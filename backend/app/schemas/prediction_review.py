from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PredictionReviewCreate(BaseModel):

    """ Request from agronomist to review a prediction"""

    status:str
    crop_type:str
    corrected_disease:Optional[str]=None
    notes:Optional[str]=None



class PredictionReviewResponse(BaseModel):
    """Response: stored review"""
    id: int
    prediction_id: int
    agronomist_id: int
    status: str
    crop_type: str
    corrected_disease: Optional[str] = None
    notes: Optional[str] = None
    reviewed_at: datetime
    
    class Config:
        from_attributes = True
