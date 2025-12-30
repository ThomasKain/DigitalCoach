# Handles orchestration of tasks for interview videos, e.g. starting analysis jobs. 
# Can be called by route handlers.

from tasks.assemblyai_api import detect_audio_sentiment
from redisStore.queue import add_task_to_queue
from tasks.create_answer_task import create_answer
from tasks.starscores import predict_star_scores
from utils.logger_config import get_logger

logger = get_logger(__name__)

def start_audio_analysis(video_url: str) -> str:
    """
    Start the audio analysis job by adding it to the queue.
    
    Args:
        video_url (str): The URL of the video to analyze.
    Returns:
        job (Job): The Redis Job object of the queued audio analysis job.
    """
    logger.info(f"Started audio analysis job for video URL {video_url}.")
    
    # Enqueue audio analysis job
    job = add_task_to_queue(detect_audio_sentiment, video_url)

    logger.info(f"Audio analysis job ID: {job.id}")

    return job

def start_interview_analysis(video_url: str) -> str:
    """
    Start the interview analysis job by adding it to the task queue.
    
    Currently, this function only starts the audio sentiment job but can be extended to also start facial analysis.

    Args:
        video_url (str): The URL of the video to analyze.
    Returns:
        answer_job_id (str): The job ID of the queued interview analysis job.
    """
    # Enqueue audio analysis job on the given video url
    audio_job = start_audio_analysis(video_url)

    # Enqueue the create_answer job that's dependent on the analysis job(s) 
    answer_job = add_task_to_queue(
        create_answer, # function to execute
        video_url, # video of interview
        audio_job.id, # audio job id
        depends_on=[audio_job] # job doesn't start until audio_job is complete
    )

    return answer_job.id



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
    job = add_task_to_queue(predict_star_scores, data)

    return job.id
