from schemas import (
    SentimentAnalysisResult,
)
from utils.logger_config import get_logger
import os
from openai import OpenAI
from pydantic import ValidationError
from dotenv import load_dotenv

logger = get_logger(__name__)

load_dotenv() # load environment variables
def detect_audio_sentiment(transcript_id: str) -> SentimentAnalysisResult:
    """
    Generate audio sentiment analysis using local LLM. This should be a job performed by a Redis RQ Worker

    Args:
        request (SentimentAnalysisRequest): Request model containing transcript id to perform sentiment analysis on.
    Returns:
        result (SentimentAnalysisResult): Sentiment analysis results according to SentimentAnalysisResult schema
    """

    logger.info(f"Starting sentiment analysis on transcript={transcript_id}...")

    # extract relevant environment variables
    base_url = os.getenv("LM_BASE_URL")
    api_key = os.getenv("LM_API_KEY")
    model_name = os.getenv("MODEL")
    # initialize OpenAI client
    client = OpenAI(base_url=base_url, api_key=api_key)

    # initialize messages for LLM 
    # system messages provide additional context to the LLM
    # user messages are the messages the LLM actually responds to
    model_messages = [
                {
                    "role": "system",
                    "content": 
                    """
                    You are an expert technical recruiter and behavioral analyst specializing in interviews. Your task is to analyze the following interview transcript and evaluate the candidate's sentiment, emotional intelligence, and communication skills.

                    Please analyze any given transcripts line-by-line and provide your response strictly in the following JSON format. Do not include any additional text outside of the JSON object. Note: "sentiment_analysis" is an array of your sentiment analysis on each line the user spoke.

                    {
                        "sentiment_analysis": [
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
    try:
        response = client.chat.completions.create(
            model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
            messages = model_messages,
        )

    except Exception as e:
        logger.error(f"Error communicating with LLM: {e}")
        logger.error(f"Sentiment analysis for transcript={transcript_id} failed.")
        # return SentimentAnalysisResult(error=f"Error communicating with LLM: {e}")
        raise e # to make sure the RQ job returns a failed status, we must raise an exception
    
    # parse and return LLM response
    try:
        logger.info(f"Verifying LLM sentiment analysis on transcript={transcript_id}...")

        llm_response = response.choices[0].message.content # extract LLM's JSON response string
        
        # verify LLM JSON response is the correct shape 
        validated_data = SentimentAnalysisResult.model_validate_json(llm_response) # parses JSON, checks if it fits our response schema and instantiates our schema if successful 
        logger.info(f"Sentiment Analysis on transcript={transcript_id} successful!")
        return validated_data
    except ValidationError as e:
        logger.error(f"LLM sentiment analysis on transcript={transcript_id} is in invalid shape. Reason: {e}")
        # return SentimentAnalysisResult(error=f"LLM sentiment analysis on transcript={transcript_id} is in invalid shape. Reason: {e}")
        raise e # to make sure the RQ job returns a failed status, we must raise an exception
