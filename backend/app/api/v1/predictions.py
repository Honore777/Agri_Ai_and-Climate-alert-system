"""
PREDICTIONS.PY - Prediction CRUD Endpoints
===========================================

Endpoints for storing ML predictions and retrieving them for validation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.models.image import Image
from app.models.validation import Validation
from app.models.prediction_review import PredictionReview
from app.models.message import Message

from app.schemas.predictionresponse import PredictionResponse, PredictionCreate, savePredictionRequest, WeatherSnapshotRead
from app.schemas.prediction_review import  PredictionReviewCreate,PredictionReviewResponse
from app.schemas.message import MessageResponse, MessageListResponse, MessageCreate
from app.api.v1.users import _build_location_path

router = APIRouter(prefix="/predictions", tags=["predictions"])


def _prediction_image_ids(pred: Prediction, db: Session) -> List[int]:
    """All photos for a prediction: the primary image first, then any
    extra photos the farmer attached afterwards."""
    ids = [pred.image_id]
    extra = db.query(Image.id).filter(
        Image.prediction_id == pred.id,
        Image.id != pred.image_id,
    ).all()
    ids.extend(row[0] for row in extra)
    return ids


@router.post("/", response_model=PredictionResponse)
def create_prediction(
    prediction: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Save a prediction from the ML model.
    Only farmers can create predictions (via image upload).
    """
    # Verify image exists and belongs to current user
    image = db.query(Image).filter(
        Image.id == prediction.image_id,
        Image.farmer_id == current_user.id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found or does not belong to you"
        )
    
    # Create prediction
    db_prediction = Prediction(
        farmer_id=current_user.id,
        image_id=prediction.image_id,
        predicted_disease=prediction.predicted_disease,
        confidence=prediction.confidence,
        model_version=prediction.model_version,
    )
    
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    
    return db_prediction


# ========================================
# ENDPOINT: GET PENDING PREDICTIONS
# ========================================
# ⚠️ IMPORTANT: This MUST come BEFORE /{prediction_id}
# Otherwise FastAPI matches /pending as /{prediction_id} and tries int("pending")!
# ========================================

@router.get("/pending", response_model=List[PredictionResponse])
def get_pending_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get predictions pending validation for agronomist's assigned regions.
    Agronomist only.
    """
    if current_user.role != "agronomist":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agronomists can view pending predictions"
        )
    
    # Get agronomist's assignments (regions)
    from app.models.assignment import Assignment
    assignments = db.query(Assignment).filter(
        Assignment.agronomist_id == current_user.id,
        Assignment.is_active == True
    ).all()
    
    if not assignments:
        return []
    
    # Build list of farmer IDs in agronomist's regions
    farmer_ids = set()
    
    for assignment in assignments:
        # Org-scoped matching: only farmers belonging to the SAME
        # organization as the assignment are in this agronomist's scope.
        # Rwandan farmers operate through cooperatives — geography alone
        # must not leak one cooperative's farmers to another's staff.
        base = db.query(User).filter(
            User.organization_id == assignment.organization_id
        )
        if assignment.village_id:
            # Farmers in specific village
            farmer_ids.update(
                f.id for f in base.filter(User.village_id == assignment.village_id).all()
            )
        elif assignment.cell_id:
            # Farmers in specific cell
            farmer_ids.update(
                f.id for f in base.filter(User.cell_id == assignment.cell_id).all()
            )
        elif assignment.sector_id:
            # Farmers in specific sector
            farmer_ids.update(
                f.id for f in base.filter(User.sector_id == assignment.sector_id).all()
            )
        elif assignment.district_id:
            # Farmers in specific district
            farmer_ids.update(
                f.id for f in base.filter(User.district_id == assignment.district_id).all()
            )
        elif assignment.province_id:
            # Farmers in whole province
            farmer_ids.update(
                f.id for f in base.filter(User.province_id == assignment.province_id).all()
            )
    
    # Get predictions from farmers in these regions that have NO validations yet
    # Use a NOT IN subquery to find predictions without validations
    from sqlalchemy import not_
    
    # Handle empty farmer_ids case
    if not farmer_ids:
        return []
    
    # Get all predictions that have been reviewed (using PredictionReview model)
    # PredictionReview is the new model - Validation is legacy
    reviewed_prediction_ids = db.query(PredictionReview.prediction_id).distinct().all()
    reviewed_ids = [v[0] for v in reviewed_prediction_ids]
    
    # Build the query
    query = db.query(Prediction).filter(
        Prediction.farmer_id.in_(list(farmer_ids))
    )
    
    # Exclude reviewed predictions if any exist
    if reviewed_ids:
        query = query.filter(not_(Prediction.id.in_(reviewed_ids)))
    
    pending_predictions = query.order_by(Prediction.created_at.desc()).all()
    
    # Build response with farmer details included
    response_data = []
    for pred in pending_predictions:
        farmer = db.query(User).filter(User.id == pred.farmer_id).first()
        response_data.append(PredictionResponse(
            id=pred.id,
            farmer_id=pred.farmer_id,
            farmer_name=farmer.full_name if farmer else None,
            farmer_email=farmer.email if farmer else None,
            farmer_phone=farmer.phone_number if farmer else None,
            farmer_location=_build_location_path(farmer, db) if farmer else None,
            farmer_latitude=farmer.latitude if farmer else None,
            farmer_longitude=farmer.longitude if farmer else None,
            farmer_location_source=farmer.location_source if farmer else None,
            image_ids=_prediction_image_ids(pred, db),
            image_id=pred.image_id,
            crop_type=pred.crop_type,
            predicted_disease=pred.predicted_disease,
            confidence=pred.confidence,
            model_version=pred.model_version,
            all_predictions=pred.all_predictions,
            created_at=pred.created_at,
            weather_snapshot=pred.weather_snapshot,
        ))
    
    return response_data


@router.get("/reviewed/me", response_model=List[dict])
def get_my_reviewed_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Agronomist's review history: predictions this agronomist has
    reviewed (confirmed or corrected), newest first.
    """
    if current_user.role != "agronomist":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agronomists can view their review history"
        )

    reviews = db.query(PredictionReview).filter(
        PredictionReview.agronomist_id == current_user.id
    ).order_by(PredictionReview.reviewed_at.desc()).all()

    result = []
    for review in reviews:
        pred = db.query(Prediction).filter(Prediction.id == review.prediction_id).first()
        if not pred:
            continue
        farmer = db.query(User).filter(User.id == pred.farmer_id).first()
        weather = (
            WeatherSnapshotRead.model_validate(pred.weather_snapshot).model_dump(mode="json")
            if pred.weather_snapshot else None
        )
        result.append({
            "review_id": review.id,
            "status": review.status,
            "crop_type": review.crop_type,
            "corrected_disease": review.corrected_disease,
            "notes": review.notes,
            "reviewed_at": review.reviewed_at,
            "prediction": {
                "id": pred.id,
                "image_id": pred.image_id,
                "image_ids": _prediction_image_ids(pred, db),
                "farmer_id": pred.farmer_id,
                "farmer_name": farmer.full_name if farmer else None,
                "farmer_email": farmer.email if farmer else None,
                "farmer_location": _build_location_path(farmer, db) if farmer else None,
                "farmer_latitude": farmer.latitude if farmer else None,
                "farmer_longitude": farmer.longitude if farmer else None,
                "farmer_location_source": farmer.location_source if farmer else None,
                "predicted_disease": pred.predicted_disease,
                "confidence": pred.confidence,
                "crop_type": pred.crop_type,
                "created_at": pred.created_at,
                "weather_snapshot": weather,
            },
        })

    return result


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single prediction by ID.
    Farmer can view their own predictions.
    Agronomist can view predictions for their assigned regions.
    """
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Permission check: farmer sees own, agronomist sees assigned regions
    if current_user.role == "farmer":
        if prediction.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own predictions"
            )
    elif current_user.role == "agronomist":
        # Check if farmer is in agronomist's assigned region
        # This requires querying Assignment model
        # For now: TODO implement region-based filtering
        pass

    farmer = db.query(User).filter(User.id == prediction.farmer_id).first()
    return PredictionResponse(
        id=prediction.id,
        farmer_id=prediction.farmer_id,
        farmer_name=farmer.full_name if farmer else None,
        farmer_email=farmer.email if farmer else None,
        farmer_phone=farmer.phone_number if farmer else None,
        farmer_location=_build_location_path(farmer, db) if farmer else None,
        farmer_latitude=farmer.latitude if farmer else None,
        farmer_longitude=farmer.longitude if farmer else None,
        farmer_location_source=farmer.location_source if farmer else None,
        image_id=prediction.image_id,
        image_ids=_prediction_image_ids(prediction, db),
        crop_type=prediction.crop_type,
        predicted_disease=prediction.predicted_disease,
        confidence=prediction.confidence,
        model_version=prediction.model_version,
        all_predictions=prediction.all_predictions,
        created_at=prediction.created_at,
        weather_snapshot=prediction.weather_snapshot,
    )


@router.get("/user/me", response_model=List[PredictionResponse])
def get_my_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all predictions for current user (farmer).
    Returns list of predictions with newest first.
    """
    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can view their predictions"
        )

    predictions = db.query(Prediction).filter(
        Prediction.farmer_id == current_user.id
    ).order_by(Prediction.created_at.desc()).all()

    return [
        PredictionResponse(
            id=p.id,
            farmer_id=p.farmer_id,
            image_id=p.image_id,
            image_ids=_prediction_image_ids(p, db),
            crop_type=p.crop_type,
            predicted_disease=p.predicted_disease,
            confidence=p.confidence,
            model_version=p.model_version,
            all_predictions=p.all_predictions,
            created_at=p.created_at,
            weather_snapshot=p.weather_snapshot,
        )
        for p in predictions
    ]


# ========================================
# NOTE: /pending endpoint moved to top (before /{prediction_id})
# See above for the complete implementation
# ========================================


import base64
import os
from datetime import datetime

@router.post('/save', response_model=PredictionResponse)
async def save_prediction(
    data: savePredictionRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save a prediction from ML inference with base64 image.
    Farmers upload images and get predictions.
    """
    try:
        # Decode base64 image and save to disk
        image_data = base64.b64decode(data.image_base64)
        
        # Create directory if it doesn't exist
        image_dir = "storage/predictions"
        os.makedirs(image_dir, exist_ok=True)
        
        # Generate filename: farmer_id_timestamp.jpg
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{data.predicted_disease}_{data.crop_type or 'None'}_{current_user.id}_{timestamp}.jpg"
        file_path = os.path.join(image_dir, filename)
        
        # Save image to disk
        with open(file_path, 'wb') as f:
            f.write(image_data)
        
        # Create Image record
        image = Image(
            farmer_id=current_user.id,
            file_path=file_path,
            image_metadata='AI prediction upload'
        )
        db.add(image)
        db.flush()  # Get the image.id without committing yet
        
        # Create Prediction record
        prediction = Prediction(
            farmer_id=current_user.id,
            image_id=image.id,
            crop_type=data.crop_type,
            predicted_disease=data.predicted_disease,
            confidence=data.confidence,
            all_predictions=data.all_predictions,
            model_version=data.model_version or 'plant_disease_resnet18_v1'
        )
        
        db.add(prediction)
        db.flush()  # prediction.id needed to link the primary image back
        image.prediction_id = prediction.id
        db.commit()
        db.refresh(prediction)

        # Attach climate context (GPS coords → district centroid fallback).
        # Never raises: a weather outage must not fail a disease prediction.
        from app.services.weather_service import create_snapshot_for_prediction
        create_snapshot_for_prediction(prediction, current_user, db)

        return prediction

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save prediction: {str(e)}"
        )


class AttachmentUploadRequest(BaseModel):
    """Farmer attaching extra photos to an existing prediction."""
    images: List[str]  # base64-encoded image payloads


@router.post("/{prediction_id}/attachments", response_model=List[int])
def add_prediction_attachments(
    prediction_id: int,
    payload: AttachmentUploadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Farmer attaches extra photos to their own prediction — used when the
    agronomist asks for more angles to confirm a diagnosis.
    Returns the ids of the newly created images.
    """
    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can attach photos to a prediction"
        )

    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.farmer_id == current_user.id,
    ).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )

    if not payload.images or len(payload.images) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attach between 1 and 5 photos"
        )

    image_dir = "storage/predictions"
    os.makedirs(image_dir, exist_ok=True)
    new_ids: List[int] = []

    try:
        for i, b64 in enumerate(payload.images):
            raw = base64.b64decode(b64)
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S%f")
            filename = f"attachment_{prediction_id}_{current_user.id}_{timestamp}_{i}.jpg"
            file_path = os.path.join(image_dir, filename)
            with open(file_path, 'wb') as f:
                f.write(raw)

            img = Image(
                farmer_id=current_user.id,
                prediction_id=prediction_id,
                file_path=file_path,
                image_metadata='Additional photo for agronomist review',
            )
            db.add(img)
            db.flush()
            new_ids.append(img.id)

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save attachments: {str(e)}"
        )

    return new_ids

from app.models.prediction_review import PredictionReview
from app.schemas.prediction_review import PredictionReviewCreate, PredictionReviewResponse

@router.post("/{prediction_id}/review", response_model=PredictionReviewResponse)
def create_prediction_review(
    prediction_id: int,
    review: PredictionReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Agronomist submits review for a prediction (confirm/correct).
    Creates PredictionReview record for data labeling.
    """
    # Verify user is agronomist
    if current_user.role != "agronomist":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agronomists can review predictions"
        )
    
    # Get the prediction
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Verify prediction is in agronomist's assigned region
    from app.models.assignment import Assignment
    assignments = db.query(Assignment).filter(
        Assignment.agronomist_id == current_user.id,
        Assignment.is_active == True
    ).all()
    
    # Get farmer's region info
    farmer = db.query(User).filter(User.id == prediction.farmer_id).first()
    
    # Check if farmer is in any of agronomist's regions AND same organization
    has_permission = False
    for assignment in assignments:
        if assignment.organization_id != farmer.organization_id:
            continue  # farmers belong to a specific cooperative
        if assignment.village_id and farmer.village_id == assignment.village_id:
            has_permission = True
            break
        elif assignment.cell_id and farmer.cell_id == assignment.cell_id:
            has_permission = True
            break
        elif assignment.sector_id and farmer.sector_id == assignment.sector_id:
            has_permission = True
            break
        elif assignment.district_id and farmer.district_id == assignment.district_id:
            has_permission = True
            break
        elif assignment.province_id and farmer.province_id == assignment.province_id:
            has_permission = True
            break

    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This prediction is not in your assigned region"
        )
    
    # Create PredictionReview record
    db_review = PredictionReview(
        prediction_id=prediction_id,
        agronomist_id=current_user.id,
        status=review.status,
        crop_type=review.crop_type,
        corrected_disease=review.corrected_disease,
        notes=review.notes,
        reviewed_at=datetime.utcnow()
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return db_review


@router.get("/{prediction_id}/feedback", response_model=List[dict])
def get_prediction_feedback(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get agronomist feedback/reviews for a prediction.
    Farmer can see reviews for their own predictions.
    Agronomist can see reviews they created.
    """
    # Get prediction
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Permission check
    if current_user.role == "farmer":
        if prediction.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view feedback for your own predictions"
            )
    elif current_user.role != "agronomist":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers and agronomists can view feedback"
        )
    
    # Get all reviews for this prediction
    reviews = db.query(PredictionReview).filter(
        PredictionReview.prediction_id == prediction_id
    ).all()
    
    feedback = [
        {
            "id": review.id,
            "status": review.status,
            "crop_type": review.crop_type,
            "corrected_disease": review.corrected_disease,
            "notes": review.notes,
            "reviewed_at": review.reviewed_at,
            "agronomist_id": review.agronomist_id,
        }
        for review in reviews
    ]
    
    return feedback


# ========================================
# MESSAGING ENDPOINTS
# ========================================

from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse, MessageListResponse


@router.post("/{prediction_id}/message", response_model=MessageResponse)
def send_message_to_farmer(
    prediction_id: int,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Agronomist sends a message to a farmer about a specific prediction.
    This allows direct communication about advice, corrections, or follow-ups.
    """
    # Verify user is agronomist
    if current_user.role != "agronomist":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agronomists can send messages"
        )
    
    # Get the prediction
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Verify agronomist has permission to message this farmer (same region check)
    from app.models.assignment import Assignment
    assignments = db.query(Assignment).filter(
        Assignment.agronomist_id == current_user.id,
        Assignment.is_active.is_(True)
    ).all()
    
    farmer = db.query(User).filter(User.id == prediction.farmer_id).first()
    
    has_permission = False
    for assignment in assignments:
        if assignment.organization_id != farmer.organization_id:
            continue  # farmers belong to a specific cooperative
        if assignment.village_id and farmer.village_id == assignment.village_id:
            has_permission = True
            break
        elif assignment.cell_id and farmer.cell_id == assignment.cell_id:
            has_permission = True
            break
        elif assignment.sector_id and farmer.sector_id == assignment.sector_id:
            has_permission = True
            break
        elif assignment.district_id and farmer.district_id == assignment.district_id:
            has_permission = True
            break
        elif assignment.province_id and farmer.province_id == assignment.province_id:
            has_permission = True
            break

    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This farmer is not in your assigned region"
        )
    
    # Create message
    db_message = Message(
        agronomist_id=current_user.id,
        farmer_id=prediction.farmer_id,
        prediction_id=prediction_id,
        title=message_data.title,
        body=message_data.body,
        is_read=False,
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Build response with agronomist name
    return MessageResponse(
        id=db_message.id,
        agronomist_id=db_message.agronomist_id,
        agronomist_name=current_user.full_name or current_user.email,
        farmer_id=db_message.farmer_id,
        prediction_id=db_message.prediction_id,
        title=db_message.title,
        body=db_message.body,
        is_read=db_message.is_read,
        created_at=db_message.created_at,
        updated_at=db_message.updated_at,
    )


@router.get("/messages/inbox", response_model=list[MessageListResponse])
def get_farmer_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all messages for current farmer (from agronomists).
    Messages are sorted by newest first.
    """
    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can view messages"
        )
    
    messages = db.query(Message).filter(
        Message.farmer_id == current_user.id
    ).order_by(Message.created_at.desc()).all()
    
    response_data = []
    for msg in messages:
        agronomist = db.query(User).filter(User.id == msg.agronomist_id).first()
        response_data.append(MessageListResponse(
            id=msg.id,
            agronomist_id=msg.agronomist_id,
            agronomist_name=agronomist.full_name or agronomist.email if agronomist else None,
            farmer_id=msg.farmer_id,
            prediction_id=msg.prediction_id,
            title=msg.title,
            body=msg.body,
            is_read=msg.is_read,
            created_at=msg.created_at,
        ))
    
    return response_data


@router.get("/messages/{message_id}", response_model=MessageResponse)
def get_message_detail(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get full message details. Only the farmer who received it can view it.
    Marks message as read when viewed.
    """
    message = db.query(Message).filter(
        Message.id == message_id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Permission check - only recipient can view
    if message.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own messages"
        )
    
    # Mark as read
    if not message.is_read:
        message.is_read = True
        db.commit()
    
    # Build response with agronomist info
    agronomist = db.query(User).filter(User.id == message.agronomist_id).first()
    
    return MessageResponse(
        id=message.id,
        agronomist_id=message.agronomist_id,
        agronomist_name=agronomist.full_name or agronomist.email if agronomist else None,
        farmer_id=message.farmer_id,
        prediction_id=message.prediction_id,
        title=message.title,
        body=message.body,
        is_read=message.is_read,
        created_at=message.created_at,
        updated_at=message.updated_at,
    )

# ============================================================================
# ORGANIZATION DISEASE SUMMARY — cooperative admin outbreak dashboard
# ============================================================================

@router.get('/organization/summary')
def organization_disease_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregated disease-surveillance stats for the cooperative's organization.
    Answers: which diseases are spreading, where (sector/cell), and how fast.
    """
    if current_user.role != 'cooperative_admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail='Only cooperative admins can view the disease summary')
    if not current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail='No organization linked to this account')

    from collections import Counter
    from datetime import timedelta
    from sqlalchemy.orm import joinedload

    now = datetime.utcnow()
    since_30d = now - timedelta(days=30)
    since_7d = now - timedelta(days=7)

    preds = (
        db.query(Prediction)
        .join(User, Prediction.farmer_id == User.id)
        .options(joinedload(Prediction.farmer))
        .filter(User.organization_id == current_user.organization_id)
        .all()
    )

    disease_30d: Counter = Counter()
    disease_7d: Counter = Counter()
    hotspots: Counter = Counter()
    loc_disease: Counter = Counter()
    weekly: dict = {}
    healthy_30d = 0

    for p in preds:
        d = p.predicted_disease
        if p.created_at >= since_30d:
            disease_30d[d] += 1
            if 'healthy' in d.lower():
                healthy_30d += 1
            else:
                u = p.farmer
                loc = (
                    (u.cell.name if u.cell else None)
                    or (u.sector.name if u.sector else None)
                    or (u.district.name if getattr(u, 'district', None) else None)
                ) if u else None
                if loc:
                    hotspots[loc] += 1
                    loc_disease[(loc, d)] += 1
            week_start = (p.created_at - timedelta(days=p.created_at.weekday())).date()
            weekly[week_start] = weekly.get(week_start, 0) + 1
            if p.created_at >= since_7d:
                disease_7d[d] += 1

    alerts = [
        {'location': loc, 'disease': d, 'count': c}
        for (loc, d), c in sorted(loc_disease.items(), key=lambda kv: -kv[1])
        if c >= 3
    ]

    return {
        'totals': {
            'all_time': len(preds),
            'last_30d': sum(disease_30d.values()),
            'last_7d': sum(disease_7d.values()),
            'diseased_30d': sum(disease_30d.values()) - healthy_30d,
            'healthy_30d': healthy_30d,
        },
        'diseases': sorted(
            [{'disease': d, 'count_30d': disease_30d[d], 'count_7d': disease_7d[d]}
             for d in disease_30d],
            key=lambda x: -x['count_30d'],
        ),
        'hotspots': [{'location': loc, 'reports': c}
                     for loc, c in hotspots.most_common(5)],
        'outbreak_alerts': alerts[:5],
        'weekly': [{'week': d.strftime('%b %d'), 'count': weekly[d]}
                   for d in sorted(weekly)],
    }
