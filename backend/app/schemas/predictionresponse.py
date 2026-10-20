from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime


class PredictionCreate(BaseModel):
    """Request to create a prediction"""
    image_id: int
    predicted_disease: str
    confidence: float
    model_version: Optional[str] = None


class WeatherSnapshotRead(BaseModel):
    """Climate context captured when the prediction was made."""
    id: int
    prediction_id: int
    latitude: float
    longitude: float
    location_source: Optional[str] = None
    data: Dict
    fetched_at: datetime

    class Config:
        from_attributes = True


class PredictionResponse(BaseModel):
    """Response for a prediction (stored in DB)"""
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None  # Farmer name for agronomist to see
    farmer_email: Optional[str] = None  # Farmer email for agronomist to contact
    farmer_phone: Optional[str] = None  # Farmer phone for agronomist to contact
    farmer_location: Optional[str] = None  # Admin path: Province > ... > Village
    farmer_latitude: Optional[float] = None  # Precise GPS if farmer provided it
    farmer_longitude: Optional[float] = None
    farmer_location_source: Optional[str] = None  # 'gps' | 'manual' | None
    image_id: int
    crop_type: Optional[str] = None
    predicted_disease: str
    confidence: float
    model_version: Optional[str] = None
    all_predictions: Optional[Dict[str, float]] = None
    created_at: datetime
    weather_snapshot: Optional[WeatherSnapshotRead] = None

    class Config:
        from_attributes = True


class PredictionInferenceResponse(BaseModel):
    """Response from /inference/predict endpoint"""
    disease: str
    confidence: float
    all_predictions: Dict[str, float]


class savePredictionRequest(BaseModel):
    crop_type:Optional[str]=None
    
    predicted_disease:str
    confidence:float
    all_predictions:Dict[str,float]
    image_base64:str
    model_version:Optional[str]=None

    