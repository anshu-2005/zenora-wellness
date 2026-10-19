from datetime import datetime
from extensions import db
import json

# User table
class User(db.Model):
    """
    Represents a user in the ZENORA mental health platform.
    """
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True, default='User')
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    assessments = db.relationship('Assessment', backref='user', lazy=True, cascade='all, delete-orphan')
    mood_logs = db.relationship('MoodLog', backref='user', lazy=True, cascade='all, delete-orphan')
    journal_entries = db.relationship('JournalEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    chat_history = db.relationship('ChatHistory', backref='user', lazy=True, cascade='all, delete-orphan')
    specialist_notes = db.relationship('SpecialistNote', backref='user', lazy=True, cascade='all, delete-orphan')
    vitals_logs = db.relationship('VitalsLog', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'

# Assessment table
class Assessment(db.Model):
    """
    Represents standardized GAD-7 (Anxiety) and PHQ-9 (Depression) assessment scores.
    """
    __tablename__ = 'assessment'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    gad7_score = db.Column(db.Integer, nullable=True)
    phq9_score = db.Column(db.Integer, nullable=True)
    interpretation = db.Column(db.String(100), nullable=True)
    crisis_flag = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Assessment GAD-7: {self.gad7_score}, PHQ-9: {self.phq9_score} for User {self.user_id}>'

# Daily Mood Log table
class MoodLog(db.Model):
    """
    Represents a daily mood state entry for longitudinal tracking.
    """
    __tablename__ = 'mood_log'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    mood = db.Column(db.String(50), nullable=False)
    note = db.Column(db.Text, nullable=True)  # Optional user note
    sentiment_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<MoodLog {self.mood} for User {self.user_id}>'

# Chat History table
class ChatHistory(db.Model):
    """
    Represents conversational logs between user and AI wellness companion.
    """
    __tablename__ = 'chat_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    sender = db.Column(db.String(50), nullable=False)  # 'user' or 'bot'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<ChatHistory Message from {self.sender} for User {self.user_id}>'

# Daily Journal table with NLP Sentiment integration
class JournalEntry(db.Model):
    """
    Represents a daily self-reflection journal entry enriched with NLP sentiment analytics.
    """
    __tablename__ = 'journal_entry'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    entry = db.Column(db.Text, nullable=False)
    sentiment_score = db.Column(db.Float, nullable=True)     # Compound score (-1.0 to 1.0)
    sentiment_label = db.Column(db.String(50), nullable=True) # 'Positive', 'Neutral', 'Negative'
    emotion_tags = db.Column(db.Text, nullable=True)         # JSON-encoded array of tags
    crisis_flag = db.Column(db.Boolean, default=False)       # Crisis indicator flag
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_tags(self):
        if self.emotion_tags:
            try:
                return json.loads(self.emotion_tags)
            except Exception:
                return [self.emotion_tags]
        return []

    def __repr__(self):
        return f'<JournalEntry {self.title or self.id} for User {self.user_id}>'

# Specialist Clinical Consultation & Treatment Plan table
class SpecialistNote(db.Model):
    """
    Represents psychiatric/clinical specialist notes, ICD/DSM diagnosis, care plan, and risk triage.
    """
    __tablename__ = 'specialist_note'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    specialist_name = db.Column(db.String(120), default='Dr. Clinical Specialist')
    diagnosis = db.Column(db.String(255), nullable=True)
    clinical_notes = db.Column(db.Text, nullable=False)
    care_plan = db.Column(db.Text, nullable=True)
    risk_level = db.Column(db.String(50), default='Low')
    follow_up_date = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<SpecialistNote {self.id} for User {self.user_id}>'

# Daily Biometrics and Vitals Log table
class VitalsLog(db.Model):
    """
    Represents daily sleep, stress, energy, and mindfulness vitals for clinical correlation analysis.
    """
    __tablename__ = 'vitals_log'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sleep_hours = db.Column(db.Float, nullable=False, default=7.0)
    stress_level = db.Column(db.Integer, nullable=False, default=3)
    energy_level = db.Column(db.Integer, nullable=False, default=7)
    mindfulness_mins = db.Column(db.Integer, nullable=True, default=10)
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<VitalsLog {self.id} Sleep: {self.sleep_hours}h for User {self.user_id}>'
