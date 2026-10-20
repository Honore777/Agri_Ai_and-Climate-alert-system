from pydantic import BaseModel, EmailStr

class FarmerRegisterRequest(BaseModel):
    """Simple farmer registration - code determines role + organization"""
    email: EmailStr
    password: str
    registration_code: str


class FarmerRegisterWithLocationRequest(BaseModel):
    """Farmer registration with location selection - complete form"""
    email: EmailStr
    password: str
    registration_code: str
    phone_number: str          # ✅ NEW: Required phone number
    full_name: str = None      # ✅ NEW: Optional full name
    province_id: int
    district_id: int
    sector_id: int
    cell_id: int
    village_id: int

