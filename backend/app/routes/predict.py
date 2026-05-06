from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
import pickle
import numpy as np
import pandas as pd
import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# ── Paths ─────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "../models/model.pkl")
DATA_PATH = r"D:\Disaster\data\disasters_clean.csv"

# ── Load ML Model ─────────────────────────────────────────
def load_model():
    try:
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        print("⚠️ model.pkl not found — rule-based fallback will be used!")
        return None

model = load_model()

# ── Load EMDAT Historical Data ────────────────────────────
def load_emdat():
    try:
        df       = pd.read_csv(DATA_PATH)
        india_df = df[df["Country"] == "India"].copy()
        print(f"✅ EMDAT data loaded: {len(india_df)} India records")
        return india_df
    except Exception as e:
        print(f"⚠️ EMDAT data could not be loaded: {e}")
        return None

emdat_df = load_emdat()

# ── Disaster Type Mapping ─────────────────────────────────
DISASTER_TYPE_MAP = {
    "flood"      : 0,
    "earthquake" : 1,
    "cyclone"    : 2,
    "storm"      : 2,
    "drought"    : 3,
    "landslide"  : 4,
    "wildfire"   : 5,
    "tsunami"    : 6,
}

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

SEVERITY_COLORS = {
    "Low"      : "#639922",
    "Medium"   : "#185FA5",
    "High"     : "#EF9F27",
    "Critical" : "#E24B4A"
}

# ── Request Schema ────────────────────────────────────────
class PredictRequest(BaseModel):
    disaster_type   : str             = Field(..., example="flood")
    district        : str             = Field(..., example="Moradabad")
    state           : str             = Field(..., example="Uttar Pradesh")
    rainfall_mm     : float           = Field(..., example=250.5)
    temperature_c   : float           = Field(..., example=38.2)
    wind_speed_kmh  : float           = Field(..., example=45.0)
    population      : int             = Field(..., example=887000)
    area_sq_km      : float           = Field(..., example=3493.0)
    river_level_m   : Optional[float] = Field(None, example=8.5)
    magnitude       : Optional[float] = Field(None, example=5.2)

# ── Response Schema ───────────────────────────────────────
class PredictResponse(BaseModel):
    district           : str
    state              : str
    disaster_type      : str
    severity_score     : float
    severity_label     : str
    severity_color     : str
    people_at_risk     : int
    confidence_pct     : float
    recommendations    : list[str]
    alert_level        : str
    historical_context : str
    ml_used            : bool

# ── EMDAT Historical Analysis ─────────────────────────────
def get_historical_context(disaster_type: str) -> dict:
    if emdat_df is None:
        return {"avg_deaths": 0, "avg_affected": 0, "avg_damages": 0, "total_events": 0}

    emdat_type = EMDAT_TYPE_MAP.get(disaster_type.lower(), "Flood")
    filtered   = emdat_df[emdat_df["Disaster Type"] == emdat_type]

    if filtered.empty:
        return {"avg_deaths": 0, "avg_affected": 0, "avg_damages": 0, "total_events": 0}

    stats = {
        "avg_deaths"   : round(filtered["Total Deaths"].mean(), 1),
        "avg_affected" : round(filtered["Total Affected"].mean(), 1),
        "avg_damages"  : round(filtered["Total Damages ('000 US$)"].mean(), 1),
        "total_events" : len(filtered),
    }
    if not filtered["Total Deaths"].isna().all():
        worst_idx             = filtered["Total Deaths"].idxmax()
        stats["worst_year"]   = int(filtered.loc[worst_idx, "Year"])
        stats["worst_deaths"] = int(filtered.loc[worst_idx, "Total Deaths"])
    return stats

def build_historical_message(disaster_type: str) -> str:
    ctx        = get_historical_context(disaster_type)
    emdat_type = EMDAT_TYPE_MAP.get(disaster_type.lower(), "Flood")
    if ctx["total_events"] == 0:
        return "Historical data is not available."
    msg = (
        f"📊 India EMDAT Historical Data ({emdat_type}):\n"
        f"   • Total events (1900-2021): {ctx['total_events']}\n"
        f"   • Avg deaths per event: {ctx['avg_deaths']:,.0f}\n"
        f"   • Avg people affected: {ctx['avg_affected']:,.0f}\n"
    )
    if ctx.get("worst_year") and ctx.get("worst_deaths"):
        msg += f"   • Worst year: {ctx['worst_year']} ({ctx['worst_deaths']:,} deaths)\n"
    return msg

# ── ML Model Prediction ───────────────────────────────────
def ml_predict(disaster_type: str, population: int):
    if model is None:
        return None, 72.0, False
    try:
        ctx           = get_historical_context(disaster_type)
        dtype_encoded = DISASTER_TYPE_MAP.get(disaster_type.lower(), 0)
        features      = np.array([[
            2024,
            ctx["avg_deaths"],
            ctx["avg_affected"],
            ctx["avg_damages"],
            dtype_encoded
        ]])
        pred_class = model.predict(features)[0]
        pred_proba = model.predict_proba(features).max() * 100
        score_map  = {0: 2.0, 1: 5.0, 2: 7.5}
        ml_score   = score_map.get(int(pred_class), 3.0)
        return ml_score, round(pred_proba, 1), True
    except Exception as e:
        print(f"ML predict error: {e}")
        return None, 72.0, False

# ── Rule-based Severity ───────────────────────────────────
def rule_based_severity(req: PredictRequest) -> float:
    score = 0.0
    dtype = req.disaster_type.lower()

    if dtype == "flood":
        if req.rainfall_mm > 200:   score += 4.0
        elif req.rainfall_mm > 100: score += 2.5
        elif req.rainfall_mm > 50:  score += 1.0
        if req.river_level_m:
            if req.river_level_m > 10:   score += 3.0
            elif req.river_level_m > 7:  score += 2.0
            elif req.river_level_m > 5:  score += 1.0

    elif dtype == "earthquake":
        mag = req.magnitude or 0
        if mag >= 7.0:   score += 7.0
        elif mag >= 6.0: score += 5.0
        elif mag >= 5.0: score += 3.0
        elif mag >= 4.0: score += 1.5
        high_risk   = ["dehradun", "haridwar", "rishikesh", "shimla", "nainital", "guwahati", "ranchi"]
        medium_risk = ["delhi", "meerut", "agra", "lucknow", "chandigarh", "amritsar", "noida", "ghaziabad"]
        city = req.district.lower()
        if city in high_risk:     score += 4.0
        elif city in medium_risk: score += 2.5
        else:                     score += 1.0

    elif dtype in ["cyclone", "storm"]:
        if req.wind_speed_kmh > 180:   score += 6.0
        elif req.wind_speed_kmh > 120: score += 4.0
        elif req.wind_speed_kmh > 60:  score += 2.0

    elif dtype == "drought":
        if req.temperature_c > 45:   score += 4.0
        elif req.temperature_c > 42: score += 3.0
        elif req.temperature_c > 38: score += 2.0
        elif req.temperature_c > 35: score += 1.0
        if req.rainfall_mm == 0:     score += 2.0

    elif dtype == "landslide":
        if req.rainfall_mm > 150:  score += 4.0
        elif req.rainfall_mm > 80: score += 2.5
        elif req.rainfall_mm > 40: score += 1.0
        hilly = ["dehradun", "haridwar", "rishikesh", "nainital", "shimla", "ranchi", "guwahati"]
        if req.district.lower() in hilly: score += 3.0

    elif dtype == "wildfire":
        if req.temperature_c > 42:   score += 3.5
        elif req.temperature_c > 38: score += 2.0
        if req.rainfall_mm == 0:     score += 2.0
        if req.wind_speed_kmh > 60:  score += 1.5

    elif dtype == "tsunami":
        coastal_high   = ["chennai", "visakhapatnam", "bhubaneswar", "kochi", "thiruvananthapuram"]
        coastal_medium = ["mumbai", "kolkata", "guwahati"]
        city = req.district.lower()
        if city in coastal_high:     score += 6.0
        elif city in coastal_medium: score += 4.0
        else:                        score += 1.5

    density = req.population / max(req.area_sq_km, 1)
    if density > 5000:    score += 2.0
    elif density > 2000:  score += 1.5
    elif density > 1000:  score += 1.0
    elif density > 500:   score += 0.5

    return min(round(score, 1), 10.0)

# ── Combine ML + Rule-based ───────────────────────────────
def get_final_score(req: PredictRequest):
    ml_score, confidence, ml_used = ml_predict(req.disaster_type, req.population)
    rule_score = rule_based_severity(req)
    if ml_score is not None:
        final_score = round((ml_score * 0.6) + (rule_score * 0.4), 1)
        return min(final_score, 10.0), confidence, True
    return rule_score, 72.0, False

# ── People at Risk ────────────────────────────────────────
def estimate_people_at_risk(severity_score: float, population: int) -> int:
    if severity_score >= 8:   pct = 0.70
    elif severity_score >= 6: pct = 0.45
    elif severity_score >= 4: pct = 0.20
    else:                     pct = 0.08
    return int(population * pct)

# ── Recommendations ───────────────────────────────────────
def get_recommendations(severity_label: str, disaster_type: str) -> list[str]:
    base = {
        "Critical": ["Issue an immediate evacuation order.", "Deploy NDRF teams.", "Activate the emergency helpline (1078).", "Setup relief camps.", "Position medical teams on standby."],
        "High"    : ["Issue evacuation advisory.", "Alert rescue teams.", "Inform local administration.", "Notify residents about safe zones via SMS."],
        "Medium"  : ["Monitor the situation.", "Alert residents via SMS.", "Pre-position resources."],
        "Low"     : ["Conduct routine monitoring.", "Follow weather updates."],
    }
    specific = {
        "flood"      : ["Monitor river levels.", "Evacuate low-lying areas."],
        "earthquake" : ["Inspect buildings.", "Be prepared for aftershocks."],
        "cyclone"    : ["Evacuate coastal areas.", "Hold ships at the port."],
        "drought"    : ["Implement water rationing.", "Provide support to farmers."],
        "landslide"  : ["Close hill roads.", "Monitor slopes."],
        "wildfire"   : ["Evacuate forest areas.", "Deploy fire brigades."],
        "tsunami"    : ["Move to higher ground.", "Band coastal areas."],
    }
    recs  = base.get(severity_label, base["Low"]).copy()
    recs += specific.get(disaster_type.lower(), [])
    return recs[:5]

# ── Main Predict Endpoint ─────────────────────────────────
@router.post("/predict", response_model=PredictResponse)
async def predict_disaster(req: PredictRequest):
    severity_score, confidence, ml_used = get_final_score(req)

    if severity_score >= 7:   label = "Critical"
    elif severity_score >= 5: label = "High"
    elif severity_score >= 3: label = "Medium"
    else:                     label = "Low"

    return PredictResponse(
        district           = req.district,
        state              = req.state,
        disaster_type      = req.disaster_type,
        severity_score     = severity_score,
        severity_label     = label,
        severity_color     = SEVERITY_COLORS[label],
        people_at_risk     = estimate_people_at_risk(severity_score, req.population),
        confidence_pct     = confidence,
        recommendations    = get_recommendations(label, req.disaster_type),
        alert_level        = label,
        historical_context = build_historical_message(req.disaster_type),
        ml_used            = ml_used,
    )

# ── Test Endpoint ─────────────────────────────────────────
@router.get("/predict/test")
async def predict_test():
    test_req = PredictRequest(
        disaster_type  = "flood",
        district       = "Moradabad",
        state          = "Uttar Pradesh",
        rainfall_mm    = 280.0,
        temperature_c  = 35.0,
        wind_speed_kmh = 40.0,
        population     = 887000,
        area_sq_km     = 3493.0,
        river_level_m  = 9.2,
    )
    return await predict_disaster(test_req)