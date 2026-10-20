"""
ORGANIZATIONS.PY - System Admin Organization Management
======================================================

Endpoints for creating and managing organizations (cooperatives/institutions)
Only System Admins can create/delete organizations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import secrets

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.organization import Organization
from app.schemas.organization import (
    OrganizationCreate, OrganizationResponse, OrganizationUpdate, OrganizationStatusUpdate
)


router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=List[OrganizationResponse])
def list_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all organizations (filtered by user role).
    - System Admin: sees all organizations
    - Cooperative Admin: sees only their organization
    - Others: forbidden
    """
    if current_user.role == "system_admin":
        # System admin sees all
        organizations = db.query(Organization).all()
    elif current_user.role == "cooperative_admin":
        # Coop admin sees only theirs
        organizations = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view organizations"
        )
    
    return organizations


@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single organization by ID"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Permission check
    if current_user.role == "system_admin":
        pass  # Can see any org
    elif current_user.role == "cooperative_admin" and current_user.organization_id == org_id:
        pass  # Can see their own
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this organization"
        )
    
    return org


@router.post("", response_model=OrganizationResponse)
def create_organization(
    org_data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new organization (System Admin only).
    
    CONCEPTS:
    - Role-based access control
    - Unique code generation (for registration)
    - Transaction commit (save to DB)
    """
    # Role check: only system admin can create orgs
    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system admins can create organizations"
        )
    
    # Check if org already exists
    existing = db.query(Organization).filter(
        Organization.name == org_data.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization already exists"
        )
    
    # Generate unique registration code
    # Format: COOP-COOPERATIVE-2026-XXXXX (unique identifier)
    unique_suffix = secrets.token_hex(4).upper()[:8]
    reg_code = f"COOP-{org_data.type.upper()}-{datetime.now().year}-{unique_suffix}"
    
    # Create organization
    new_org = Organization(
        name=org_data.name,
        type=org_data.type,  # 'cooperative' or 'institution'
        registration_code=reg_code,
        region=org_data.region,
    )
    
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    return new_org


@router.put("/{org_id}", response_model=OrganizationResponse)
def update_organization(
    org_id: int,
    org_data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update organization (System Admin only)"""
    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system admins can update organizations"
        )
    
    org = db.query(Organization).filter(Organization.id == org_id).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Update fields
    if org_data.name:
        org.name = org_data.name
    if org_data.region:
        org.region = org_data.region
    
    org.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(org)
    
    return org


@router.patch("/{org_id}/status", response_model=OrganizationResponse)
def set_organization_status(
    org_id: int,
    payload: OrganizationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Activate/deactivate an organization (System Admin only).

    Deactivating an org blocks logins for ALL its members (checked in
    auth/login) and disables its registration codes — prefer this over
    deletion since history stays intact.
    """
    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system admins can change organization status"
        )

    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    org.is_active = payload.is_active
    org.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(org)

    return org


@router.delete("/{org_id}")
def delete_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete organization (System Admin only)"""
    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system admins can delete organizations"
        )
    
    org = db.query(Organization).filter(Organization.id == org_id).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Check if has users/codes (prevent deletion if active)
    users_count = db.query(User).filter(User.organization_id == org_id).count()
    
    if users_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete organization with active users"
        )
    
    db.delete(org)
    db.commit()
    
    return {"message": "Organization deleted successfully"}