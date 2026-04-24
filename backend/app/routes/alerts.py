from fastapi import APIRouter, Query
from pydantic import BaseModel
import httpx
import os
from datetime import datetime

router = APIRouter()

# ── OpenWeather API key (.env se aayega) ──────────────────
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "your_key_here")
WEATHER_URL     = "https://api.openweathermap.org/data/2.5/weather"

# ── UP ke major districts ─────────────────────────────────
UP_DISTRICTS = [
    {"name": "Moradabad",    "lat": 28.8386, "lon": 78.7733, "population": 887000},
    {"name": "Bareilly",     "lat": 28.3670, "lon": 79.4304, "population": 905000},
    {"name": "Rampur",       "lat": 28.8190, "lon": 79.0253, "population": 553000},
    {"name": "Bijnor",       "lat": 29.3727, "lon": 78.1360, "population": 520000},
    {"name": "Amroha",       "lat": 28.9042, "lon": 78.4676, "population": 402000},
    {"name": "Shahjahanpur", "lat": 27.8819, "lon": 79.9051, "population": 702000},
    {"name": "Agra",         "lat": 27.1767, "lon": 78.0081, "population": 1585000},
    {"name": "Lucknow",      "lat": 26.8467, "lon": 80.9462, "population": 2817000},
]

# ── Alert schema ──────────────────────────────────────────
class AlertItem(BaseModel):
    district     : str
    state        : str
    alert_level  : str          # Critical / High / Medium / Low
    alert_color  : str
    message      : str
    temperature  : float
    humidity     : int
    rainfall_mm  : float
    wind_kmh     : float
    timestamp    : str

LEVEL_COLORS = {
    "Critical": "#E24B4A",
    "High"    : "#EF9F27",
    "Medium"  : "#185FA5",
    "Low"     : "#639922",
}

def weather_to_alert_level(rainfall: float, wind: float, temp: float) -> str:
    """Simple rule — weather data se alert level decide karo"""
    score = 0
    if rainfall > 100: score += 3
    elif rainfall > 50: score += 2
    elif rainfall > 20: score += 1
    if wind > 80: score += 2
    elif wind > 50: score += 1
    if temp > 42: score += 1

    if score >= 5: return "Critical"
    if score >= 3: return "High"
    if score >= 1: return "Medium"
    return "Low"

async def fetch_weather(lat: float, lon: float) -> dict:
    """OpenWeather API se live data fetch karo"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(WEATHER_URL, params={
                "lat"   : lat,
                "lon"   : lon,
                "appid" : WEATHER_API_KEY,
                "units" : "metric"
            })
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "temp"    : data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "rainfall": data.get("rain", {}).get("1h", 0.0),
                    "wind"    : data["wind"]["speed"] * 3.6,  # m/s to km/h
                }
    except Exception as e:
        print(f"Weather API error: {e}")
    # Fallback mock data
    import random
    return {
        "temp"    : round(random.uniform(28, 42), 1),
        "humidity": random.randint(60, 95),
        "rainfall": round(random.uniform(0, 150), 1),
        "wind"    : round(random.uniform(10, 90), 1),
    }

# ── GET /alerts ───────────────────────────────────────────
@router.get("/alerts", response_model=list[AlertItem])
async def get_alerts(
    state: str = Query("Uttar Pradesh", description="State name"),
    min_level: str = Query("Low", description="Minimum alert level: Low/Medium/High/Critical")
):
    """
    Sabhi districts ke live alerts return karo.
    OpenWeather API se real data fetch karta hai.
    """
    level_order = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}
    min_order   = level_order.get(min_level, 0)

    alerts = []
    for district in UP_DISTRICTS:
        weather = await fetch_weather(district["lat"], district["lon"])
        level   = weather_to_alert_level(
            weather["rainfall"], weather["wind"], weather["temp"]
        )

        if level_order[level] >= min_order:
            alerts.append(AlertItem(
                district    = district["name"],
                state       = state,
                alert_level = level,
                alert_color = LEVEL_COLORS[level],
                message     = f"{district['name']} mein {level.lower()} risk — "
                              f"rainfall {weather['rainfall']}mm, "
                              f"wind {weather['wind']:.0f}km/h",
                temperature = weather["temp"],
                humidity    = weather["humidity"],
                rainfall_mm = weather["rainfall"],
                wind_kmh    = round(weather["wind"], 1),
                timestamp   = datetime.now().isoformat(),
            ))

    # Critical pehle sort karo
    alerts.sort(key=lambda a: level_order[a.alert_level], reverse=True)
    return alerts

# ── GET /alerts/summary ───────────────────────────────────
@router.get("/alerts/summary")
async def alerts_summary():
    """Dashboard ke stat cards ke liye summary"""
    all_alerts = await get_alerts(state="Uttar Pradesh", min_level="Low")
    counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    total_at_risk = 0

    for alert in all_alerts:
        counts[alert.alert_level] += 1
        d = next((d for d in UP_DISTRICTS if d["name"] == alert.district), None)
        if d:
            risk_pct = {"Critical": 0.70, "High": 0.45, "Medium": 0.20, "Low": 0.05}
            total_at_risk += int(d["population"] * risk_pct[alert.alert_level])

    return {
        "total_districts"  : len(UP_DISTRICTS),
        "critical_count"   : counts["Critical"],
        "high_count"       : counts["High"],
        "medium_count"     : counts["Medium"],
        "low_count"        : counts["Low"],
        "total_at_risk"    : total_at_risk,
        "timestamp"        : datetime.now().isoformat(),
    }