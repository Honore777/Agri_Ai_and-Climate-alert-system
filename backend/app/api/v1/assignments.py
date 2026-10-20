"""
ASSIGNMENTS.PY - Agronomist Region Assignment Endpoints
========================================================

Endpoints for cooperative admins to assign agronomists to regions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.assignment import Assignment
from app.models.organization import Organization

router = APIRouter(prefix="/assignments", tags=["assignments"])

# ========================================
# PYDANTIC SCHEMAS (request/response data models)
# ========================================

class AssignmentCreate(BaseModel):
    """
    Request body for creating assignment.
    Cooperative admin sends: agronomist_id, assignment_level, location_id
    """
    agronomist_id: int          # Which agronomist?
    assignment_level: str       # At what level? "district", "sector", etc.
    location_id: int            # Which location? (district_id, sector_id, etc.)


class AssignmentResponse(BaseModel):
    """
    Response when returning assignment to frontend.
    Computes location_id and assignment_level from the specific location columns.
    """
    id: int
    agronomist_id: int
    agronomist_name: str                    # ✅ Full name of assigned agronomist
    agronomist_email: str                   # ✅ NEW: Email for contact
    organization_id: int
    is_active: bool
    created_at: str
    
    # Computed fields - derived from actual location columns
    location_id: int | None = None              # Will be province_id, district_id, etc.
    assignment_level: str | None = None         # Will be "province", "district", etc.
    location_display: str | None = None         # Human readable
    
    # Raw location IDs (optional - for reference)
    province_id: int | None = None
    district_id: int | None = None
    sector_id: int | None = None
    cell_id: int | None = None
    village_id: int | None = None
    
    class Config:
        from_attributes = True


# ========================================
# ENDPOINT 1: CREATE ASSIGNMENT
# ========================================

@router.post("/", response_model=AssignmentResponse)
def create_assignment(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create assignment linking agronomist to region.
    Only cooperative admins can call this.
    
    Example flow:
    1. Admin selects "John Doe" (agronomist)
    2. Admin selects "District" level
    3. Admin selects "Gasabo" district (location_id=3)
    4. Backend creates Assignment record
    5. From now on, John sees predictions from Gasabo District farmers
    """
    
    # ========== AUTHORIZATION ==========
    # Only cooperative_admin can create assignments
    if current_user.role not in ["cooperative_admin", "system_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only cooperative admins can create assignments"
        )
    
    # ========== VALIDATE AGRONOMIST EXISTS ==========
    # Verify agronomist exists and is in same organization as admin
    agronomist = db.query(User).filter(
        User.id == assignment.agronomist_id,
        User.role == "agronomist"
    ).first()
    
    if not agronomist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agronomist not found"
        )
    
    # ========== VALIDATE LOCATION EXISTS ==========
    # Get the location model based on assignment_level
    # If level="district", get District model
    # If level="sector", get Sector model, etc.
    if assignment.assignment_level == "province":
        from app.models.province import Province
        location = db.query(Province).filter(Province.id == assignment.location_id).first()
    elif assignment.assignment_level == "district":
        from app.models.district import District
        location = db.query(District).filter(District.id == assignment.location_id).first()
    elif assignment.assignment_level == "sector":
        from app.models.sector import Sector
        location = db.query(Sector).filter(Sector.id == assignment.location_id).first()
    elif assignment.assignment_level == "cell":
        from app.models.cell import Cell
        location = db.query(Cell).filter(Cell.id == assignment.location_id).first()
    elif assignment.assignment_level == "village":
        from app.models.village import Village
        location = db.query(Village).filter(Village.id == assignment.location_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assignment level"
        )
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{assignment.assignment_level.title()} not found"
        )
    
    # ========== CREATE ASSIGNMENT RECORD ==========
    # Create Assignment based on assignment_level
    # Store location_id in the appropriate column
    
    if assignment.assignment_level == "province":
        db_assignment = Assignment(
            agronomist_id=assignment.agronomist_id,
            province_id=assignment.location_id
        )
    elif assignment.assignment_level == "district":
        db_assignment = Assignment(
            agronomist_id=assignment.agronomist_id,
            district_id=assignment.location_id
        )
    elif assignment.assignment_level == "sector":
        db_assignment = Assignment(
            agronomist_id=assignment.agronomist_id,
            sector_id=assignment.location_id
        )
    elif assignment.assignment_level == "cell":
        db_assignment = Assignment(
            agronomist_id=assignment.agronomist_id,
            cell_id=assignment.location_id
        )
    elif assignment.assignment_level == "village":
        db_assignment = Assignment(
            agronomist_id=assignment.agronomist_id,
            village_id=assignment.location_id
        )
    
    # Set is_active = True (assignment is active)
    db_assignment.is_active = True
    db_assignment.organization_id = current_user.organization_id
    db_assignment.created_by_id = current_user.id
    
    # Save to database
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    
    # Compute location_id and assignment_level from the actual location columns
    location_id = None
    assignment_level = None
    if db_assignment.province_id:
        location_id = db_assignment.province_id
        assignment_level = "province"
    elif db_assignment.district_id:
        location_id = db_assignment.district_id
        assignment_level = "district"
    elif db_assignment.sector_id:
        location_id = db_assignment.sector_id
        assignment_level = "sector"
    elif db_assignment.cell_id:
        location_id = db_assignment.cell_id
        assignment_level = "cell"
    elif db_assignment.village_id:
        location_id = db_assignment.village_id
        assignment_level = "village"
    
    # Return assignment with computed fields
    return AssignmentResponse(
        id=db_assignment.id,
        agronomist_id=db_assignment.agronomist_id,
        agronomist_name=agronomist.full_name,  # ✅ Include agronomist's full name
        agronomist_email=agronomist.email,     # ✅ Include agronomist's email
        organization_id=db_assignment.organization_id,
        is_active=db_assignment.is_active,
        created_at=db_assignment.created_at.isoformat(),
        location_id=location_id,
        assignment_level=assignment_level,
        location_display=f"{location.name} {assignment.assignment_level.title()}",
        province_id=db_assignment.province_id,
        district_id=db_assignment.district_id,
        sector_id=db_assignment.sector_id,
        cell_id=db_assignment.cell_id,
        village_id=db_assignment.village_id,
    )


# ========================================
# ENDPOINT 2: GET ORG'S ASSIGNMENTS
# ========================================

@router.get("/organization", response_model=List[AssignmentResponse])
def get_organization_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all assignments for current user's organization.
    Lists which agronomists are assigned to which regions.
    
    Response example:
    [
      {
        "id": 1,
        "agronomist_id": 5,
        "district_id": 3,
        "location_display": "Gasabo District"
      },
      {
        "id": 2,
        "agronomist_id": 6,
        "sector_id": 12,
        "location_display": "Kicukiro Sector"
      }
    ]
    """
    
    # Query all active assignments for this organization
    assignments = db.query(Assignment).filter(
        Assignment.organization_id == current_user.organization_id,
        Assignment.is_active == True
    ).all()
    
    # Build response with location display names
    response = []
    for assignment in assignments:
        location_display = ""
        location_id = None
        assignment_level = None
        
        # Determine location name based on what's set
        if assignment.village_id:
            location_display = assignment.village.name + " Village"
            location_id = assignment.village_id
            assignment_level = "village"
        elif assignment.cell_id:
            location_display = assignment.cell.name + " Cell"
            location_id = assignment.cell_id
            assignment_level = "cell"
        elif assignment.sector_id:
            location_display = assignment.sector.name + " Sector"
            location_id = assignment.sector_id
            assignment_level = "sector"
        elif assignment.district_id:
            location_display = assignment.district.name + " District"
            location_id = assignment.district_id
            assignment_level = "district"
        elif assignment.province_id:
            location_display = assignment.province.name + " Province"
            location_id = assignment.province_id
            assignment_level = "province"
        
        # Get agronomist's name and email
        agronomist = db.query(User).filter(User.id == assignment.agronomist_id).first()
        agronomist_name = agronomist.full_name if agronomist else "Unknown Agronomist"
        agronomist_email = agronomist.email if agronomist else "unknown@example.com"
        
        response.append(AssignmentResponse(
            id=assignment.id,
            agronomist_id=assignment.agronomist_id,
            agronomist_name=agronomist_name,  # ✅ Include agronomist's full name
            agronomist_email=agronomist_email,  # ✅ Include agronomist's email
            organization_id=assignment.organization_id,
            is_active=assignment.is_active,
            created_at=assignment.created_at.isoformat(),
            location_id=location_id,
            assignment_level=assignment_level,
            location_display=location_display,
            province_id=assignment.province_id,
            district_id=assignment.district_id,
            sector_id=assignment.sector_id,
            cell_id=assignment.cell_id,
            village_id=assignment.village_id,
        ))
    
    return response


# ========================================
# ENDPOINT 3: DELETE/DEACTIVATE ASSIGNMENT
# ========================================

@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deactivate assignment (soft delete).
    Sets is_active = False instead of removing record.
    
    Why soft delete? Keeps historical data for analytics.
    """
    
    # Find assignment
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Verify belongs to current user's organization
    if assignment.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete assignments from other organizations"
        )
    
    # Soft delete: set is_active = False
    assignment.is_active = False
    
    db.commit()
    
    return {"message": "Assignment removed"}