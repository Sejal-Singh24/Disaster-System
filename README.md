# 🌊 DisasterGuard India
### Disaster Impact Prediction System

> A full-stack AI-powered web application that predicts disaster severity across India using Machine Learning, real-time weather data, and historical EM-DAT records.

**MCA Final Year Project — GBPIET Pauri Garhwal, Uttarakhand**  
**Batch 2024–2026 | Department of Computer Science & Applications**

---

## 👥 Team

| Name | Roll No. |
|------|----------|
| Sejal Singh | 240090600019 |
| Anjali Patwal | 240090600005 |
| Kamal Singh Bisht | 240090600012 |

**Supervisor:** Dr. Shail Kumar Dinkar, Asst. Professor, Dept. of CSA

---

## 📌 About the Project

DisasterGuard India is an intelligent disaster management platform that combines:
- **Machine Learning** (XGBoost + 4 other models) for severity classification
- **Live weather data** (OpenWeatherMap API) for real-time risk assessment
- **Global disaster alerts** (GDACS API) for situational awareness
- **Bilingual AI chatbot** (Hindi + English) for citizen-level queries
- **Interactive India map** with district-level color-coded risk markers

The system classifies disaster severity into **3 classes: Low 🟢 / Medium 🟡 / High 🔴** using 120+ years of EM-DAT historical data combined with live weather inputs.

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Risk Map** | Interactive India map with 60+ district-level alert markers |
| 📊 **Analytics Dashboard** | Real-time charts for deaths, affected population, damage |
| 🔔 **EMDAT Alert Feed** | Live alerts with Critical/High/Medium severity badges |
| 🤖 **AI Chatbot** | Hindi/English disaster risk queries with ML prediction |
| 📈 **ML Evaluation** | Learning curves, ROC, Confusion Matrix, 5-model comparison |
| 🏆 **Model Comparison** | Side-by-side comparison of all 5 ML models |
| ⚡ **WebSocket Alerts** | Real-time alert streaming with <200ms latency |

---

## 🤖 ML Model Performance

| Model | Accuracy | F1 Score | High Recall |
|-------|----------|----------|-------------|
| 🥇 Decision Tree | 99.69% | 0.9969 | 0.90 |
| 🥈 Random Forest | 99.54% | 0.9952 | 0.72 |
| 🥉 XGBoost | 99.47% | 0.9946 | 0.79 |
| Gradient Boosting | 99.44% | 0.9943 | 0.79 |
| Logistic Regression | 88.19% | 0.8760 | 0.10 |

> Trained on **EM-DAT India dataset** — 752 records, 1900–2021, 3-class severity classification

---

## 🛠️ Technology Stack

### Frontend
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.3.1-646CFF?logo=vite)
![Leaflet](https://img.shields.io/badge/React--Leaflet-4.2.1-199900?logo=leaflet)
![Recharts](https://img.shields.io/badge/Recharts-2.12.7-22B5BF)

### Backend
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![Uvicorn](https://img.shields.io/badge/Uvicorn-0.30.0-499848)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)

### Machine Learning
![XGBoost](https://img.shields.io/badge/XGBoost-2.0.3-FF6600)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5.0-F7931E?logo=scikitlearn)
![NumPy](https://img.shields.io/badge/NumPy-1.26.4-013243?logo=numpy)
![Pandas](https://img.shields.io/badge/Pandas-2.x-150458?logo=pandas)

### APIs & Data
- 🌤️ **OpenWeatherMap** — Live weather (temperature, rainfall, wind, humidity)
- 🌍 **GDACS** — Global Disaster Alert and Coordination System
- 🔍 **DuckDuckGo Search** — Real-time disaster news
- 📁 **EM-DAT** — Historical disaster dataset 1900–2021

---

## 📁 Project Structure

```
Disaster-System/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertFeed.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DisasterAlarm.jsx
│   │   │   └── MapView.jsx
│   │   ├── pages/
│   │   │   ├── MLEvaluation.jsx
│   │   │   └── ModelComparison.jsx
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── alerts.py       # Live weather + GDACS alerts
│   │   │   ├── chat.py         # Bilingual chatbot
│   │   │   └── predict.py      # Disaster severity prediction
│   │   ├── services/
│   │   │   └── search.py       # DuckDuckGo + Knowledge base
│   │   ├── models/
│   │   │   ├── model.pkl       # Trained XGBoost model
│   │   │   └── label_encoder.pkl
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
├── data/
│   ├── 1900_2021_DISASTERS.csv     # EM-DAT global dataset
│   ├── 1970-2021_DISASTERS.csv     # EM-DAT subset
│   ├── disasters_clean.csv         # Preprocessed training data
│   └── india_disasters_2021_2025.csv # Recent India data
│
├── 01_EDA_Disaster_Analysis.ipynb
├── 02_ML_Model_Training.ipynb
└── 03_Model_Evaluation.ipynb
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm 8+

### 1. Clone the Repository
```bash
git clone https://github.com/Sejal-Singh24/Disaster-System.git
cd Disaster-System
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file in backend folder:
```env
WEATHER_API_KEY=your_openweathermap_api_key
```

Start backend:
```bash
uvicorn app.main:app --reload
```
Backend runs at: `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Disaster severity prediction |
| `/api/alerts` | GET | Live weather + GDACS alerts (60+ districts) |
| `/api/chatbot` | POST | Bilingual disaster risk chatbot |
| `/api/global` | GET | Global disaster event feed |
| `/ws/alerts` | WebSocket | Real-time alert streaming |

### Sample API Request
```json
POST /api/predict
{
  "disaster_type": "flood",
  "district": "Moradabad",
  "state": "Uttar Pradesh",
  "rainfall_mm": 280.0,
  "temperature_c": 35.0,
  "wind_speed_kmh": 40.0,
  "population": 887000,
  "area_sq_km": 3493.0,
  "river_level_m": 9.2
}
```

### Sample Response
```json
{
  "severity_score": 8.4,
  "severity_label": "Critical",
  "people_at_risk": 620900,
  "confidence_pct": 88.5,
  "recommendations": [
    "Issue an immediate evacuation order.",
    "Deploy NDRF teams.",
    "Activate emergency helpline (1078).",
    "Setup relief camps.",
    "Monitor river levels."
  ],
  "ml_used": true
}
```

---

## 📊 Dataset Information

| Dataset | Records | Period | Use |
|---------|---------|--------|-----|
| EM-DAT 1900–2021 | ~16,000 global / 752 India | 1900–2021 | ML model training |
| EM-DAT 1970–2021 | Subset | 1970–2021 | EDA & visualization |
| disasters_clean.csv | 752 India records | 1900–2021 | Preprocessed training data |
| india_disasters_2021_2025.csv | Recent | 2021–2025 | Recent India context |

**Source:** [EM-DAT — Centre for Research on the Epidemiology of Disasters (CRED)](https://www.emdat.be)

---

## 🧠 ML Pipeline

```
EM-DAT Dataset
      ↓
Data Preprocessing (missing values, encoding)
      ↓
Feature Engineering (5 features per record)
      ↓
80% Train / 20% Test Split
      ↓
XGBoost Classifier Training
      ↓
Hybrid Scoring = ML (60%) + Rule-based (40%)
      ↓
Severity Output: Low / Medium / High
```

**Hybrid Scoring Formula:**
```
Final Score = (ML Score × 0.6) + (Rule-based Score × 0.4)
```

---

## 🌍 Disaster Types Supported

🌊 Flood | 🏔️ Earthquake | 🌀 Cyclone | 🌵 Drought | ⛰️ Landslide | 🔥 Wildfire | 🌊 Tsunami

---

## 🔮 Future Scope

- 🛰️ Satellite imagery analysis (Sentinel-1, MODIS, SAR)
- 📱 Mobile app with push notifications
- 🧠 Multilingual NLP chatbot (mBERT / IndicBERT)
- 🌍 Expand to Bangladesh, Nepal, Pakistan
- 📡 IoT sensor integration for early warning
- 🐦 Social media (Twitter/X) NLP-based event verification

---

## 📄 License

This project is developed as part of MCA Final Year thesis at GBPIET Pauri Garhwal, Uttarakhand.

---

## 🙏 Acknowledgements

- **Dr. Shail Kumar Dinkar** — Project Supervisor
- **EM-DAT / CRED** — Historical disaster dataset
- **OpenWeatherMap** — Live weather API
- **GDACS (United Nations)** — Global disaster alerts
- **GBPIET Pauri** — Department of Computer Science & Applications

---

<div align="center">

**⭐ If you find this project useful, please give it a star! ⭐**

Made with ❤️ by Sejal Singh, Anjali Patwal & Kamal Singh Bisht

*GBPIET Pauri Garhwal, Uttarakhand | MCA 2024–2026*

</div>