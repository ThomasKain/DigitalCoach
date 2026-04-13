from services.firebase_init import get_firestore_client
from fastapi import APIRouter
from utils.logger_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/server/firestore", tags=["test"])

# GET /server/firestore
@router.get(
    "/",
    description="Tests read and write operations with Firestore by adding a test user and reading back their mock data."
)
async def test_firstore():
    db = get_firestore_client()
    logger.info("Attempting to write to Firestore.")
    # Write new document
    test_data = {
        "name": "Maeve Reaper",
        "age": 27,
        "email": "maeavereaper@gmail.com",
        "interviews": [
            {
            "date": "02/08/26",
            "duration": "05:30",
            "feedback": {
                "ai_feedback": "Your enthusiasm was evident, and you established a great rapport early on. You used the STAR method effectively for behavioral questions, but your technical answers were slightly vague. Next time, focus more on specific metrics to quantify your past achievements, and try to pause briefly before answering complex questions to gather your thoughts.",
                "overall_competency": {
                    "clarity": {
                        "score": 8,
                        "summary": "Excellent pacing at 150 WPM; your delivery was very clear and easy to follow."
                    },
                    "confidence": {
                        "score": 10,
                        "summary": "You had approximately 10 filler words or hedge phrases per minute, but you projected strong confidence throughout your interview!"
                    },
                    "engagement": {
                        "score": 9,
                        "summary": "Great job varying your tone with 98% of your responses being expressive! You used 10 high-value keywords effectively in your responses."
                    },
                }
            }, # end of feedback
            "metrics": {
                "filler_count": 10,
                "overall_score": 100,
                "wpm": 150
            }, # end of metrics
            "title": "Interview_1",
            "transcript": [
                {
                    "speaker": "Recruiter",
                    "response": "Hello are you ready to start your interview?"
                },
                {
                    "speaker": "Maeve Reaper",
                    "response": "Yes, I'm ready."
                },
            ], # end of transcript
            "url": "http://interviewVideo.com",
            }
        ], # end of interviews
    }

    docRef = db.collection("server_test_collection").document("server_test_user")
    docRef.set(test_data)    
    logger.info("Write operation successful!")
    logger.info("Attempting to read new document")
    
    # Read new document
    doc = docRef.get()
    if doc.exists:
        logger.info(f"Document found, data: {doc.to_dict()}")
    else:
        logger.warning("Document not found.")
    return doc.to_dict()
