from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey,Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base
from app.models.user import User
from app.models.organization import Organization

class RegistrationCode(Base):
    __tablename__='registration_codes'

    id=Column(Integer, primary_key=True, index=True)

    code= Column(String, unique=True, nullable=False, index=True)

    organization_id= Column(Integer, ForeignKey('organizations.id'),nullable=False)

    role= Column(String, nullable=False, default='farmer')

    is_active=Column(Boolean, default=True)

    expires_at= Column(DateTime, nullable=True)

    created_by=Column(Integer, ForeignKey('users.id'),nullable=False)

    created_at=Column(DateTime, default=datetime.utcnow,nullable=False)

    organization= relationship('Organization', back_populates='registration_codes')

    creator= relationship('User', foreign_keys=[created_by])

    # ✅ NEW: Track if code has been used
    is_used = Column(Boolean, default=False, index=True)
    used_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    user_who_used_it = relationship('User', foreign_keys=[used_by_user_id])

    province_id = Column(Integer, ForeignKey('provinces.id'), nullable=True)
    district_id = Column(Integer, ForeignKey('districts.id'), nullable=True)
    sector_id = Column(Integer, ForeignKey('sectors.id'), nullable=True)
    cell_id = Column(Integer, ForeignKey('cells.id'), nullable=True)
    village_id = Column(Integer, ForeignKey('villages.id'), nullable=True)
    
    # Relationships to location models
    province = relationship('Province')
    district = relationship('District')
    sector = relationship('Sector')
    cell = relationship('Cell')
    village = relationship('Village')

