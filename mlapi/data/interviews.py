"""
Data functions related to interviews.
"""

from services.firebase_setup import get_firestore_client
from utils.logger_config import get_logger
logger = get_logger(__name__)
async def getTranscriptById(user_id: str, interview_id: str) -> str:
    """
    Returns the transcript with the given interview id from the given user.

    Args:
        user_id (str): Id of the user that owns the interview transcript
        interview_id (str): Id of the interview we're extracting the transcript from
    """

    try:
        db = get_firestore_client()
        # get user's document reference
        userRef = db.collection("users").document(f"{user_id}")
        # get interview document reference
        transcriptRef = userRef.collection("interviews").document(interview_id)

        # get interview document
        interviewDoc = await transcriptRef.get()
        if (interviewDoc.exists):
            transcript = interviewDoc.to_dict()["transcript"]
            logger.info(f"Interview transcript with id={interview_id} found!")
            return transcript
        else:
            logger.error(f"Can't find transcript for interview={interview_id}")
            raise AttributeError(f"Can't find transcript for interview={interview_id}")
    except Exception as e:
        raise AttributeError(f"Error getting transcript for interview={interview_id}. Reason: {e}")




