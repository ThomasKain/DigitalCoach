AUDIO_EMOTION_POINTS = {"NEGATIVE": -2, "NEUTRAL": 1, "POSITIVE": 2}
OVERALL_AUDIO_POINTS = {"NEGATIVE": 0, "NEUTRAL": 5, "POSITIVE": 10}


# Filler words and hedge phrases for confidence analysis (should be mutually exclusive sets and lowercase)
FILLER_WORDS = {"um", "uh", "er", "ah", "like", "you know", "i mean"}
HEDGE_PHRASES = {"i think", "maybe", "sort of", "kind of", "i guess", "probably"}
FILLER_HEDGE_BUFF = 2 # how many filler/hedge words can be used per minute without losing points
FILLER_HEDGE_SENS = 0.8 # how much of a point is deducted for every filler/hedge word used, e.g. if the initial score was 10 and the FILLER_HEADGE_BUFF was 2 then 4 filler/hedge words used per minute would make the score 10 - (4-2) * 0.8 = 8.4
FILLER_WEIGHT = 2 # magnitude for each filler word used
HEDGE_WEIGHT = 1 # magnitude for each hedge phrase used
MAX_CONFIDENCE_SCORE = 10 # base score for user's confidence
MAX_CLARITY_SCORE = 10 # base score for user's communication clarity
MIN_OPTIMAL_WPM = 120 # minimum words per minute for optimal pacing 
MAX_OPTIMAL_WPM = 150 # maximum words per minute for optimal pacing
WPM_PENALTY = 0.1 # points deducted per WPM outside optimal range
MAX_ENGAGEMENT_SCORE = 10 # base score for user's engagement
BASE_ENGAGEMENT_SCORE = MAX_ENGAGEMENT_SCORE / 2 # initial score for engagement before adjustments
MONOTONE_PENALTY = BASE_ENGAGEMENT_SCORE / 2 # points deducted for completely monotone speech
MIN_SENTIMENT_VARIETY_RATIO = 0.2 # minimum ratio of non-neutral sentiment segments to total segments to avoid monotone penalty
SENTIMENT_VARIETY_BONUS_RATIO = 0.35 # ratio of non-neutral sentiment segments to total segments for full sentiment variety bonus
KEYWORD_BONUS_LIMIT = int(MAX_ENGAGEMENT_SCORE / 3) # max points gained for using keywords  
SENTIMENT_BONUS_LIMIT = int(MAX_ENGAGEMENT_SCORE / 4) # max points gained for non-neutral sentiment 
KEYWORD_REVELANCE_THRESHOLD = 0.5 # minimum relevance for a keyword to be considered high-value
KEYWORD_POINTS = int(KEYWORD_BONUS_LIMIT / 5) # points per high-value keyword used