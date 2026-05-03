from fastapi import APIRouter, Query
from pydantic import BaseModel
import httpx
import numpy as np
import pickle
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_URL     = "https://api.openweathermap.org/data/2.5/weather"

# ── Districts ─────────────────────────────────────────────
DISTRICTS = [
    {"name": "Moradabad",    "state": "Uttar Pradesh", "lat": 28.8386, "lon": 78.7733, "population": 887000},
    {"name": "Bareilly",     "state": "Uttar Pradesh", "lat": 28.3670, "lon": 79.4304, "population": 905000},
    {"name": "Lucknow",      "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "population": 2817000},
    {"name": "Agra",         "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081, "population": 1585000},
    {"name": "Kanpur",       "state": "Uttar Pradesh", "lat": 26.4499, "lon": 80.3319, "population": 2765000},
    {"name": "Varanasi",     "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739, "population": 1198000},
    {"name": "Meerut",       "state": "Uttar Pradesh", "lat": 28.9845, "lon": 77.7064, "population": 1305000},
    {"name": "Rampur",       "state": "Uttar Pradesh", "lat": 28.8190, "lon": 79.0253, "population": 553000},
    {"name": "Bijnor",       "state": "Uttar Pradesh", "lat": 29.3727, "lon": 78.1360, "population": 520000},
    {"name": "Shahjahanpur", "state": "Uttar Pradesh", "lat": 27.8819, "lon": 79.9051, "population": 702000},
]

# ── Load ML Model ─────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "../models/model.pkl")
LABEL_PATH = os.path.join(BASE_DIR, "../models/label_encoder.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    MODEL_LOADED = True
    print("✅ ML Model loaded in alerts")
except Exception:
    MODEL_LOADED = False
    model        = None

LEVEL_COLORS = {
    "Critical": "#E24B4A",
    "High"    : "#EF9F27",
    "Medium"  : "#185FA5",
    "Low"     : "#639922",
}

# ── Alert Schema ──────────────────────────────────────────
class AlertItem(BaseModel):
    district     : str
    state        : str
    alert_level  : str
    alert_color  : str
    message      : str
    temperature  : float
    humidity     : int
    rainfall_mm  : float
    wind_kmh     : float
    disaster_type: str
    timestamp    : str

# ── Helper Functions ──────────────────────────────────────
def get_alert_level(rainfall: float, wind: float, temp: float) -> str:
    score = 0
    if rainfall > 100:  score += 3
    elif rainfall > 50: score += 2
    elif rainfall > 20: score += 1
    if wind > 80:  score += 2
    elif wind > 50: score += 1
    if temp > 42:  score += 1
    if score >= 5: return "Critical"
    if score >= 3: return "High"
    if score >= 1: return "Medium"
    return "Low"

def get_disaster_type(rainfall: float, wind: float) -> str:
    if rainfall > 100:  return "Flash Flood"
    elif rainfall > 60: return "Riverine Flood"
    elif rainfall > 25: return "Urban Flood"
    elif wind > 80:     return "Cyclone"
    else:               return "Normal"

async def fetch_weather(lat: float, lon: float) -> dict:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(WEATHER_URL, params={
                "lat"  : lat,
                "lon"  : lon,
                "appid": WEATHER_API_KEY,
                "units": "metric"
            })
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "temp"    : data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "rainfall": data.get("rain", {}).get("1h", 0.0),
                    "wind"    : data["wind"]["speed"] * 3.6,
                    "desc"    : data["weather"][0]["description"],
                }
    except Exception as e:
        print(f"Weather API error: {e}")

    import random
    return {
        "temp"    : round(random.uniform(28, 42), 1),
        "humidity": random.randint(60, 95),
        "rainfall": round(random.uniform(0, 80), 1),
        "wind"    : round(random.uniform(10, 60), 1),
        "desc"    : "partly cloudy",
    }

# ── GET /alerts ───────────────────────────────────────────
@router.get("/alerts", response_model=list[AlertItem])
async def get_alerts(
    state     : str = Query("Uttar Pradesh", description="State name"),
    min_level : str = Query("Low",           description="Minimum alert level")
):
    level_order = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}
    min_order   = level_order.get(min_level, 0)
    alerts      = []

    for district in DISTRICTS:
        weather = await fetch_weather(district["lat"], district["lon"])
        level   = get_alert_level(weather["rainfall"], weather["wind"], weather["temp"])
        dtype   = get_disaster_type(weather["rainfall"], weather["wind"])

        if level_order[level] >= min_order:
            alerts.append(AlertItem(
                district     = district["name"],
                state        = district["state"],
                alert_level  = level,
                alert_color  = LEVEL_COLORS[level],
                message      = (
                    f"{district['name']} mein {level.lower()} risk — "
                    f"rainfall {weather['rainfall']}mm, "
                    f"wind {weather['wind']:.0f}km/h"
                ),
                temperature  = weather["temp"],
                humidity     = weather["humidity"],
                rainfall_mm  = weather["rainfall"],
                wind_kmh     = round(weather["wind"], 1),
                disaster_type= dtype,
                timestamp    = datetime.now().isoformat(),
            ))

    alerts.sort(key=lambda a: level_order[a.alert_level], reverse=True)
    return alerts

# ── GET /alerts/summary ───────────────────────────────────
@router.get("/alerts/summary")
async def alerts_summary():
    all_alerts = await get_alerts(state="Uttar Pradesh", min_level="Low")
    counts     = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    total_risk = 0

    for alert in all_alerts:
        counts[alert.alert_level] += 1
        d = next((d for d in DISTRICTS if d["name"] == alert.district), None)
        if d:
            pct        = {"Critical": 0.70, "High": 0.45, "Medium": 0.20, "Low": 0.05}
            total_risk += int(d["population"] * pct[alert.alert_level])

    return {
        "total_districts": len(DISTRICTS),
        "critical_count" : counts["Critical"],
        "high_count"     : counts["High"],
        "medium_count"   : counts["Medium"],
        "low_count"      : counts["Low"],
        "total_at_risk"  : total_risk,
        "timestamp"      : datetime.now().isoformat(),
    }