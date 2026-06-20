from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.ocr_yolo_service import OCRYoloService
from typing import List

router = APIRouter(prefix="/vision", tags=["Object Detection"])

class DetectionBox(BaseModel):
    name: str
    confidence: float
    box: List[int]  # [x1, y1, x2, y2]
    guidance: str

class DetectionResponse(BaseModel):
    detections: List[DetectionBox]

@router.post("/detect", response_model=DetectionResponse)
async def detect_classroom_objects(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        detections = await OCRYoloService.detect_objects(contents)
        
        box_responses = [
            DetectionBox(
                name=d["name"],
                confidence=d["confidence"],
                box=d["box"],
                guidance=d["guidance"]
            )
            for d in detections
        ]
        
        return DetectionResponse(detections=box_responses)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()
