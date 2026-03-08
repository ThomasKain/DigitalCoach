from fastapi import APIRouter, HTTPException
from utils.logger_config import get_logger
from schemas import CreateInterviewResponse, CreateInterviewRequest
from services.firebase_setup import get_firestore_client

logger = get_logger(__name__) # create a logger instance to log messages

router = APIRouter(prefix="/api/interview", tags=["interview"])

# POST /api/interview
@router.post(
    "/",
    response_model=CreateInterviewResponse,
    summary="Create partially populated interview given after user finishes their interview.",
    description="Creates interview document populated with initial data from user's interview before it gets analyzed.",
)
async def create_interview(request: CreateInterviewRequest):
    db = get_firestore_client()
    logger.info(f"Attempting to create new interview document for user={request.userId}...")
    print(request.interview)
    try:

        interview = request.interview.model_dump() # convert interview pydantic object into a dictionary 

        # get reference to user's interview collection
        interviewRef = db.collection("users").document(request.userId).collection("interviews")
        
        # add interview document to user's interview using the given interview id
        interviewRef.document(interview.interviewId).set(interview)

        logger.info("Inserted new interview!")
        return CreateInterviewResponse(success=True)
    except Exception as e:
        logger.info(f"Failed to create interview: {e}")
        return CreateInterviewResponse(success=False)
    
