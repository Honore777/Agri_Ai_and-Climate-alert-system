"""
VALIDATION.PY - Agronomist Validation of Predictions
=====================================================

Agronomists validate (confirm/correct) model predictions.
This feedback is stored here and used for:
1. Displaying validation status to farmers
2. Collecting ground truth for model retraining
3. Tracking agronomist performance
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class Validation(Base):
    __tablename__ = 'validations'

    id = Column(Integer, primary_key=True, index=True)
    
    # WHAT: Which prediction is being validated
    prediction_id = Column(Integer, ForeignKey('predictions.id'), nullable=False, index=True)
    prediction = relationship('Prediction', back_populates='validations')
    
    # WHO: Which agronomist validated it
    agronomist_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    agronomist = relationship(
        'User',
        back_populates='validations',
        foreign_keys=[agronomist_id]
    )
    
    # VALIDATION RESULT: What agronomist confirmed/corrected
    is_correct = Column(Integer, nullable=False)  # 1 = correct, 0 = incorrect, -1 = unsure
    validated_disease = Column(String, nullable=True)  # If agronomist corrected it
    
    # FEEDBACK: Additional notes from agronomist
    feedback = Column(Text, nullable=True)  # e.g., "Disease is more advanced than model suggested"
    
    # METADATA
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        status = "✓ Correct" if self.is_correct == 1 else "✗ Incorrect" if self.is_correct == 0 else "? Unsure"
        return f"<Validation: {self.prediction.predicted_disease} → {self.validated_disease} ({status})>"
