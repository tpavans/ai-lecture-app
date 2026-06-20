from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.ai_service import AIService

router = APIRouter(prefix="/tutor", tags=["AI Tutor"])

class ChatMessage(BaseModel):
    sender: str  # "student" or "tutor"
    text: str

class TutorRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []
    persona: Optional[str] = "normal"  # "normal", "10-year-old", "visual", "dyslexia"
    language: Optional[str] = "English"

class TutorResponse(BaseModel):
    answer: str
    translated_answer: str

@router.post("/ask", response_model=TutorResponse)
async def ask_tutor(request: TutorRequest):
    try:
        # Convert Pydantic chat message lists to basic dicts for service layer
        history_dicts = [{"sender": m.sender, "text": m.text} for m in request.history] if request.history else []
        
        # Get AI Tutor explanation
        answer = await AIService.ask_tutor(
            question=request.question,
            history=history_dicts,
            persona=request.persona
        )
        
        # Translate the answer if the target language is different from English
        translated_answer = answer
        if request.language and request.language.lower() not in ["english", "en"]:
            translated_answer = await AIService.translate_text(answer, request.language)
            
        return TutorResponse(answer=answer, translated_answer=translated_answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
