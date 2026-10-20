from sqlalchemy import Column, Integer, String, ForeignKey , DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base

class Image(Base):
    __tablename__='images'

    id= Column(Integer, primary_key=True, index=True)
    farmer_id= Column(Integer,ForeignKey('users.id'), nullable=False)
    file_path=Column(String,nullable=False)
    image_metadata=Column(String, nullable=True)
    uploaded_at= Column(DateTime,default=datetime.utcnow)

    farmer= relationship('User', back_populates='images')
    predictions=relationship('Prediction', back_populates='image')

    
