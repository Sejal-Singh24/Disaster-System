from fastapi import APIRouter
from pydantic import BaseModel
import requests

router = APIRouter()


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
    "haridwar":  {"population": 228832,   "area": 2360},
    "agra":      {"population": 1585000,  "area": 4027},
    "delhi":     {"population": 11007835, "area": 1484},
    "patna":     {"population": 1684222,  "area": 3202},
    "mumbai":    {"population": 12442373, "area": 603},
    "kolkata":   {"population": 4496694,  "area": 1886},
    "chennai":   {"population": 4646732,  "area": 426},
    "kanpur":    {"population": 2765348,  "area": 3155},
    "varanasi":  {"population": 1198491,  "area": 1535},
    "meerut":    {"population": 1305000,  "area": 2590},
    "noida":     {"population": 637272,   "area": 203},
    "ghaziabad": {"population": 1636068,  "area": 1179},
    "pune":      {"population": 3124458,  "area": 331},
    "ahmedabad": {"population": 5570585,  "area": 464},
    "jaipur":    {"population": 3046163,  "area": 467},
    "bhopal":    {"population": 1798218,  "area": 285},
}

WEATHER_API_KEY = "4dc6dfe592ba69fb69c3ba954f0deca6"


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
        "now", "current", "live", "real", "time", "update"
    ]

    words = text_lower.split()
    for word in words:
        word = word.replace("?", "").replace("!", "").replace(",", "").replace(".", "")
        if word not in stop_words and len(word) >= 3:
            return word.capitalize()

    return "Delhi"


def get_weather_update(city="Delhi"):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    try:
        response = requests.get(url)
        data = response.json()
        if data.get("cod") == 200:
            temp     = data["main"]["temp"]
            desc     = data["weather"][0]["description"]
            humidity = data["main"]["humidity"]
            wind     = data["wind"]["speed"]
            return (
                f"📍 {city.capitalize()} mein abhi:\n"
                f"🌡️ Temperature: {temp}°C\n"
                f"🌤️ Mausam: {desc}\n"
                f"💧 Humidity: {humidity}%\n"
                f"💨 Wind: {wind} m/s"
            )
        else:
            return f"⚠️ '{city}' ka data nahi mila. Sahi city naam likhein."
    except Exception:
        return "❌ Network error! Weather fetch nahi ho paya."


async def get_disaster_prediction(city):
    data = CITY_DATA.get(city.lower(), {"population": 500000, "area": 2000})

    # Live weather se rainfall, temp, wind lo
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    try:
        weather_resp = requests.get(url).json()
        rainfall = weather_resp.get("rain", {}).get("1h", 0)
        temp     = weather_resp["main"]["temp"]
        wind     = weather_resp["wind"]["speed"] * 3.6
        humidity = weather_resp["main"]["humidity"]
    except Exception:
        rainfall, temp, wind, humidity = 0, 35, 20, 60

    # Rule-based severity score
    score = 0.0

    if rainfall > 200:   score += 4.0
    elif rainfall > 100: score += 2.5
    elif rainfall > 50:  score += 1.0

    if temp > 45:   score += 1.5
    elif temp > 40: score += 0.8

    if wind > 80:   score += 1.5
    elif wind > 50: score += 0.8

    if humidity > 90:   score += 1.0
    elif humidity > 75: score += 0.5

    density = data["population"] / max(data["area"], 1)
    if density > 5000:   score += 2.0
    elif density > 2000: score += 1.5
    elif density > 1000: score += 1.0
    elif density > 500:  score += 0.5

    score = min(round(score, 1), 10.0)

    # Severity label
    if score >= 7:   label = "Critical"
    elif score >= 5: label = "High"
    elif score >= 3: label = "Medium"
    else:            label = "Low"

    emoji = {"Critical": "🔴", "High": "🟠", "Medium": "🟡", "Low": "🟢"}.get(label, "⚪")

    pct    = {"Critical": 0.70, "High": 0.45, "Medium": 0.20, "Low": 0.08}.get(label, 0.08)
    people = int(data["population"] * pct)

    recs = {
        "Critical": [
            "Turant evacuation order jaari karo",
            "NDRF teams deploy karo",
            "Emergency helpline activate karo (1078)",
            "Relief camps setup karo",
        ],
        "High": [
            "Evacuation advisory jaari karo",
            "Rescue teams alert karo",
            "Local administration ko inform karo",
            "Logon ko safe zones identify karke batao",
        ],
        "Medium": [
            "Situation monitor karo",
            "Logon ko alert karo via SMS",
            "Resources pre-position karo",
            "River levels check karo",
        ],
        "Low": [
            "Routine monitoring karo",
            "Weather updates follow karo",
            "Koi immediate action ki zaroorat nahi",
        ],
    }.get(label, [])

    response = (
        f"{emoji} {city.capitalize()} Flood Risk Assessment:\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"⚠️  Severity: {label} ({score}/10)\n"
        f"👥 People at risk: {people:,}\n"
        f"🌡️  Temperature: {temp}°C\n"
        f"🌧️  Rainfall: {rainfall}mm\n"
        f"💧 Humidity: {humidity}%\n"
        f"💨 Wind: {round(wind, 1)} km/h\n\n"
        f"📋 Recommended Actions:\n"
    )
    for i, rec in enumerate(recs, 1):
        response += f"{i}. {rec}\n"

    return response


@router.post("/chatbot")
async def chat_endpoint(chat_data: ChatInput):
    user_text = chat_data.message.lower()

    # 1. WEATHER LOGIC
    if any(word in user_text for word in ["weather", "mausam", "temperature", "temp"]):
        city  = extract_city(user_text)
        reply = get_weather_update(city)
        return {"response": reply}

    # 2. RISK / PREDICTION LOGIC
    if any(w in user_text for w in ["risk", "danger", "khatra", "flood risk", "prediction", "predict"]):
        city  = extract_city(user_text)
        reply = await get_disaster_prediction(city)
        return {"response": reply}

    # 3. HISTORICAL DATA
    if "uttarakhand" in user_text and "2013" in user_text:
        return {"response": "📅 2013 mein Uttarakhand mein sabse bhayanak flood aaya tha jisme 6,054 deaths record hui thi aur lakho log homeless hue the."}

    if "kerala" in user_text and "2018" in user_text:
        return {"response": "📅 2018 Kerala floods mein lagbhag 504 logon ki jaan gayi thi aur 5.4 million log affected hue the. Yeh 100 saal ka sabse bada flood tha."}

    if "bihar" in user_text and "flood" in user_text:
        return {"response": "🌊 Bihar mein 1900-2021 ke beech kaafi flood events record hue hain. Sabse zyada affected districts: Darbhanga, Muzaffarpur, Sitamarhi. Kosi river ko 'Bihar ka Shok' bhi kehte hain."}

    if "worst" in user_text or "sabse bura" in user_text:
        return {"response": "😮 India mein sabse bura flood 1987 mein aaya tha jisme 1,399 deaths aur 40 million log affected hue the."}

    if "assam" in user_text and "flood" in user_text:
        return {"response": "🌊 Assam India ka sabse flood-prone state hai. Brahmaputra river ki wajah se har saal flooding hoti hai. 2022 mein 32 lakh log affected hue the."}

    if "cyclone" in user_text or "odisha" in user_text:
        return {"response": "🌀 Odisha cyclone-prone state hai. 1999 Super Cyclone sabse deadly tha jisme 10,000+ log mare. Ab early warning system bahut strong ho gaya hai."}

    if "earthquake" in user_text or "bhukamp" in user_text:
        return {"response": "🏔️ India mein high seismic zones: Himalayan belt (Zone V), Northeast India. 2001 Bhuj earthquake mein 20,000+ deaths hui thi. Richter scale 7.7 tha."}

    # 4. DEFAULT
    return {
        "response": (
            "🙏 Main FloodGuard AI hoon! Aap pooch sakte hain:\n\n"
            "🌤️ Weather:  'Dehradun weather'\n"
            "⚠️  Risk:     'Moradabad flood risk'\n"
            "📊 History:  '2013 Uttarakhand flood'\n"
            "🌊 State:    'Bihar flood history'\n"
            "😮 Worst:    'India ka sabse bura flood'\n"
            "🌀 Cyclone:  'Odisha cyclone'\n"
            "🏔️ Quake:    'earthquake India'"
        )
    }