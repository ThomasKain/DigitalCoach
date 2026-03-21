"""
Builds the final response schema.
"""
from typing import List
from pydantic import BaseModel, Field
from schemas.feedback import OverallCompetencyFeedback
# from schemas.audio import HighlightData
from schemas.jobs import JobStatus

class CreateAnswerEvaluation(BaseModel):
    """
    Result of creating an answer
    """

    predictionScore: float  # 0-100
    overallSentiment: str  # Overall audio sentiment from assemblyAI
    # topFiveKeywords: List[HighlightData] = Field(default_factory=list)
    transcript: str  # Full transcript of speech
    competencyFeedback: OverallCompetencyFeedback
    aggregateScore: float = 0.0  # Overall score (0-100)

class CreateAnswerJobResponse(BaseModel):
    """
    Response model for polling answer job status
    """
    job_id: str
    status: JobStatus
    result: CreateAnswerEvaluation | None = None
    error: str | None = None