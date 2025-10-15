import os
from datetime import timedelta

class Config:
    """Base configuration"""
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = False
    TESTING = False
    
    # Database - Local PostgreSQL (FREE)
    # Format: postgresql://username:password@localhost:5432/database_name
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:postgres@localhost:5432/fitness_companion'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # JWT Authentication
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_COOKIE_CSRF_PROTECT = False  # Disable CSRF for API-only backend
    
    # LLM Configuration - Google Gemini (FREE 1500 req/day)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or 'your-gemini-api-key-here'
    GEMINI_MODEL = 'gemini-1.5-flash'  # Free tier model - use v1 API
    
    # Fallback: Ollama for completely free local LLM (optional)
    OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL') or 'http://localhost:11434'
    OLLAMA_MODEL = 'llama3.1:8b'
    USE_OLLAMA = os.environ.get('USE_OLLAMA', 'false').lower() == 'true'
    
    # LLM Context Settings
    MAX_CONVERSATION_HISTORY = 20  # Last N messages to include in context
    MAX_CONTEXT_TOKENS = 8000  # Token limit for context window
    
    # Pose Detection
    POSE_CONFIDENCE_THRESHOLD = 0.5
    POSE_FRAME_SKIP = 2  # Process every Nth frame to reduce load
    
    # Habit Tracker
    REMINDER_LOOKAHEAD_HOURS = 24  # Check for reminders in next N hours
    DEFAULT_STREAK_GRACE_PERIOD_HOURS = 48  # Hours before streak breaks
    
    # File Upload (for pose images if needed)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # CORS (for React Native frontend)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')


class DevelopmentConfig(Config):
    """Development configuration - FREE stack"""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Log all SQL queries


class ProductionConfig(Config):
    """Production configuration - Still free/cheap"""
    DEBUG = False
    # Use environment variables for production
    # Example: DATABASE_URL from Supabase/Neon (free tier)
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:postgres@localhost:5432/fitness_companion_test'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
