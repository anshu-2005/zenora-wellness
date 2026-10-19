"""
Database Seeding Script for ZENORA Mental Health Platform
Populates rich clinical mental health tracking data for longitudinal analytics:
- Patient and Specialist users
- 30-day daily mood logs & sentiment scores
- 30-day daily vitals (sleep hours, stress index, energy, mindfulness minutes)
- Clinical GAD-7 & PHQ-9 assessments showing clinical trajectory
- Longitudinal journal reflections with NLP emotional tagging
- Psychiatric / Clinical Specialist consultation notes & CBT treatment plans
- AI companion chat history
"""

from datetime import datetime, timedelta
import json
from werkzeug.security import generate_password_hash
from app import create_app
from extensions import db
from models import User, Assessment, MoodLog, JournalEntry, ChatHistory, SpecialistNote, VitalsLog

def seed_database():
    app = create_app()
    with app.app_context():
        print("[*] Creating all database tables...")
        db.create_all()

        # Check existing data
        existing_patient = User.query.filter_by(email='vikas@zenora.app').first()
        if existing_patient:
            print("[!] Found existing patient user. Cleaning up tables for fresh realistic seed...")
            SpecialistNote.query.delete()
            VitalsLog.query.delete()
            JournalEntry.query.delete()
            MoodLog.query.delete()
            Assessment.query.delete()
            ChatHistory.query.delete()
            User.query.delete()
            db.session.commit()

        print("[*] Creating primary users...")
        hashed_pw = generate_password_hash('password123', method='pbkdf2:sha256', salt_length=8)

        # 1. Primary Patient User
        patient = User(
            name='Vikas Sharma',
            email='vikas@zenora.app',
            password=hashed_pw,
            role='user',
            age=24,
            gender='Male',
            created_at=datetime.utcnow() - timedelta(days=32)
        )
        db.session.add(patient)

        # 2. Specialist Doctor User
        doctor = User(
            name='Dr. Meera Sen, MD (Psychiatry)',
            email='doctor@zenora.app',
            password=hashed_pw,
            role='specialist',
            age=43,
            gender='Female',
            created_at=datetime.utcnow() - timedelta(days=60)
        )
        db.session.add(doctor)

        # 3. Clinical Administrator User
        admin_user = User(
            name='Clinical Admin Lead',
            email='admin@zenora.app',
            password=hashed_pw,
            role='admin',
            age=38,
            gender='Non-binary',
            created_at=datetime.utcnow() - timedelta(days=90)
        )
        db.session.add(admin_user)
        db.session.commit()

        user_id = patient.id
        print(f"[+] Users created. Patient ID: {user_id}, Doctor ID: {doctor.id}")

        # 4. Generate 30 Days of Daily Mood and Vitals Logs
        print("[*] Generating 30-day longitudinal mood & vitals logs...")
        base_date = datetime.utcnow() - timedelta(days=29)

        # 30-day simulation of anxiety reducing and positive resilience growing
        mood_journey = [
            ("Anxious", "Woke up with heavy chest and impending dread about project deadlines.", -0.62, 5.2, 8, 4, 0),
            ("Overwhelmed", "Back-to-back meetings, feel exhausted and unable to concentrate.", -0.55, 5.5, 7, 3, 5),
            ("Stressed", "Skipped lunch due to meetings. Feeling jittery.", -0.48, 5.8, 8, 4, 5),
            ("Anxious", "Could not fall asleep until 3 AM, racing mind.", -0.58, 4.8, 8, 3, 0),
            ("Restless", "Trying deep breathing, feeling slight relief.", -0.22, 6.0, 6, 5, 10),
            ("Neutral", "Quiet morning. Work was manageable.", 0.05, 6.5, 5, 5, 10),
            ("Tired", "Physical fatigue but mentally more calm.", -0.15, 6.2, 5, 5, 10),
            ("Reflective", "First clinical session with Dr. Meera. Felt heard and validated.", 0.42, 6.8, 5, 6, 15),
            ("Hopeful", "Started the 4-7-8 breathing routine before bedtime.", 0.52, 7.0, 4, 6, 15),
            ("Calm", "Slept 7 hours uninterrupted. Less brain fog today.", 0.60, 7.1, 4, 7, 15),
            ("Stressed", "Unexpected work emergency spiked my anxiety briefly.", -0.35, 6.2, 6, 5, 10),
            ("Resilient", "Applied CBT thought challenging when anxiety hit. It worked!", 0.58, 6.9, 4, 7, 15),
            ("Peaceful", "Took a mindful walk without my phone. Crisp air was refreshing.", 0.72, 7.4, 3, 8, 20),
            ("Calm", "Consistent morning routine makes a huge difference.", 0.65, 7.5, 3, 7, 15),
            ("Happy", "Celebrated a milestone with teammates. Felt genuinely connected.", 0.81, 7.8, 2, 8, 15),
            ("Neutral", "Standard mundane day, but content and stable.", 0.12, 7.0, 4, 6, 10),
            ("Anxious", "Minor panic about upcoming presentation, but recovered quickly.", -0.28, 6.4, 6, 5, 15),
            ("Motivated", "Practiced presentation using progressive muscle relaxation.", 0.64, 7.2, 3, 7, 15),
            ("Excited", "Presentation went extraordinarily well! Confidence restored.", 0.88, 7.6, 2, 9, 20),
            ("Calm", "Taking time to rest and absorb the positive feedback.", 0.68, 8.0, 2, 8, 20),
            ("Grateful", "Noticed how far I have come since day 1.", 0.85, 7.8, 2, 8, 20),
            ("Peaceful", "Weekend meditation in nature. Feeling aligned.", 0.79, 8.1, 2, 8, 25),
            ("Happy", "Cooked a wholesome meal and spent time with family.", 0.78, 7.5, 3, 8, 15),
            ("Neutral", "Busy Monday but managed stress boundaries well.", 0.18, 7.1, 4, 7, 15),
            ("Calm", "Declined an unnecessary late meeting to protect my sleep.", 0.55, 7.6, 3, 7, 15),
            ("Focused", "High cognitive flow and productivity without feeling hurried.", 0.72, 7.4, 3, 8, 15),
            ("Hopeful", "Reviewing clinical screening trends; anxiety score dropped into normal tier.", 0.82, 7.8, 2, 8, 20),
            ("Grateful", "Journaling has become my daily sanctuary for mental clarity.", 0.87, 8.0, 2, 9, 20),
            ("Peaceful", "Grounded, present, and emotionally stable.", 0.76, 7.7, 2, 8, 20),
            ("Joyful", "Feeling empowered, balanced, and ready for whatever comes next.", 0.89, 8.2, 1, 9, 25)
        ]

        for i, (mood, note, sentiment, sleep, stress, energy, mindfulness) in enumerate(mood_journey):
            entry_time = base_date + timedelta(days=i, hours=19, minutes=i*2 % 40)
            
            # Mood Log
            ml = MoodLog(
                user_id=user_id,
                mood=mood,
                note=note,
                sentiment_score=sentiment,
                created_at=entry_time
            )
            db.session.add(ml)

            # Daily Vitals Log
            vl = VitalsLog(
                user_id=user_id,
                sleep_hours=sleep,
                stress_level=stress,
                energy_level=energy,
                mindfulness_mins=mindfulness,
                notes=f"Tracked via Zenora Wellness Vitals (Sleep: {sleep}h, Stress: {stress}/10)",
                created_at=entry_time
            )
            db.session.add(vl)

        # 5. Clinical Assessments (GAD-7 & PHQ-9 Trajectory over 4 Weeks)
        print("[*] Generating clinical GAD-7 & PHQ-9 assessment records...")
        assessments_data = [
            {
                "days_ago": 28,
                "gad7": 14,
                "phq9": 13,
                "interpretation": "Moderate Anxiety (14/21) / Moderate Depression (13/27)",
                "crisis_flag": False
            },
            {
                "days_ago": 21,
                "gad7": 11,
                "phq9": 10,
                "interpretation": "Moderate Anxiety (11/21) / Moderate Depression (10/27)",
                "crisis_flag": False
            },
            {
                "days_ago": 12,
                "gad7": 7,
                "phq9": 6,
                "interpretation": "Mild Anxiety (7/21) / Mild Depression (6/27)",
                "crisis_flag": False
            },
            {
                "days_ago": 2,
                "gad7": 4,
                "phq9": 3,
                "interpretation": "Minimal Anxiety (4/21) / Minimal Depression (3/27) - Remission Tier",
                "crisis_flag": False
            }
        ]

        for a in assessments_data:
            assessment = Assessment(
                user_id=user_id,
                gad7_score=a['gad7'],
                phq9_score=a['phq9'],
                interpretation=a['interpretation'],
                crisis_flag=a['crisis_flag'],
                created_at=datetime.utcnow() - timedelta(days=a['days_ago'], hours=10)
            )
            db.session.add(assessment)

        # 6. Detailed Longitudinal Journal Entries with NLP Emotional Tags
        print("[*] Generating clinical reflection journals...")
        journal_samples = [
            {
                "days_ago": 27,
                "title": "Feeling consumed by worry and mental turbulence",
                "entry": "I feel like I'm drowning in deadlines and expectations. My chest feels tight constantly, and I can't seem to stop catastrophic thinking about failing at my responsibilities. Even small mistakes feel like huge disasters.",
                "score": -0.68,
                "label": "Negative",
                "tags": ["Overwhelmed", "Catastrophizing", "High Anxiety"],
                "crisis": False
            },
            {
                "days_ago": 22,
                "title": "Small pause after my first clinical talk",
                "entry": "Dr. Meera explained how my nervous system is stuck in fight-or-flight mode. Learning about the physiology behind palpitations helped demystify them. I tried doing 5 minutes of physiological sigh breathing before bed.",
                "score": 0.45,
                "label": "Positive",
                "tags": ["Mindful", "Clinical Psychoeducation", "Grounded"],
                "crisis": False
            },
            {
                "days_ago": 17,
                "title": "Challenging the 'All-or-Nothing' cognitive distortion",
                "entry": "Caught myself thinking 'If I don't finish everything today, the whole project is ruined.' I stopped, wrote down evidence for and against, and realized it's not all or nothing. Submitting 80% today is perfectly fine.",
                "score": 0.55,
                "label": "Positive",
                "tags": ["CBT Reframing", "Hopeful & Motivated", "Self-Compassion"],
                "crisis": False
            },
            {
                "days_ago": 13,
                "title": "Rediscovering peace in nature and silent walks",
                "entry": "Went for a 30-minute walk through the park without headphones or phone notifications. I watched the autumn sunlight filtering through the trees and smelled the earth. For the first time in months, my mind felt tranquil.",
                "score": 0.78,
                "label": "Positive",
                "tags": ["Calm & Peaceful", "Nature Grounding", "Mindfulness"],
                "crisis": False
            },
            {
                "days_ago": 8,
                "title": "Navigating stress with healthy emotional boundaries",
                "entry": "A colleague tried to delegate an urgent last-minute task at 7 PM. Normally I would say yes and stay up anxious until 2 AM. Today, I politely stated my capacity and deferred it to tomorrow morning. No guilt, no panic.",
                "score": 0.65,
                "label": "Positive",
                "tags": ["Healthy Boundaries", "Assertiveness", "Calm & Peaceful"],
                "crisis": False
            },
            {
                "days_ago": 3,
                "title": "Reflecting on 30 days of therapy, tracking, and transformation",
                "entry": "Looking back at where I was a month ago versus today brings tears of gratitude. My GAD-7 dropped from 14 down to 4. I sleep 8 hours consistently now. The anxiety spikes still happen occasionally, but now I have an entire toolkit of breathing, reframing, and compassion to welcome them and let them pass.",
                "score": 0.88,
                "label": "Positive",
                "tags": ["Gratitude", "Emotional Resilience", "Clinical Remission"],
                "crisis": False
            }
        ]

        for js in journal_samples:
            je = JournalEntry(
                user_id=user_id,
                title=js['title'],
                entry=js['entry'],
                sentiment_score=js['score'],
                sentiment_label=js['label'],
                emotion_tags=json.dumps(js['tags']),
                crisis_flag=js['crisis'],
                created_at=datetime.utcnow() - timedelta(days=js['days_ago'], hours=21)
            )
            db.session.add(je)

        # 7. Psychiatric & Specialist Notes (Dr. Meera Sen)
        print("[*] Generating psychiatric specialist consultation notes...")
        specialist_notes_data = [
            {
                "specialist_name": "Dr. Meera Sen, MD (Psychiatry)",
                "diagnosis": "F41.1 Generalized Anxiety Disorder (Moderate) with Work-Related Burnout",
                "clinical_notes": (
                    "Patient presented with persistent somatic tension, autonomic arousal (tachycardia, diaphoresis during stress), "
                    "sleep-onset insomnia (sleep latency > 90 mins), and cognitive catastrophizing. "
                    "Mental State Examination: Alert, cooperative, speech fluent but slightly rapid, affect anxious but congruent. "
                    "No active suicidal or self-harm ideation reported (PHQ-9 Item 9 = 0)."
                ),
                "care_plan": json.dumps([
                    {"goal": "Daily 4-7-8 diaphragmatic breathing morning and evening", "status": "completed"},
                    {"goal": "Sleep hygiene protocol: zero screens 45 mins before bedtime", "status": "completed"},
                    {"goal": "CBT Thought-Challenging Diary: record 3 cognitive distortions weekly", "status": "in_progress"},
                    {"goal": "Aerobic physical activity: minimum 20 mins brisk walking daily", "status": "completed"}
                ]),
                "risk_level": "Moderate Risk",
                "follow_up_date": (datetime.utcnow() + timedelta(days=14)).strftime("%Y-%m-%d"),
                "days_ago": 26
            },
            {
                "specialist_name": "Dr. Meera Sen, MD (Psychiatry)",
                "diagnosis": "F41.1 Generalized Anxiety Disorder - Excellent Treatment Response / Clinical Remission",
                "clinical_notes": (
                    "Progress consultation: Patient exhibits marked reduction in subjective tension. "
                    "GAD-7 screening indicates drop from baseline 14 down to 4 (Minimal/Sub-clinical). "
                    "Sleep latency reduced to under 20 minutes, average duration 7.8 hours. "
                    "Patient actively utilizes cognitive reframing and boundary assertiveness. Affect is bright, open, and resilient."
                ),
                "care_plan": json.dumps([
                    {"goal": "Maintain longitudinal daily mood and sleep vitals tracking", "status": "active"},
                    {"goal": "Bi-weekly mindfulness meditation maintenance (15-20 mins)", "status": "active"},
                    {"goal": "Preventive booster session scheduled in 6 weeks", "status": "scheduled"}
                ]),
                "risk_level": "Low Risk",
                "follow_up_date": (datetime.utcnow() + timedelta(days=42)).strftime("%Y-%m-%d"),
                "days_ago": 2
            }
        ]

        for sn in specialist_notes_data:
            spec_note = SpecialistNote(
                user_id=user_id,
                specialist_name=sn['specialist_name'],
                diagnosis=sn['diagnosis'],
                clinical_notes=sn['clinical_notes'],
                care_plan=sn['care_plan'],
                risk_level=sn['risk_level'],
                follow_up_date=sn['follow_up_date'],
                created_at=datetime.utcnow() - timedelta(days=sn['days_ago'], hours=15)
            )
            db.session.add(spec_note)

        # 8. AI Companion Chat History
        print("[*] Generating companion chat history...")
        chats = [
            ("user", "Hello Zenora, I'm feeling really anxious about an upcoming presentation today.", 10),
            ("bot", "Hello Vikas. It is completely normal to feel an adrenaline rush before a presentation. Let's do a quick physiological grounding check: feel your feet firmly planted on the floor, take a slow 4-second breath in, and release it gently. What is the main message you want your audience to take away?", 10),
            ("user", "That helped slow my pulse. I want them to see how much progress we made on the product architecture.", 10),
            ("bot", "That's a wonderful, clear focal point! Remember: you know this material better than anyone in the room. Focus on sharing your knowledge, not on perfection. You've got this!", 10)
        ]

        for sender, msg, days_ago in chats:
            ch = ChatHistory(
                user_id=user_id,
                message=msg,
                sender=sender,
                created_at=datetime.utcnow() - timedelta(days=days_ago, hours=14)
            )
            db.session.add(ch)

        db.session.commit()
        print("\n[SUCCESS] Database seeded successfully!")
        print("  - Users: 3 (Patient, Specialist, Admin)")
        print(f"  - Mood Logs: {MoodLog.query.count()}")
        print(f"  - Vitals Logs: {VitalsLog.query.count()}")
        print(f"  - Assessments: {Assessment.query.count()}")
        print(f"  - Journals: {JournalEntry.query.count()}")
        print(f"  - Specialist Notes: {SpecialistNote.query.count()}")
        print(f"  - Chat History: {ChatHistory.query.count()}")

if __name__ == '__main__':
    seed_database()
