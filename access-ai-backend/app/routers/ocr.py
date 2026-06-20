from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from app.services.ocr_yolo_service import OCRYoloService
from app.services.ai_service import AIService
from typing import Optional

router = APIRouter(prefix="/ocr", tags=["OCR Scanner"])

class OCRResponse(BaseModel):
    extracted_text: str
    simplified_text: str
    translated_text: str
    summary: str

@router.post("/scan", response_model=OCRResponse)
async def scan_document(
    file: UploadFile = File(...),
    language: Optional[str] = Form("English"),
    simplify: Optional[bool] = Form(False)
):
    try:
        # Read file bytes
        contents = await file.read()
        
        # Extract text via OCR service
        extracted_text = await OCRYoloService.process_ocr_image(contents)
        
        # Simplify text if requested (or default for dyslexia support)
        simplified_text = extracted_text
        if simplify:
            simplified_text = await AIService.simplify_text(extracted_text)
            
        # Translate text if language specified is not English
        translated_text = extracted_text
        if language and language.lower() not in ["english", "en"]:
            translated_text = await AIService.translate_text(extracted_text, language)
            
        # Generate summary notes
        notes = await AIService.generate_notes(extracted_text)
        summary = notes.get("summary", "")
        
        return OCRResponse(
            extracted_text=extracted_text,
            simplified_text=simplified_text,
            translated_text=translated_text,
            summary=summary
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()
