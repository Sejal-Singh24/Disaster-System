from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# ── App setup ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Disaster Impact API starting...")
    yield
    print("🛑 API shutting down...")

app = FastAPI(
    title="Disaster Impact Prediction API",
    description="Backend for Disaster Impact Prediction System",
    version="1.0.0",
    lifespan=lifespan
)

# ── CORS (React frontend ko allow karo) ───────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes import ────────────────────────────────────
from app.routes.predict import router as predict_router
from app.routes.alerts  import router as alerts_router  
from app.routes.chat    import router as chat_router    

app.include_router(predict_router,  prefix="/api", tags=["Prediction"])
app.include_router(alerts_router,   prefix="/api", tags=["Alerts"])
app.include_router(chat_router,     prefix="/api", tags=["Chatbot"])

# ── Health check ──────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "running",
        "message": "Disaster Impact Prediction API is live!",
        "endpoints": {
            "predict" : "/api/predict",
            "alerts"  : "/api/alerts",
            "chat"    : "/api/chat",
            "docs"    : "/docs"
        }
    }

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}

# ── WebSocket — live alerts ───────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, message: dict):
        import json
        for ws in self.active:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/alerts")
async def websocket_alerts(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()   # keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(ws)

# ── Run ───────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)