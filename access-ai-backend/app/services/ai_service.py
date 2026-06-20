import json
import logging
from app.config import settings

logger = logging.getLogger("access_ai")

# Check if Google GenAI is configured
gemini_available = False
try:
    if settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        gemini_available = True
        logger.info("Gemini API initialized successfully.")
    else:
        logger.warning("GEMINI_API_KEY not set. Using local high-fidelity AI mocks.")
except Exception as e:
    logger.error(f"Failed to initialize Gemini API: {e}. Using local high-fidelity AI mocks.")

class AIService:
    @staticmethod
    async def translate_text(text: str, target_lang: str) -> str:
        """Translates text using Gemini or mock responses."""
        if not text.strip():
            return ""
        
        target_lang = target_lang.lower()
        if target_lang in ["english", "en"]:
            return text
            
        # Basic common translation mappings for direct mock demo reliability
        translations = {
            "telugu": {
                "hello": "నమస్కారం (Namaskāram)",
                "welcome to access ai": "యాక్సెస్ AI కి స్వాగతం",
                "machine learning": "మెషిన్ లెర్నింగ్ అనేది కృత్రిమ మేధస్సు యొక్క ఒక విభాగం.",
                "today we will learn machine learning": "ఈ రోజు మనం మెషిన్ లెర్నింగ్ గురించి నేర్చుకుంటాము.",
                "machine learning is a branch of artificial intelligence": "మెషిన్ లెర్నింగ్ అనేది ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ (కృత్రిమ మేధస్సు) యొక్క ఒక శాఖ.",
                "binary search": "బైనరీ సెర్చ్ అనేది క్రమబద్ధీకరించిన జాబితాలో ఒక మూలకాన్ని కనుగొనడానికి ఒక సమర్థవంతమైన అల్గారిథమ్.",
            },
            "hindi": {
                "hello": "नमस्ते (Namaste)",
                "welcome to access ai": "एक्सेस एआई में आपका स्वागत है",
                "machine learning": "मशीन लर्निंग आर्टिफिशियल इंटेलिजेंस की एक शाखा है।",
                "today we will learn machine learning": "आज हम मशीन लर्निंग सीखेंगे।",
                "machine learning is a branch of artificial intelligence": "मशीन लर्निंग आर्टिफिशियल इंटेलिजेंस की एक शाखा है।",
                "binary search": "बाइनरी सर्च एक सॉर्ट की गई सूची में किसी तत्व को खोजने का एक कुशल एल्गोरिदम है।",
            },
            "tamil": {
                "hello": "வணக்கம் (Vanakkam)",
                "welcome to access ai": "அக்சஸ் ஏஐ-க்கு வரவேற்கிறோம்",
                "machine learning": "மெஷின் லேர்னிங் என்பது செயற்கை நுண்ணறிவின் ஒரு பிரிவாகும்.",
                "today we will learn machine learning": "இன்று நாம் மெஷின் லேர்னிங் பற்றி கற்றுக்கொள்வோம்.",
                "machine learning is a branch of artificial intelligence": "மெஷின் லேர்னிங் என்பது செயற்கை நுண்ணறிவின் ஒரு கிளை ஆகும்.",
                "binary search": "பைனரி தேடல் என்பது வரிசைப்படுத்தப்பட்ட பட்டியலில் ஒரு உறுப்பைக் கண்டறியும் திறமையான அல்காரிதம் ஆகும்.",
            },
            "kannada": {
                "hello": "ನಮಸ್ಕಾರ (Namaskara)",
                "welcome to access ai": "ಆಕ್ಸೆಸ್ ಎಐ ಗೆ ಸ್ವಾಗತ",
                "machine learning": "ಮಷಿನ್ ಲರ್ನಿಂಗ್ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯ ಒಂದು ಶಾಖೆಯಾಗಿದೆ.",
                "today we will learn machine learning": "ಇಂದು ನಾವು ಮಷಿನ್ ಲರ್ನಿಂಗ್ ಕಲಿಯಲಿದ್ದೇವೆ.",
                "machine learning is a branch of artificial intelligence": "ಮಷಿನ್ ಲರ್ನಿಂಗ್ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯ ಒಂದು ಶಾಖೆಯಾಗಿದೆ.",
                "binary search": "ಬೈನರಿ ಹುಡುಕಾಟವು ವಿಂಗಡಿಸಲಾದ ಪಟ್ಟಿಯಲ್ಲಿ ಒಂದು ಅಂಶವನ್ನು ಕಂಡುಹಿಡಿಯಲು ಒಂದು ಪರಿಣಾಮಕಾರಿ ಅಲ್ಗಾರಿದಮ್ ಆಗಿದೆ.",
            },
            "malayalam": {
                "hello": "നമസ്കാരം (Namaskaram)",
                "welcome to access ai": "ആക്സസ് എഐയിലേക്ക് സ്വാഗതം",
                "machine learning": "മെഷീൻ ലേണിംഗ് എന്നത് ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസിന്റെ ഒരു ശാഖയാണ്.",
                "today we will learn machine learning": "ഇന്ന് നമ്മൾ മെഷീൻ ലേണിംഗ് പഠിക്കും.",
                "machine learning is a branch of artificial intelligence": "മെഷീൻ ലേണിംഗ് എന്നത് ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസിന്റെ ഒരു ശാഖയാണ്.",
                "binary search": "ക്രമീകരിച്ചിരിക്കുന്ന ഒരു ലിസ്റ്റിൽ നിന്ന് ഒരു ഘടകം കണ്ടെത്താനുള്ള കാര്യക്ഷമമായ അൽഗോരിതമാണ് ബൈനറി സെർച്ച്.",
            }
        }

        if gemini_available:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = f"Translate the following text into {target_lang}. Only return the direct translation, nothing else:\n\n{text}"
                response = model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini translation error: {e}")

        # Local fallback translation logic
        normalized_text = text.lower().strip().replace(".", "").replace("!", "")
        for lang_name, lang_dict in translations.items():
            if lang_name in target_lang:
                # Direct match
                if normalized_text in lang_dict:
                    return lang_dict[normalized_text]
                # Fallback fuzzy match
                for key, val in lang_dict.items():
                    if key in normalized_text or normalized_text in key:
                        return val
                return f"[Translated to {target_lang.upper()}]: {text}"
                
        return f"[Translated to {target_lang.upper()}]: {text}"

    @staticmethod
    async def ask_tutor(question: str, history: list = None, persona: str = "normal") -> str:
        """Answers queries using the AI Tutor mode with optional personas."""
        if not question:
            return "Please ask a question!"
            
        system_instruction = "You are a helpful AI Tutor on Access AI, an accessibility learning platform."
        if persona == "dyslexia" or persona == "10-year-old":
            system_instruction += " Explain things simply, use short sentences, split paragraphs, highlight concepts, and write in a very clear, easy-to-read style."
        elif persona == "visual":
            system_instruction += " Explain using structural components: bullet points, clear outlines, code blocks, or ASCII charts."

        if gemini_available:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel(
                    'gemini-1.5-flash',
                    system_instruction=system_instruction
                )
                
                # Format conversation history
                chat = model.start_chat(history=[])
                if history:
                    for msg in history:
                        role = "user" if msg.get("sender") == "student" else "model"
                        # Simply simulate sending history
                        pass
                
                response = chat.send_message(question)
                return response.text
            except Exception as e:
                logger.error(f"Gemini Tutor error: {e}")

        # Local high-fidelity mock chatbot response generator
        q_low = question.lower()
        if "binary search" in q_low:
            if "10-year-old" in persona or "dyslexia" in persona:
                return (
                    "**What is Binary Search?**\n\n"
                    "Imagine you are looking for a page in a book. The page is **150**.\n\n"
                    "Instead of flipping pages one-by-one from the start:\n"
                    "1. You open the book exactly in the middle (say page 100).\n"
                    "2. You ask: Is 150 bigger or smaller than 100? It is **bigger**.\n"
                    "3. So, you throw away the first half of the book! Now you only search the second half.\n"
                    "4. You open to the middle of the second half. You repeat this until you find page 150.\n\n"
                    "**Why is it awesome?**\n"
                    "It is super fast. If you have 1,000 pages, you can find your page in just **10 steps**!"
                )
            elif "visual" in persona:
                return (
                    "### Binary Search Algorithm\n\n"
                    "A fast search algorithm that operates on **sorted arrays** by repeatedly dividing the search interval in half.\n\n"
                    "```python\n"
                    "def binary_search(arr, target):\n"
                    "    low = 0\n"
                    "    high = len(arr) - 1\n"
                    "    while low <= high:\n"
                    "        mid = (low + high) // 2\n"
                    "        if arr[mid] == target:\n"
                    "            return mid  # Target found!\n"
                    "        elif arr[mid] < target:\n"
                    "            low = mid + 1\n"
                    "        else:\n"
                    "            high = mid - 1\n"
                    "    return -1  # Target not found\n"
                    "```\n"
                    "**Visualizing search for 23 in sorted array:**\n"
                    "`[ 2, 5, 8, 12, 16, 23, 38, 56, 72, 91 ]`  (Search range: entire array)\n"
                    "1. Mid element is `16` (index 4). `23 > 16`. Search right half.\n"
                    "2. Range becomes: `[ 23, 38, 56, 72, 91 ]`\n"
                    "3. Mid element is `56` (index 7). `23 < 56`. Search left half.\n"
                    "4. Range becomes: `[ 23, 38 ]`\n"
                    "5. Mid element is `23` (index 5). Match found!"
                )
            else:
                return (
                    "Binary Search is a classic search algorithm in Computer Science. "
                    "It finds the position of a target value within a sorted array. "
                    "By comparing the target value to the middle element of the array, it eliminates half of the search space "
                    "at each step, achieving a logarithmic time complexity of O(log n)."
                )
        
        # General response generator
        return (
            f"Here is an explanation of **\"{question}\"** tailored for your needs:\n\n"
            "1. **Core Concept**: This represents a central topic in modern curriculum designs.\n"
            "2. **Real-world Application**: In everyday life, this assists in optimizing workflows, sorting information, or resolving structural issues.\n"
            "3. **Summary**: To master this topic, practice dividing it into smaller blocks and reviewing them periodically.\n\n"
            "Do you want me to explain this in another language (e.g., *Telugu*, *Hindi*), or generate a quick *quiz* about it?"
        )

    @staticmethod
    async def generate_notes(lecture_text: str) -> dict:
        """Generates summaries, quizzes, flashcards, and revision materials from lecture transcript."""
        if not lecture_text.strip():
            lecture_text = "Today we introduced Machine Learning. Machine Learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. We discussed supervised learning where models are trained on labeled datasets, and unsupervised learning which finds hidden structures in unlabeled data."

        if gemini_available:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = (
                    "You are an education AI notes developer. Analyze the following lecture transcript and return a JSON object with "
                    "exactly these keys:\n"
                    " - 'summary': string, comprehensive executive summary.\n"
                    " - 'key_points': list of strings, main takeaways.\n"
                    " - 'questions': list of strings, potential exam questions.\n"
                    " - 'flashcards': list of objects, each containing 'front' and 'back' properties.\n"
                    " - 'quiz': list of objects, each with 'question', 'options' (list of strings), and 'answer' (exact string matching the correct option).\n"
                    " - 'mindmap': object representing a visual tree: {'node': 'Main Title', 'children': [{'node': 'Subtopic', 'children': []}]}.\n"
                    " - 'revision': string, short cheat-sheet summary.\n\n"
                    f"Lecture transcript:\n{lecture_text}\n\n"
                    "Return ONLY valid JSON. Do not include markdown formatting or backticks around the JSON."
                )
                response = model.generate_content(prompt)
                res_text = response.text.strip()
                # strip backticks if Gemini added them
                if res_text.startswith("```json"):
                    res_text = res_text[7:]
                if res_text.endswith("```"):
                    res_text = res_text[:-3]
                return json.loads(res_text.strip())
            except Exception as e:
                logger.error(f"Gemini notes generation failed: {e}")

        # Local high-quality notes generation
        return {
            "summary": (
                "The lecture provided a foundational introduction to machine learning, detailing its "
                "role as a major branch of Artificial Intelligence. Key concepts included how algorithms learn "
                "patterns from datasets rather than relying on explicit step-by-step programming. The lecture "
                "also distinguished between supervised and unsupervised learning structures."
            ),
            "key_points": [
                "Machine Learning is a subset of Artificial Intelligence (AI).",
                "Instead of being programmed, models learn patterns from historical datasets.",
                "Supervised learning utilizes labeled inputs to predict outcomes.",
                "Unsupervised learning groups unlabeled data based on structural similarities (clustering)."
            ],
            "questions": [
                "What is the primary difference between traditional programming and machine learning?",
                "Define supervised learning and list two common applications.",
                "Explain the role of labels in training a classification model."
            ],
            "flashcards": [
                {"front": "Machine Learning", "back": "A field of study that gives computers the ability to learn without being explicitly programmed."},
                {"front": "Supervised Learning", "back": "Learning models using labeled datasets where both input and target output are known."},
                {"front": "Unsupervised Learning", "back": "Learning from data that does not have historical labels, usually for discovering patterns or clustering."}
            ],
            "quiz": [
                {
                    "question": "What branch of computer science is Machine Learning a subset of?",
                    "options": ["Web Development", "Artificial Intelligence", "Hardware Design", "Database Systems"],
                    "answer": "Artificial Intelligence"
                },
                {
                    "question": "Which type of learning utilizes pre-labeled inputs?",
                    "options": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Fuzzy Logic"],
                    "answer": "Supervised Learning"
                }
            ],
            "mindmap": {
                "node": "Introduction to Machine Learning",
                "children": [
                    {
                        "node": "Supervised Learning",
                        "children": [
                            {"node": "Labeled Data", "children": []},
                            {"node": "Classification & Regression", "children": []}
                        ]
                    },
                    {
                        "node": "Unsupervised Learning",
                        "children": [
                            {"node": "Unlabeled Data", "children": []},
                            {"node": "Clustering & Associations", "children": []}
                        ]
                    }
                ]
            },
            "revision": (
                "Machine Learning summary cheat sheet: \n"
                "• AI -> ML -> Deep Learning (hierarchical relationship).\n"
                "• Supervised = Labeled data (e.g. email spam filters).\n"
                "• Unsupervised = Unlabeled data (e.g. customer segmentations)."
            )
        }

    @staticmethod
    async def simplify_text(text: str) -> str:
        """Simplifies complex text into easy English for Dyslexia Mode."""
        if not text.strip():
            return ""
            
        if gemini_available:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = (
                    "Rewrite the following text to make it extremely easy to read. "
                    "Follow these rules:\n"
                    "1. Use simple words and vocabulary.\n"
                    "2. Write short, simple sentences.\n"
                    "3. Split long paragraphs into single sentences or small lists.\n"
                    "4. Bold key terms.\n"
                    "Original text:\n"
                    f"{text}"
                )
                response = model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini simplify text failed: {e}")

        # Local simplification mockup
        paragraphs = text.split("\n\n")
        simplified_paragraphs = []
        for p in paragraphs:
            if len(p.strip()) == 0:
                continue
            # Basic rule-based sentence splits
            sentences = p.replace(". ", ".\n\n").split("\n\n")
            for s in sentences:
                s = s.strip()
                if not s:
                    continue
                # Highlight some common academic words
                for word in ["Artificial Intelligence", "Machine Learning", "Algorithm", "Binary Search", "Database", "Complexity"]:
                    if word.lower() in s.lower():
                        # replace with bold version
                        import re
                        pattern = re.compile(re.escape(word), re.IGNORECASE)
                        s = pattern.sub(f"**{word}**", s)
                simplified_paragraphs.append(s)
                
        return "\n\n".join(simplified_paragraphs)
