from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
import pickle
import numpy as np
import os

router = APIRouter()

# ── ML Model load karo ────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/model.pkl")

def load_model():
    try:
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        print("⚠️  model.pkl nahi mila — rule-based fallback use hoga!")
        return None

model = load_model()

DISASTER_TYPES = {
    "flood"      : 0,
    "earthquake" : 1,
    "cyclone"    : 2,
    "drought"    : 3,
    "landslide"  : 4,
    "wildfire"   : 5,
}

SEVERITY_LABELS = {
    0: "Low",
    1: "Medium",
    2: "High",
    3: "Critical"
}

SEVERITY_COLORS = {
    "Low"      : "#639922",
    "Medium"   : "#185FA5",
    "High"     : "#EF9F27",
    "Critical" : "#E24B4A"
}

# ── Request schema ────────────────────────────────────────
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

# ── Response schema ───────────────────────────────────────
class PredictResponse(BaseModel):
    district        : str
    state           : str
    disaster_type   : str
    severity_score  : float
    severity_label  : str
    severity_color  : str
    people_at_risk  : int
    confidence_pct  : float
    recommendations : list[str]
    alert_level     : str

# ── Helper functions ──────────────────────────────────────
def estimate_people_at_risk(severity_score: float, population: int) -> int:
    if severity_score >= 8:   pct = 0.70
    elif severity_score >= 6: pct = 0.45
    elif severity_score >= 4: pct = 0.20
    else:                     pct = 0.08
    return int(population * pct)

def get_recommendations(severity_label: str, disaster_type: str) -> list[str]:
    base = {
        "Critical": [
            "Turant evacuation order jaari karo",
            "NDRF teams deploy karo",
            "Emergency helpline activate karo (1078)",
            "Relief camps setup karo",
            "Medical teams standby pe rakho",
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
        ],
        "Low": [
            "Routine monitoring karo",
            "Weather updates follow karo",
        ]
    }
    disaster_specific = {
        "flood"      : ["River levels continuously monitor karo", "Low-lying areas khali karwao"],
        "earthquake" : ["Buildings inspect karo", "Aftershocks ke liye taiyaar raho"],
        "cyclone"    : ["Coastal areas evacuate karo", "Ships ko port pe rokho"],
    }
    recs = base.get(severity_label, base["Low"])
    recs += disaster_specific.get(disaster_type.lower(), [])
    return recs[:5]

def rule_based_severity(req: PredictRequest) -> float:
    score = 0.0
    dtype = req.disaster_type.lower()

    if dtype == "flood":
        if req.rainfall_mm > 200  : score += 4.0
        elif req.rainfall_mm > 100: score += 2.5
        elif req.rainfall_mm > 50 : score += 1.0
        if req.river_level_m:
            if req.river_level_m > 10  : score += 3.0
            elif req.river_level_m > 7 : score += 2.0
            elif req.river_level_m > 5 : score += 1.0

    elif dtype == "earthquake":
        mag = req.magnitude or 0
        if mag >= 7.0  : score += 7.0
        elif mag >= 6.0: score += 5.0
        elif mag >= 5.0: score += 3.0
        elif mag >= 4.0: score += 1.5

    elif dtype == "cyclone":
        if req.wind_speed_kmh > 180 : score += 6.0
        elif req.wind_speed_kmh > 120: score += 4.0
        elif req.wind_speed_kmh > 60 : score += 2.0

    density = req.population / max(req.area_sq_km, 1)
    if density > 1000: score += 1.5
    elif density > 500: score += 0.8

    return min(round(score, 1), 10.0)

# ── Main prediction endpoint ──────────────────────────────
@router.post("/predict", response_model=PredictResponse)
async def predict_disaster(req: PredictRequest):
    features = np.array([[
        DISASTER_TYPES.get(req.disaster_type.lower(), 0),
        req.rainfall_mm,
        req.temperature_c,
        req.wind_speed_kmh,
        req.population,
        req.area_sq_km,
        req.river_level_m  or 0.0,
        req.magnitude      or 0.0,
        req.population / max(req.area_sq_km, 1),
    ]])

    if model is not None:
        try:
            severity_score = float(model.predict(features)[0])
            confidence     = float(model.predict_proba(features).max() * 100)
        except Exception as e:
            print(f"Model error: {e} — fallback use kar raha hoon")
            severity_score = rule_based_severity(req)
            confidence     = 72.0
    else:
        severity_score = rule_based_severity(req)
        confidence     = 72.0

    if severity_score >= 7  : label = "Critical"
    elif severity_score >= 5: label = "High"
    elif severity_score >= 3: label = "Medium"
    else                    : label = "Low"

    return PredictResponse(
        district        = req.district,
        state           = req.state,
        disaster_type   = req.disaster_type,
        severity_score  = round(severity_score, 1),
        severity_label  = label,
        severity_color  = SEVERITY_COLORS[label],
        people_at_risk  = estimate_people_at_risk(severity_score, req.population),
        confidence_pct  = round(confidence, 1),
        recommendations = get_recommendations(label, req.disaster_type),
        alert_level     = label,
    )

# ── Test endpoint ─────────────────────────────────────────
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