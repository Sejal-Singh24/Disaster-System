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
    # Uttar Pradesh
    {"name": "Lucknow",        "state": "Uttar Pradesh",   "lat": 26.8467, "lon": 80.9462},
    {"name": "Kanpur",         "state": "Uttar Pradesh",   "lat": 26.4499, "lon": 80.3319},
    {"name": "Varanasi",       "state": "Uttar Pradesh",   "lat": 25.3176, "lon": 82.9739},
    {"name": "Agra",           "state": "Uttar Pradesh",   "lat": 27.1767, "lon": 78.0081},
    {"name": "Prayagraj",      "state": "Uttar Pradesh",   "lat": 25.4358, "lon": 81.8463},
    # Bihar
    {"name": "Patna",          "state": "Bihar",           "lat": 25.5941, "lon": 85.1376},
    {"name": "Muzaffarpur",    "state": "Bihar",           "lat": 26.1197, "lon": 85.3910},
    {"name": "Darbhanga",      "state": "Bihar",           "lat": 26.1542, "lon": 85.8918},
    {"name": "Bhagalpur",      "state": "Bihar",           "lat": 25.2425, "lon": 86.9842},
    # Assam
    {"name": "Guwahati",       "state": "Assam",           "lat": 26.1445, "lon": 91.7362},
    {"name": "Dibrugarh",      "state": "Assam",           "lat": 27.4728, "lon": 94.9120},
    {"name": "Jorhat",         "state": "Assam",           "lat": 26.7509, "lon": 94.2037},
    {"name": "Silchar",        "state": "Assam",           "lat": 24.8333, "lon": 92.7789},
    # Odisha
    {"name": "Bhubaneswar",    "state": "Odisha",          "lat": 20.2961, "lon": 85.8245},
    {"name": "Cuttack",        "state": "Odisha",          "lat": 20.4625, "lon": 85.8830},
    {"name": "Puri",           "state": "Odisha",          "lat": 19.8135, "lon": 85.8312},
    # West Bengal
    {"name": "Kolkata",        "state": "West Bengal",     "lat": 22.5726, "lon": 88.3639},
    {"name": "Darjeeling",     "state": "West Bengal",     "lat": 27.0360, "lon": 88.2627},
    {"name": "Malda",          "state": "West Bengal",     "lat": 25.0108, "lon": 88.1418},
    # Kerala
    {"name": "Thiruvananthapuram", "state": "Kerala",      "lat": 8.5241,  "lon": 76.9366},
    {"name": "Kochi",          "state": "Kerala",          "lat": 9.9312,  "lon": 76.2673},
    {"name": "Kozhikode",      "state": "Kerala",          "lat": 11.2588, "lon": 75.7804},
    {"name": "Wayanad",        "state": "Kerala",          "lat": 11.6854, "lon": 76.1320},
    # Maharashtra
    {"name": "Mumbai",         "state": "Maharashtra",     "lat": 19.0760, "lon": 72.8777},
    {"name": "Pune",           "state": "Maharashtra",     "lat": 18.5204, "lon": 73.8567},
    {"name": "Nagpur",         "state": "Maharashtra",     "lat": 21.1458, "lon": 79.0882},
    {"name": "Nashik",         "state": "Maharashtra",     "lat": 19.9975, "lon": 73.7898},
    # Rajasthan
    {"name": "Jaipur",         "state": "Rajasthan",       "lat": 26.9124, "lon": 75.7873},
    {"name": "Jodhpur",        "state": "Rajasthan",       "lat": 26.2389, "lon": 73.0243},
    {"name": "Bikaner",        "state": "Rajasthan",       "lat": 28.0229, "lon": 73.3119},
    # Gujarat
    {"name": "Ahmedabad",      "state": "Gujarat",         "lat": 23.0225, "lon": 72.5714},
    {"name": "Surat",          "state": "Gujarat",         "lat": 21.1702, "lon": 72.8311},
    {"name": "Bhuj",           "state": "Gujarat",         "lat": 23.2420, "lon": 69.6669},
    # Tamil Nadu
    {"name": "Chennai",        "state": "Tamil Nadu",      "lat": 13.0827, "lon": 80.2707},
    {"name": "Madurai",        "state": "Tamil Nadu",      "lat": 9.9252,  "lon": 78.1198},
    {"name": "Coimbatore",     "state": "Tamil Nadu",      "lat": 11.0168, "lon": 76.9558},
    # Andhra Pradesh
    {"name": "Visakhapatnam",  "state": "Andhra Pradesh",  "lat": 17.6868, "lon": 83.2185},
    {"name": "Vijayawada",     "state": "Andhra Pradesh",  "lat": 16.5062, "lon": 80.6480},
    # Telangana
    {"name": "Hyderabad",      "state": "Telangana",       "lat": 17.3850, "lon": 78.4867},
    {"name": "Warangal",       "state": "Telangana",       "lat": 17.9784, "lon": 79.5941},
    # Karnataka
    {"name": "Bengaluru",      "state": "Karnataka",       "lat": 12.9716, "lon": 77.5946},
    {"name": "Mangaluru",      "state": "Karnataka",       "lat": 12.9141, "lon": 74.8560},
    # Madhya Pradesh
    {"name": "Bhopal",         "state": "Madhya Pradesh",  "lat": 23.2599, "lon": 77.4126},
    {"name": "Indore",         "state": "Madhya Pradesh",  "lat": 22.7196, "lon": 75.8577},
    # Punjab & Haryana
    {"name": "Amritsar",       "state": "Punjab",          "lat": 31.6340, "lon": 74.8723},
    {"name": "Ludhiana",       "state": "Punjab",          "lat": 30.9010, "lon": 75.8573},
    {"name": "Faridabad",      "state": "Haryana",         "lat": 28.4089, "lon": 77.3178},
    # Uttarakhand
    {"name": "Dehradun",       "state": "Uttarakhand",     "lat": 30.3165, "lon": 78.0322},
    {"name": "Haridwar",       "state": "Uttarakhand",     "lat": 29.9457, "lon": 78.1642},
    {"name": "Nainital",       "state": "Uttarakhand",     "lat": 29.3919, "lon": 79.4542},
    # Himachal Pradesh
    {"name": "Shimla",         "state": "Himachal Pradesh","lat": 31.1048, "lon": 77.1734},
    {"name": "Manali",         "state": "Himachal Pradesh","lat": 32.2396, "lon": 77.1887},
    # Delhi
    {"name": "New Delhi",      "state": "Delhi",           "lat": 28.6139, "lon": 77.2090},
    # Jharkhand
    {"name": "Ranchi",         "state": "Jharkhand",       "lat": 23.3441, "lon": 85.3096},
    {"name": "Jamshedpur",     "state": "Jharkhand",       "lat": 22.8046, "lon": 86.2029},
    # Chhattisgarh
    {"name": "Raipur",         "state": "Chhattisgarh",    "lat": 21.2514, "lon": 81.6296},
    # Northeast
    {"name": "Imphal",         "state": "Manipur",         "lat": 24.8170, "lon": 93.9368},
    {"name": "Aizawl",         "state": "Mizoram",         "lat": 23.7271, "lon": 92.7176},
    {"name": "Shillong",       "state": "Meghalaya",       "lat": 25.5788, "lon": 91.8933},
    {"name": "Agartala",       "state": "Tripura",         "lat": 23.8315, "lon": 91.2868},
    {"name": "Kohima",         "state": "Nagaland",        "lat": 25.6751, "lon": 94.1086},
    # J&K
    {"name": "Srinagar",       "state": "J&K",             "lat": 34.0837, "lon": 74.7973},
    {"name": "Jammu",          "state": "J&K",             "lat": 32.7266, "lon": 74.8570},
    # Goa
    {"name": "Panaji",         "state": "Goa",             "lat": 15.4909, "lon": 73.8278},
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
    print(f"⚠️ ML model could not be loaded: {e}")

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
                print(f"⚠️ {district['name']} No data found. {e}")
                continue
        gdacs_alerts = await fetch_gdacs_alerts(client)
        all_alerts.extend(gdacs_alerts)
    level_order = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
    all_alerts.sort(key=lambda x: level_order.get(x["alert_level"], 0), reverse=True)
    return all_alerts
# ── Global/Country GDACS Alerts Endpoint ──────────────────
@router.get("/global")
async def get_global_alerts(country: str = ""):
    gdacs_alerts = []
    try:
        params = {
            "eventlist":  "FL,TC,EQ,DR,WF",
            "limitItems": 50,
        }
        if country:
            params["country"] = country

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(GDACS_URL, params=params)
            data = resp.json()
            features = data.get("features", [])

            for i, feature in enumerate(features):
                props  = feature.get("properties", {})
                coords = feature.get("geometry", {}).get("coordinates", [0, 0])
                alertlevel = props.get("alertlevel", "Green")
                alert_level, alert_color = gdacs_alert_to_level(alertlevel)
                eventtype    = props.get("eventtype", "FL")
                disaster     = gdacs_event_type(eventtype)
                fromdate     = props.get("fromdate", "")[:10]
                todate       = props.get("todate", "")[:10]
                severity     = props.get("severitydata", {}).get("severitytext", "")
                country_name = props.get("country", "Global")

                gdacs_alerts.append({
                    "id":            f"global_{i+1}",
                    "district":      country_name,
                    "state":         "Global (GDACS)",
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
                    "country":       country_name,
                })

        print(f"✅ Global GDACS: {len(gdacs_alerts)} alerts")
    except Exception as e:
        print(f"⚠️ Global GDACS failed: {e}")

    level_order = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
    gdacs_alerts.sort(key=lambda x: level_order.get(x["alert_level"], 0), reverse=True)
    return gdacs_alerts