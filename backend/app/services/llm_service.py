"""
LLM Service - Google Gemini Integration (FREE)
Uses Google Gemini 1.5 Flash - 1500 requests/day FREE
"""

import google.generativeai as genai
from flask import current_app
from app.models import LLMConversation, User, WorkoutSession, Habit
from app import db
from datetime import datetime, timedelta
import json


class LLMService:
    """Service for LLM interactions with context management"""
    
    def __init__(self):
        self.model = None
        self.use_ollama = False
    
    def initialize(self):
        """Initialize Gemini API or Ollama"""
        try:
            if current_app.config.get('USE_OLLAMA'):
                self.use_ollama = True
                # Ollama setup (if available)
                import ollama
                self.ollama_client = ollama.Client(
                    host=current_app.config['OLLAMA_BASE_URL']
                )
                current_app.logger.info("Using Ollama for LLM (100% free, local)")
            else:
                # Google Gemini setup (FREE tier)  
                genai.configure(api_key=current_app.config['GEMINI_API_KEY'])
                # For google-generativeai v0.8+, use models/gemini-2.5-flash (new free tier)
                self.model = genai.GenerativeModel('models/gemini-2.5-flash')
                current_app.logger.info(f"Using Google Gemini gemini-2.5-flash (FREE tier)")
        except Exception as e:
            current_app.logger.error(f"Error initializing LLM: {e}")
            # Fallback to mock responses in case of error
            self.model = None
    
    def get_user_context(self, user_id, session_id=None):
        """Build context from user profile, recent workouts, and habits"""
        user = User.query.get(user_id)
        if not user:
            return ""
        
        # User profile
        context_parts = [
            f"User: {user.name or user.username}",
            f"Fitness Level: {user.fitness_level or 'beginner'}",
        ]
        
        if user.goals:
            goals = json.loads(user.goals) if isinstance(user.goals, str) else user.goals
            context_parts.append(f"Goals: {', '.join(goals)}")
        
        # Recent workout sessions (last 5)
        recent_sessions = WorkoutSession.query.filter_by(user_id=user_id)\
            .filter(WorkoutSession.completed_at.isnot(None))\
            .order_by(WorkoutSession.completed_at.desc())\
            .limit(5)\
            .all()
        
        if recent_sessions:
            context_parts.append("\nRecent Workouts:")
            for session in recent_sessions:
                workout_info = f"- {session.completed_at.strftime('%Y-%m-%d')}: "
                workout_info += f"{session.duration_minutes} min"
                
                if session.calories_burned:
                    workout_info += f", {session.calories_burned} cal"
                
                # Add exercises if available
                if session.exercises_completed:
                    exercise_names = [ex.get('name', '') for ex in session.exercises_completed if ex.get('name')]
                    if exercise_names:
                        workout_info += f" - Exercises: {', '.join(exercise_names)}"
                
                # Add notes if available
                if session.notes:
                    workout_info += f" (Notes: {session.notes[:50]}{'...' if len(session.notes) > 50 else ''})"
                
                context_parts.append(workout_info)
        
        # Active habits
        active_habits = Habit.query.filter_by(user_id=user_id, is_active=True).all()
        if active_habits:
            context_parts.append("\nActive Habits:")
            for habit in active_habits:
                context_parts.append(
                    f"- {habit.name}: {habit.current_streak} day streak, "
                    f"{habit.total_completions} total completions"
                )
        
        # Conversation history - load from ALL sessions for continuity
        history = LLMConversation.query.filter_by(user_id=user_id)\
            .order_by(LLMConversation.timestamp.desc())\
            .limit(current_app.config['MAX_CONVERSATION_HISTORY'])\
            .all()
        
        if history:
            context_parts.append("\nRecent Conversation:")
            for msg in reversed(history):
                context_parts.append(f"{msg.role}: {msg.content}")
        
        return "\n".join(context_parts)
    
    def generate_response(self, user_id, user_message, session_id=None):
        """Generate LLM response with full context"""
        if not self.model and not self.use_ollama:
            self.initialize()
        
        # Build context
        context = self.get_user_context(user_id, session_id)
        
        # System prompt for fitness coaching
        system_prompt = """You are an enthusiastic and knowledgeable fitness coach AI assistant. 
Your role is to:
- Provide personalized workout advice and motivation
- Analyze workout performance and give constructive feedback
- Help users maintain healthy habits and track progress
- Encourage users while being realistic about fitness goals
- Answer questions about exercise form, nutrition, and fitness
- REMEMBER and reference information from the "Recent Conversation" section below
- If the user has told you their height, weight, or other personal info in recent messages, USE that information

Be supportive, positive, and concise in your responses. Use the user's context and conversation history to personalize your advice."""
        
        # Construct full prompt
        full_prompt = f"{system_prompt}\n\n{context}\n\nUser: {user_message}\n\nAssistant:"
        
        try:
            if self.use_ollama:
                # Ollama API call
                response = self.ollama_client.chat(
                    model=current_app.config['OLLAMA_MODEL'],
                    messages=[
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': f"{context}\n\n{user_message}"}
                    ]
                )
                assistant_message = response['message']['content']
                model_used = current_app.config['OLLAMA_MODEL']
                tokens_used = 0  # Ollama doesn't track tokens
            else:
                # Google Gemini API call (FREE)
                response = self.model.generate_content(full_prompt)
                assistant_message = response.text
                model_used = current_app.config['GEMINI_MODEL']
                
                # Estimate tokens (Gemini doesn't return exact count in free tier)
                tokens_used = len(full_prompt.split()) + len(assistant_message.split())
            
            # Save conversation to database
            self._save_conversation(user_id, session_id, 'user', user_message, tokens_used // 2, model_used)
            self._save_conversation(user_id, session_id, 'assistant', assistant_message, tokens_used // 2, model_used)
            
            return {
                'message': assistant_message,
                'model': model_used,
                'tokens_used': tokens_used
            }
        
        except Exception as e:
            current_app.logger.error(f"Error generating LLM response: {e}")
            # Fallback response
            return {
                'message': "I'm having trouble connecting right now, but I'm here to help! Try again in a moment.",
                'model': 'fallback',
                'error': str(e)
            }
    
    def analyze_pose_feedback(self, user_id, pose_data, exercise_name):
        """Generate feedback based on pose detection results"""
        if not self.model and not self.use_ollama:
            self.initialize()
        
        prompt = f"""Analyze this workout pose data and provide brief, actionable feedback:

Exercise: {exercise_name}
Form Score: {pose_data.get('form_score', 0)}/100
Rep Count: {pose_data.get('rep_count', 0)}
Range of Motion: {pose_data.get('range_of_motion', 0)}

Provide:
1. One sentence on form quality
2. One specific improvement tip (if score < 80)
3. Encouragement

Keep response under 100 words."""
        
        try:
            if self.use_ollama:
                response = self.ollama_client.chat(
                    model=current_app.config['OLLAMA_MODEL'],
                    messages=[{'role': 'user', 'content': prompt}]
                )
                feedback = response['message']['content']
            else:
                response = self.model.generate_content(prompt)
                feedback = response.text
            
            return feedback
        
        except Exception as e:
            current_app.logger.error(f"Error generating pose feedback: {e}")
            # Fallback feedback
            score = pose_data.get('form_score', 0)
            if score >= 80:
                return "Great form! Keep maintaining this quality throughout your workout."
            else:
                return "Good effort! Focus on controlled movements and full range of motion."
    
    def generate_motivation(self, user_id):
        """Generate daily motivation based on user's progress"""
        user = User.query.get(user_id)
        if not user:
            return "You've got this! Every workout counts."
        
        # Get recent activity
        sessions_this_week = WorkoutSession.query.filter_by(user_id=user_id)\
            .filter(WorkoutSession.started_at >= datetime.utcnow() - timedelta(days=7))\
            .count()
        
        prompt = f"""Generate a short, motivational message (max 50 words) for a fitness app user:
- Name: {user.name or user.username}
- Workouts this week: {sessions_this_week}
- Fitness level: {user.fitness_level or 'beginner'}

Be encouraging and specific to their progress."""
        
        try:
            if self.use_ollama:
                response = self.ollama_client.chat(
                    model=current_app.config['OLLAMA_MODEL'],
                    messages=[{'role': 'user', 'content': prompt}]
                )
                message = response['message']['content']
            else:
                response = self.model.generate_content(prompt)
                message = response.text
            
            return message
        
        except Exception as e:
            current_app.logger.error(f"Error generating motivation: {e}")
            return f"Great job on {sessions_this_week} workouts this week! Keep up the momentum!"
    
    def _save_conversation(self, user_id, session_id, role, content, tokens, model):
        """Save conversation message to database"""
        conversation = LLMConversation(
            user_id=user_id,
            session_id=session_id or 'default',
            role=role,
            content=content,
            tokens_used=tokens,
            model=model
        )
        db.session.add(conversation)
        db.session.commit()


# Global instance
llm_service = LLMService()
