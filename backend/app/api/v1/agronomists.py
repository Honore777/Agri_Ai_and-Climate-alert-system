"""
AGRONOMISTS.PY - Agronomist Management Endpoints
=================================================

Endpoints for cooperative admins to manage agronomists (staff).
Agronomists are farm advisors who review farmer predictions and provide guidance.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.organization import Organization

router = APIRouter(prefix="/agronomists", tags=["agronomists"])


# ========================================
# PYDANTIC SCHEMAS
# ========================================

class AgronomistCreate(BaseModel):
    """Request body for creating/hiring agronomist"""
    first_name: str
    last_name: str
    email: str
    phone_number: str
    password: str  # Agronomist sets their own password


class AgronomistUpdate(BaseModel):
    """Request body for updating agronomist info"""
    first_name: str = None
    last_name: str = None
    email: str = None
    phone_number: str = None
    is_active: bool = None


class AgronomistResponse(BaseModel):
    """Response with agronomist details"""
    id: int
    organization_id: Optional[int] = None
    full_name: Optional[str] = None
    email: str
    phone_number: Optional[str] = None
    assigned_regions: List[str] = []  # Regions they cover
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========================================
# ENDPOINT 1: CREATE AGRONOMIST (HIRE)
# ========================================

@router.post("", response_model=AgronomistResponse)
def create_agronomist(
    agronomist_data: AgronomistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Hire a new agronomist in the cooperative.
    
    AUTHORIZATION:
    - Only cooperative_admin can hire agronomists
    
    WHAT THIS DOES:
    1. Creates a User with role="agronomist"
    2. Links to the admin's organization
    3. Agronomist can now login and review predictions
    4. Admin can assign regions to this agronomist
    
    EXAMPLE FLOW:
    1. Coop admin clicks "Hire New Agronomist"
    2. Enters: John Doe, john@example.com, +250123456789
    3. Backend creates User record with role="agronomist"
    4. John receives temporary password via email
    5. John logs in and can review predictions
    6. Admin assigns John to "Eastern" region
    7. All farmers in Eastern region get John as their agronomist
    """
    
    # ========== AUTHORIZATION ==========
    if current_user.role != "cooperative_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only cooperative admins can hire agronomists"
        )
    
    # ========== VALIDATE EMAIL UNIQUE ==========
    existing_user = db.query(User).filter(
        User.email == agronomist_data.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use"
        )
    
    # ========== CREATE AGRONOMIST USER ==========
    # Hash the password provided by admin
    from app.core.password_utils import hash_password, validate_password
    
    # Validate password meets security requirements
    if not validate_password(agronomist_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
        )
    
    hashed_password = hash_password(agronomist_data.password)
    
    # Create User with role="agronomist"
    full_name = f"{agronomist_data.first_name} {agronomist_data.last_name}"
    
    new_agronomist = User(
        email=agronomist_data.email,
        hashed_password=hashed_password,
        phone_number=agronomist_data.phone_number,
        full_name=full_name,
        role="agronomist",
        organization_id=current_user.organization_id,  # Same org as the admin
        is_active=True,
    )
    
    db.add(new_agronomist)
    db.commit()
    db.refresh(new_agronomist)
    
    # ✅ Agronomist is now registered and can login immediately with provided password
    
    return new_agronomist


# ========================================
# ENDPOINT 2: GET ALL AGRONOMISTS
# ========================================

@router.get("", response_model=List[AgronomistResponse])
def list_agronomists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all agronomists in the cooperative WITH their assigned regions.
    
    AUTHORIZATION:
    - Cooperative admin sees their org's agronomists
    - System admin sees all agronomists
    """
    from app.models.assignment import Assignment
    
    if current_user.role == "system_admin":
        # System admin sees all agronomists
        agronomists = db.query(User).filter(
            User.role == "agronomist"
        ).all()
    elif current_user.role == "cooperative_admin":
        # Coop admin sees only their org's agronomists
        agronomists = db.query(User).filter(
            User.role == "agronomist",
            User.organization_id == current_user.organization_id
        ).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view agronomists"
        )
    
    # ✅ NEW: For each agronomist, fetch their assignments and build region list
    result = []
    for agronomist in agronomists:
        # Query all active assignments for this agronomist
        assignments = db.query(Assignment).filter(
            Assignment.agronomist_id == agronomist.id,
            Assignment.is_active == True
        ).all()
        
        # Build region names from assignments
        assigned_regions = []
        for assignment in assignments:
            if assignment.village:
                assigned_regions.append(f"{assignment.village.name} Village")
            elif assignment.cell:
                assigned_regions.append(f"{assignment.cell.name} Cell")
            elif assignment.sector:
                assigned_regions.append(f"{assignment.sector.name} Sector")
            elif assignment.district:
                assigned_regions.append(f"{assignment.district.name} District")
            elif assignment.province:
                assigned_regions.append(f"{assignment.province.name} Province")
        
        # Build response with populated assigned_regions
        response = AgronomistResponse(
            id=agronomist.id,
            organization_id=agronomist.organization_id,
            full_name=agronomist.full_name,
            email=agronomist.email,
            phone_number=agronomist.phone_number,
            assigned_regions=assigned_regions,  # ✅ NOW POPULATED!
            is_active=agronomist.is_active,
            created_at=agronomist.created_at,
        )
        result.append(response)
    
    return result


# ========================================
# FARMER ENDPOINT - Get assigned agronomist
# NOTE: Must be defined BEFORE /{agronomist_id} or FastAPI
# matches "my-agronomist" as an integer path param (422).
# ========================================

class AgronomistProfileResponse(BaseModel):
    """Agronomist info for farmers to contact"""
    id: int
    full_name: Optional[str] = None
    email: str
    phone_number: Optional[str] = None
    assigned_region: str  # e.g., "Sector" or "District"

    class Config:
        from_attributes = True


@router.get("/my-agronomist", response_model=AgronomistProfileResponse)
def get_my_agronomist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the agronomist assigned to the current farmer's region
    within the farmer's own organization (cooperative).
    """
    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can view their assigned agronomist"
        )

    from app.models.assignment import Assignment

    # Priority: Village > Cell > Sector > District > Province
    levels = [
        ('village', Assignment.village_id, current_user.village_id, "Village"),
        ('cell', Assignment.cell_id, current_user.cell_id, "Cell"),
        ('sector', Assignment.sector_id, current_user.sector_id, "Sector"),
        ('district', Assignment.district_id, current_user.district_id, "District"),
        ('province', Assignment.province_id, current_user.province_id, "Province"),
    ]

    agronomist = None
    assigned_region = None
    for _, column, value, label in levels:
        if not value:
            continue
        assignment = db.query(Assignment).filter(
            column == value,
            Assignment.is_active.is_(True),
            Assignment.organization_id == current_user.organization_id,
        ).first()
        if assignment:
            agronomist = db.query(User).filter(User.id == assignment.agronomist_id).first()
            assigned_region = label
            break

    if not agronomist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No agronomist is assigned to your region yet"
        )

    return AgronomistProfileResponse(
        id=agronomist.id,
        full_name=agronomist.full_name or agronomist.email,
        email=agronomist.email,
        phone_number=agronomist.phone_number or "Not provided",
        assigned_region=assigned_region or "Your region"
    )


# ========================================
# ENDPOINT 3: GET SINGLE AGRONOMIST
# ========================================

@router.get("/{agronomist_id}", response_model=AgronomistResponse)
def get_agronomist(
    agronomist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single agronomist by ID with their region assignments"""
    
    agronomist = db.query(User).filter(
        User.id == agronomist_id,
        User.role == "agronomist"
    ).first()
    
    if not agronomist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agronomist not found"
        )
    
    # Permission check
    if current_user.role == "system_admin":
        pass  # Can see any agronomist
    elif current_user.role == "cooperative_admin" and current_user.organization_id == agronomist.organization_id:
        pass  # Can see agronomists from their org
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this agronomist"
        )
    
    return agronomist


# ========================================
# ENDPOINT 4: UPDATE AGRONOMIST
# ========================================

@router.put("/{agronomist_id}", response_model=AgronomistResponse)
def update_agronomist(
    agronomist_id: int,
    update_data: AgronomistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update agronomist information.
    
    Can update:
    - first_name, last_name
    - email, phone_number
    - is_active (deactivate/reactivate agronomist)
    """
    
    agronomist = db.query(User).filter(
        User.id == agronomist_id,
        User.role == "agronomist"
    ).first()
    
    if not agronomist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agronomist not found"
        )
    
    # Permission check
    if current_user.role == "system_admin":
        pass
    elif current_user.role == "cooperative_admin" and current_user.organization_id == agronomist.organization_id:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this agronomist"
        )
    
    # Update fields if provided
    if update_data.first_name or update_data.last_name:
        # Update full_name by combining first and last
        first = update_data.first_name or (agronomist.full_name.split()[0] if agronomist.full_name else "")
        last = update_data.last_name or (agronomist.full_name.split()[1] if agronomist.full_name and len(agronomist.full_name.split()) > 1 else "")
        agronomist.full_name = f"{first} {last}".strip()
    if update_data.email:
        # Check email uniqueness
        existing = db.query(User).filter(
            User.email == update_data.email,
            User.id != agronomist_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        agronomist.email = update_data.email
    if update_data.phone_number:
        agronomist.phone_number = update_data.phone_number
    if update_data.is_active is not None:
        agronomist.is_active = update_data.is_active
    
    db.commit()
    db.refresh(agronomist)
    
    return agronomist


# ========================================
# ENDPOINT 5: DELETE AGRONOMIST
# ========================================

@router.delete("/{agronomist_id}")
def delete_agronomist(
    agronomist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete/fire an agronomist.
    
    WHAT HAPPENS:
    1. Agronomist record is deleted
    2. All their region assignments are removed
    3. Predictions they reviewed remain (for history)
    """
    
    agronomist = db.query(User).filter(
        User.id == agronomist_id,
        User.role == "agronomist"
    ).first()
    
    if not agronomist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agronomist not found"
        )
    
    # Permission check
    if current_user.role == "system_admin":
        pass
    elif current_user.role == "cooperative_admin" and current_user.organization_id == agronomist.organization_id:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this agronomist"
        )
    
    # ✅ STEP 1: Delete all assignments for this agronomist first
    from app.models.assignment import Assignment
    assignments = db.query(Assignment).filter(
        Assignment.agronomist_id == agronomist_id
    ).all()
    
    for assignment in assignments:
        db.delete(assignment)
    
    # ✅ STEP 2: Now delete the agronomist (no foreign key conflicts)
    db.delete(agronomist)
    db.commit()
    
    return {"success": True, "message": f"Agronomist deleted and {len(assignments)} assignments removed"}
