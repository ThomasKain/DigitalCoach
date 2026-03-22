# Audio analysis schemas for sentiment analysis
from enum import Enum
from pydantic import BaseModel
from typing import List, Optional
from schemas.jobs import JobStatus

class AAI_Token(BaseModel):
    """
    Response model for returning a temporary authentication token for the client to interact with AssemblyAI API.
    """
    token: str

class Sentiments(str, Enum):
    """
    Audio sentiments detected by AssemblyAI
    """

    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"

class SentimentResult(BaseModel):
    """
    Individual sentiment analysis result for a text segment
    """

    text: str # text segment/sentence
    sentiment: Sentiments  # "POSITIVE", "NEUTRAL", or "NEGATIVE"
    confidence: float  # AI model's confidence score [0,1]
    # start: int  # Start time in milliseconds
    # end: int  # End time in milliseconds

class SentimentAnalysisResult(BaseModel):
    """
    Result of audio sentiment analysis by AssemblyAI
    """
    sentiment_analysis: List[SentimentResult] = []
    
    # transcript: str # interview transcript
    # sentiment_analysis: List[SentimentResult] = Field(default_factory=list)
    # highlights: List[HighlightData] = Field(default_factory=list)
    # iab_results: IABResult = Field(default_factory=IABResult)
    # duration: float = 0.0 # duration of audio clip in seconds
    # error: str | None = None
    
class SentimentAnalysisJobResponse(BaseModel):
    """
    Response model for audio analysis job
    """

    status: JobStatus
    result: SentimentAnalysisResult | None = None
    error: str | None = None

class SentimentAnalysisRequest(BaseModel):
    """
    Request to start an audio analysis job
    
    Args:
        user_id: The id of the user whose interview we're analyzing
        interview_id: The id of the interview who owns the transcript to analyze
    Returns:
        AudioAnalysisRequest: The request object
    Raises:
        ValidationError: If the video_url is empty or not a valid URL
    """
    user_id: str
    interview_id: str

# class TimestampData(BaseModel):
#     """Timestamp info for keyword occurrences"""

#     start: int  # Start time in milliseconds
#     end: int  # End time in milliseconds


# class HighlightData(BaseModel):
#     """Data for auto-highlighted keywords/phrases"""

#     text: str  # The highlighted word or phrase
#     rank: float  # Importance ranking (0-1), words relevant to the content.
#     count: int  # Number of occurrences
#     timestamps: List[TimestampData] = Field(default_factory=list)

# class IABLabel(BaseModel):
#     """IAB category label with relevance score from AssemblyAI"""

#     label: str  # Category name
#     relevance: float  # Relevance score (0-1)


# class IABResult(BaseModel):
#     """IAB category detection results from AssemblyAI"""

#     text: str = ""  # Input text that was analyzed
#     labels: List[IABLabel] = Field(default_factory=list)  # Detected category labels


# class ExtractedAudio(BaseModel):
#     """
#     Result of audio extraction by MoviePy
#     """

#     path_to_file: str
#     clip_length_seconds: float

