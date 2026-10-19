from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_migrate import Migrate
import os
import logging
from datetime import datetime

from extensions import db, socketio, migrate

def create_app():
    """
    Factory function to create and configure the Flask application.
    """
    app = Flask(__name__)
    
    # Enable Cross-Origin Resource Sharing (CORS) across development ports
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Database Configuration
    db_path = os.path.join(app.instance_path, 'database.db')
    os.makedirs(app.instance_path, exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', f'sqlite:///{db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Logging configuration
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

    # Initialize extensions
    db.init_app(app)
    socketio.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints for modular routing
    from routes import auth
    app.register_blueprint(auth, url_prefix='/api')

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "An internal error occurred", "details": str(error)}, 500

    # Ensure tables exist
    with app.app_context():
        import models  # Ensure all models are imported before create_all
        db.create_all()

    return app

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print("WebSocket client connected.")

@socketio.on('disconnect')
def handle_disconnect():
    print("WebSocket client disconnected.")

@socketio.on('message')
def handle_message(data):
    """
    Handles incoming WebSocket messages from the client.
    """
    try:
        from models import ChatHistory
        user_id = data.get('user_id', 1)
        user_message = data.get('message')

        if not user_message:
            emit('error', {'error': 'Message content is required'})
            return

        # Save user message
        user_chat = ChatHistory(user_id=user_id, message=user_message, sender='user', created_at=datetime.utcnow())
        db.session.add(user_chat)
        db.session.commit()

        # Generate intelligent supportive reply
        from nlp_service import analyze_sentiment
        analysis = analyze_sentiment(user_message)
        
        if analysis.get('crisis_flag'):
            bot_reply = "I hear how much pain you are in right now. Please know you are not alone, and there is immediate help. You can call or text the Suicide & Crisis Lifeline at 988 or Tele-MANAS at 14416 anytime for free, confidential support."
        elif analysis.get('sentiment_label') == 'Negative':
            bot_reply = f"Thank you for sharing that with me. It sounds like you're experiencing some tough emotions right now. Remember to be gentle with yourself. Would you like to talk more about what's on your mind or try a calming breathing exercise?"
        elif analysis.get('sentiment_label') == 'Positive':
            bot_reply = f"That is wonderful to hear! Recognizing positive moments and what brings you joy is a vital part of emotional resilience. How can we build on this feeling today?"
        else:
            bot_reply = f"Thank you for reflecting with me. Taking time to put your feelings into words is a great habit for mental clarity. What else is on your mind?"

        # Save bot reply
        bot_chat = ChatHistory(user_id=user_id, message=bot_reply, sender='bot', created_at=datetime.utcnow())
        db.session.add(bot_chat)
        db.session.commit()

        emit('bot_reply', {'bot_reply': bot_reply, 'sentiment': analysis})

    except Exception as e:
        emit('error', {'error': 'An unexpected error occurred', 'details': str(e)})

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
