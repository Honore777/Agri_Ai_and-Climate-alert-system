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
