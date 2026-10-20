"""
MESSAGE.PY - Agronomist to Farmer Messaging
============================================

Messages sent by agronomists to farmers for:
1. General advice about their crop
2. Follow-up on specific predictions
3. Tips and best practices
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True, index=True)
    
    # WHO: Which agronomist sent it?
    agronomist_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    agronomist = relationship('User', foreign_keys=[agronomist_id], back_populates='sent_messages')
    
    # TO: Which farmer is receiving it?
    farmer_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    farmer = relationship('User', foreign_keys=[farmer_id], back_populates='received_messages')
    
    # CONTEXT: Is this about a specific prediction?
    prediction_id = Column(Integer, ForeignKey('predictions.id'), nullable=True, index=True)
    prediction = relationship('Prediction', back_populates='messages')
    
    # MESSAGE CONTENT
    title = Column(String, nullable=False)  # e.g., "Advice for tomato crop", "Follow-up on early blight"
    body = Column(Text, nullable=False)  # e.g., "Your plants need nitrogen fertilizer..."
    
    # STATUS
    is_read = Column(Boolean, default=False)  # Has farmer seen this?
    
    # METADATA
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        status = "✓ Read" if self.is_read else "✗ Unread"
        return f"<Message: {self.title} ({status})>"
