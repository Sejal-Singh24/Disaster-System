import httpx
from fastapi import APIRouter
import pickle
import numpy as np
import os

router = APIRouter()

# ─── API Key & Settings ────────────────────────────────────────────────────────
WEATHER_API_KEY = "3e082ac810d6c412e9ecf7faf476a20e"
WEATHER_URL     = "https://api.openweathermap.org/data/2.5/weather"

# ─── UP ke Districts with coordinates ─────────────────────────────────────────
DISTRICTS = [
    {"name": "Lucknow",     "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462},
    {"name": "Moradabad",   "state": "Uttar Pradesh", "lat": 28.8386, "lon": 78.7733},
    {"name": "Bareilly",    "state": "Uttar Pradesh", "lat": 28.3670, "lon": 79.4304},
    {"name": "Agra",        "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081},
    {"name": "Kanpur",      "state": "Uttar Pradesh", "lat": 26.4499, "lon": 80.3319},
    {"name": "Varanasi",    "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739},
    {"name": "Meerut",      "state": "Uttar Pradesh", "lat": 28.9845, "lon": 77.7064},
    {"name": "Prayagraj",   "state": "Uttar Pradesh", "lat": 25.4358, "lon": 81.8463},
    {"name": "Gorakhpur",   "state": "Uttar Pradesh", "lat": 26.7606, "lon": 83.3732},
    {"name": "Rampur",      "state": "Uttar Pradesh", "lat": 28.8159, "lon": 79.0289},
]

# ─── Load ML Model ─────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model.pkl")
LABEL_PATH = os.path.join(BASE_DIR, "..", "label_encoder.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(LABEL_PATH, "rb") as f:
        label_encoder = pickle.load(f)
    MODEL_LOADED = True
    print("✅ ML Model loaded successfully")
except Exception as e:
    MODEL_LOADED = False
    print(f"⚠️ ML Model load nahi hua: {e}")

# ─── Alert Level Logic ─────────────────────────────────────────────────────────
def get_alert_level(rainfall_mm, wind_kmh, humidity):
    if rainfall_mm > 100 or wind_kmh > 80:
        return "Critical", "#E24B4A"
    elif rainfall_mm > 60 or wind_kmh > 50:
        return "High", "#EF9F27"
    elif rainfall_mm > 25 or wind_kmh > 30:
        return "Medium", "#185FA5"
    else:
        return "Low", "#639922"

def get_disaster_type(rainfall_mm, wind_kmh):
    if rainfall_mm > 100:
        return "Flash Flood"
    elif rainfall_mm > 60:
        return "Riverine Flood"
    elif rainfall_mm > 25:
        return "Urban Flood"
    elif wind_kmh > 80:
        return "Cyclone"
    else:
        return "None"

# ─── Main Alerts Endpoint ──────────────────────────────────────────────────────
@router.get("/")
async def get_alerts():
    alerts = []

    async with httpx.AsyncClient(timeout=10) as client:
        for i, district in enumerate(DISTRICTS):
            try:
                # Real weather data fetch karo
                resp = await client.get(WEATHER_URL, params={
                    "lat":   district["lat"],
                    "lon":   district["lon"],
                    "appid": WEATHER_API_KEY,
                    "units": "metric",
                })
                data = resp.json()

                # Weather values extract karo
                temperature  = round(data["main"]["temp"], 1)
                humidity     = data["main"]["humidity"]
                wind_kmh     = round(data["wind"]["speed"] * 3.6, 1)  # m/s to km/h
                rainfall_mm  = round(data.get("rain", {}).get("1h", 0) * 24, 1)  # 1h to 24h estimate
                description  = data["weather"][0]["description"].capitalize()

                # Alert level calculate karo
                alert_level, alert_color = get_alert_level(rainfall_mm, wind_kmh, humidity)
                disaster_type            = get_disaster_type(rainfall_mm, wind_kmh)

                # ML Model se prediction (agar loaded hai)
                ml_prediction = None
                if MODEL_LOADED:
                    try:
                        features     = np.array([[temperature, humidity, wind_kmh, rainfall_mm]])
                        prediction   = model.predict(features)
                        ml_prediction = label_encoder.inverse_transform(prediction)[0]
                    except:
                        ml_prediction = disaster_type

                alerts.append({
                    "id":            f"d{i+1}",
                    "district":      district["name"],
                    "state":         district["state"],
                    "lat":           district["lat"],
                    "lon":           district["lon"],
                    "alert_level":   alert_level,
                    "alert_color":   alert_color,
                    "message":       f"{district['name']} mein {alert_level.lower()} risk — {description}, rainfall {rainfall_mm}mm, wind {wind_kmh}km/h",
                    "temperature":   temperature,
                    "humidity":      humidity,
                    "rainfall_mm":   rainfall_mm,
                    "wind_kmh":      wind_kmh,
                    "disaster_type": ml_prediction or disaster_type,
                    "predicted_for": "Live Data",
                    "timestamp":     data.get("dt", ""),
                })

            except Exception as e:
                print(f"⚠️ {district['name']} ka data nahi mila: {e}")
                continue

    # Critical pehle sort karo
    level_order = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
    alerts.sort(key=lambda x: level_order.get(x["alert_level"], 0), reverse=True)

    return alerts