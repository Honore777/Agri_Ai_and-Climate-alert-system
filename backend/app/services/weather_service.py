"""
WEATHER_SERVICE.PY - Open-Meteo Integration
============================================

Fetches climate context for a farmer's location and stores an immutable
WeatherSnapshot against each prediction.

Resolution order for coordinates:
  1. user.latitude / user.longitude   (farmer's own GPS / manual entry)
  2. district centroid                (fallback when GPS is denied)
  3. None                             (no snapshot - prediction still works)

Open-Meteo is free and needs no API key. One call gives us the last 30
days + next 7 days: the agronomist sees the historical trend AND the
coming weather next to the AI result.
"""

import json
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.district import District
from app.models.prediction import Prediction
from app.models.weather_snapshot import WeatherSnapshot

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
DAILY_VARS = "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean"
HISTORY_DAYS = 30
FORECAST_DAYS = 7
TIMEOUT_SECONDS = 10

_DISTRICT_COORDS_PATH = Path(__file__).parent.parent / "data" / "district_coordinates.json"
_district_coords_cache: Optional[dict] = None


def _load_district_coords() -> dict:
    """Lazy-load the district centroid lookup (30 districts)."""
    global _district_coords_cache
    if _district_coords_cache is None:
        with open(_DISTRICT_COORDS_PATH, "r", encoding="utf-8") as f:
            _district_coords_cache = json.load(f)
    return _district_coords_cache


def resolve_coordinates(user: User, db: Session) -> Tuple[Optional[float], Optional[float], Optional[str]]:
    """
    Return (latitude, longitude, source) for weather lookups.

    'gps'               → farmer granted precise location
    'district_fallback' → coords came from the district centroid table
    'manual'            → typed in by hand
    None                → we know nothing; caller skips weather
    """
    if user.latitude is not None and user.longitude is not None:
        return user.latitude, user.longitude, user.location_source or "gps"

    if user.district_id is not None:
        district = db.query(District).filter(District.id == user.district_id).first()
        if district:
            coords = _load_district_coords().get(district.name.strip().lower())
            if coords:
                return coords["latitude"], coords["longitude"], "district_fallback"

    return None, None, None


def fetch_weather(latitude: float, longitude: float) -> dict:
    """Call Open-Meteo: past 30 days + next 7 days in one request."""
    response = requests.get(
        OPEN_METEO_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "daily": DAILY_VARS,
            "past_days": HISTORY_DAYS,
            "forecast_days": FORECAST_DAYS,
            "timezone": "Africa/Kigali",
        },
        timeout=TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def build_summary(payload: dict) -> dict:
    """
    Compress the raw daily series into the numbers an agronomist actually
    scans for: recent rain, heat, humidity, plus simple climate alerts.
    """
    daily = payload.get("daily", {})
    dates = daily.get("time", [])
    tmax = daily.get("temperature_2m_max", [])
    tmin = daily.get("temperature_2m_min", [])
    rain = daily.get("precipitation_sum", [])
    humidity = daily.get("relative_humidity_2m_mean", [])

    today_index = len(dates) - FORECAST_DAYS  # first forecast day index
    history_slice = slice(max(0, today_index - 7), today_index)
    month_slice = slice(0, today_index)

    def _avg(values, s):
        vals = [v for v in values[s] if v is not None]
        return round(sum(vals) / len(vals), 1) if vals else None

    def _sum(values, s):
        vals = [v for v in values[s] if v is not None]
        return round(sum(vals), 1) if vals else None

    rain_7d = _sum(rain, history_slice)
    rain_30d = _sum(rain, month_slice)
    humidity_7d = _avg(humidity, history_slice)

    alerts = []
    if rain_7d is not None and humidity_7d is not None:
        if rain_7d > 20 and humidity_7d > 75:
            alerts.append({
                "type": "fungal_risk",
                "message": "Heavy rain + high humidity this week — elevated risk of fungal diseases (blight, mildew).",
            })
    if rain_30d is not None and rain_30d < 10:
        alerts.append({
            "type": "dry_spell",
            "message": "Very little rain in the past month — drought stress likely; check irrigation.",
        })

    return {
        "avg_temp_max_7d": _avg(tmax, history_slice),
        "avg_temp_min_7d": _avg(tmin, history_slice),
        "avg_humidity_7d": humidity_7d,
        "total_rain_7d_mm": rain_7d,
        "total_rain_30d_mm": rain_30d,
        "alerts": alerts,
    }


def create_snapshot_for_prediction(
    prediction: Prediction,
    user: User,
    db: Session,
) -> Optional[WeatherSnapshot]:
    """
    Resolve the farmer's coordinates, fetch Open-Meteo, and store a
    WeatherSnapshot row linked to the prediction.

    Never raises: a weather outage must not fail a disease prediction.
    Returns None when no coordinates can be resolved or the API fails.
    """
    latitude, longitude, source = resolve_coordinates(user, db)
    if latitude is None:
        return None

    try:
        payload = fetch_weather(latitude, longitude)
    except requests.RequestException:
        return None

    data = {
        "summary": build_summary(payload),
        "history": _daily_series(payload, end_offset=-FORECAST_DAYS),
        "forecast": _daily_series(payload, start_offset=-FORECAST_DAYS),
    }

    snapshot = WeatherSnapshot(
        prediction_id=prediction.id,
        latitude=latitude,
        longitude=longitude,
        location_source=source,
        data=data,
        fetched_at=datetime.utcnow(),
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


def _daily_series(payload: dict, start_offset: int = 0, end_offset: int = None) -> list:
    """Slice the daily arrays into [{date, temp_max, temp_min, rain, humidity}]."""
    daily = payload.get("daily", {})
    dates = daily.get("time", [])
    tmax = daily.get("temperature_2m_max", [])
    tmin = daily.get("temperature_2m_min", [])
    rain = daily.get("precipitation_sum", [])
    humidity = daily.get("relative_humidity_2m_mean", [])

    n = len(dates)
    start = max(0, n + start_offset) if start_offset < 0 else start_offset
    end = n + end_offset if (end_offset is not None and end_offset < 0) else (end_offset or n)

    return [
        {
            "date": dates[i],
            "temp_max": tmax[i] if i < len(tmax) else None,
            "temp_min": tmin[i] if i < len(tmin) else None,
            "rain_mm": rain[i] if i < len(rain) else None,
            "humidity": humidity[i] if i < len(humidity) else None,
        }
        for i in range(start, min(end, n))
    ]
