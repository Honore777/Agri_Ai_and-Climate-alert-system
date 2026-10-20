"""
WEATHER_SNAPSHOT.PY - Climate Context for Predictions
=====================================================

Captures the weather conditions around the time and place a
prediction was made, so agronomists can review the AI result
together with the climate trend (rainfall, temperature, humidity).

A snapshot is a historical record: it is never updated after the
fact. If a farmer moves, old predictions keep the weather of the
place where they were taken.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class WeatherSnapshot(Base):
    __tablename__ = 'weather_snapshots'

    id = Column(Integer, primary_key=True, index=True)

    # WHAT: the prediction this climate data belongs to
    prediction_id = Column(Integer, ForeignKey('predictions.id'), nullable=False, index=True)
    prediction = relationship('Prediction', back_populates='weather_snapshot')

    # WHERE: coordinates used for the weather lookup
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # COORDS SOURCE: 'gps' | 'district_fallback' | 'manual'
    location_source = Column(String, nullable=True)

    # DATA: raw series + summary from Open-Meteo
    # {
    #   "current": {...},
    #   "history": [{"date": "...", "temp_max": .., "precipitation": ..}, ...],
    #   "forecast": [...],
    #   "summary": {"avg_temp_7d": .., "total_rain_7d": .., ...}
    # }
    data = Column(JSON, nullable=False)

    # METADATA
    fetched_at = Column(DateTime, default=datetime.utcnow, nullable=False)
