from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.ai_service import AIService
from typing import List

router = APIRouter(prefix="/pdf", tags=["PDF Reader"])

class PDFResponse(BaseModel):
    filename: str
    paragraphs: List[str]
    summary: str
    key_points: List[str]

@router.post("/upload", response_model=PDFResponse)
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Simulate PDF reading (production would use PyPDF2 or pdfplumber)
        filename = file.filename
        
        # Simulated academic paragraphs from a syllabus or lecture
        paragraphs = [
            "Chapter 1: Foundations of Algorithms. An algorithm is a step-by-step procedure for solving a problem or accomplishing a task. In this section, we study how to measure the efficiency of algorithms using Big O notation, focusing on worst-case execution runtimes.",
            "Chapter 2: Sorting and Searching. Searching involves finding a specific item in a collection. We contrast linear search, which has a complexity of O(n), with binary search, which has a complexity of O(log n) but requires the list to be pre-sorted.",
            "Chapter 3: Space Complexity. In addition to CPU cycles, algorithms also consume memory. Space complexity measures the total memory workspace an algorithm requires, relative to its input size. We analyze recursion and its stack frame footprint."
        ]
        
        full_text = "\n\n".join(paragraphs)
        notes = await AIService.generate_notes(full_text)
        
        return PDFResponse(
            filename=filename,
            paragraphs=paragraphs,
            summary=notes.get("summary", ""),
            key_points=notes.get("key_points", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()
