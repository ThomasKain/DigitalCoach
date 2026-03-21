"""
Routes for AssemblyAI related services like starting transcriptions.
"""
from fastapi import APIRouter, HTTPException
from assemblyai.streaming.v3 import (
    StreamingClient,
    StreamingClientOptions
)
from utils.logger_config import get_logger
from dotenv import load_dotenv
import os
from openai import OpenAI
import json
import requests
# imports for get_sentiment_analysis
from pydantic import BaseModel
from schemas import SentimentResult
from typing import List, Optional

class SentimentAnalysisByTranscriptResponse(BaseModel):
    transcript_id: str
    status: str
    sentiment_analysis_results: List[SentimentResult]
    error: Optional[str] = None


logger = get_logger(__name__) # create logger instance to log messages

router = APIRouter(prefix="/api/assemblyai", tags=["transcription"])

# GET /api/assemblyai/token
@router.get(
    "/token",
    summary="Sends a temporary authentication token from AssemblyAI for the client to make requests to the API.",
    description="Returns an authentication token for client to interact with AssemblyAI API"
)
async def request_token():
    """
    Creates a temporary authentication token for the client to be able to send requests to AssemblyAI API for services like speech-to-text.

    Returns: 
        token: Temporary authentication token
    """
    logger.info("Requesting temporary AssemblyAI authentication token...")

    load_dotenv()
    api_key = os.getenv("AAPI_KEY")
    if not api_key:
        raise KeyError("AAPI_KEY key not found in .env file.")
    
    client = StreamingClient(
        StreamingClientOptions(
            api_key=api_key,
            api_host="streaming.assemblyai.com",
        )
    )

    token = client.create_temporary_token(expires_in_seconds=60) # authentication token expires after 1 minute
    logger.info("Request successful!")

    return {"token": token} 


# GET /api/assemblyai/model
@router.get(
    "/model",
    summary="Endpoint that tests communicating with our local LLM on Docker Model Runner.",
    description="Temporary endpoint to communicate with Docker model runner."
)
async def llm_test(): 

    load_dotenv() # load environment variables
    # extract relevant environment variables
    base_url = os.getenv("LM_BASE_URL")
    api_key = os.getenv("LM_API_KEY")
    model_name = os.getenv("MODEL")


    # initialize OpenAI client
    client = OpenAI(base_url=base_url, api_key=api_key)
    
    try:
        # by default, Docker model runner makes your LLM accessible on port 12434
        response = client.chat.completions.create(
            model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
            # system messages provide additional context to the LLM
            # user messages are the messages the LLM actually responds to
            messages = [
                {
                    "role": "system",
                    "content": 
                    """
                    You are an expert technical recruiter and behavioral analyst specializing in interviews. Your task is to analyze the following interview transcript and evaluate the candidate's sentiment, emotional intelligence, and communication skills.

                    Please analyze any given transcripts line-by-line and provide your response strictly in the following JSON format. Do not include any additional text outside of the JSON object. Note: "sentiment_analys_results" is an array of your sentiment analysis on each line the user spoke.

                    {
                        "sentiment_analysis_results": [
                            {
                            "text": "[The sentence that your performing sentiment analysis on]",
                            "sentiment": "[Sentiment for the sentence which must be 'POSITIVE', 'NEGATIVE', or 'NEUTRAL']",
                            "confidence": [Your level of confidence between [0, 1]],
                            },
                        ],
                    }

                    """
                },
                {
                    "role": "user",
                    "content":
                    """
                    Interviewer: Hi Alex, thanks for taking the time to speak with me today. To kick things off, could you tell me about a recent software project you worked on and a specific technical challenge you had to overcome?

                    Candidate: Hi, yes, absolutely. Um, to be honest, I'm a little bit nervous, but I'm really excited to be here. So, recently, I worked on a full-stack web application. The biggest hurdle was definitely optimizing the database queries. Initially, the main user dashboard was loading incredibly slowly—it was taking almost five seconds to render. I felt pretty frustrated because I just couldn't figure out the bottleneck at first.

                    Interviewer: That does sound stressful. How did you end up resolving it?

                    Candidate: Well, I stepped back, dug into the documentation, and realized I was making a classic N+1 query error. Once I understood the root of the problem, I felt a lot more confident. I restructured the backend logic to use batch processing and implemented some basic indexing. Seeing the load time drop to under 200 milliseconds was incredibly rewarding. I'm actually really proud of how that turned out.
                    """
                }
            ]
        )
    except Exception as e:
        raise f"Error communicating with LLM: {e}"
    
    # return model's reply
    return {"data" : json.loads(response.choices[0].message.content)}

# POST /api/assemblyai/sentiment/{transcript_id}

@router.post(
    "/sentiment/{transcript_id}",
    response_model=SentimentAnalysisByTranscriptResponse,
    summary="Generate sentiment analysis from AssemblyAI for the given transcript",
    description=("Fetch sentiment analysis results from AssemblyAI using an existing transcript ID."),
)
async def get_sentiment_analysis(transcript_id: str):
    """
    Returns sentiment analysis results given a transcript id

    Args: 
        transcript_id: The transcript id of transcription to be analyzed

    Note:
        AssemblyAI only returns sentiment results if "sentiment_analysis=true" 
        is enabled.

    Returns:
        SentimentAnalysisByTranscriptResponse

    Raises:
        HTTPException: If the transcript id is not valid
    """
    transcript_id = transcript_id.strip()
    if not transcript_id:
        raise HTTPException(status_code=400, detail="transcript_id cannot be empty")

    logger.info(f"Requesting sentiment analysis from AssemblyAI for transcript_id: {transcript_id}")

    load_dotenv()
    api_key = os.getenv("AAPI_KEY")
    if not api_key:
        raise KeyError("AAPI_KEY key not found in .env file.")
    
    headers = {"authorization": api_key}
    transcript_endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"

    try:
        response = requests.get(transcript_endpoint, headers=headers, timeout=30)
    except requests.RequestException as e:
        logger.error(f"AssemblyAI request failed: {str(e)}")
        raise HTTPException(status_code=502, detail=str(e))
    
    # for other status codes 
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=str(response.status_code))
    if response.status_code >= 400:
        logger.error(f"AssemblyAI returned error ({response.status_code}): {response.text}")
        raise HTTPException(status_code=502, detail=str(response.status_code))

    data = response.json()
    status = data.get("status", "unknown")
    error = data.get("error")

    if status == "error":
        return SentimentAnalysisByTranscriptResponse(
            transcript_id=transcript_id,
            status=status,
            sentiment_analysis_results=[],
            error=error or "AssemblyAI transcript processing failed"
        )

    if status != "completed":
        return SentimentAnalysisByTranscriptResponse(
            transcript_id=transcript_id,
            status=status,
            sentiment_analysis_results=[],
            error=("Transcript is not completed yet. Retry after processing finishes.")
        )

    results = data.get("sentiment_analysis_results") or []
    if not results:
        raise HTTPException(status_code=409,detail=("No sentiment analysis results found for this transcript. Ensure 'sentiment_analysis=true' was enabled at time of transcription creation."))

    normalized_results = [
        SentimentResult(
            text=item.get("text", ""),
            sentiment=item.get("sentiment", "NEUTRAL"),
            confidence=float(item.get("confidence", 0.0)),
            start=int(item.get("start", 0)),
            end=int(item.get("end", 0)),
        )
        for item in results
    ]

    return SentimentAnalysisByTranscriptResponse(
        transcript_id=transcript_id,
        status=status,
        sentiment_analysis_results=normalized_results,
        error=None,
    )