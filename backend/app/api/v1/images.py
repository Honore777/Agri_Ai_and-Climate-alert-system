"""
IMAGES.PY - Image Retrieval Endpoints
======================================

Endpoints for retrieving uploaded images.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import os

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.image import Image

router = APIRouter(prefix="/images", tags=["images"])


@router.get("/{image_id}")
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get image file by ID.
    Returns the image file with appropriate content type.
    """
    # Get image from database
    image = db.query(Image).filter(Image.id == image_id).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    # ---- Access control: images are farmer data, not public ----
    owner = db.query(User).filter(User.id == image.farmer_id).first()
    allowed = False
    if current_user.role == 'farmer':
        allowed = image.farmer_id == current_user.id
    elif current_user.role == 'system_admin':
        allowed = True
    elif current_user.role == 'cooperative_admin':
        allowed = owner is not None and owner.organization_id == current_user.organization_id
    elif current_user.role == 'agronomist' and owner is not None:
        # Same org + region overlap, same rule as prediction visibility
        from app.models.assignment import Assignment
        assignments = db.query(Assignment).filter(
            Assignment.agronomist_id == current_user.id,
            Assignment.is_active.is_(True),
            Assignment.organization_id == owner.organization_id,
        ).all()
        for a in assignments:
            if (a.village_id and owner.village_id == a.village_id) or \
               (a.cell_id and owner.cell_id == a.cell_id) or \
               (a.sector_id and owner.sector_id == a.sector_id) or \
               (a.district_id and owner.district_id == a.district_id) or \
               (a.province_id and owner.province_id == a.province_id):
                allowed = True
                break

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this image"
        )

    # Check if file exists
    file_path = Path(image.file_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image file not found on server"
        )
    
    # Determine media type
    suffix = file_path.suffix.lower()
    media_type_map = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
    }
    media_type = media_type_map.get(suffix, 'application/octet-stream')
    
    # Return file
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=file_path.name
    )


@router.get("/{image_id}/info")
def get_image_info(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get image metadata without loading full file.
    Returns: id, farmer_id, file_path, image_metadata, uploaded_at
    """
    image = db.query(Image).filter(Image.id == image_id).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return {
        "id": image.id,
        "farmer_id": image.farmer_id,
        "file_path": image.file_path,
        "image_metadata": image.image_metadata,
        "uploaded_at": image.uploaded_at,
    }
