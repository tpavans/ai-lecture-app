import asyncio
import httpx

async def test_endpoints():
    print("Testing Access AI Backend API Endpoints...")
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # 1. Test Root Endpoint
        try:
            r = await client.get("/")
            print(f"[-] ROOT: {r.status_code} - {r.json()}")
        except Exception as e:
            print(f"[!] ROOT FAIL: {e}")
            
        # 2. Test AI Tutor ask endpoint
        try:
            payload = {
                "question": "Explain Binary Search",
                "persona": "10-year-old",
                "language": "English"
            }
            r = await client.post("/api/v1/tutor/ask", json=payload)
            print(f"[-] TUTOR (English, 10yo): {r.status_code}")
            print(f"    Answer: {r.json()['answer'][:150]}...")
        except Exception as e:
            print(f"[!] TUTOR FAIL: {e}")

        # 3. Test AI Tutor Telugu translation
        try:
            payload = {
                "question": "Today we will learn Machine Learning",
                "persona": "normal",
                "language": "Telugu"
            }
            r = await client.post("/api/v1/tutor/ask", json=payload)
            print(f"[-] TUTOR (Telugu): {r.status_code}")
            print(f"    Telugu Answer: {r.json()['translated_answer']}")
        except Exception as e:
            print(f"[!] TUTOR TRANSLATION FAIL: {e}")

        # 4. Test Lecture Save and Retrieve
        try:
            payload = {
                "title": "Machine Learning Intro",
                "language": "English",
                "segments": [
                    {"timestamp": "2026-06-20T12:00:00Z", "text": "Hello students. Today we will learn Machine Learning."},
                    {"timestamp": "2026-06-20T12:00:05Z", "text": "Machine Learning is a branch of Artificial Intelligence."}
                ]
            }
            r = await client.post("/api/v1/lectures/save", json=payload)
            print(f"[-] SAVE LECTURE: {r.status_code}")
            lecture_id = r.json()["id"]
            
            # Fetch all lectures
            r = await client.get("/api/v1/lectures")
            print(f"[-] GET LECTURES: {r.status_code} - count: {len(r.json())}")
            
            # Clean up
            r = await client.delete(f"/api/v1/lectures/{lecture_id}")
            print(f"[-] DELETE LECTURE: {r.status_code}")
        except Exception as e:
            print(f"[!] LECTURE CRUD FAIL: {e}")

if __name__ == "__main__":
    # Note: Ensure uvicorn backend server is running on localhost:8000 before executing this script
    asyncio.run(test_endpoints())
