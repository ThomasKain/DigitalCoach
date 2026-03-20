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
import requests
from openai import OpenAI
import json

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

                Please analyze any given transcripts and provide your response strictly in the following JSON format. Do not include any additional text outside of the JSON object.

                {
                "overall_sentiment": "[A brief 1-2 sentence summary of the candidate's overall emotional state and tone]",
                "emotional_arc": [
                    {
                    "phase": "Beginning",
                    "detected_emotions": ["[Emotion 1]", "[Emotion 2]"],
                    "analysis": "[Brief explanation of why these emotions were detected based on the text]"
                    },
                    {
                    "phase": "Middle",
                    "detected_emotions": ["[Emotion 1]", "[Emotion 2]"],
                    "analysis": "[Brief explanation of why these emotions were detected based on the text]"
                    },
                    {
                    "phase": "End",
                    "detected_emotions": ["[Emotion 1]", "[Emotion 2]"],
                    "analysis": "[Brief explanation of why these emotions were detected based on the text]"
                    }
                ],
                "confidence_score": "[A score from 1-10 rating how confident the candidate sounded]",
                "constructive_feedback": "[1-2 actionable tips for the candidate to improve their communication, tailored for a junior developer or recent graduate entering the tech industry]"
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

    
    # return model's reply
    return {"data" : json.loads(response.choices[0].message.content)}