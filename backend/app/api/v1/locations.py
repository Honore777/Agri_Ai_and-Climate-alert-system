"""
LOCATIONS.PY - Location Hierarchy Endpoints
============================================

Public endpoints for fetching provinces, districts, sectors, cells, villages.
Used during user registration for location selection.
No authentication required.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.models.province import Province
from app.models.district import District
from app.models.sector import Sector
from app.models.cell import Cell
from app.models.village import Village

router = APIRouter(prefix='/locations', tags=['Locations'])

# ===== PROVINCES =====
@router.get("/provinces")
def get_provinces(db: Session = Depends(get_db)):
    """
    Get all provinces.
    Public endpoint - no authentication required.
    Used during registration for location selection.
    """
    provinces = db.query(Province).all()
    return [
        {"id": p.id, "name": p.name} 
        for p in provinces
    ]


# ===== DISTRICTS =====
@router.get("/provinces/{province_id}/districts")
def get_districts(province_id: int, db: Session = Depends(get_db)):
    """
    Get all districts for a specific province.
    """
    # Validate province exists
    province = db.query(Province).filter(Province.id == province_id).first()
    if not province:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Province {province_id} not found"
        )
    
    # Get districts for this province
    districts = db.query(District).filter(
        District.province_id == province_id
    ).all()
    
    return [
        {"id": d.id, "name": d.name} 
        for d in districts
    ]


# ===== SECTORS =====
@router.get("/districts/{district_id}/sectors")
def get_sectors(district_id: int, db: Session = Depends(get_db)):
    """
    Get all sectors for a specific district.
    """
    # Validate district exists
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"District {district_id} not found"
        )
    
    # Get sectors for this district
    sectors = db.query(Sector).filter(
        Sector.district_id == district_id
    ).all()
    
    return [
        {"id": s.id, "name": s.name} 
        for s in sectors
    ]


# ===== CELLS =====
@router.get("/sectors/{sector_id}/cells")
def get_cells(sector_id: int, db: Session = Depends(get_db)):
    """
    Get all cells for a specific sector.
    """
    # Validate sector exists
    sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not sector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sector {sector_id} not found"
        )
    
    # Get cells for this sector
    cells = db.query(Cell).filter(
        Cell.sector_id == sector_id
    ).all()
    
    return [
        {"id": c.id, "name": c.name} 
        for c in cells
    ]


# ===== VILLAGES =====
@router.get("/cells/{cell_id}/villages")
def get_villages(cell_id: int, db: Session = Depends(get_db)):
    """
    Get all villages for a specific cell.
    """
    # Validate cell exists
    cell = db.query(Cell).filter(Cell.id == cell_id).first()
    if not cell:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cell {cell_id} not found"
        )
    
    # Get villages for this cell
    villages = db.query(Village).filter(
        Village.cell_id == cell_id
    ).all()
    
    return [
        {"id": v.id, "name": v.name} 
        for v in villages
    ]