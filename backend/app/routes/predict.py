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
    api_key = "4dc6dfe592ba69fb69c3ba954f0deca6"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
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
    city_data = {
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
    }

    city_lower = city.lower()
    data = city_data.get(city_lower, {"population": 500000, "area": 2000})

    api_key = "4dc6dfe592ba69fb69c3ba954f0deca6"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

    try:
        weather_resp = requests.get(url).json()
        rainfall = weather_resp.get("rain", {}).get("1h", 0)
        temp     = weather_resp["main"]["temp"]
        wind     = weather_resp["wind"]["speed"] * 3.6
    except Exception:
        rainfall, temp, wind = 0, 35, 20

    try:
        req = PredictRequest(
            disaster_type  = "flood",
            district       = city.capitalize(),
            state          = "India",
            rainfall_mm    = rainfall,
            temperature_c  = temp,
            wind_speed_kmh = wind,
            population     = data["population"],
            area_sq_km     = data["area"],
            river_level_m  = 5.0
        )
        result   = await predict_disaster(req)
        severity = result.severity_label
        score    = result.severity_score
        people   = result.people_at_risk
        recs     = result.recommendations[:3]

        emoji = {
            "Critical": "🔴",
            "High":     "🟠",
            "Medium":   "🟡",
            "Low":      "🟢"
        }.get(severity, "⚪")

        response = (
            f"{emoji} {city.capitalize()} Flood Risk Assessment:\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"⚠️ Severity: {severity} ({score}/10)\n"
            f"👥 People at risk: {people:,}\n"
            f"🌡️ Temperature: {temp}°C\n"
            f"🌧️ Rainfall: {rainfall}mm\n\n"
            f"📋 Recommended Actions:\n"
        )
        for i, rec in enumerate(recs, 1):
            response += f"{i}. {rec}\n"
        return response

    except Exception as e:
        return f"⚠️ {city.capitalize()} ka risk assessment abhi available nahi hai. Error: {str(e)}"


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

    # 3. EMDAT DATA LOGIC
    if "uttarakhand" in user_text and "2013" in user_text:
        return {"response": "2013 mein Uttarakhand mein sabse bhayanak flood aaya tha jisme 6,054 deaths record hui thi."}

    if "kerala" in user_text and "2018" in user_text:
        return {"response": "2018 Kerala floods mein lagbhag 504 logon ki jaan gayi thi aur 5.4 million log affected hue the."}

    if "bihar" in user_text and "flood" in user_text:
        return {"response": "Bihar mein 1900-2021 ke beech kaafi flood events record hue hain. Sabse zyada affected districts: Darbhanga, Muzaffarpur, Sitamarhi."}

    if "worst" in user_text or "sabse bura" in user_text:
        return {"response": "India mein sabse bura flood 1987 mein aaya tha jisme 1,399 deaths aur 40 million log affected hue the."}

    if "assam" in user_text and "flood" in user_text:
        return {"response": "Assam India ka sabse flood-prone state hai. Brahmaputra river ki wajah se har saal flooding hoti hai."}

    # 4. DEFAULT
    return {
        "response": (
            "🙏 Main FloodGuard AI hoon! Aap pooch sakte hain:\n\n"
            "🌤️ Weather: 'Dehradun weather'\n"
            "⚠️ Risk: 'Moradabad flood risk'\n"
            "📊 History: '2013 Uttarakhand flood'\n"
            "🌊 State data: 'Bihar flood history'\n"
            "😮 Worst: 'India ka sabse bura flood'"
        )
    }