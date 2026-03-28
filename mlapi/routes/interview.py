from fastapi import APIRouter
from utils.logger_config import get_logger
from schemas import (
    CreateInterviewResponse, 
    CreateInterviewRequest,
    AnalyzeInterviewRequest,
    GetInterviewRequest, 
    GetInterviewResponse
) 
from services.firebase_setup import get_firestore_client

logger = get_logger(__name__) # create a logger instance to log messages

router = APIRouter(prefix="/api/interview", tags=["interview"])
from services.orchestrator import start_interview_analysis 
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
    try:
        # convert interview pydantic object into a dictionary 
        interview = request.interview.model_dump()

        # get reference to user's interview collection
        interviewRef = db.collection("users").document(request.userId).collection("interviews")
        
        # add interview document to user's interview using the given interview id
        await interviewRef.document(interview["id"]).set(interview)

        logger.info("Inserted new interview!")

        logger.info(f"Starting analysis on interview={interview["id"]}")
        # Start analysis jobs on interview
        analysisRequest = AnalyzeInterviewRequest(user_id=request.userId, interview_id=interview["id"])
        job_id = start_interview_analysis(analysisRequest)

        return CreateInterviewResponse(job_id=job_id, success=True)
    except Exception as e:
        logger.info(f"Failed to create interview: {e}")
        return CreateInterviewResponse(success=False)

# GET /api/interview
@router.get(
    "/",
    response_model=GetInterviewResponse,
    summary="Get interview document given user and interview id.",
    description="Retrieves an interview document with a given id from a user with a given id.",
)
async def get_interview(request: GetInterviewRequest):
    db = get_firestore_client()
    logger.info(f"Attempting to retrieve interview document with id {request.interviewId} from user={request.userId}...")
    try:
        interview = await (db.collection("users").document(request.userId)
                     .collection("interviews").document(request.interviewId).get())
        logger.info("Retrieved interview!")
        return GetInterviewResponse(interview=interview)
    except Exception as e:
        logger.info(f"Failed to retrieve interview: {e}")
        return GetInterviewResponse(interview=None)
