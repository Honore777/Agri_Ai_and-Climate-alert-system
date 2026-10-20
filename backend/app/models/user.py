from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.base import Base

from app.core.password_utils import hash_password, verify_password, validate_password

class User(Base):
    __tablename__='users'

    id= Column(Integer, primary_key=True, index=True)

    email= Column(String, unique=True, nullable=False, index=True)

    phone_number=Column(String, nullable=False)

    hashed_password= Column(String, nullable=False)

    full_name= Column(String, nullable=True)

    role= Column(String, nullable=False, index=True)

    is_active= Column(Boolean , default=True)

    organization_id= Column(Integer, ForeignKey('organizations.id'), nullable=True)

    created_at= Column(DateTime, default=datetime.utcnow)
    updated_at=Column(DateTime,default=datetime.utcnow, onupdate=datetime.utcnow)
    last_password_change=Column(DateTime, default=datetime.utcnow)

    organization= relationship('Organization', back_populates='users')
    images=relationship('Image', back_populates='farmer')

    audit_logs= relationship('AuditLog', back_populates='actor')

    # Agronomist assignments (only agronomists have assignments to regions)
    assignments_as_agronomist = relationship("Assignment", back_populates="agronomist", foreign_keys="[Assignment.agronomist_id]")
    
    # Predictions made by farmers (images they submitted)
    predictions = relationship('Prediction', back_populates='farmer', foreign_keys='[Prediction.farmer_id]')
    
    # Validations performed by agronomists
    validations = relationship('Validation', back_populates='agronomist', foreign_keys='[Validation.agronomist_id]')
    
    # Messages sent by agronomists to farmers
    sent_messages = relationship('Message', back_populates='agronomist', foreign_keys='[Message.agronomist_id]')
    
    # Messages received by farmers from agronomists
    received_messages = relationship('Message', back_populates='farmer', foreign_keys='[Message.farmer_id]')

    village_id=Column(Integer,ForeignKey('villages.id'),nullable=True)

    # GEOGRAPHIC LOCATION: for weather data (Open-Meteo needs lat/lon).
    # Separate from the administrative FKs above — those drive agronomist
    # assignment; these drive climate lookups.
    latitude=Column(Float, nullable=True)
    longitude=Column(Float, nullable=True)
    # How coords were captured: 'gps' | 'district_fallback' | 'manual'
    location_source=Column(String, nullable=True)
    location_updated_at=Column(DateTime, nullable=True)
    province_id = Column(Integer, ForeignKey('provinces.id'), nullable=True)
    district_id = Column(Integer, ForeignKey('districts.id'), nullable=True)
    sector_id = Column(Integer, ForeignKey('sectors.id'), nullable=True)
    cell_id = Column(Integer, ForeignKey('cells.id'), nullable=True)
    
    # Relationships - bidirectional to support querying location → users
    province = relationship('Province', back_populates='users')
    district = relationship('District', back_populates='users')
    sector = relationship('Sector', back_populates='users')
    cell = relationship('Cell', back_populates='users')
    village = relationship('Village', back_populates='users')

    registration_code_id= Column(Integer, ForeignKey('registration_codes.id'),nullable=True)

    # Registration code used to create this account (many-to-one)
    # User.registration_code will pull from registration_codes table
    registration_code = relationship("RegistrationCode", foreign_keys='User.registration_code_id')

    def set_password(self,password:str):
        if not validate_password(password):
            raise ValueError(
                "Password must be at least 8 characters, include uppercase, "
                "lowercase, number, and special character."
            )
        self.hashed_password=hash_password(password)
    
    def check_password(self,password:str)->bool:
        return verify_password(password, self.hashed_password)


