# Disaster Analysis & Alerting

A compact project for disaster data analysis, machine learning model training, and a web application for alerts and visualization.

## Repository Structure
- `backend/` — Python backend and API (Flask/FastAPI)
- `frontend/` — Vite + React frontend
- `data/` — Original and cleaned datasets (CSV, Excel)
- `ml/` — ML datasets, preprocessing, and training scripts
- `*.ipynb` — Notebooks for EDA, model training, and evaluation

## Prerequisites
- Python 3.10+ (backend, ML notebooks)
- Node.js 16+ and npm or yarn (frontend)

## Backend (Python)
1. Create and activate a virtual environment (Windows cmd):

```bash
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Run the backend (example):

```bash
# from project root
python backend/app/main.py
```

Adjust the command if your backend uses a different entrypoint or framework.

## Frontend (React + Vite)
1. Install dependencies and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Open the application in your browser at the URL shown by Vite (commonly http://localhost:5173).

## Notebooks
Open the Jupyter notebooks in the project root with Jupyter or VS Code:
- `01_EDA_Disaster_Analysis.ipynb`
- `02_ML_Model_Training.ipynb`
- `03_Model_Evaluation.ipynb`

## Data
Keep raw data under `data/` or `ml/data/raw/`. Use cleaned files from `data/` when training or evaluating models.

## Contributing
If you want the README to include Docker commands, CI configuration, or full Hindi translation, tell me which option to add and I will update it.

---
Generated and updated by project assistant.