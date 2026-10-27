from sqlalchemy import Column, Integer, String, ForeignKey , DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base

class Image(Base):
    __tablename__='images'

    id= Column(Integer, primary_key=True, index=True)
    farmer_id= Column(Integer,ForeignKey('users.id'), nullable=False)
    # Links additional photos the farmer attached to an existing prediction
    # (agronomist may ask for more angles to confirm a diagnosis).
    prediction_id= Column(Integer,ForeignKey('predictions.id'), nullable=True)
    file_path=Column(String,nullable=False)
    image_metadata=Column(String, nullable=True)
    uploaded_at= Column(DateTime,default=datetime.utcnow)

    farmer= relationship('User', back_populates='images')
    # Two FK paths exist between images and predictions
    # (predictions.image_id + images.prediction_id), so the join
    # column must be pinned explicitly.
    predictions=relationship(
        'Prediction', back_populates='image', foreign_keys='Prediction.image_id'
    )
    # The prediction this photo was later attached to, if any
    prediction=relationship('Prediction', foreign_keys=[prediction_id])

    
