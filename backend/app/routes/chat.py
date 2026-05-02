from fastapi import APIRouter
from pydantic import BaseModel
import requests
import os
import pickle
import numpy as np
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# ── Paths ─────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "../models/model.pkl")
DATA_PATH  = r"C:\Users\user\Desktop\Disaster-System\data\disasters_clean.csv"

# ── Load ML Model ─────────────────────────────────────────
def load_model():
    try:
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    except Exception:
        print("⚠️ model.pkl nahi mila — rule-based fallback use hoga!")
        return None

model = load_model()

# ── Load EMDAT Data ───────────────────────────────────────
def load_emdat():
    try:
        df       = pd.read_csv(DATA_PATH)
        india_df = df[df["Country"] == "India"].copy()
        print(f"✅ EMDAT loaded: {len(india_df)} India records")
        return india_df
    except Exception as e:
        print(f"⚠️ EMDAT load failed: {e}")
        return None

emdat_df = load_emdat()

# ── Disaster Type Mappings ────────────────────────────────
EMDAT_TYPE_MAP = {
    "flood"      : "Flood",
    "earthquake" : "Earthquake",
    "cyclone"    : "Storm",
    "storm"      : "Storm",
    "drought"    : "Drought",
    "landslide"  : "Landslide",
    "wildfire"   : "Wildfire",
    "tsunami"    : "Flood",
}

DISASTER_ENCODED = {
    "flood"      : 0,
    "earthquake" : 1,
    "cyclone"    : 2,
    "storm"      : 2,
    "drought"    : 3,
    "landslide"  : 4,
    "wildfire"   : 5,
    "tsunami"    : 6,
}


class ChatInput(BaseModel):
    message: str


KNOWN_CITIES = [
    "moradabad", "bareilly", "lucknow", "agra", "kanpur",
    "allahabad", "varanasi", "delhi", "mumbai", "kolkata",
    "chennai", "bangalore", "hyderabad", "rampur", "bijnor",
    "amroha", "shahjahanpur", "noida", "ghaziabad", "meerut",
    "dehradun", "haridwar", "rishikesh", "nainital", "shimla",
    "jaipur", "jodhpur", "udaipur", "pune", "nagpur",
    "surat", "ahmedabad", "bhopal", "indore", "patna",
    "ranchi", "bhubaneswar", "guwahati", "chandigarh", "amritsar",
    "vijayawada", "visakhapatnam", "coimbatore", "madurai", "kochi",
    "thiruvananthapuram", "mangalore", "hubli", "mysore", "salem"
]

CITY_DATA = {
    "moradabad"       : {"population": 887000,   "area": 3493},
    "bareilly"        : {"population": 905000,   "area": 4120},
    "lucknow"         : {"population": 2817000,  "area": 2528},
    "dehradun"        : {"population": 578000,   "area": 3088},
    "haridwar"        : {"population": 228832,   "area": 2360},
    "agra"            : {"population": 1585000,  "area": 4027},
    "delhi"           : {"population": 11007835, "area": 1484},
    "patna"           : {"population": 1684222,  "area": 3202},
    "mumbai"          : {"population": 12442373, "area": 603},
    "kolkata"         : {"population": 4496694,  "area": 1886},
    "chennai"         : {"population": 4646732,  "area": 426},
    "kanpur"          : {"population": 2765348,  "area": 3155},
    "varanasi"        : {"population": 1198491,  "area": 1535},
    "meerut"          : {"population": 1305000,  "area": 2590},
    "noida"           : {"population": 637272,   "area": 203},
    "ghaziabad"       : {"population": 1636068,  "area": 1179},
    "pune"            : {"population": 3124458,  "area": 331},
    "ahmedabad"       : {"population": 5570585,  "area": 464},
    "jaipur"          : {"population": 3046163,  "area": 467},
    "bhopal"          : {"population": 1798218,  "area": 285},
    "visakhapatnam"   : {"population": 2035922,  "area": 681},
    "vijayawada"      : {"population": 1048240,  "area": 61},
    "guwahati"        : {"population": 957352,   "area": 328},
    "bhubaneswar"     : {"population": 837737,   "area": 422},
    "kochi"           : {"population": 677381,   "area": 94},
    "thiruvananthapuram": {"population": 957730, "area": 214},
    "ranchi"          : {"population": 1073440,  "area": 652},
    "nagpur"          : {"population": 2405421,  "area": 217},
    "indore"          : {"population": 1964086,  "area": 530},
    "nainital"        : {"population": 41000,    "area": 284},
    "shimla"          : {"population": 169578,   "area": 232},
}


# ── Helper: Extract City ──────────────────────────────────
def extract_city(text):
    text_lower = text.lower()
    for city in KNOWN_CITIES:
        if city in text_lower:
            return city.capitalize()

    stop_words = [
        "weather", "mausam", "temperature", "temp", "ka", "ki",
        "ke", "mein", "hai", "aaj", "abhi", "kaisa", "kya",
        "the", "of", "in", "is", "at", "for", "and", "flood",
        "risk", "danger", "what", "how", "tell", "me", "show",
        "please", "bata", "batao", "dikhao", "check", "today",
        "now", "current", "live", "real", "time", "update",
        "earthquake", "cyclone", "drought", "landslide", "wildfire",
        "tsunami", "disaster", "predict", "prediction", "bhukamp",
        "toofan", "sukha", "aag", "bhookamp"
    ]
    words = text_lower.split()
    for word in words:
        word = word.replace("?", "").replace("!", "").replace(",", "").replace(".", "")
        if word not in stop_words and len(word) >= 3:
            return word.capitalize()
    return "Delhi"


# ── Helper: Live Weather ──────────────────────────────────
def get_live_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    try:
        resp = requests.get(url).json()
        return {
            "rainfall": resp.get("rain", {}).get("1h", 0),
            "temp"    : resp["main"]["temp"],
            "wind"    : resp["wind"]["speed"] * 3.6,
            "humidity": resp["main"]["humidity"],
            "desc"    : resp["weather"][0]["description"],
            "feels"   : resp["main"]["feels_like"],
        }
    except Exception:
        return {"rainfall": 0, "temp": 35, "wind": 20, "humidity": 60, "desc": "N/A", "feels": 35}


# ── Helper: EMDAT Historical Stats ───────────────────────
def get_emdat_stats(disaster_type: str) -> dict:
    if emdat_df is None:
        return {}
    emdat_type = EMDAT_TYPE_MAP.get(disaster_type.lower(), "Flood")
    filtered   = emdat_df[emdat_df["Disaster Type"] == emdat_type]
    if filtered.empty:
        return {}
    deaths_col = "Total Deaths"
    aff_col    = "Total Affected"
    stats = {
        "total_events" : len(filtered),
        "avg_deaths"   : round(filtered[deaths_col].mean(), 0) if not filtered[deaths_col].isna().all() else 0,
        "avg_affected" : round(filtered[aff_col].mean(), 0)    if not filtered[aff_col].isna().all()    else 0,
    }
    if not filtered[deaths_col].isna().all():
        worst_idx        = filtered[deaths_col].idxmax()
        stats["worst_year"]   = int(filtered.loc[worst_idx, "Year"])
        stats["worst_deaths"] = int(filtered.loc[worst_idx, deaths_col])
    return stats


# ── Helper: ML Prediction ─────────────────────────────────
def ml_predict(disaster_type: str) -> float | None:
    if model is None:
        return None
    try:
        stats         = get_emdat_stats(disaster_type)
        dtype_encoded = DISASTER_ENCODED.get(disaster_type.lower(), 0)
        features      = np.array([[
            2024,
            stats.get("avg_deaths", 0),
            stats.get("avg_affected", 0),
            0,
            dtype_encoded
        ]])
        pred_class = model.predict(features)[0]
        score_map  = {0: 2.0, 1: 5.0, 2: 7.5}
        return score_map.get(int(pred_class), 3.0)
    except Exception as e:
        print(f"ML error: {e}")
        return None


# ── Helper: Rule-based Score ──────────────────────────────
def rule_score(disaster_type, city, w, city_info, magnitude=None, river_level=None):
    score = 0.0
    dtype = disaster_type.lower()

    if dtype == "flood":
        if w["rainfall"] > 200:   score += 4.0
        elif w["rainfall"] > 100: score += 2.5
        elif w["rainfall"] > 50:  score += 1.0
        if w["humidity"] > 90:    score += 1.0
        elif w["humidity"] > 75:  score += 0.5
        if river_level:
            if river_level > 10:   score += 3.0
            elif river_level > 7:  score += 2.0
            elif river_level > 5:  score += 1.0

    elif dtype == "earthquake":
        high_risk   = ["dehradun", "haridwar", "rishikesh", "shimla", "nainital", "guwahati", "ranchi"]
        medium_risk = ["delhi", "meerut", "agra", "lucknow", "chandigarh", "amritsar", "noida", "ghaziabad"]
        if city.lower() in high_risk:     score += 5.0
        elif city.lower() in medium_risk: score += 3.0
        else:                             score += 1.5
        if magnitude:
            if magnitude >= 7.0:   score += 3.0
            elif magnitude >= 6.0: score += 2.0
            elif magnitude >= 5.0: score += 1.0

    elif dtype in ["cyclone", "storm"]:
        if w["wind"] > 180:   score += 6.0
        elif w["wind"] > 120: score += 4.0
        elif w["wind"] > 80:  score += 3.0
        elif w["wind"] > 50:  score += 1.5
        coastal = ["mumbai", "chennai", "kolkata", "visakhapatnam", "bhubaneswar",
                   "kochi", "thiruvananthapuram", "mangalore", "guwahati", "vijayawada"]
        if city.lower() in coastal: score += 2.0

    elif dtype == "drought":
        if w["temp"] > 45:    score += 4.0
        elif w["temp"] > 42:  score += 3.0
        elif w["temp"] > 38:  score += 2.0
        elif w["temp"] > 35:  score += 1.0
        if w["humidity"] < 20:   score += 2.0
        elif w["humidity"] < 35: score += 1.0
        if w["rainfall"] == 0:   score += 1.5

    elif dtype == "landslide":
        if w["rainfall"] > 150:  score += 4.0
        elif w["rainfall"] > 80: score += 2.5
        elif w["rainfall"] > 40: score += 1.0
        hilly = ["dehradun", "haridwar", "rishikesh", "nainital", "shimla", "ranchi", "guwahati", "chandigarh"]
        if city.lower() in hilly: score += 3.0

    elif dtype == "wildfire":
        if w["temp"] > 42:    score += 3.5
        elif w["temp"] > 38:  score += 2.0
        if w["humidity"] < 20:   score += 2.5
        elif w["humidity"] < 35: score += 1.5
        if w["wind"] > 60:       score += 1.5
        if w["rainfall"] == 0:   score += 1.5

    elif dtype == "tsunami":
        coastal_high   = ["chennai", "visakhapatnam", "bhubaneswar", "kochi", "thiruvananthapuram", "vijayawada"]
        coastal_medium = ["mumbai", "kolkata", "guwahati", "mangalore"]
        if city.lower() in coastal_high:     score += 6.0
        elif city.lower() in coastal_medium: score += 4.0
        else:                                score += 1.5

    # Population density bonus
    density = city_info["population"] / max(city_info["area"], 1)
    if density > 5000:    score += 2.0
    elif density > 2000:  score += 1.5
    elif density > 1000:  score += 1.0
    elif density > 500:   score += 0.5

    return min(round(score, 1), 10.0)


# ── Helper: Final Combined Score ──────────────────────────
def get_final_score(disaster_type, city, w, city_info):
    ml  = ml_predict(disaster_type)
    rb  = rule_score(disaster_type, city, w, city_info)
    if ml is not None:
        # 60% ML (historical) + 40% rule-based (current weather)
        return round((ml * 0.6) + (rb * 0.4), 1), True
    return rb, False


# ── Helper: Label + Emoji ─────────────────────────────────
def get_label_emoji(score):
    if score >= 7:   return "Critical", "🔴"
    elif score >= 5: return "High",     "🟠"
    elif score >= 3: return "Medium",   "🟡"
    else:            return "Low",      "🟢"


# ── Helper: People at Risk ────────────────────────────────
def get_people(score, population):
    pct = 0.70 if score >= 7 else 0.45 if score >= 5 else 0.20 if score >= 3 else 0.08
    return int(population * pct)


# ── Helper: Recommendations ──────────────────────────────
def get_recs(label, dtype):
    base = {
        "Critical": ["Turant evacuation order jaari karo", "NDRF teams deploy karo", "Emergency helpline (1078) activate karo", "Relief camps setup karo"],
        "High"    : ["Evacuation advisory jaari karo", "Rescue teams alert karo", "Local administration inform karo", "Safe zones identify karo"],
        "Medium"  : ["Situation monitor karo", "SMS alerts bhejo", "Resources pre-position karo"],
        "Low"     : ["Routine monitoring karo", "Weather updates follow karo"],
    }
    specific = {
        "flood"      : ["River levels monitor karo", "Low-lying areas khali karwao"],
        "earthquake" : ["Buildings inspect karo", "Aftershocks ke liye taiyaar raho"],
        "cyclone"    : ["Coastal areas evacuate karo", "Ships port pe rokho"],
        "drought"    : ["Pani ki rationing karo", "Farmers ko support do"],
        "landslide"  : ["Pahadi roads band karo", "Slopes monitor karo"],
        "wildfire"   : ["Forest areas evacuate karo", "Fire brigades deploy karo"],
        "tsunami"    : ["Oonchi jagah par jao", "Coastal areas band karo"],
    }
    recs  = base.get(label, base["Low"]).copy()
    recs += specific.get(dtype.lower(), [])
    return recs[:5]


# ── Helper: Format Response ───────────────────────────────
def format_prediction(disaster_name, city, label, score, people, w, recs, ml_used, emdat_stats):
    _, emoji = get_label_emoji(score)
    ml_tag   = "🤖 ML+Historical" if ml_used else "📐 Rule-based"

    resp = (
        f"{emoji} {city} {disaster_name} Risk Assessment\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n"
        f"⚠️  Severity : {label} ({score}/10)\n"
        f"👥 People at risk : {people:,}\n"
        f"🌡️  Temperature : {w['temp']}°C\n"
        f"🌧️  Rainfall : {w['rainfall']}mm\n"
        f"💧 Humidity : {w['humidity']}%\n"
        f"💨 Wind : {round(w['wind'],1)} km/h\n"
        f"🔬 Model : {ml_tag}\n\n"
    )

    # EMDAT Historical Context
    if emdat_stats:
        resp += f"📊 India Historical Data:\n"
        resp += f"   • Total events (1900-2021): {emdat_stats.get('total_events', 'N/A')}\n"
        resp += f"   • Avg deaths/event: {emdat_stats.get('avg_deaths', 'N/A'):,.0f}\n"
        resp += f"   • Avg affected/event: {emdat_stats.get('avg_affected', 'N/A'):,.0f}\n"
        if "worst_year" in emdat_stats:
            resp += f"   • Worst year: {emdat_stats['worst_year']} ({emdat_stats['worst_deaths']:,} deaths)\n"
        resp += "\n"

    resp += f"📋 Recommended Actions:\n"
    for i, rec in enumerate(recs, 1):
        resp += f"{i}. {rec}\n"

    return resp


# ── Weather Update ────────────────────────────────────────
def get_weather_update(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    try:
        data = requests.get(url).json()
        if data.get("cod") == 200:
            return (
                f"📍 {city} mein abhi:\n"
                f"🌡️ Temperature: {data['main']['temp']}°C (feels like {data['main']['feels_like']}°C)\n"
                f"🌤️ Mausam: {data['weather'][0]['description']}\n"
                f"💧 Humidity: {data['main']['humidity']}%\n"
                f"💨 Wind: {data['wind']['speed']} m/s"
            )
        return f"⚠️ '{city}' ka weather data nahi mila."
    except Exception:
        return "❌ Network error! Weather fetch nahi ho paya."


# ── Prediction Function ───────────────────────────────────
async def predict(disaster_type, city):
    city_info  = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    w          = get_live_weather(city)
    score, ml  = get_final_score(disaster_type, city, w, city_info)
    label, _   = get_label_emoji(score)
    people     = get_people(score, city_info["population"])
    recs       = get_recs(label, disaster_type)
    stats      = get_emdat_stats(disaster_type)

    disaster_names = {
        "flood": "🌊 Flood", "earthquake": "🏔️ Earthquake",
        "cyclone": "🌀 Cyclone", "drought": "🌵 Drought",
        "landslide": "⛰️ Landslide", "wildfire": "🔥 Wildfire", "tsunami": "🌊 Tsunami"
    }
    name = disaster_names.get(disaster_type.lower(), "⚠️ Disaster")
    return format_prediction(name, city, label, score, people, w, recs, ml, stats)


# ── Main Chat Endpoint ────────────────────────────────────
@router.post("/chatbot")
async def chat_endpoint(chat_data: ChatInput):
    t = chat_data.message.lower()

    # 1. WEATHER
    if any(w in t for w in ["weather", "mausam", "temperature", "temp"]):
        return {"response": get_weather_update(extract_city(t))}

    # 2. FLOOD
    if any(w in t for w in ["flood", "flooding", "baarish", "barsat", "flood risk"]):
        return {"response": await predict("flood", extract_city(t))}

    # 3. EARTHQUAKE
    if any(w in t for w in ["earthquake", "bhukamp", "bhookamp", "seismic", "quake"]):
        return {"response": await predict("earthquake", extract_city(t))}

    # 4. CYCLONE
    if any(w in t for w in ["cyclone", "toofan", "hurricane", "storm", "typhoon"]):
        return {"response": await predict("cyclone", extract_city(t))}

    # 5. DROUGHT
    if any(w in t for w in ["drought", "sukha", "pani nahi", "water crisis"]):
        return {"response": await predict("drought", extract_city(t))}

    # 6. LANDSLIDE
    if any(w in t for w in ["landslide", "bhoosakhal", "mudslide"]):
        return {"response": await predict("landslide", extract_city(t))}

    # 7. WILDFIRE
    if any(w in t for w in ["wildfire", "forest fire", "jungle fire", "aag", "fire"]):
        return {"response": await predict("wildfire", extract_city(t))}

    # 8. TSUNAMI
    if any(w in t for w in ["tsunami", "tidal wave", "seawave", "samudri lehar"]):
        return {"response": await predict("tsunami", extract_city(t))}

    # 9. GENERAL RISK
    if any(w in t for w in ["risk", "danger", "khatra", "prediction", "predict"]):
        return {"response": await predict("flood", extract_city(t))}

    # 10. HISTORICAL QUERIES
    if "uttarakhand" in t and "2013" in t:
        return {"response": "📅 2013 Uttarakhand Flash Flood:\n• 6,054 deaths recorded\n• Lakho log homeless hue\n• Kedarnath sabse zyada affected tha\n• India ka worst flood disaster tha"}

    if "kerala" in t and "2018" in t:
        return {"response": "📅 2018 Kerala Floods:\n• 504 deaths\n• 5.4 million log affected\n• 100 saal ka sabse bada flood\n• 14 districts affected the"}

    if "bihar" in t and "flood" in t:
        return {"response": "🌊 Bihar Floods History:\n• 1900-2021 mein 50+ flood events\n• Kosi river ko 'Bihar ka Shok' kehte hain\n• Sabse affected: Darbhanga, Muzaffarpur, Sitamarhi\n• 2008 mein Kosi river ne 3 million log affect kiye the"}

    if "worst" in t or "sabse bura" in t:
        return {"response": "😮 India ka Sabse Bura Flood:\n• 1987 mein aaya tha\n• 1,399 deaths\n• 40 million log affected\n• Bihar, UP, West Bengal sabse zyada affected the"}

    if "assam" in t and "flood" in t:
        return {"response": "🌊 Assam Floods:\n• India ka sabse flood-prone state\n• Brahmaputra river ki wajah se har saal flooding\n• 2022 mein 32 lakh log affected\n• Kaziranga National Park bhi affected hota hai"}

    if "odisha" in t or ("cyclone" in t and "history" in t):
        return {"response": "🌀 Odisha Cyclones:\n• India ka sabse cyclone-prone state\n• 1999 Super Cyclone: 10,000+ deaths\n• 2013 Phailin: 45 deaths (better preparedness)\n• Ab early warning system bahut strong hai"}

    if "bhuj" in t or ("earthquake" in t and "2001" in t):
        return {"response": "🏔️ 2001 Bhuj Earthquake:\n• Richter scale: 7.7\n• 20,000+ deaths\n• 1.6 lakh injured\n• India ka deadliest earthquake\n• Gujarat mein massive destruction"}

    if "2004" in t and "tsunami" in t:
        return {"response": "🌊 2004 Indian Ocean Tsunami:\n• 10,000+ deaths in India\n• Tamil Nadu, Andhra Pradesh, Kerala affected\n• 9.1 magnitude earthquake se aaya tha\n• 14 countries affected hue globally"}

    if "kedarnath" in t:
        return {"response": "⛰️ 2013 Kedarnath Disaster:\n• Flash flood + landslide combo\n• 5,000+ deaths\n• India ka worst multi-disaster event\n• Char Dham Yatra rok di gayi thi"}

    # 11. DEFAULT
    return {
        "response": (
            "🙏 Main FloodGuard AI hoon!\n\n"
            "Mujhse poochh sakte ho:\n\n"
            "🌤️ Weather:    'Dehradun weather'\n"
            "🌊 Flood:      'Moradabad flood risk'\n"
            "🏔️ Earthquake: 'Delhi earthquake risk'\n"
            "🌀 Cyclone:    'Mumbai cyclone risk'\n"
            "🌵 Drought:    'Jaipur drought risk'\n"
            "⛰️ Landslide:  'Dehradun landslide risk'\n"
            "🔥 Wildfire:   'Nainital wildfire risk'\n"
            "🌊 Tsunami:    'Chennai tsunami risk'\n"
            "📊 History:    '2013 Uttarakhand flood'\n"
            "😮 Worst:      'India ka sabse bura flood'"
        )
    }