from fastapi import APIRouter
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "4dc6dfe592ba69fb69c3ba954f0deca6")

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
    "ranchi", "bhubaneswar", "guwahati", "chandigarh", "amritsar"
]

CITY_DATA = {
    "moradabad": {"population": 887000,   "area": 3493},
    "bareilly":  {"population": 905000,   "area": 4120},
    "lucknow":   {"population": 2817000,  "area": 2528},
    "dehradun":  {"population": 578000,   "area": 3088},
    "delhi":     {"population": 11007835, "area": 1484},
    "mumbai":    {"population": 12442373, "area": 603},
    "chennai":   {"population": 4646732,  "area": 426},
    "kolkata":   {"population": 4496694,  "area": 1886},
    "jaipur":    {"population": 3046163,  "area": 467},
    "patna":     {"population": 1684222,  "area": 3202},
}

def extract_city(text):
    text_lower = text.lower()
    for city in KNOWN_CITIES:
        if city in text_lower:
            return city.capitalize()
    stop_words = [
        "weather", "mausam", "temp", "ka", "ki", "ke", "mein",
        "hai", "aaj", "the", "of", "in", "is", "flood", "risk",
        "danger", "earthquake", "cyclone", "drought", "landslide",
        "wildfire", "tsunami", "predict", "prediction", "what",
        "how", "tell", "me", "show", "please", "check", "today"
    ]
    words = text_lower.split()
    for word in words:
        word = word.replace("?","").replace("!","").replace(",","").replace(".","")
        if word not in stop_words and len(word) >= 3:
            return word.capitalize()
    return "Delhi"

def get_label(score):
    if score >= 7:   return "Critical"
    elif score >= 5: return "High"
    elif score >= 3: return "Medium"
    else:            return "Low"

def get_people(score, population):
    pct = 0.70 if score >= 7 else 0.45 if score >= 5 else 0.20 if score >= 3 else 0.08
    return int(population * pct)

def get_live_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    try:
        r = requests.get(url, timeout=5).json()
        return {
            "rainfall": r.get("rain", {}).get("1h", 0),
            "temp":     r["main"]["temp"],
            "wind":     r["wind"]["speed"] * 3.6,
            "humidity": r["main"]["humidity"]
        }
    except Exception:
        return {"rainfall": 0, "temp": 35, "wind": 20, "humidity": 60}

def format_result(dtype, city, label, score, people, w, recs):
    icons = {"Critical":"[CRITICAL]","High":"[HIGH]","Medium":"[MEDIUM]","Low":"[LOW]"}
    resp = (
        f"{icons.get(label,'')} {city} - {dtype} Risk\n"
        f"==================\n"
        f"Severity : {label} ({score}/10)\n"
        f"People at risk : {people:,}\n"
        f"Temperature : {w['temp']}C\n"
        f"Rainfall : {w['rainfall']}mm\n"
        f"Humidity : {w['humidity']}%\n"
        f"Wind : {round(w['wind'],1)} km/h\n\n"
        f"Actions:\n"
    )
    for i, r in enumerate(recs[:4], 1):
        resp += f"{i}. {r}\n"
    return resp

def get_weather_text(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    try:
        d = requests.get(url, timeout=5).json()
        if d.get("cod") == 200:
            return (
                f"[WEATHER] {city} mein abhi:\n"
                f"Temperature: {d['main']['temp']}C\n"
                f"Mausam: {d['weather'][0]['description']}\n"
                f"Humidity: {d['main']['humidity']}%\n"
                f"Wind: {d['wind']['speed']} m/s"
            )
        return f"'{city}' ka data nahi mila."
    except Exception:
        return "Network error!"

async def flood_pred(city):
    data = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    w = get_live_weather(city)
    score = 0.0
    if w["rainfall"] > 200:   score += 4.0
    elif w["rainfall"] > 100: score += 2.5
    elif w["rainfall"] > 50:  score += 1.0
    if w["humidity"] > 90: score += 1.0
    elif w["humidity"] > 75: score += 0.5
    density = data["population"] / max(data["area"], 1)
    if density > 5000: score += 2.0
    elif density > 2000: score += 1.5
    elif density > 1000: score += 1.0
    else: score += 0.5
    score = min(round(score, 1), 10.0)
    label = get_label(score)
    people = get_people(score, data["population"])
    recs = {
        "Critical": ["Turant evacuation karo", "NDRF deploy karo", "Helpline 1078 activate karo", "Relief camps banao"],
        "High":     ["Evacuation advisory do", "Rescue teams alert karo", "Low areas khali karwao", "River monitor karo"],
        "Medium":   ["Monitor karo", "SMS alerts bhejo", "Resources taiyaar karo"],
        "Low":      ["Routine monitoring", "Weather follow karo"],
    }.get(label, [])
    return format_result("Flood", city, label, score, people, w, recs)

async def earthquake_pred(city):
    data = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    high = ["dehradun","haridwar","shimla","nainital","guwahati","ranchi"]
    med  = ["delhi","meerut","agra","lucknow","noida","ghaziabad","chandigarh"]
    city_l = city.lower()
    if city_l in high:   score = 7.5
    elif city_l in med:  score = 5.0
    else:                score = 3.0
    density = data["population"] / max(data["area"], 1)
    if density > 5000: score += 1.5
    elif density > 2000: score += 1.0
    elif density > 1000: score += 0.5
    score = min(round(score, 1), 10.0)
    label = get_label(score)
    people = get_people(score, data["population"])
    recs = {
        "Critical": ["Buildings evacuate karo", "NDRF deploy karo", "Medical teams ready karo", "Helpline activate karo"],
        "High":     ["Buildings inspect karo", "Open areas mein jao", "Emergency kits rakho"],
        "Medium":   ["Awareness campaign karo", "Structural check karo"],
        "Low":      ["Seismic monitoring karo"],
    }.get(label, [])
    w = get_live_weather(city)
    return format_result("Earthquake", city, label, score, people, w, recs)

async def cyclone_pred(city):
    data = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    w = get_live_weather(city)
    score = 0.0
    if w["wind"] > 180: score += 6.0
    elif w["wind"] > 120: score += 4.5
    elif w["wind"] > 80: score += 3.0
    elif w["wind"] > 50: score += 1.5
    if w["rainfall"] > 150: score += 2.0
    elif w["rainfall"] > 80: score += 1.0
    coastal = ["mumbai","chennai","kolkata","visakhapatnam","bhubaneswar","kochi"]
    if city.lower() in coastal: score += 2.0
    score = min(round(score, 1), 10.0)
    label = get_label(score)
    people = get_people(score, data["population"])
    recs = {
        "Critical": ["Coastal areas evacuate karo", "Ships port pe rokho", "NDRF deploy karo"],
        "High":     ["Communities alert karo", "Boats wapas bulao"],
        "Medium":   ["Weather monitor karo"],
        "Low":      ["Routine monitoring"],
    }.get(label, [])
    return format_result("Cyclone", city, label, score, people, w, recs)

async def drought_pred(city):
    data = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    w = get_live_weather(city)
    score = 0.0
    if w["temp"] > 45: score += 4.0
    elif w["temp"] > 42: score += 3.0
    elif w["temp"] > 38: score += 2.0
    elif w["temp"] > 35: score += 1.0
    if w["humidity"] < 20: score += 3.0
    elif w["humidity"] < 35: score += 2.0
    elif w["humidity"] < 50: score += 1.0
    if w["rainfall"] == 0: score += 2.0
    drought_prone = ["jaipur","jodhpur","udaipur","ahmedabad","bhopal"]
    if city.lower() in drought_prone: score += 1.5
    score = min(round(score, 1), 10.0)
    label = get_label(score)
    people = get_people(score, data["population"])
    recs = {
        "Critical": ["Pani rationing karo", "Tankers se supply karo", "Farmers ko muavza do"],
        "High":     ["Pani bachao advisory do", "Irrigation restrict karo"],
        "Medium":   ["Conservation awareness failao"],
        "Low":      ["Routine monitoring"],
    }.get(label, [])
    return format_result("Drought", city, label, score, people, w, recs)

async def landslide_pred(city):
    data = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    w = get_live_weather(city)
    score = 0.0
    if w["rainfall"] > 150: score += 4.0
    elif w["rainfall"] > 80: score += 2.5
    elif w["rainfall"] > 40: score += 1.0
    hilly = ["dehradun","haridwar","nainital","shimla","ranchi","guwahati"]
    if city.lower() in hilly: score += 3.0
    score = min(round(score, 1), 10.0)
    label = get_label(score)
    people = get_people(score, data["population"])
    recs = {
        "Critical": ["Pahadi areas evacuate karo", "Roads band karo", "NDRF deploy karo"],
        "High":     ["Hilly areas mein mat jao", "Slopes monitor karo"],
        "Medium":   ["Drainage improve karo"],
        "Low":      ["Routine monitoring"],
    }.get(label, [])
    return format_result("Landslide", city, label, score, people, w, recs)

async def wildfire_pred(city):
    data = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    w = get_live_weather(city)
    score = 0.0
    if w["temp"] > 42: score += 3.5
    elif w["temp"] > 38: score += 2.0
    elif w["temp"] > 35: score += 1.0
    if w["humidity"] < 20: score += 3.0
    elif w["humidity"] < 35: score += 2.0
    if w["wind"] > 60: score += 2.0
    elif w["wind"] > 40: score += 1.0
    if w["rainfall"] == 0: score += 1.5
    forest = ["dehradun","nainital","shimla","ranchi","bhubaneswar","guwahati"]
    if city.lower() in forest: score += 1.5
    score = min(round(score, 1), 10.0)
    label = get_label(score)
    people = get_people(score, data["population"])
    recs = {
        "Critical": ["Forest evacuate karo", "Fire brigade deploy karo", "Air support lo"],
        "High":     ["Watch towers activate karo", "Fire breaks banao"],
        "Medium":   ["Open burning band karo"],
        "Low":      ["Routine monitoring"],
    }.get(label, [])
    return format_result("Wildfire", city, label, score, people, w, recs)

async def tsunami_pred(city):
    data = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})
    w = get_live_weather(city)
    coastal_high = ["chennai","visakhapatnam","bhubaneswar","kochi","thiruvananthapuram"]
    coastal_med  = ["mumbai","kolkata","guwahati"]
    if city.lower() in coastal_high:   score = 7.0
    elif city.lower() in coastal_med:  score = 4.5
    else:                              score = 1.5
    score = min(round(score, 1), 10.0)
    label = get_label(score)
    people = get_people(score, data["population"])
    recs = {
        "Critical": ["Coastal evacuate karo", "Oonchi jagah jao", "NDRF marine deploy karo"],
        "High":     ["Communities alert karo", "Evacuation routes mark karo"],
        "Medium":   ["Awareness camps lagao"],
        "Low":      ["Coastal monitoring karo"],
    }.get(label, [])
    return format_result("Tsunami", city, label, score, people, w, recs)

@router.post("/chatbot")
async def chat_endpoint(chat_data: ChatInput):
    t = chat_data.message.lower()
    city = extract_city(t)

    if any(w in t for w in ["weather","mausam","temperature","temp"]):
        return {"response": get_weather_text(city)}
    if any(w in t for w in ["flood","flooding","baarish","flood risk"]):
        return {"response": await flood_pred(city)}
    if any(w in t for w in ["earthquake","bhukamp","bhookamp","seismic","quake"]):
        return {"response": await earthquake_pred(city)}
    if any(w in t for w in ["cyclone","toofan","hurricane","storm","typhoon"]):
        return {"response": await cyclone_pred(city)}
    if any(w in t for w in ["drought","sukha","water crisis","dry"]):
        return {"response": await drought_pred(city)}
    if any(w in t for w in ["landslide","mudslide","slope"]):
        return {"response": await landslide_pred(city)}
    if any(w in t for w in ["wildfire","forest fire","fire","aag"]):
        return {"response": await wildfire_pred(city)}
    if any(w in t for w in ["tsunami","tidal wave","seawave"]):
        return {"response": await tsunami_pred(city)}
    if any(w in t for w in ["risk","danger","khatra","predict"]):
        return {"response": await flood_pred(city)}
    if "uttarakhand" in t and "2013" in t:
        return {"response": "2013 mein Uttarakhand mein sabse bhayanak flood aaya tha jisme 6,054 deaths record hui thi."}
    if "kerala" in t and "2018" in t:
        return {"response": "2018 Kerala floods mein 504 logon ki jaan gayi aur 5.4 million affected hue."}
    if "bihar" in t and "flood" in t:
        return {"response": "Bihar mein sabse zyada affected districts: Darbhanga, Muzaffarpur, Sitamarhi."}
    if "worst" in t or "sabse bura" in t:
        return {"response": "India mein sabse bura flood 1987 mein aaya - 1,399 deaths, 40 million affected."}
    if "bhuj" in t or ("earthquake" in t and "2001" in t):
        return {"response": "2001 Bhuj earthquake mein 20,000+ deaths - Richter scale 7.7."}
    if "2004" in t and "tsunami" in t:
        return {"response": "2004 Indian Ocean Tsunami mein India mein 10,000+ log mare."}

    return {"response": (
        "Main FloodGuard AI hoon! Pooch sakte hain:\n\n"
        "Weather    : 'Dehradun weather'\n"
        "Flood      : 'Moradabad flood risk'\n"
        "Earthquake : 'Delhi earthquake risk'\n"
        "Cyclone    : 'Mumbai cyclone risk'\n"
        "Drought    : 'Jaipur drought risk'\n"
        "Landslide  : 'Dehradun landslide risk'\n"
        "Wildfire   : 'Nainital wildfire risk'\n"
        "Tsunami    : 'Chennai tsunami risk'"
    )}