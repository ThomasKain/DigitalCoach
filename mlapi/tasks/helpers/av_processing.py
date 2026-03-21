from utils.logger_config import get_logger
# from schemas.create_answer import HighlightData
from schemas.audio import SentimentAnalysisResult
from heapq import nlargest
from typing import List

logger = get_logger(__name__)


# def grab_top_five_keywords(audio_data: AudioAnalysisResult) -> List[HighlightData]:
#     """
#     Extract the top five keywords from audio data.

#     Args:
#         audio_data: The audio analysis data from AssemblyAI

#     Returns:
#         List[HighlightData]: Top five keywords by rank
#     """
#     keywords = audio_data.highlights
#     top_five = nlargest(5, keywords, key=lambda item: item.rank)
#     return top_five


def calculate_overall_audio_sentiment(audio_data: SentimentAnalysisResult) -> str:
    """
    Calculate the most common sentiment in the audio data.

    Args:
        audio_data: The audio analysis data from AssemblyAI

    Returns:
        str: The most common sentiment (POSITIVE, NEGATIVE, or NEUTRAL)
    """
    sentiments = audio_data.sentiment_analysis
    sent_list = [i.sentiment for i in sentiments]

    if not sent_list:
        return "NEUTRAL"

    counted_sents = max(set(sent_list), key=sent_list.count) if sent_list else "NEUTRAL"
    return counted_sents
