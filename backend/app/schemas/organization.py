"""
ORGANIZATION SCHEMAS
====================

Pydantic models for request/response validation
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OrganizationCreate(BaseModel):
    """Request to create organization"""
    name: str
    type: str  # 'cooperative' or 'institution'
    region: str  # 'Northern', 'Southern', etc.


class OrganizationUpdate(BaseModel):
    """Request to update organization"""
    name: Optional[str] = None
    region: Optional[str] = None


class OrganizationStatusUpdate(BaseModel):
    """Activate/deactivate an organization"""
    is_active: bool


class OrganizationResponse(BaseModel):
    """Response with organization data"""
    id: int
    name: str
    type: str
    registration_code: str
    region: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True