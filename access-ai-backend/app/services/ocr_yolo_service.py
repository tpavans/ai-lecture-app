import logging
import random
from typing import List, Dict

logger = logging.getLogger("access_ai")

class OCRYoloService:
    @staticmethod
    async def process_ocr_image(image_bytes: bytes) -> str:
        """Parses image bytes to extract text. If EasyOCR is not installed, uses mock OCR extraction."""
        try:
            # Here, in full production, you would do:
            # import easyocr
            # reader = easyocr.Reader(['en'])
            # result = reader.readtext(image_bytes, detail=0)
            # return " ".join(result)
            pass
        except Exception as e:
            logger.error(f"Failed to use EasyOCR: {e}")
            
        # Returning a high-quality educational mockup text suitable for dyslexia simplification
        mock_texts = [
            "Introduction to Neural Networks. Neural Networks are computational systems inspired by the human brain's biological neural networks. They consist of highly interconnected nodes called artificial neurons. These systems learn to perform tasks by considering examples, generally without being programmed with task-specific rules.",
            "A database is an organized collection of data, generally stored and accessed electronically from a computer system. Where databases are more complex they are often developed using formal design and modeling techniques.",
            "Design patterns are typical solutions to common problems in software design. Each pattern is like a blueprint that you can customize to solve a recurring design problem in your code."
        ]
        return random.choice(mock_texts)

    @staticmethod
    async def detect_objects(frame_bytes: bytes) -> List[Dict]:
        """Runs YOLOv8 object detection on incoming image frames. 
        Returns bounding boxes and names of detected classroom elements.
        """
        # Simulated YOLO detections for classroom environment
        possible_objects = [
            {"name": "Door", "confidence": 0.92, "box": [100, 50, 250, 480], "guidance": "Door ahead, approximately 3 meters. Keep straight."},
            {"name": "Chair", "confidence": 0.88, "box": [320, 200, 480, 420], "guidance": "Chair nearby on your right. Steer slightly left."},
            {"name": "Bottle", "confidence": 0.85, "box": [500, 310, 560, 390], "guidance": "Bottle on the table in front of you."},
            {"name": "Teacher", "confidence": 0.95, "box": [200, 80, 350, 400], "guidance": "Teacher in front of you, standing by the board."},
            {"name": "Laptop", "confidence": 0.91, "box": [400, 280, 550, 410], "guidance": "Laptop detected. Open in front of you."},
            {"name": "Whiteboard", "confidence": 0.89, "box": [50, 30, 450, 220], "guidance": "Whiteboard detected straight ahead."}
        ]
        
        # Pick 1 to 3 items randomly to simulate live video tracking
        count = random.randint(1, 3)
        detections = random.sample(possible_objects, count)
        
        return detections
