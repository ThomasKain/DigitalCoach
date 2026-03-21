from tasks.helpers.constants import (
    OVERALL_AUDIO_POINTS,
    AUDIO_EMOTION_POINTS,
)
from schemas.create_answer import CreateAnswerEvaluation
from schemas.audio import SentimentAnalysisResult

from tasks.helpers.analyze_text_structure_ml import analyze_text_structure_ml
from tasks.helpers.text_preprocessing import clean_text
from tasks.helpers.av_processing import (
    calculate_overall_audio_sentiment,
    # grab_top_five_keywords,
)

from utils.logger_config import get_logger

logger = get_logger(__name__)

def compute_overall_score(result: CreateAnswerEvaluation) -> float:
    """
    Compute user's overall performance score using various metrics, e.g. WPM, STAR structure, filler words, included in CreateAnswerEvaluation schema.

    Args:
        metrics (CreateAnswerEvaluation): The metrics used to compute the overall performance score.

    Returns:
        float: The aggregate score
    """

    text_structure_score = result.predictionScore
    overall_audio = OVERALL_AUDIO_POINTS.get(result.overallSentiment, 0)

    
    logger.info(f"COMPUTING AGGREGATE SCORE: overall audio score: {overall_audio}")
    
    aggregate = (overall_audio)

    return round(aggregate, 2)
