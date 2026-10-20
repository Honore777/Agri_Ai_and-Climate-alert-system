from pydantic import BaseModel

from datetime import datetime 

from typing import Optional 

class RegistrationCodeCreate(BaseModel):
    role:str
    expires_at: Optional[datetime]= None


class RegistrationCodeRead(BaseModel):
    id:int
    code:str
    role:str
    organization_id:int
    is_used:bool
    expires_at: Optional[datetime]
    created_at:datetime
    created_by:int

    class Config:
        from_attributes=True