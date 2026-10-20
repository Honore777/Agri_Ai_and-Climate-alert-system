"""
VALIDATIONS.PY - Agronomist Validation Endpoints
=================================================

Endpoints for agronomists to validate predictions and provide feedback.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.models.validation import Validation
from pydantic import BaseModel


router = APIRouter(prefix="/validations", tags=["validations"])


class ValidationCreate(BaseModel):
    """Request body for creating a validation"""
    prediction_id: int
    is_correct: int  # 1 = correct, 0 = incorrect, -1 = unsure
    validated_disease: str = None  # If correcting it
    feedback: str = None


class ValidationResponse(BaseModel):
    """Response for a validation"""
    id: int
    prediction_id: int
    agronomist_id: int
    is_correct: int
    validated_disease: str = None
    feedback: str = None
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/", response_model=ValidationResponse)
def create_validation(
    validation: ValidationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Validate a prediction. Only agronomists can validate.
    """
    if current_user.role != "agronomist":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agronomists can validate predictions"
        )
    
    # Verify prediction exists
    prediction = db.query(Prediction).filter(Prediction.id == validation.prediction_id).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # TODO: Verify agronomist is assigned to farmer's region
    # This requires checking Assignment model
    
    # Check if already validated
    existing = db.query(Validation).filter(
        Validation.prediction_id == validation.prediction_id,
        Validation.agronomist_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already validated this prediction"
        )
    
    # Create validation
    db_validation = Validation(
        prediction_id=validation.prediction_id,
        agronomist_id=current_user.id,
        is_correct=validation.is_correct,
        validated_disease=validation.validated_disease,
        feedback=validation.feedback,
    )
    
    db.add(db_validation)
    db.commit()
    db.refresh(db_validation)
    
    return db_validation


@router.get("/me", response_model=List[ValidationResponse])
def get_my_validations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all validations performed by current agronomist.
    Returns newest validations first.
    """
    if current_user.role != "agronomist":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agronomists can view validations"
        )
    
    validations = db.query(Validation).filter(
        Validation.agronomist_id == current_user.id
    ).order_by(Validation.created_at.desc()).all()
    
    return validations


@router.get("/prediction/{prediction_id}", response_model=List[ValidationResponse])
def get_validation_for_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all validations for a specific prediction.
    Farmer can check validation status of their submission.
    """
    # Verify prediction exists
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Permission: farmer views own, agronomist views their validations
    if current_user.role == "farmer":
        if prediction.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own predictions"
            )
    
    validations = db.query(Validation).filter(
        Validation.prediction_id == prediction_id
    ).order_by(Validation.created_at.desc()).all()
    
    return validations
