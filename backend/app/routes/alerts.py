import httpx
from fastapi import APIRouter
import pickle
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_URL     = "https://api.openweathermap.org/data/2.5/weather"
GDACS_URL       = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"

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

def gdacs_alert_to_level(alertlevel):
    mapping = {
        "Red":    ("Critical", "#E24B4A"),
        "Orange": ("High",     "#EF9F27"),
        "Green":  ("Low",      "#639922"),
    }
    return mapping.get(alertlevel, ("Medium", "#185FA5"))

def gdacs_event_type(eventtype):
    mapping = {
        "FL": "Flood",
        "TC": "Cyclone",
        "EQ": "Earthquake",
        "DR": "Drought",
        "WF": "Wildfire",
        "VO": "Volcano",
    }
    return mapping.get(eventtype, "Disaster")

async def fetch_gdacs_alerts(client):
    gdacs_alerts = []
    try:
        resp = await client.get(GDACS_URL, params={
            "eventlist":  "FL,TC,EQ,DR,WF",
            "country":    "IND",
            "limitItems": 20,
        }, timeout=10)
        data     = resp.json()
        features = data.get("features", [])
        for i, feature in enumerate(features):
            props    = feature.get("properties", {})
            coords   = feature.get("geometry", {}).get("coordinates", [0, 0])
            # India alerts data 
            affected_iso3 = [c.get("iso3","") for c in props.get("affectedcountries", [])]
            if "IND" not in affected_iso3:
                continue
            if len(affected_iso3) > 1 and "IND" in affected_iso3:
                india_only = all(iso == "IND" for iso in affected_iso3)
            if not india_only:
                continue
            alertlevel            = props.get("alertlevel", "Green")
            alert_level, alert_color = gdacs_alert_to_level(alertlevel)
            eventtype  = props.get("eventtype", "FL")
            disaster   = gdacs_event_type(eventtype)
            country    = "India"
            fromdate   = props.get("fromdate", "")[:10]
            todate     = props.get("todate", "")[:10]
            severity   = props.get("severitydata", {}).get("severitytext", "")
            gdacs_alerts.append({
                "id":            f"gdacs_{i+1}",
                "district":      country,
                "state":         "India (GDACS)",
                "lat":           coords[1],
                "lon":           coords[0],
                "alert_level":   alert_level,
                "alert_color":   alert_color,
                "message":       f"{disaster} — {props.get('description', '')}. {severity}",
                "temperature":   0,
                "humidity":      0,
                "rainfall_mm":   0,
                "wind_kmh":      0,
                "disaster_type": disaster,
                "predicted_for": f"GDACS | {fromdate} to {todate}",
                "timestamp":     props.get("datemodified", ""),
                "source":        "GDACS",
            })
        print(f"✅ GDACS: {len(gdacs_alerts)} India alerts fetched")
    except Exception as e:
        print(f"⚠️ GDACS fetch failed: {e}")
    return gdacs_alerts

@router.get("/")
async def get_alerts():
    all_alerts = []
    async with httpx.AsyncClient(timeout=15) as client:
        for i, district in enumerate(DISTRICTS):
            try:
                resp = await client.get(WEATHER_URL, params={
                    "lat":   district["lat"],
                    "lon":   district["lon"],
                    "appid": WEATHER_API_KEY,
                    "units": "metric",
                })
                data        = resp.json()
                temperature = round(data["main"]["temp"], 1)
                humidity    = data["main"]["humidity"]
                wind_kmh    = round(data["wind"]["speed"] * 3.6, 1)
                rainfall_mm = round(data.get("rain", {}).get("1h", 0) * 24, 1)
                description = data["weather"][0]["description"].capitalize()
                alert_level, alert_color = get_alert_level(rainfall_mm, wind_kmh, humidity)
                disaster_type            = get_disaster_type(rainfall_mm, wind_kmh)
                ml_prediction = None
                if MODEL_LOADED:
                    try:
                        features      = np.array([[temperature, humidity, wind_kmh, rainfall_mm]])
                        prediction    = model.predict(features)
                        ml_prediction = label_encoder.inverse_transform(prediction)[0]
                    except:
                        ml_prediction = disaster_type
                all_alerts.append({
                    "id":            f"weather_{i+1}",
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
                    "predicted_for": "Live Weather",
                    "timestamp":     data.get("dt", ""),
                    "source":        "OpenWeatherMap",
                })
            except Exception as e:
                print(f"⚠️ {district['name']} ka data nahi mila: {e}")
                continue
        gdacs_alerts = await fetch_gdacs_alerts(client)
        all_alerts.extend(gdacs_alerts)
    level_order = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
    all_alerts.sort(key=lambda x: level_order.get(x["alert_level"], 0), reverse=True)
    return all_alerts