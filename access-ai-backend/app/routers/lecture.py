from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.database import db
from app.services.ai_service import AIService
from datetime import datetime
import uuid

router = APIRouter(prefix="/lectures", tags=["Lectures"])

class LectureSegment(BaseModel):
    timestamp: str
    text: str
    translated_text: Optional[str] = ""

class LectureSaveRequest(BaseModel):
    title: str
    segments: List[LectureSegment]
    language: str

class LectureNotesResponse(BaseModel):
    summary: str
    key_points: List[str]
    questions: List[str]
    flashcards: List[dict]
    quiz: List[dict]
    mindmap: dict
    revision: str

class LectureItem(BaseModel):
    id: str
    title: str
    date: str
    language: str
    segments: List[LectureSegment]
    notes: Optional[LectureNotesResponse] = None

@router.get("", response_model=List[LectureItem])
async def get_all_lectures():
    try:
        cursor = db["lectures"].find({})
        docs = await cursor.to_list(length=100)
        
        lectures = []
        for doc in docs:
            lectures.append(LectureItem(
                id=doc["_id"],
                title=doc["title"],
                date=doc.get("date", datetime.utcnow().isoformat()),
                language=doc.get("language", "English"),
                segments=[LectureSegment(**s) for s in doc.get("segments", [])],
                notes=LectureNotesResponse(**doc["notes"]) if doc.get("notes") else None
            ))
        return lectures
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save", response_model=LectureItem)
async def save_lecture(request: LectureSaveRequest):
    try:
        # Generate full text transcript
        full_text = " ".join([seg.text for seg in request.segments])
        
        # Call AI notes generator
        notes = await AIService.generate_notes(full_text)
        
        lecture_id = str(uuid.uuid4())
        lecture_doc = {
            "_id": lecture_id,
            "title": request.title,
            "date": datetime.utcnow().isoformat(),
            "language": request.language,
            "segments": [seg.model_dump() for seg in request.segments],
            "notes": notes
        }
        
        await db["lectures"].insert_one(lecture_doc)
        
        return LectureItem(
            id=lecture_id,
            title=request.title,
            date=lecture_doc["date"],
            language=request.language,
            segments=request.segments,
            notes=LectureNotesResponse(**notes)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{lecture_id}")
async def delete_lecture(lecture_id: str):
    try:
        res = await db["lectures"].delete_one({"_id": lecture_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lecture not found")
        return {"status": "success", "message": "Lecture deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
