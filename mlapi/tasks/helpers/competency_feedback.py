"""
Module for competency-based interview feedback analysis. Specifically focuses on the user's confidence, clarity, and engagement during their responses.
"""

from schemas import (
    CompetencyFeedback,
    OverallCompetencyFeedback
)
from schemas.audio import SentimentAnalysisResult
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
    MAX_ENGAGEMENT_SCORE,
    BASE_ENGAGEMENT_SCORE,
    MONOTONE_PENALTY,
    MIN_SENTIMENT_VARIETY_RATIO,
    KEYWORD_BONUS_LIMIT,
    SENTIMENT_BONUS_LIMIT,
    SENTIMENT_VARIETY_BONUS_RATIO,
    KEYWORD_REVELANCE_THRESHOLD,
    KEYWORD_POINTS,
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
    audio_analysis: SentimentAnalysisResult
) -> CompetencyFeedback:
    """
    Analyzes confidence level based on filler words and hedging phrases.

    Args:
        audio_analysis (SentimentAnalysisResult): Results from audio sentiment analysis based on SentimentAnalysisResult schema.

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
    audio_analysis: SentimentAnalysisResult
) -> CompetencyFeedback:
    """
    Analyzes communication clarity based on pacing (WPM). Could be extended in the future with grammar.

    Args:
        audio_analysis (SentimentAnalysisResult): Audio sentiment analysis results

    Returns:
        CompetencyFeedback: Score and evaluation on communication clarity
    """
    logger.info("Analyzing communication clarity from interview transcript.")
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

    logger.info(f"Communication clarity analysis complete with score: {clarity_score}.")

    return result


def _analyze_engagement(
    audio_analysis: SentimentAnalysisResult,
) -> CompetencyFeedback:
    """
    Analyzes how engaging the response is based on audio sentiment and keywords.

    Args:
        audio_analysis (SentimentAnalysisResult): Audio sentiment analysis results

    Returns:
        CompetencyFeedback: Score and specific feedback on engagement level
    """
    logger.info("Analyzing engagement from interview transcript.")

    # Check sentiment variety in audio segments, i.e. how many different sentiment types were expressed.
    # Goal is to avoid NEUTRAL responses and have a mix of POSITIVE and NEGATIVE sentiments to keep the interviewer engaged. 

    sentiments = [segment.sentiment for segment in audio_analysis.sentiment_analysis] # extract sentiments from interview's audio segments
    total_segments = len(sentiments)
    result = CompetencyFeedback(score = BASE_ENGAGEMENT_SCORE)
    
    # Compute variety of sentiments expresssed
    if total_segments > 0:
        # Compute percentage of non-neurtral segments
        neutral_count = sentiments.count("NEUTRAL")
        emotion_variety = 1.0 - (neutral_count / total_segments) # proportion of non-neutral segments

        # Deduct points for monotone speech (i.e. mostly neutral sentiment)
        if emotion_variety < MIN_SENTIMENT_VARIETY_RATIO:
            result.score -= MONOTONE_PENALTY
            result.evaluation = f"Your speech was quite monotone with {int((neutral_count / total_segments) * 100)}% of your responses being neutral. Try to vary your tone to keep the listener engaged."
        # Add points for sentiment variety
        else:
            # Add points for sentiment variety if user was at most 40% expressive (i.e. 40% of responses are non-neutral)
            variety_points = min(emotion_variety / SENTIMENT_VARIETY_BONUS_RATIO, 1) * SENTIMENT_BONUS_LIMIT
            result.score += variety_points
            result.evaluation = f"Great job varying your tone with {int(emotion_variety * 100)}% of your responses being expressive!"

    # Compute keyword usage from highlights in audio analysis
    high_value_keywords = [keyword for keyword in audio_analysis.highlights if keyword.rank > KEYWORD_REVELANCE_THRESHOLD]

    keyword_count = len(high_value_keywords)
    # Add points for keyword usage capped at KEYWORD_BONUS_LIMIT
    keyword_points = min(keyword_count * KEYWORD_POINTS, KEYWORD_BONUS_LIMIT)
    result.score += keyword_points

    # Generate keyword usage feedback
    if keyword_count <= 2:
        result.evaluation += f" You only used {keyword_count} high-value keywords in your responses. Try to incorporate more relevant keywords to keep the interviewer engaged."
    else:
        result.evaluation += f" You used {keyword_count} high-value keywords effectively in your responses."

    result.score = round(min(max(result.score, 0), MAX_ENGAGEMENT_SCORE), 2) # ensure score is within bounds of maximum engagement score and rounded 2 decimal places

    logger.info(f"Engagement analysis complete with score: {result.score}.")

    return result 


def generate_competency_feedback(
    audio_analysis: SentimentAnalysisResult,
) -> OverallCompetencyFeedback:
    """
    Generates comprehensive competency-based feedback from all analysis components, i.e. confidence, clarity, and engagement.

    Args:
        audio_analysis (SentimentAnalysisResult): Audio sentiment analysis

    Returns:
        OverallCompetencyFeedback: Structured feedback on key interview competencies
    """

    logger.info("Generating overall competency feedback.")

    # Generate individual competency feedback
    communication_clarity = _analyze_communication_clarity(audio_analysis)
    confidence = _analyze_confidence(audio_analysis)
    engagement = _analyze_engagement(audio_analysis)

    # Calculate overall competency score
    overall_score = communication_clarity.score + confidence.score + engagement.score

    # Collect all evaluations
    evaluations = ""
    for eval in [communication_clarity, confidence, engagement]:
        evaluations += eval.evaluation + "\n"

    MAX_SCORE = MAX_CONFIDENCE_SCORE + MAX_CLARITY_SCORE + MAX_ENGAGEMENT_SCORE
    # Generate summary based on overall score
    if overall_score >= MAX_SCORE * 0.8:
        summary = "Excellent performance! You demonstrated strong competencies across all areas."
    elif MAX_SCORE * 0.5 < overall_score < MAX_SCORE * 0.8:
        summary = "Good job! There are some areas for improvement to enhance your interview effectiveness."
    else: # overall_score < MAX_SCORE * 0.5 
        summary = "Needs improvement. Focus on developing your competencies to perform better in interviews."

    # Create the overall feedback
    feedback = OverallCompetencyFeedback(
        communication_clarity=communication_clarity,
        confidence=confidence,
        engagement=engagement,
        overall_score=round(overall_score, 2),
        summary=summary + "\n\nEvaluations:\n" + evaluations.strip()
    )

    logger.info("Overall competency feedback generation complete.")

    return feedback
