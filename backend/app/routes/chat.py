from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter()

class ChatMessage(BaseModel):
    role   : str
    content: str

class ChatRequest(BaseModel):
    message : str
    history : list[ChatMessage] = []

class ChatResponse(BaseModel):
    reply     : str
    model_used: str

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message empty hai!")

    try:
        import anthropic
        client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY", "")
        )
        messages = []
        for msg in req.history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": req.message})

        response = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 500,
            system     = "Tum DisasterAI ho — UP Disaster Management assistant. Hindi aur English dono mein jawab do.",
            messages   = messages,
        )
        return ChatResponse(
            reply      = response.content[0].text,
            model_used = "claude-sonnet-4"
        )
    except Exception:
        return ChatResponse(
            reply      = f"Demo mode: Tumhara sawaal tha '{req.message}'. Moradabad mein HIGH flood risk hai — 94,000 log affected hain.",
            model_used = "demo-mode"
        )