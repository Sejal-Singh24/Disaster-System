from fastapi import APIRouter
from pydantic import BaseModel
import requests

router = APIRouter()

# Input structure for Frontend
class ChatInput(BaseModel):
    message: str

def get_weather_update(city="Delhi"):
    api_key = "4dc6dfe592ba69fb69c3ba954f0deca6"
    # Celsius ke liye units=metric use kiya hai
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data.get("cod") == 200:
            temp = data["main"]["temp"]
            desc = data["weather"][0]["description"]
            humidity = data["main"]["humidity"]
            return f"📍 {city.capitalize()} mein abhi temperature {temp}°C hai aur mausam '{desc}' hai. Humidity {humidity}% hai."
        else:
            # Agar city na mile toh ye message dikhayega
            return f"⚠️ Maaf kijiye, mujhe '{city}' ke mausam ka data nahi mila. Please city ka naam sahi se likhein."
    except Exception as e:
        return "❌ Network error! Weather update fetch nahi ho paya."

@router.post("/chatbot")
async def chat_endpoint(chat_data: ChatInput):
    user_text = chat_data.message.lower()
    
    # --- 1. SMART WEATHER LOGIC ---
    if "weather" in user_text or "mausam" in user_text:
        # User ke text ko words mein split karte hain
        words = user_text.split()
        
        # Default city Delhi rahegi agar user city na likhe
        target_city = "Delhi"
        
        # Logic: Agar user ne likha "Mumbai weather", toh 'mumbai' ko city maan lo
        for i, word in enumerate(words):
            if word in ["weather", "mausam"]:
                # Check karo ki "weather" se pehle koi word hai?
                if i > 0:
                    target_city = words[i-1]
                # Ya phir "weather" ke baad koi word hai? (e.g., "weather Mumbai")
                elif i < len(words) - 1:
                    target_city = words[i+1]
        
        # Clean city name (remove extra marks if any)
        target_city = target_city.replace("?", "").replace("!", "")
        
        reply = get_weather_update(target_city)
        return {"response": reply}

    # --- 2. EMDAT DATA LOGIC ---
    if "uttarakhand" in user_text and "2013" in user_text:
        return {"response": "2013 mein Uttarakhand mein sabse bhayanak flood aaya tha jisme 6,054 deaths record hui thi."}
    
    if "kerala" in user_text and "2018" in user_text:
        return {"response": "2018 Kerala floods mein lagbhag 504 logon ki jaan gayi thi aur kafi nuksaan hua tha."}

    # --- 3. DEFAULT RESPONSE ---
    return {
        "response": "Main FloodGuard AI hoon. Aap mujhse India ke flood records (1900-2021) ya kisi bhi city ke 'weather' ke baare mein pooch sakte hain!"
    }