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
