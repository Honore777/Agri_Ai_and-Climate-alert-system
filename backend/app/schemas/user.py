from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str
    role: str
    organization_id: Optional[int] = None

class UserRead(BaseModel):
    id:int
    email:EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role:str
    is_active: Optional[bool] = True
    organization_id:Optional[int]

    class Config:
        from_attributes= True


class UserAdminRead(BaseModel):
    """Admin-facing user view — includes status for account management."""
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: str
    is_active: Optional[bool] = True
    organization_id: Optional[int] = None
    location_path: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    """Activate/deactivate a user account"""
    is_active: bool


class UserSelfUpdate(BaseModel):
    """
    Update own profile. Password changes require the current password;
    email changes must stay unique.
    """
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class PasswordResetResponse(BaseModel):
    """Temporary password shown to the admin ONCE, to share with the user."""
    user_id: int
    email: str
    temporary_password: str


class CoordinatesUpdate(BaseModel):
    """GPS coordinates from the browser Geolocation API (or manual entry)."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_source: str = 'gps'  # 'gps' | 'district_fallback' | 'manual'


class AdminLocationUpdate(BaseModel):
    """Administrative hierarchy update. Any subset of levels may be sent;
    each provided id must exist and sit inside its effective parent."""
    province_id: Optional[int] = None
    district_id: Optional[int] = None
    sector_id: Optional[int] = None
    cell_id: Optional[int] = None
    village_id: Optional[int] = None


class UserLocationRead(BaseModel):
    """Everything the frontend needs to render the farmer's location status."""
    # Administrative location (drives agronomist assignment)
    province_id: Optional[int] = None
    district_id: Optional[int] = None
    sector_id: Optional[int] = None
    cell_id: Optional[int] = None
    village_id: Optional[int] = None
    location_path: Optional[str] = None  # "KIGALI > Gasabo > ... > Gihanga"
    # Geographic location (drives weather)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None
    location_updated_at: Optional[datetime] = None
    # True when coords are missing or only a fallback — frontend shows the
    # "enable precise location" prompt.
    needs_precise_location: bool = True

