from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class AuditLog(Base):
    __tablename__='audit_logs'

    id=Column(Integer,primary_key=True,index=True)

    actor_id=Column(Integer,ForeignKey('users.id'),nullable=False)

    action=Column(String,nullable=False)

    details= Column(Text,nullable=True)

    created_at=Column(DateTime, default=datetime.utcnow)

    actor= relationship('User', back_populates='audit_logs')
