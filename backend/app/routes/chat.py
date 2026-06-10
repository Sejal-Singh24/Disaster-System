from fastapi import APIRouter
from pydantic import BaseModel
from app.services.search import search_knowledge, web_search

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
        print("⚠️ model.pkl not found — rule-based fallback will be used!")
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


# ── 150+ Cities ───────────────────────────────────────────
KNOWN_CITIES = [
    # Uttar Pradesh
    "moradabad", "bareilly", "lucknow", "agra", "kanpur", "allahabad",
    "varanasi", "meerut", "noida", "ghaziabad", "rampur", "bijnor",
    "amroha", "shahjahanpur", "mathura", "aligarh", "saharanpur",
    "gorakhpur", "faizabad", "sultanpur", "jhansi", "banda", "chitrakoot",
    "mirzapur", "sonbhadra", "azamgarh", "mau", "ballia", "ghazipur",
    "jaunpur", "pratapgarh", "amethi", "raebareli", "unnao", "hardoi",
    "sitapur", "lakhimpur", "bahraich", "shravasti", "balrampur",
    "gonda", "basti", "sant kabir nagar", "siddharthnagar", "kushinagar",
    "deoria", "maharajganj", "pilibhit", "budaun", "etawah", "mainpuri",
    # Delhi & NCR
    "delhi", "new delhi", "gurugram", "faridabad", "gurgaon",
    # Rajasthan
    "jaipur", "jodhpur", "udaipur", "kota", "ajmer", "bikaner",
    "alwar", "bharatpur", "sikar", "jhunjhunu", "chittorgarh",
    "bhilwara", "barmer", "jaisalmer", "nagaur", "tonk", "sawai madhopur",
    # Maharashtra
    "mumbai", "pune", "nagpur", "nashik", "aurangabad", "solapur",
    "kolhapur", "thane", "amravati", "akola", "nanded", "satara",
    "ratnagiri", "sindhudurg", "osmanabad", "latur", "yavatmal",
    # Gujarat
    "ahmedabad", "surat", "vadodara", "rajkot", "bhavnagar", "jamnagar",
    "gandhinagar", "anand", "mehsana", "patan", "banaskantha", "kutch",
    "porbandar", "junagadh", "amreli", "bhuj",
    # Madhya Pradesh
    "bhopal", "indore", "jabalpur", "gwalior", "ujjain", "sagar",
    "rewa", "satna", "ratlam", "dewas", "mandsaur", "khargone",
    "chhindwara", "betul", "hoshangabad", "vidisha", "raisen",
    # West Bengal
    "kolkata", "howrah", "durgapur", "asansol", "siliguri", "darjeeling",
    "jalpaiguri", "cooch behar", "malda", "murshidabad", "nadia",
    "bardhaman", "bankura", "purulia", "midnapore",
    # Tamil Nadu
    "chennai", "coimbatore", "madurai", "tiruchirappalli", "salem",
    "tirunelveli", "vellore", "erode", "thoothukudi", "thanjavur",
    "dindigul", "kanchipuram", "cuddalore", "nagapattinam", "ramanathapuram",
    # Karnataka
    "bangalore", "mysore", "hubli", "mangalore", "belgaum", "gulbarga",
    "bijapur", "shimoga", "tumkur", "davangere", "bellary", "hassan",
    "udupi", "chikmagalur", "kodagu",
    # Kerala
    "kochi", "thiruvananthapuram", "kozhikode", "thrissur", "kollam",
    "palakkad", "alappuzha", "kottayam", "idukki", "wayanad", "kannur",
    "kasaragod", "malappuram", "pathanamthitta",
    # Andhra Pradesh
    "visakhapatnam", "vijayawada", "guntur", "nellore", "kurnool",
    "rajahmundry", "tirupati", "kadapa", "anantapur", "eluru",
    "ongole", "srikakulam", "vizianagaram",
    # Telangana
    "hyderabad", "warangal", "nizamabad", "karimnagar", "khammam",
    "nalgonda", "adilabad", "mahbubnagar", "rangareddy",
    # Bihar
    "patna", "gaya", "bhagalpur", "muzaffarpur", "darbhanga",
    "purnia", "araria", "sitamarhi", "vaishali", "samastipur",
    "begusarai", "munger", "nalanda", "rohtas", "aurangabad",
    # Jharkhand
    "ranchi", "jamshedpur", "dhanbad", "bokaro", "hazaribagh",
    "deoghar", "giridih", "dumka", "godda", "pakur",
    # Odisha
    "bhubaneswar", "cuttack", "rourkela", "berhampur", "sambalpur",
    "puri", "balasore", "kendrapara", "jagatsinghpur", "ganjam",
    # Assam
    "guwahati", "dibrugarh", "silchar", "jorhat", "tezpur",
    "nagaon", "tinsukia", "bongaigaon", "dhubri", "barpeta",
    # Punjab
    "amritsar", "ludhiana", "jalandhar", "patiala", "bathinda",
    "mohali", "pathankot", "hoshiarpur", "gurdaspur", "firozpur",
    # Haryana
    "chandigarh", "ambala", "rohtak", "hisar", "karnal",
    "panipat", "yamunanagar", "sonipat", "sirsa", "bhiwani",
    # Himachal Pradesh
    "shimla", "dharamsala", "mandi", "solan", "kullu",
    "manali", "hamirpur", "una", "bilaspur", "kangra",
    # Uttarakhand
    "dehradun", "haridwar", "rishikesh", "nainital", "roorkee",
    "haldwani", "rudrapur", "mussoorie", "uttarkashi", "chamoli",
    # Jammu & Kashmir
    "srinagar", "jammu", "anantnag", "baramulla", "sopore",
    "udhampur", "kathua", "rajouri", "poonch",
    # Northeastern States
    "imphal", "aizawl", "kohima", "agartala", "itanagar",
    "shillong", "gangtok", "dispur",
    # Chhattisgarh
    "raipur", "bilaspur", "durg", "bhilai", "korba",
    "rajnandgaon", "jagdalpur", "ambikapur",
    # Goa
    "panaji", "margao", "vasco da gama", "mapusa",
]

# ── 150+ Cities Data ──────────────────────────────────────
CITY_DATA = {
    "moradabad"       : {"population": 887000,   "area": 3493},
    "bareilly"        : {"population": 905000,   "area": 4120},
    "lucknow"         : {"population": 2817000,  "area": 2528},
    "agra"            : {"population": 1585000,  "area": 4027},
    "kanpur"          : {"population": 2765348,  "area": 3155},
    "allahabad"       : {"population": 1117094,  "area": 3747},
    "varanasi"        : {"population": 1198491,  "area": 1535},
    "meerut"          : {"population": 1305000,  "area": 2590},
    "noida"           : {"population": 637272,   "area": 203},
    "ghaziabad"       : {"population": 1636068,  "area": 1179},
    "delhi"           : {"population": 11007835, "area": 1484},
    "new delhi"       : {"population": 11007835, "area": 1484},
    "gurugram"        : {"population": 876824,   "area": 739},
    "gurgaon"         : {"population": 876824,   "area": 739},
    "faridabad"       : {"population": 1404653,  "area": 742},
    "jaipur"          : {"population": 3046163,  "area": 467},
    "jodhpur"         : {"population": 1033918,  "area": 22850},
    "udaipur"         : {"population": 474531,   "area": 11724},
    "kota"            : {"population": 1001365,  "area": 12436},
    "ajmer"           : {"population": 542580,   "area": 8481},
    "bikaner"         : {"population": 647804,   "area": 27244},
    "barmer"          : {"population": 80000,    "area": 28387},
    "jaisalmer"       : {"population": 78000,    "area": 38401},
    "mumbai"          : {"population": 12442373, "area": 603},
    "pune"            : {"population": 3124458,  "area": 331},
    "nagpur"          : {"population": 2405421,  "area": 217},
    "nashik"          : {"population": 1486053,  "area": 259},
    "aurangabad"      : {"population": 1175116,  "area": 139},
    "solapur"         : {"population": 951558,   "area": 14895},
    "thane"           : {"population": 1841488,  "area": 147},
    "ahmedabad"       : {"population": 5570585,  "area": 464},
    "surat"           : {"population": 4462002,  "area": 395},
    "vadodara"        : {"population": 1670806,  "area": 109},
    "rajkot"          : {"population": 1286678,  "area": 170},
    "bhuj"            : {"population": 147000,   "area": 45674},
    "bhopal"          : {"population": 1798218,  "area": 285},
    "indore"          : {"population": 1964086,  "area": 530},
    "jabalpur"        : {"population": 1267564,  "area": 367},
    "gwalior"         : {"population": 1054420,  "area": 289},
    "kolkata"         : {"population": 4496694,  "area": 1886},
    "howrah"          : {"population": 1072161,  "area": 58},
    "durgapur"        : {"population": 566937,   "area": 154},
    "darjeeling"      : {"population": 132016,   "area": 3149},
    "chennai"         : {"population": 4646732,  "area": 426},
    "coimbatore"      : {"population": 1601438,  "area": 246},
    "madurai"         : {"population": 1462420,  "area": 147},
    "bangalore"       : {"population": 8425970,  "area": 741},
    "mysore"          : {"population": 887446,   "area": 128},
    "mangalore"       : {"population": 484785,   "area": 132},
    "kochi"           : {"population": 677381,   "area": 94},
    "thiruvananthapuram": {"population": 957730, "area": 214},
    "kozhikode"       : {"population": 436527,   "area": 2345},
    "visakhapatnam"   : {"population": 2035922,  "area": 681},
    "vijayawada"      : {"population": 1048240,  "area": 61},
    "hyderabad"       : {"population": 6809970,  "area": 650},
    "warangal"        : {"population": 704570,   "area": 406},
    "patna"           : {"population": 1684222,  "area": 3202},
    "gaya"            : {"population": 470839,   "area": 4976},
    "muzaffarpur"     : {"population": 393724,   "area": 3173},
    "ranchi"          : {"population": 1073440,  "area": 652},
    "jamshedpur"      : {"population": 629659,   "area": 64},
    "dhanbad"         : {"population": 1161561,  "area": 2052},
    "bhubaneswar"     : {"population": 837737,   "area": 422},
    "cuttack"         : {"population": 606007,   "area": 3932},
    "puri"            : {"population": 200564,   "area": 3479},
    "guwahati"        : {"population": 957352,   "area": 328},
    "dibrugarh"       : {"population": 154019,   "area": 3381},
    "amritsar"        : {"population": 1132761,  "area": 490},
    "ludhiana"        : {"population": 1618879,  "area": 310},
    "chandigarh"      : {"population": 960787,   "area": 114},
    "shimla"          : {"population": 169578,   "area": 232},
    "dharamsala"      : {"population": 30000,    "area": 22},
    "manali"          : {"population": 8096,     "area": 24},
    "dehradun"        : {"population": 578000,   "area": 3088},
    "haridwar"        : {"population": 228832,   "area": 2360},
    "rishikesh"       : {"population": 102138,   "area": 11},
    "nainital"        : {"population": 41000,    "area": 284},
    "mussoorie"       : {"population": 30118,    "area": 64},
    "uttarkashi"      : {"population": 18919,    "area": 8016},
    "chamoli"         : {"population": 8500,     "area": 8030},
    "srinagar"        : {"population": 1180570,  "area": 294},
    "jammu"           : {"population": 502197,   "area": 3097},
    "imphal"          : {"population": 268243,   "area": 709},
    "aizawl"          : {"population": 293416,   "area": 457},
    "kohima"          : {"population": 99039,    "area": 1463},
    "shillong"        : {"population": 354759,   "area": 64},
    "gangtok"         : {"population": 100286,   "area": 19},
    "raipur"          : {"population": 1010087,  "area": 226},
    "panaji"          : {"population": 114759,   "area": 69},
}


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


def get_live_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    try:
        resp = requests.get(url, timeout=5).json()
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
        worst_idx             = filtered[deaths_col].idxmax()
        stats["worst_year"]   = int(filtered.loc[worst_idx, "Year"])
        stats["worst_deaths"] = int(filtered.loc[worst_idx, deaths_col])
    return stats


def ml_predict(disaster_type: str):
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


def rule_score(disaster_type, city, w, city_info):
    score = 0.0
    dtype = disaster_type.lower()

    if dtype == "flood":
        if w["rainfall"] > 200:   score += 4.0
        elif w["rainfall"] > 100: score += 2.5
        elif w["rainfall"] > 50:  score += 1.0
        if w["humidity"] > 90:    score += 1.0
        elif w["humidity"] > 75:  score += 0.5

    elif dtype == "earthquake":
        high_risk   = ["dehradun", "haridwar", "rishikesh", "shimla", "nainital",
                       "guwahati", "ranchi", "srinagar", "jammu", "imphal",
                       "kohima", "itanagar", "gangtok", "shillong", "aizawl",
                       "mussoorie", "uttarkashi", "chamoli", "manali", "kullu"]
        medium_risk = ["delhi", "meerut", "agra", "lucknow", "chandigarh",
                       "amritsar", "noida", "ghaziabad", "pathankot", "kangra",
                       "dharamsala", "roorkee", "haldwani", "rudrapur", "ambala"]
        if city.lower() in high_risk:     score += 5.0
        elif city.lower() in medium_risk: score += 3.0
        else:                             score += 1.5

    elif dtype in ["cyclone", "storm"]:
        if w["wind"] > 180:   score += 6.0
        elif w["wind"] > 120: score += 4.0
        elif w["wind"] > 80:  score += 3.0
        elif w["wind"] > 50:  score += 1.5
        coastal = ["mumbai", "chennai", "kolkata", "visakhapatnam", "bhubaneswar",
                   "kochi", "thiruvananthapuram", "mangalore", "guwahati", "vijayawada",
                   "puri", "balasore", "nagapattinam", "ramanathapuram", "thoothukudi",
                   "panaji", "kannur", "kozhikode", "alappuzha", "kollam"]
        if city.lower() in coastal: score += 2.0

    elif dtype == "drought":
        if w["temp"] > 45:    score += 4.0
        elif w["temp"] > 42:  score += 3.0
        elif w["temp"] > 38:  score += 2.0
        elif w["temp"] > 35:  score += 1.0
        if w["humidity"] < 20:   score += 2.0
        elif w["humidity"] < 35: score += 1.0
        if w["rainfall"] == 0:   score += 1.5
        drought_prone = ["jaipur", "jodhpur", "bikaner", "barmer", "jaisalmer",
                         "ajmer", "nagaur", "chittorgarh", "kota", "anantapur",
                         "kadapa", "kurnool", "bellary", "gulbarga", "solapur", "latur"]
        if city.lower() in drought_prone: score += 1.5

    elif dtype == "landslide":
        if w["rainfall"] > 150:  score += 4.0
        elif w["rainfall"] > 80: score += 2.5
        elif w["rainfall"] > 40: score += 1.0
        hilly = ["dehradun", "haridwar", "rishikesh", "nainital", "shimla",
                 "ranchi", "guwahati", "manali", "kullu", "mussoorie",
                 "uttarkashi", "chamoli", "dharamsala", "darjeeling", "gangtok",
                 "shillong", "aizawl", "kohima", "imphal", "srinagar"]
        if city.lower() in hilly: score += 3.0

    elif dtype == "wildfire":
        if w["temp"] > 42:    score += 3.5
        elif w["temp"] > 38:  score += 2.0
        if w["humidity"] < 20:   score += 2.5
        elif w["humidity"] < 35: score += 1.5
        if w["wind"] > 60:       score += 1.5
        if w["rainfall"] == 0:   score += 1.5
        forest = ["dehradun", "nainital", "shimla", "ranchi", "bhubaneswar",
                  "guwahati", "manali", "dharamsala", "mussoorie", "uttarkashi",
                  "chamoli", "darjeeling", "shillong", "aizawl", "imphal"]
        if city.lower() in forest: score += 1.5

    elif dtype == "tsunami":
        coastal_high   = ["chennai", "visakhapatnam", "bhubaneswar", "kochi",
                          "thiruvananthapuram", "mangalore", "nagapattinam",
                          "ramanathapuram", "thoothukudi", "puri", "balasore",
                          "kannur", "kozhikode", "alappuzha", "nellore"]
        coastal_medium = ["mumbai", "kolkata", "panaji", "kollam", "thrissur"]
        if city.lower() in coastal_high:     score += 6.0
        elif city.lower() in coastal_medium: score += 4.0
        else:                                score += 1.5

    density = city_info["population"] / max(city_info["area"], 1)
    if density > 5000:    score += 2.0
    elif density > 2000:  score += 1.5
    elif density > 1000:  score += 1.0
    elif density > 500:   score += 0.5

    return min(round(score, 1), 10.0)


def get_final_score(disaster_type, city, w, city_info):
    ml  = ml_predict(disaster_type)
    rb  = rule_score(disaster_type, city, w, city_info)
    if ml is not None:
        return round((ml * 0.6) + (rb * 0.4), 1), True
    return rb, False


def get_label_emoji(score):
    if score >= 7:   return "Critical", "🔴"
    elif score >= 5: return "High",     "🟠"
    elif score >= 3: return "Medium",   "🟡"
    else:            return "Low",      "🟢"


def get_people(score, population):
    pct = 0.70 if score >= 7 else 0.45 if score >= 5 else 0.20 if score >= 3 else 0.08
    return int(population * pct)


def get_recs(label, dtype):
    base = {
        "Critical": ["Issue an immediate evacuation order.", "Deploy NDRF teams.", "Activate emergency helpline (1078).", "Set up relief camps."],
        "High"    : ["Issue evacuation advisory.", "Alert rescue teams.", "Inform local administration.", "Identify safe zones."],
        "Medium"  : ["Monitor the situation.", "Send SMS alerts.", "Pre-position resources."],
        "Low"     : ["Conduct routine monitoring.", "Follow weather updates."],
    }
    specific = {
        "flood"      : ["Monitor river levels.", "Low-lying areas khali karwao."],
        "earthquake" : ["Inspect buildings.", "Be prepared for aftershocks."],
        "cyclone"    : ["Evacuate coastal areas.", "Hold ships at the port."],
        "drought"    : ["Implement water rationing.", "Provide support to farmers."],
        "landslide"  : ["Close hill roads.", "Monitor slopes."],
        "wildfire"   : ["Evacuate forest areas.", "Deploy fire brigades."],
        "tsunami"    : ["Move to higher ground.", "Vacate coastal areas."],
    }
    recs  = base.get(label, base["Low"]).copy()
    recs += specific.get(dtype.lower(), [])
    return recs[:5]


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


def get_weather_update(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    try:
        data = requests.get(url, timeout=5).json()
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


async def predict(disaster_type, city):
    city_info  = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    w          = get_live_weather(city)
    score, ml  = get_final_score(disaster_type, city, w, city_info)
    label, _   = get_label_emoji(score)
    people     = get_people(score, city_info["population"])
    recs       = get_recs(label, disaster_type)
    stats      = get_emdat_stats(disaster_type)

    disaster_names = {
        "flood"      : "🌊 Flood",
        "earthquake" : "🏔️ Earthquake",
        "cyclone"    : "🌀 Cyclone",
        "drought"    : "🌵 Drought",
        "landslide"  : "⛰️ Landslide",
        "wildfire"   : "🔥 Wildfire",
        "tsunami"    : "🌊 Tsunami"
    }
    name = disaster_names.get(disaster_type.lower(), "⚠️ Disaster")
    return format_prediction(name, city, label, score, people, w, recs, ml, stats)


@router.post("/chatbot")
async def chat_endpoint(chat_data: ChatInput):
    t = chat_data.message.lower()

    # ── 1. News / Web Search ──────────────────────────────
    if any(word in t for word in ["news", "latest", "breaking", "current"]):
        result = web_search(chat_data.message + " India")
        if result:
            return {"response": result}
        return {"response": "⚠️ No latest information found."}

    # ── 2. Knowledge Base ─────────────────────────────────
    knowledge = search_knowledge(t)
    if knowledge:
        return {"response": f"📚 Disaster Information:\n\n{knowledge}"}

    # ── 3. Weather ────────────────────────────────────────
    if any(w in t for w in ["weather", "mausam", "temperature", "temp", "forecast", "humidity"]):
        return {"response": get_weather_update(extract_city(t))}

    # ── 4. Disaster Risk Predictions ─────────────────────
    if any(w in t for w in ["flood", "flooding", "baarish", "barsat", "flood risk"]):
        return {"response": await predict("flood", extract_city(t))}

    if any(w in t for w in ["earthquake", "bhukamp", "bhookamp", "seismic", "quake"]):
        return {"response": await predict("earthquake", extract_city(t))}

    if any(w in t for w in ["cyclone", "toofan", "hurricane", "storm", "typhoon"]):
        return {"response": await predict("cyclone", extract_city(t))}

    if any(w in t for w in ["drought", "sukha", "pani nahi", "water crisis"]):
        return {"response": await predict("drought", extract_city(t))}

    if any(w in t for w in ["landslide", "bhoosakhal", "mudslide"]):
        return {"response": await predict("landslide", extract_city(t))}

    if any(w in t for w in ["wildfire", "forest fire", "jungle fire", "aag", "fire"]):
        return {"response": await predict("wildfire", extract_city(t))}

    if any(w in t for w in ["tsunami", "tidal wave", "seawave", "samudri lehar"]):
        return {"response": await predict("tsunami", extract_city(t))}

    if any(w in t for w in ["risk", "danger", "khatra", "prediction", "predict"]):
        return {"response": await predict("flood", extract_city(t))}

    # ── 5. Historical Events ──────────────────────────────
    if "uttarakhand" in t and "2013" in t:
        return {"response": "📅 2013 Uttarakhand Flash Flood:\n• 6,054 deaths recorded\n• Lakhs of people became homeless.\n• Kedarnath was the most affected.\n• It was India's worst flood disaster."}

    if "kerala" in t and "2018" in t:
        return {"response": "📅 2018 Kerala Floods:\n• 504 deaths\n• 5.4 million people affected\n• 100 years' worst flood\n• 14 districts affected"}

    if "bihar" in t and "flood" in t:
        return {"response": "🌊 Bihar Floods History:\n• 50+ flood events between 1900 and 2021.\n• The Kosi River is called the Sorrow of Bihar.\n• Most affected: Darbhanga, Muzaffarpur, Sitamarhi."}

    if "worst" in t or "sabse bura" in t:
        return {"response": "😮 India's Worst Flood:\n• 1987\n• 1,399 deaths\n• 40 million people affected"}

    if "assam" in t and "flood" in t:
        return {"response": "🌊 Assam Floods:\n• India's most flood-prone state\n• Caused by the Brahmaputra river\n• 32 lakh people affected in 2022"}

    if "odisha" in t or ("cyclone" in t and "history" in t):
        return {"response": "🌀 Odisha Cyclones:\n• 1999 Super Cyclone: 10,000+ deaths\n• 2013 Phailin: 45 deaths\n• Early warning system is now strong."}

    if "bhuj" in t or ("earthquake" in t and "2001" in t):
        return {"response": "🏔️ 2001 Bhuj Earthquake:\n• Richter scale: 7.7\n• 20,000+ deaths\n• India's deadliest earthquake."}

    if "2004" in t and "tsunami" in t:
        return {"response": "🌊 2004 Indian Ocean Tsunami:\n• 10,000+ deaths in India\n• Tamil Nadu, Andhra Pradesh, Kerala affected\n• Caused by a magnitude 9.1 earthquake."}

    if "kedarnath" in t:
        return {"response": "⛰️ 2013 Kedarnath Disaster:\n• Flash flood + landslide combo\n• 5,000+ deaths\n• India's worst multi-disaster event."}

    return {
        "response": (
            "🙏 I am DisasterGuard AI!\n\n"
            "You can ask me:\n\n"
            "🌤️ Weather:    'Dehradun weather'\n"
            "🌊 Flood:      'Moradabad flood risk'\n"
            "🏔️ Earthquake: 'Delhi earthquake risk'\n"
            "🌀 Cyclone:    'Mumbai cyclone risk'\n"
            "🌵 Drought:    'Jaipur drought risk'\n"
            "⛰️ Landslide:  'Dehradun landslide risk'\n"
            "🔥 Wildfire:   'Nainital wildfire risk'\n"
            "🌊 Tsunami:    'Chennai tsunami risk'\n"
            "📊 History:    '2013 Uttarakhand flood'\n"
            "😮 Worst:      'India\'s worst flood'"
        )
    }