"""
Data functions related to interviews.
"""

from services.firebase_setup import get_firestore_client
from utils.logger_config import get_logger
from schemas.interview import (
    Interview,
    Feedback,
    Metrics,
    OverallCompetency,
    CompetencyMetric,
)
from google.api_core import exceptions
from pydantic import ValidationError
from google.cloud import firestore

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



async def getUserInterviews(user_id: str) -> list[Interview]:
    """
    Returns a list of all the user's interviews that are analyzed.
    """
    db = get_firestore_client() # get firestore instance

    # get user's document 
    userRef = db.collection("users").document(user_id)
    userDoc = await userRef.get()

    # check if user document exists
    if userDoc.exists:
        logger.info(f"User document found!")
 
        interviewCol = userRef.collection("interviews").order_by("timestamp", direction=firestore.Query.DESCENDING).stream() # get all interviews from collection in descending order based on their creation timestamp 
        interviews = [] 
        try:
            # iterate through each interview document
            async for interviewDoc in interviewCol:
                interview_data = interviewDoc.to_dict() # convert document into dictionary
                # an interview is finished with analysis when it has an overall score
                if ("metrics" in interview_data  
                    and "overall_score" in interview_data["metrics"]):
                    interviews.append(Interview.model_validate(interview_data)) # verify dictionary matches interview schema's shape and then add it to the list as an interview instance if valid
                

            return interviews # return list of all interviews
        except ValidationError as e:
            logger.error(f"An interview doesn't follow the Pydantic schema: {e}")
            return []

    else:
        logger.error(f"User with user_id={user_id} not found.")
        return []


