from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import json


class User(db.Model):
    """User model for authentication and profile"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120))
    
    # Profile info
    height_cm = db.Column(db.Float)
    weight_kg = db.Column(db.Float)
    fitness_level = db.Column(db.String(20))  # beginner, intermediate, advanced
    goals = db.Column(db.Text)  # JSON string of fitness goals
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workout_routines = db.relationship('WorkoutRoutine', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    workout_sessions = db.relationship('WorkoutSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    habits = db.relationship('Habit', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    llm_conversations = db.relationship('LLMConversation', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'name': self.name,
            'height_cm': self.height_cm,
            'weight_kg': self.weight_kg,
            'fitness_level': self.fitness_level,
            'goals': json.loads(self.goals) if self.goals else [],
            'created_at': self.created_at.isoformat()
        }


class WorkoutRoutine(db.Model):
    """Workout routine templates"""
    __tablename__ = 'workout_routines'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    exercises = db.Column(db.JSON)  # List of exercises with sets/reps/duration
    difficulty = db.Column(db.String(20))  # easy, medium, hard
    estimated_duration_minutes = db.Column(db.Integer)
    is_camera_based = db.Column(db.Boolean, default=False)  # Requires pose detection
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sessions = db.relationship('WorkoutSession', backref='routine', lazy='dynamic')
    habits = db.relationship('Habit', backref='routine', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'exercises': self.exercises,
            'difficulty': self.difficulty,
            'estimated_duration_minutes': self.estimated_duration_minutes,
            'is_camera_based': self.is_camera_based,
            'created_at': self.created_at.isoformat()
        }


class WorkoutSession(db.Model):
    """Actual workout sessions (completed or in-progress)"""
    __tablename__ = 'workout_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    routine_id = db.Column(db.Integer, db.ForeignKey('workout_routines.id'), nullable=True)
    
    session_type = db.Column(db.String(20), nullable=False)  # camera, manual
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    duration_minutes = db.Column(db.Integer)
    
    # Manual workout data (if not camera-based)
    exercises_completed = db.Column(db.JSON)  # List of exercises with actual sets/reps
    
    # Summary
    calories_burned = db.Column(db.Integer)
    notes = db.Column(db.Text)
    
    # Relationships
    pose_analyses = db.relationship('PoseAnalysis', backref='session', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'routine': self.routine.to_dict() if self.routine else None,
            'session_type': self.session_type,
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'duration_minutes': self.duration_minutes,
            'exercises_completed': self.exercises_completed,
            'calories_burned': self.calories_burned,
            'notes': self.notes
        }


class PoseAnalysis(db.Model):
    """Pose detection results from camera workouts"""
    __tablename__ = 'pose_analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('workout_sessions.id'), nullable=False, index=True)
    exercise_name = db.Column(db.String(80))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Pose data
    keypoints = db.Column(db.JSON)  # MediaPipe pose keypoints (33 landmarks)
    form_score = db.Column(db.Float)  # 0-100 score for form quality
    feedback_text = db.Column(db.Text)  # Auto-generated feedback
    
    # Metrics
    rep_count = db.Column(db.Integer, default=0)
    range_of_motion = db.Column(db.Float)
    
    def to_dict(self):
        return {
            'id': self.id,
            'exercise_name': self.exercise_name,
            'timestamp': self.timestamp.isoformat(),
            'form_score': self.form_score,
            'feedback_text': self.feedback_text,
            'rep_count': self.rep_count,
            'range_of_motion': self.range_of_motion
        }


class Habit(db.Model):
    """Habit tracker for workout routines"""
    __tablename__ = 'habits'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    routine_id = db.Column(db.Integer, db.ForeignKey('workout_routines.id'), nullable=True)
    
    name = db.Column(db.String(120), nullable=False)
    frequency = db.Column(db.String(50))  # daily, weekly, custom
    schedule = db.Column(db.JSON)  # Days/times for reminders
    
    # Tracking
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    total_completions = db.Column(db.Integer, default=0)
    last_completed_at = db.Column(db.DateTime, nullable=True)
    next_reminder_at = db.Column(db.DateTime, nullable=True, index=True)
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'routine': self.routine.to_dict() if self.routine else None,
            'frequency': self.frequency,
            'schedule': self.schedule,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'total_completions': self.total_completions,
            'last_completed_at': self.last_completed_at.isoformat() if self.last_completed_at else None,
            'next_reminder_at': self.next_reminder_at.isoformat() if self.next_reminder_at else None,
            'is_active': self.is_active
        }


class LLMConversation(db.Model):
    """LLM conversation history for context-aware responses"""
    __tablename__ = 'llm_conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    session_id = db.Column(db.String(36))  # UUID for conversation session
    
    role = db.Column(db.String(20), nullable=False)  # user, assistant, system
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Metadata
    tokens_used = db.Column(db.Integer)
    model = db.Column(db.String(50))
    
    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat()
        }
