"""
REGISTRATION_CODE.PY - Registration Code Management Endpoints
==============================================================

Endpoints for cooperative admins to generate and manage registration codes.
Codes embed role + location, enabling self-service farmer/agronomist registration.

CONCEPT:
--------
Instead of admin manually creating each user, they generate registration codes.
Each code embeds: role (farmer/agronomist), organization_id, and location.
When farmer registers with code, all fields are automatically pre-filled.

SECURITY:
---------
1. Codes are random/unpredictable (secrets.token_urlsafe)
2. Code doesn't reveal role/org/location (hashed in code itself via DB lookup)
3. Codes are one-time use (marked inactive after use)
4. Codes can be deactivated by admin if compromised
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import secrets
import string
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.registration_code import RegistrationCode
from app.models.province import Province
from app.models.district import District
from app.models.sector import Sector
from app.models.cell import Cell
from app.models.village import Village

router = APIRouter(prefix="/registration-codes", tags=["registration-codes"])

# ========================================
# PYDANTIC SCHEMAS
# ========================================

class CodeGenerateRequest(BaseModel):
    """
    Request body for generating registration codes.
    Admin specifies: role and quantity
    Organization is determined from current_user.organization_id
    Location will be captured when farmer registers
    """
    role: str          # 'farmer' or 'agronomist'
    quantity: int = 1  # How many codes? (1-100)


class CodeResponse(BaseModel):
    """Single registration code in response."""
    id: int
    code: str
    role: str
    organization_id: int
    is_active: bool
    is_used: bool                      # ✅ NEW: Whether code has been used
    used_by_user_id: Optional[int] = None  # ✅ NEW: Which user used it (if any)
    used_by_email: Optional[str] = None     # Email of the farmer who redeemed it
    used_by_name: Optional[str] = None      # Full name of that farmer
    created_at: datetime

    class Config:
        from_attributes = True


class CodesGeneratedResponse(BaseModel):
    """Response after generating multiple codes."""
    codes: List[str]


# ========================================
# HELPER: GENERATE SECURE RANDOM CODE
# ========================================

def generate_registration_code() -> str:
    """
    Generate cryptographically secure random code.
    
    Example outputs: 'aB3xK9pL', 'mN2qR8sT', etc.
    
    Why random strings?
    - Unpredictable (attacker can't guess next code)
    - No information leak (code doesn't encode role/org)
    - Easy to share via email/SMS
    
    Uses secrets module (cryptographically secure)
    instead of random (which is pseudorandom)
    """
    # token_urlsafe generates URL-safe base64 string
    # 6 bytes → ~8 character code
    return secrets.token_urlsafe(6)


# ========================================
# ENDPOINT 1: GENERATE REGISTRATION CODES
# ========================================

@router.post("/generate", response_model=CodesGeneratedResponse)
def generate_codes(
    request: CodeGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate multiple registration codes with embedded role + location.
    
    FLOW:
    1. Admin clicks "Generate Codes" button
    2. Selects role (farmer/agronomist)
    3. Enters quantity (1-100)
    4. Backend generates random codes with organization_id embedded
    5. Each code stored in DB with metadata
    6. Codes returned to admin to share
    
    WHEN FARMER REGISTERS:
    1. Farmer enters code + email + password + LOCATION
    2. Backend looks up code in DB
    3. Verifies code is active (not used yet)
    4. Extracts from code: role + organization_id
    5. Creates User with:
       - role and organization_id from code
       - email and password from farmer
       - location from farmer's input (province, district, sector, cell, village)
    6. Marks code as used (is_active=False)
    """
    
    # ========== AUTHORIZATION ==========
    # Only cooperative admin can generate
    if current_user.role not in ["cooperative_admin", "system_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only cooperative admins can generate codes"
        )
    
    # ========== VALIDATE QUANTITY ==========
    # Prevent abuse (max 100 codes at once)
    if request.quantity < 1 or request.quantity > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be between 1 and 100"
        )
    
    # ========== VALIDATE ROLE ==========
    if request.role not in ["farmer", "agronomist"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'farmer' or 'agronomist'"
        )
    
    # ========== GENERATE CODES ==========
    # Create 'quantity' unique registration codes
    generated_codes = []
    
    for _ in range(request.quantity):
        # Keep generating until we get a unique code
        # (collision is extremely unlikely with secure random)
        while True:
            code = generate_registration_code()
            
            # Check if code already exists
            existing = db.query(RegistrationCode).filter(
                RegistrationCode.code == code
            ).first()
            
            if not existing:
                # Code is unique, use it
                break
        
        # Create RegistrationCode record
        # Stores: code, role, organization_id
        # Location will be captured when farmer registers
        registration_code = RegistrationCode(
            code=code,
            role=request.role,  # 'farmer' or 'agronomist'
            organization_id=current_user.organization_id,  # Which coop
            is_active=True,     # Not used yet
            is_used=False,      # ✅ NEW: Code hasn't been used yet
            used_by_user_id=None,  # ✅ NEW: No user has used it yet
            created_by=current_user.id,  # Track who created the code
        )
        
        # Save to DB
        db.add(registration_code)
        generated_codes.append(code)
    
    # Commit all codes
    db.commit()
    
    return CodesGeneratedResponse(codes=generated_codes)


# ========================================
# ENDPOINT 2: GET ALL REGISTRATION CODES
# ========================================

@router.get("", response_model=List[CodeResponse])
def list_registration_codes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all registration codes for cooperative admin's organization.
    Only coop admins can list their own codes.
    System admins can list any org's codes.
    """
    
    from sqlalchemy.orm import joinedload

    query = db.query(RegistrationCode).options(
        joinedload(RegistrationCode.user_who_used_it)
    )
    if current_user.role == "cooperative_admin":
        # Coop admin sees only their org's codes — used AND unused,
        # so the admin has the full audit trail of who registered when.
        query = query.filter(
            RegistrationCode.organization_id == current_user.organization_id
        )
    elif current_user.role != "system_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view registration codes"
        )

    codes = query.order_by(RegistrationCode.created_at.desc()).all()
    return [
        CodeResponse(
            id=c.id,
            code=c.code,
            role=c.role,
            organization_id=c.organization_id,
            is_active=c.is_active,
            is_used=c.is_used,
            used_by_user_id=c.used_by_user_id,
            used_by_email=c.user_who_used_it.email if c.user_who_used_it else None,
            used_by_name=c.user_who_used_it.full_name if c.user_who_used_it else None,
            created_at=c.created_at,
        )
        for c in codes
    ]


# ========================================
# ENDPOINT 3: GET SINGLE REGISTRATION CODE
# ========================================

@router.get("/{code_id}", response_model=CodeResponse)
def get_registration_code(
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single registration code by ID"""
    
    code = db.query(RegistrationCode).filter(
        RegistrationCode.id == code_id
    ).first()
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration code not found"
        )
    
    # Permission check
    if current_user.role == "system_admin":
        pass  # Can see any code
    elif current_user.role == "cooperative_admin" and current_user.organization_id == code.organization_id:
        pass  # Can see their own org's codes
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this code"
        )
    
    return code


# ========================================
# ENDPOINT 4: VERIFY REGISTRATION CODE
# ========================================

class CodeVerifyRequest(BaseModel):
    """Request to verify if a code is valid"""
    code: str


class CodeVerifyResponse(BaseModel):
    """Response after verifying code"""
    valid: bool
    organization_id: int = None
    role: str = None
    message: str = None


@router.post("/verify", response_model=CodeVerifyResponse)
def verify_registration_code(
    request: CodeVerifyRequest,
    db: Session = Depends(get_db),
):
    """
    Verify if a registration code is valid.
    Farmers use this when registering.
    
    Returns:
    - valid: true/false
    - organization_id: which coop issued it
    - role: farmer/agronomist
    """
    
    code = db.query(RegistrationCode).filter(
        RegistrationCode.code == request.code
    ).first()
    
    if not code:
        return CodeVerifyResponse(
            valid=False,
            message="Code not found"
        )
    
    if not code.is_active:
        return CodeVerifyResponse(
            valid=False,
            message="Code has already been used"
        )
    
    # Code is valid!
    return CodeVerifyResponse(
        valid=True,
        organization_id=code.organization_id,
        role=code.role,
        message="Code is valid"
    )


# ========================================
# ENDPOINT 5: DELETE REGISTRATION CODE
# ========================================

@router.delete("/{code_id}")
def delete_registration_code(
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a registration code.
    Only coop admins can delete their org's codes.
    """
    
    code = db.query(RegistrationCode).filter(
        RegistrationCode.id == code_id
    ).first()
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Code not found"
        )
    
    # Permission check
    if current_user.role == "system_admin":
        pass  # Can delete any code
    elif current_user.role == "cooperative_admin" and current_user.organization_id == code.organization_id:
        pass  # Can delete their own org's codes
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this code"
        )
    
    db.delete(code)
    db.commit()
    
    return {"success": True, "message": "Code deleted"}
