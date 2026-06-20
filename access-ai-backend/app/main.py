import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, close_db
from app.routers import tutor, ocr, pdf, object_detection, lecture
from app.services.websocket_manager import manager
from app.services.ai_service import AIService
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("access_ai")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await init_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db()

# Include Routers
app.include_router(tutor.router, prefix=settings.API_V1_STR)
app.include_router(ocr.router, prefix=settings.API_V1_STR)
app.include_router(pdf.router, prefix=settings.API_V1_STR)
app.include_router(object_detection.router, prefix=settings.API_V1_STR)
app.include_router(lecture.router, prefix=settings.API_V1_STR)

# Live Classroom WebSocket endpoint
@app.websocket("/ws/classroom/{channel_id}")
async def websocket_classroom(websocket: WebSocket, channel_id: str):
    await manager.connect(websocket, channel_id)
    try:
        while True:
            # Expect JSON data from client
            # Form: { "text": "hello class", "sender": "teacher", "translate_to": "telugu" }
            data = await websocket.receive_text()
            message = json.loads(data)
            
            text = message.get("text", "")
            sender = message.get("sender", "teacher")
            translate_to = message.get("translate_to", "English")
            
            translated = text
            if translate_to and translate_to.lower() not in ["english", "en"]:
                translated = await AIService.translate_text(text, translate_to)
                
            # Broadcast the segment to all students in the classroom channel
            payload = {
                "timestamp": datetime_str(),
                "sender": sender,
                "text": text,
                "translated_text": translated
            }
            await manager.broadcast(payload, channel_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel_id)
    except Exception as e:
        logger.error(f"WebSocket Classroom Error: {e}")
        manager.disconnect(websocket, channel_id)

def datetime_str():
    from datetime import datetime
    return datetime.utcnow().isoformat()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Access AI API server!",
        "status": "healthy",
        "endpoints": [
            f"{settings.API_V1_STR}/tutor/ask",
            f"{settings.API_V1_STR}/ocr/scan",
            f"{settings.API_V1_STR}/pdf/upload",
            f"{settings.API_V1_STR}/vision/detect",
            f"{settings.API_V1_STR}/lectures"
        ]
    }
