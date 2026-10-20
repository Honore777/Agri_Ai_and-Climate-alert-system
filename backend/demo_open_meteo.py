"""
Demo: calling Open-Meteo directly — the same call weather_service.py makes.
Run:  python demo_open_meteo.py
"""
import requests

# 1. The request — params dict becomes the URL's ?key=value query string
response = requests.get(
    "https://api.open-meteo.com/v1/forecast",
    params={
        "latitude": -1.9441,      # Kigali
        "longitude": 30.0619,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
        "past_days": 7,
        "forecast_days": 3,
        "timezone": "Africa/Kigali",
    },
    timeout=10,
)

# 2. See the exact URL that was sent
print("URL sent:", response.url)
print("Status:", response.status_code)   # 200 = success

# 3. Parse JSON text -> Python dict
payload = response.json()
print("Keys in response:", list(payload.keys()))
print("Keys in daily:", list(payload["daily"].keys()))
print()


# 4. Navigate the dict — same pattern build_summary() uses
def parse_temps(payload):
    """Return [{'date': ..., 'temp_max': ...}, ...] from the raw API dict."""
    daily = payload["daily"]
    rows = []
    for i, date in enumerate(daily["time"]):
        rows.append({
            "date": date,
            "temp_max": daily["temperature_2m_max"][i],
            "temp_min": daily["temperature_2m_min"][i],
            "rain_mm": daily["precipitation_sum"][i],
        })
    return rows


rows = parse_temps(payload)
print(f"Got {len(rows)} days (7 past + 3 forecast):\n")
for row in rows:
    print(f"  {row['date']}   max {row['temp_max']}°C   "
          f"min {row['temp_min']}°C   rain {row['rain_mm']}mm")
