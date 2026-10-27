"""
PREDICTION.PY - ML Model Prediction Storage
============================================

Stores predictions from the ResNet18 model.
Predictions are shown to agronomists for validation.
Once validated, validation records are created with agronomist feedback.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class Prediction(Base):
    __tablename__ = 'predictions'

    id = Column(Integer, primary_key=True, index=True)
    
    # WHO: Which farmer submitted this image
    farmer_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    farmer = relationship('User', back_populates='predictions')
    
    # WHAT: Which image was analyzed
    image_id = Column(Integer, ForeignKey('images.id'), nullable=False, index=True)
    image = relationship(
        'Image', back_populates='predictions', foreign_keys='Prediction.image_id'
    )
    
    # PREDICTION RESULT: What the model predicted
    crop_type=Column(String, nullable=True)
    predicted_disease = Column(String, nullable=False)  # Disease name (e.g., "Early Blight")
    confidence = Column(Float, nullable=False)  # 0.0 to 1.0

    
    # MODEL INFO: Which model version made this prediction
    model_version = Column(String, nullable=True)  # e.g., "plant_disease_resnet18_v1"
    
    # METADATA
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    all_predictions = Column(JSON, nullable=False)  # All 38 diseases with scores
    
    # Relationship to validations (agronomist feedback)
    validations = relationship('Validation', back_populates='prediction', cascade='all, delete')

    # Relationship to reviews (agronomist review & correction)
    reviews = relationship('PredictionReview', back_populates='prediction', cascade='all, delete')
    
    # Messages about this prediction (agronomist to farmer)
    messages = relationship('Message', back_populates='prediction', cascade='all, delete')

    # Climate context captured when this prediction was made
    weather_snapshot = relationship('WeatherSnapshot', back_populates='prediction', uselist=False, cascade='all, delete')