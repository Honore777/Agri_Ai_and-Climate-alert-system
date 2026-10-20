"""
PREDICTION_REVIEW.PY - Agronomist Review & Validation
======================================================

When an agronomist reviews a prediction, they:
1. Confirm the AI was correct (status='confirmed')
2. Correct the AI if wrong (status='corrected')
3. Enter crop_type (required for data quality)
4. Add notes explaining their decision

This creates our labeled training dataset!
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class PredictionReview(Base):
    __tablename__ = 'prediction_reviews'
    
    id = Column(Integer, primary_key=True, index=True)
    
    # LINK: Which prediction is being reviewed?
    prediction_id = Column(Integer, ForeignKey('predictions.id'), nullable=False, index=True)
    prediction = relationship('Prediction', back_populates='reviews')
    
    # WHO: Which agronomist reviewed it?
    agronomist_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    agronomist = relationship('User', foreign_keys=[agronomist_id])
    
    # DECISION: What did agronomist decide?
    status = Column(String, nullable=False)  # "confirmed" or "corrected"
    
    # DATA QUALITY: Agronomist must provide crop_type (AI's guess might be wrong)
    crop_type = Column(String, nullable=False)  # REQUIRED! "Tomato", "Potato", etc.
    
    # CORRECTION: If AI was wrong, what's the real disease?
    corrected_disease = Column(String, nullable=True)  # Only if status='corrected'
    
    # FEEDBACK: Why did they confirm/correct?
    notes = Column(String, nullable=True)  # "Fungal infection, spray X", etc.
    
    # AUDIT TRAIL
    reviewed_at = Column(DateTime, default=datetime.utcnow, nullable=False)