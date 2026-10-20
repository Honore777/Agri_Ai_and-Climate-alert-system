"""
MESSAGE SCHEMA - Pydantic models for message requests/responses
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    """Request to send a message from agronomist to farmer"""
    title: str  # e.g., "Advice for your tomato crop"
    body: str  # e.g., "Your plants need nitrogen fertilizer because..."
    prediction_id: Optional[int] = None  # Link to specific prediction if applicable


class MessageResponse(BaseModel):
    """Response when returning a message"""
    id: int
    agronomist_id: int
    agronomist_name: Optional[str] = None
    farmer_id: int
    prediction_id: Optional[int] = None
    title: str
    body: str
    is_read: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Response for listing messages"""
    id: int
    agronomist_id: int
    agronomist_name: Optional[str] = None
    farmer_id: int
    prediction_id: Optional[int] = None
    title: str
    body: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
