"""
Module for competency-based interview feedback analysis. Specifically focuses on the user's confidence, clarity, and engagement during their responses.
"""

from schemas import (
    CompetencyFeedback,
    OverallCompetencyFeedback
)
from schemas.audio import AudioAnalysisResult
from utils.logger_config import get_logger
import re
from .constants import (
    FILLER_WORDS,
    HEDGE_PHRASES,
    FILLER_WEIGHT,
    HEDGE_WEIGHT,
    FILLER_HEDGE_BUFF,
    FILLER_HEDGE_SENS,
    MAX_CONFIDENCE_SCORE,
    MAX_CLARITY_SCORE,
    MIN_OPTIMAL_WPM,
    MAX_OPTIMAL_WPM,
    WPM_PENALTY,
)

logger = get_logger(__name__)

def _count_confidence_markers(transcript: str) -> dict :
    """
    Counts filler words and hedge phrases in the transcript.

    Args:
        transcript (str): The full transcript text.

    Returns:
        dict: A dictionary with counts of filler words and hedge phrases.
    """
    # Initialize counts for filler words and hedge phrases
    counts = {
        "filler_words": 0,
        "hedge_phrases": 0
    }

    # Normalize transcript to lowercase for matching
    transcript_lower = transcript.lower()
    
    # Construct regex patterns based on predefined sets of filler words and hedge phrases
    filler_pattern = r"\b({})\b".format("|".join(re.escape(word) for word in FILLER_WORDS))
    print(filler_pattern)
    hedge_pattern = r"\b({})\b".format("|".join(re.escape(word) for word in HEDGE_PHRASES))
    print(hedge_pattern)

    # Compute filler words and hedge phrases frequencies
    counts["filler_words"] = len(re.findall(filler_pattern, transcript_lower))
    counts["hedge_phrases"] = len(re.findall(hedge_pattern, transcript_lower))

    return counts

def _analyze_confidence(
    audio_analysis: AudioAnalysisResult
) -> CompetencyFeedback:
    """
    Analyzes confidence level based on filler words and hedging phrases.

    Args:
        audio_analysis (AudioAnalysisResult): Results from audio sentiment analysis based on AudioAnalysisResult schema.

    Returns:
        CompetencyFeedback: Score and evaluation on perceived confidence

    Raises:
        ValueError: If the transcript is empty or contains only whitespace.
    """

    logger.info("Analyzing confidence from interview transcript.")
    # Reconstruct entire transcript text
    try:
        transcript = audio_analysis.transcript.lower()
    
        # Check if transcript is empty or whitespace
        if not transcript or transcript.strip() == "":
            logger.warning("Transcript is empty or contains only whitespace.")
            raise ValueError("Transcript is empty or contains only whitespace.")
    
    except Exception as e:
        logger.error(f"Error with confidence analysis: {str(e)}")
        raise e
    
    # Count filler words and hedge phrases
    counts = _count_confidence_markers(transcript)
    
    # Get duration of interview in minutes
    duration_mins = max(audio_analysis.duration / 60.0, 0.5) # Avoid division by zero

    # Compute the density of filler words and hedge phrases, i.e. filler/hedge words per minute 
    # We weigh filler words heavier than hedge phrases
    total_fillers_hedge = (counts["filler_words"] * FILLER_WEIGHT) + (counts["hedge_phrases"] * HEDGE_WEIGHT) 
    penalty_score = total_fillers_hedge / duration_mins # penalty score based on fillers and hedge words used per minute

    score = MAX_CONFIDENCE_SCORE # initialize confidence score
    # deduct points based on how many filler/hedge words are used per minute
    deduction = max(0, penalty_score - FILLER_HEDGE_BUFF) * FILLER_HEDGE_SENS
    score = round(max(0, score - deduction), 2) # compute final confidence score

    # Generate feedback for confidence
    result = CompetencyFeedback(score=score)

    # Provide feedback if the user's filler/hedge words per minute is +2 more than the FILLER_HEDGE_BUFFER
    if penalty_score > FILLER_HEDGE_BUFF + 2:
        result.evaluation = f"You had approximately {int(penalty_score)} filler words or hedge phrases per minute."
    # User had strong confidence
    else:
        result.evaluation = f"You had approximately {int(penalty_score)} filler words or hedge phrases per minute, but you projected strong confidence throughout your interview!"

    logger.info(f"Confidence analysis complete with score: {score}.")

    return result

def _analyze_communication_clarity(
    audio_analysis: AudioAnalysisResult
) -> CompetencyFeedback:
    """
    Analyzes communication clarity based on pacing (WPM). Could be extended in the future with grammar.

    Args:
        audio_analysis (AudioAnalysisResult): Audio sentiment analysis results

    Returns:
        CompetencyFeedback: Score and evaluation on communication clarity
    """
    # Compute speech rate (words per minute)
    words = audio_analysis.transcript.split()
    duration_mins = max(audio_analysis.duration / 60.0, 0.5) # duration in minutes, avoid division by zero
    speech_rate = len(words) / duration_mins # words per minute (WPM)
    
    # Generate evaluation
    result = CompetencyFeedback(score=round(clarity_score, 2))

    # Compute clarity score based on speech rate (and future metrics)

    # speech rate within optimal range
    if MIN_OPTIMAL_WPM <= speech_rate <= MAX_OPTIMAL_WPM:
        clarity_score = MAX_CLARITY_SCORE
        result.evaluation = f"Excellent pacing at {int(speech_rate)} WPM; your delivery was very clear and easy to follow."
    # speech rate too slow
    elif speech_rate < MIN_OPTIMAL_WPM:
        deviation = (MIN_OPTIMAL_WPM - speech_rate) * WPM_PENALTY
        clarity_score = max(0, MAX_CLARITY_SCORE - deviation)
        result.evaluation = f"Your pacing was a bit slow at {int(speech_rate)} WPM; consider speaking a little faster."
    # speech rate too fast
    else: # speech_rate > MAX_OPTIMAL_WPM
        deviation = (speech_rate - MAX_OPTIMAL_WPM) * WPM_PENALTY
        clarity_score = max(0, MAX_CLARITY_SCORE - deviation)
        result.evaluation = f"Your pacing was quite fast at {int(speech_rate)} WPM; consider slowing down to give the interviewer time to process your key points."

    return result


def _analyze_engagement(
    audio_analysis: AudioAnalysisResult,
) -> CompetencyFeedback:
    """
    Analyzes how engaging the response is likely to be to interviewers.

    Args:
        audio_analysis (AudioAnalysisResult): Audio sentiment analysis

    Returns:
        CompetencyFeedback: Score and specific feedback on engagement level
    """
    result = CompetencyFeedback(
        score=3.5,  # Default score for testing
        strengths=[],
        areas_for_improvement=[],
        recommendations=[],
    )

    # # Count emotional variety if available
    # emotion_variety = 0
    # if facial_analysis and facial_analysis.emotion_sums:
    #     emotion_data = facial_analysis.emotion_sums.dict()
    #     emotion_variety = len([e for e, v in emotion_data.items() if v > 0.1])

    # Count keyword usage if available
    keyword_usage = 0
    if audio_analysis and audio_analysis.highlights:
        for highlight in audio_analysis.highlights:
            if highlight.rank > 0.5:
                keyword_usage += 1

        # Calculate engagement score
        engagement_score = (
            min(emotion_variety / 3, 1) * 0.3  # Normalize to max of 1
            + min(keyword_usage / 10, 1) * 0.3
        )

        result.score = round(min(engagement_score * 10, 10), 2)  # Scale to 0-10

        # Generate feedback based on keyword usage
        if keyword_usage > 3:
            result.strengths.append("Good keyword usage")
        elif keyword_usage < 3:
            result.areas_for_improvement.append(
                "Try to use more keywords related to the content."
            )
            result.recommendations.append(
                "Practice adding emphasis to key points in your responses"
            )

    # Always ensure we have at least one recommendation for testing
    if not result.recommendations:
        result.recommendations.append(
            "Keep your audience engaged by varying your tone and pacing"
        )

    return result


def generate_competency_feedback(
    audio_analysis: AudioAnalysisResult,
) -> OverallCompetencyFeedback:
    """
    Generates comprehensive competency-based feedback from all analysis components.

    Args:
        audio_analysis (AudioAnalysisResult): Audio sentiment analysis

    Returns:
        OverallCompetencyFeedback: Structured feedback on key interview competencies
    """
    # Generate individual competency feedback
    communication_clarity = _analyze_communication_clarity(audio_analysis)
    confidence = _analyze_confidence(audio_analysis)
    engagement = _analyze_engagement(audio_analysis)

    # Calculate overall score
    scores = [
        communication_clarity.score,
        confidence.score,
        engagement.score,
    ]
    overall_score = sum(scores) / len(scores) if scores else 0

    # Collect all recommendations
    strengths = []
    improvements = []
    all_recommendations = []

    for feedback in [communication_clarity, confidence, engagement]:
        strengths.extend(feedback.strengths)
        improvements.extend(feedback.areas_for_improvement)
        all_recommendations.extend(feedback.recommendations)

    # Generate summary based on overall score
    if overall_score >= 7:
        summary = "Your response demonstrates strong interview skills with some specific areas to refine."
    elif overall_score >= 5:
        summary = "Your response has good elements but could benefit from targeted improvements."
    else:
        summary = "Your response needs development in several key areas to increase interview effectiveness."

    # Create the overall feedback
    feedback = OverallCompetencyFeedback(
        communication_clarity=communication_clarity,
        confidence=confidence,
        engagement=engagement,
        overall_score=round(overall_score, 2),
        summary=summary,
        key_recommendations=all_recommendations[:3],  # Top 3 recommendations
    )

    return feedback
