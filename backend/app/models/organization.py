from sqlalchemy import Column, Integer, String , DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base

class Organization(Base):
    __tablename__='organizations'

    id= Column(Integer,primary_key=True, index=True)
    name=Column(String, nullable=False, unique=True, index=True)

    type=Column(String, nullable=False)

    registration_code= Column(String(50), unique=True, nullable=False)

    region= Column(String, nullable=False)

    # Soft-disable: a deactivated org freezes all its members (login blocked).
    # Prefer this over deletion — history and data stay intact.
    is_active= Column(Boolean, default=True, nullable=False)

    created_at= Column(DateTime, default=datetime.utcnow)
    updated_at= Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users= relationship('User', back_populates='organization')

    registration_codes=relationship('RegistrationCode', back_populates='organization')
