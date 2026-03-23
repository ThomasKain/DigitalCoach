# Handles orchestration of tasks for interview videos, e.g. starting analysis jobs. 
# Can be called by route handlers.

from tasks.audio_analysis import detect_audio_sentiment
from redisStore.queue import add_task_to_queue
from tasks.create_answer_task import create_answer
from tasks.starscores import predict_star_scores
from utils.logger_config import get_logger
from schemas import (
    SentimentAnalysisRequest,
    AnalyzeInterviewRequest
)

logger = get_logger(__name__)

def start_audio_analysis(req: SentimentAnalysisRequest) -> str:
    """
    Start the audio analysis job by adding it to the queue.
    
    Args:
        req (SentimentAnalysisRequest): the request body of the audio analysis job which is currently just sentiment analysis.
    Returns:
        job_id (str): The Redis Job id of the queued audio analysis job.
    """
    logger.info(f"Started audio analysis job for interview={req.interview_id}.")
    
    # Enqueue sentiment analysis job
    # only pass the fields instead of the pydantic model
    job = add_task_to_queue("high", detect_audio_sentiment, req.user_id, req.interview_id)

    logger.info(f"Sentiment analysis for interview={req.interview_id} job ID={job.id} enqueued!")

    return job.id # returns job id for polling later

def start_star_feedback_analysis(text: str) -> str:
    """
    Start the STAR feedback analysis job by adding it to the queue.
    
    Args:
        text (str): The text to analyze using the STAR method.
    Returns:
        str: The job ID of the queue STAR feedback analysis job.
    """
    data = {"text": text} # predict_star_scores expects a dict with "text" key
    # Enqueue STAR feedback analysis job
    job = add_task_to_queue("high", predict_star_scores, data)

    return job.id

def start_interview_analysis(req: AnalyzeInterviewRequest) -> str:
    """
    Start the interview analysis job by adding it to the task queue.
    
    Currently, this function only starts the audio sentiment job but can be extended to also start facial analysis.

    Args:
        req (AnalyzeInterviewRequest): Request body that contains the fields needed to perform the various interview analysis tasks.
    Returns:
        answer_job_id (str): The job ID of the queued interview analysis job.
    """
    # Enqueue audio analysis job on the given video url
    sentiment_analysis_request = SentimentAnalysisRequest(user_id=req.user_id, interview_id=req.interview_id)

    audio_job = start_audio_analysis(sentiment_analysis_request)

    # Invoke other tasks here...

    return audio_job 

    # Enqueue the create_answer job that's dependent on the analysis job(s) 
    # answer_job = add_task_to_queue(
    #     "high", # priority of task (i.e. RQ queue name)
    #     create_answer, # function to execute
    #     video_url, # video of interview
    #     audio_job.id, # audio job id
    #     depends_on=[audio_job] # job doesn't start until audio_job is complete
    # )
    
    # return answer_job.id