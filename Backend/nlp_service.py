"""
ZENORA Natural Language Processing & Sentiment Analysis Service
Powered by VADER (Valence Aware Dictionary and sEntiment Reasoner)
Provides sentiment scoring, emotion categorization, crisis detection, and clinical wellness recommendations.
"""

import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize VADER Sentiment Analyzer
analyzer = SentimentIntensityAnalyzer()

# High-risk crisis trigger words and phrases indicating potential self-harm or acute distress
CRISIS_TRIGGERS = [
    r"\bhurt myself\b",
    r"\bkill myself\b",
    r"\bsuicide\b",
    r"\bsuicidal\b",
    r"\bend my life\b",
    r"\bbetter off dead\b",
    r"\bwant to die\b",
    r"\bno reason to live\b",
    r"\bend it all\b",
    r"\bcan't go on\b",
    r"\bself harm\b",
    r"\bcutting myself\b"
]

# Emotional keywords mapping for contextual tagging
EMOTION_LEXICON = {
    "Grateful": ["grateful", "thankful", "blessed", "appreciate", "kindness", "warmth", "happy"],
    "Calm & Peaceful": ["calm", "peace", "relaxed", "tranquil", "serene", "breathing", "nature", "quiet"],
    "Anxious & Nervous": ["anxious", "nervous", "worry", "worried", "panic", "scared", "fear", "restless", "racing"],
    "Down & Depressed": ["sad", "depressed", "hopeless", "crying", "empty", "lonely", "exhausted", "gloomy", "heavy"],
    "Stressed & Overwhelmed": ["stress", "stressed", "overwhelmed", "deadline", "pressure", "burnout", "too much"],
    "Hopeful & Motivated": ["hope", "hopeful", "excited", "progress", "better", "improving", "inspired", "goals"],
    "Angry & Frustrated": ["angry", "mad", "furious", "frustrated", "annoyed", "irritated", "unfair"]
}

def detect_crisis(text: str) -> bool:
    """
    Scans text for clinical crisis indicators and self-harm ideation.
    Returns True if an emergency risk pattern is matched.
    """
    if not text:
        return False
    lower_text = text.lower()
    for pattern in CRISIS_TRIGGERS:
        if re.search(pattern, lower_text):
            return True
    return False

def extract_emotion_tags(text: str, compound: float) -> list:
    """
    Extracts descriptive emotional tags based on keyword patterns and sentiment valence.
    """
    if not text:
        return ["Neutral"]
    
    tags = []
    lower_text = text.lower()
    
    for emotion, keywords in EMOTION_LEXICON.items():
        if any(re.search(r"\b" + re.escape(kw) + r"\b", lower_text) for kw in keywords):
            tags.append(emotion)
            
    if not tags:
        if compound >= 0.05:
            tags.append("Positive Reflection")
        elif compound <= -0.05:
            tags.append("Challenging Day")
        else:
            tags.append("Reflective / Neutral")
            
    return tags[:3]  # Return top 3 most relevant tags

def generate_wellness_recommendation(compound: float, emotion_tags: list, is_crisis: bool) -> str:
    """
    Generates evidence-informed supportive wellness advice based on sentiment analysis.
    """
    if is_crisis:
        return "Priority Alert: Please connect immediately with a supportive crisis counselor or reach out to the 24/7 Suicide & Crisis Lifeline (call/text 988 or Tele-MANAS 14416). You do not have to carry this alone."

    if compound <= -0.4:
        return "You seem to be carrying a heavy emotional load today. Consider a 5-minute deep diaphragmatic breathing session (4 seconds in, 4 hold, 6 out) and consider taking a warm break away from screens."
    elif compound < 0.05:
        return "A balanced day with mixed or low emotional energy. Gentle stretching, staying hydrated, or a short walk outdoors can help restore cognitive clarity."
    elif compound < 0.5:
        return "A positive and mindful emotional state. Acknowledge this moment and note down one positive detail you are grateful for today."
    else:
        return "A wonderful, uplifted reflection! Celebrate your progress and let this positive energy sustain your wellness journey."

def analyze_sentiment(text: str) -> dict:
    """
    Comprehensive NLP pipeline analyzing raw text input.
    Returns sentiment polarity scores, classification label, emotion tags, and clinical wellness suggestions.
    """
    if not text or not text.strip():
        return {
            "compound": 0.0,
            "pos": 0.0,
            "neu": 1.0,
            "neg": 0.0,
            "sentiment_label": "Neutral",
            "emotion_tags": ["Neutral"],
            "crisis_flag": False,
            "recommendation": "No text provided for analysis."
        }
        
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]
    
    # Standard VADER classification thresholds
    if compound >= 0.05:
        sentiment_label = "Positive"
    elif compound <= -0.05:
        sentiment_label = "Negative"
    else:
        sentiment_label = "Neutral"
        
    is_crisis = detect_crisis(text)
    tags = extract_emotion_tags(text, compound)
    recommendation = generate_wellness_recommendation(compound, tags, is_crisis)
    
    return {
        "compound": round(compound, 3),
        "pos": round(scores["pos"], 3),
        "neu": round(scores["neu"], 3),
        "neg": round(scores["neg"], 3),
        "sentiment_label": sentiment_label,
        "emotion_tags": tags,
        "crisis_flag": is_crisis,
        "recommendation": recommendation
    }
