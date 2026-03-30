from schemas import (
    SentimentAnalysisResult,
)
from utils.logger_config import get_logger
import os
from openai import OpenAI
from pydantic import ValidationError
from dotenv import load_dotenv
from data.interviews import getTranscriptById
from services.firebase_setup import get_firestore_client
from tasks.prompts import SENTIMENT_ANALYSIS_PROMPT
import json
logger = get_logger(__name__)

load_dotenv() # load environment variables
async def detect_audio_sentiment(user_id: str, interview_id: str) -> SentimentAnalysisResult:
    """
    Generate audio sentiment analysis using local LLM. This should be a job performed by a Redis RQ Worker.

    Args:
        user_id (str): User id that owns the interview to be analyzed.
        interview_id (str): Id of the interview undergoing sentiment analysis
    Returns:
        result (SentimentAnalysisResult): Sentiment analysis results according to SentimentAnalysisResult schema
    """

    logger.info(f"Starting sentiment analysis on interview={interview_id}...")

    # extract relevant environment variables
    base_url = os.getenv("LM_BASE_URL")
    api_key = os.getenv("LM_API_KEY")
    model_name = os.getenv("MODEL")
    # initialize OpenAI-compliant LLM client
    client = OpenAI(base_url=base_url, api_key=api_key)

    # get interview's transcript
    transcript = await getTranscriptById(user_id, interview_id)

    # initialize messages for LLM 
    # system messages provide additional context to the LLM
    # user messages are the messages the LLM actually responds to
    model_messages = [
                {
                    "role": "system",
                    "content": SENTIMENT_ANALYSIS_PROMPT
                },
                {
                    "role": "user",
                    "content": transcript # pass the transcript to the LLM for sentiment analysis
                }
            ]
    try:
        response = client.chat.completions.create(
            model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
            messages = model_messages,
        )

    except Exception as e:
        logger.error(f"Error communicating with LLM: {e}")
        logger.error(f"Sentiment analysis for interview={interview_id} failed.")
        # return SentimentAnalysisResult(error=f"Error communicating with LLM: {e}")
        raise BaseException(e) # to make sure the RQ job returns a failed status, we must raise an exception
    
    db = get_firestore_client()
    # parse and return LLM response
    try:
        logger.info(f"Verifying LLM sentiment analysis on interview={interview_id}...")

        llm_response = response.choices[0].message.content # extract LLM's JSON response string
        
        # verify LLM JSON response is the correct shape 
        validated_data = SentimentAnalysisResult.model_validate_json(llm_response) # parses JSON, checks if it fits our response schema and instantiates our schema if successful 
        logger.info(f"Sentiment Analysis on interview={interview_id} successful!")

        # add sentiment analysis to user's interview as a JSON string to be parsed later and converted into an overall sentiment
        # get reference to interview
        interviewRef = db.collection("users").document(user_id).collection("interviews").document(interview_id)
        await interviewRef.update({"sentiment": validated_data.model_dump_json()})

        return validated_data
    except ValidationError as e:
        logger.error(f"LLM sentiment analysis on interview={interview_id} is in invalid shape. Reason: {e}")
        # return SentimentAnalysisResult(error=f"LLM sentiment analysis on interview={interview_id} is in invalid shape. Reason: {e}")
        raise ValidationError(f"LLM sentiment analysis on interview={interview_id} is in invalid shape. Reason: {e}") # to make sure the RQ job returns a failed status, we must raise an exception
