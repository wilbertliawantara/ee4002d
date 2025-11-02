from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Habit, WorkoutSession
from app.utils import validate_habit, ValidationError
from datetime import datetime, timedelta

bp = Blueprint('habits', __name__)


@bp.route('/', methods=['GET'])
@jwt_required()
def get_habits():
    """Get all habits for current user"""
    current_user_id = int(get_jwt_identity())
    
    active_only = request.args.get('active_only', 'false').lower() == 'true'
    
    query = Habit.query.filter_by(user_id=current_user_id)
    if active_only:
        query = query.filter_by(is_active=True)
    
    habits = query.all()
    
    return jsonify({
        'habits': [h.to_dict() for h in habits]
    }), 200


@bp.route('/', methods=['POST'])
@jwt_required()
def create_habit():
    """Create a new habit tracker"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate input
    validated, errors = validate_habit(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Calculate first reminder time
    next_reminder = None
    if data.get('schedule'):
        next_reminder = calculate_next_reminder(data['schedule'])
    
    habit = Habit(
        user_id=current_user_id,
        routine_id=data.get('routine_id'),
        name=validated['name'],
        frequency=validated.get('frequency', 'weekly'),
        schedule=validated.get('schedule', {}),
        next_reminder_at=next_reminder
    )
    
    db.session.add(habit)
    db.session.commit()
    
    return jsonify({
        'message': 'Habit created successfully',
        'habit': habit.to_dict()
    }), 201


@bp.route('/<int:habit_id>', methods=['PUT'])
@jwt_required()
def update_habit(habit_id):
    """Update a habit"""
    current_user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate input
    validated, errors = validate_habit(data, is_update=True)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    if 'name' in validated:
        habit.name = validated['name']
    if 'frequency' in validated:
        habit.frequency = validated['frequency']
    if 'schedule' in validated:
        habit.schedule = validated['schedule']
        habit.next_reminder_at = calculate_next_reminder(validated['schedule'])
    if 'is_active' in validated:
        habit.is_active = validated['is_active']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Habit updated successfully',
        'habit': habit.to_dict()
    }), 200


@bp.route('/<int:habit_id>/complete', methods=['POST'])
@jwt_required()
def complete_habit(habit_id):
    """Mark a habit as completed"""
    current_user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    now = datetime.utcnow()
    
    # Update streak
    if habit.last_completed_at:
        hours_since_last = (now - habit.last_completed_at).total_seconds() / 3600
        
        # Check if within grace period (default 48 hours)
        from flask import current_app
        grace_period = current_app.config.get('DEFAULT_STREAK_GRACE_PERIOD_HOURS', 48)
        
        if hours_since_last <= grace_period:
            habit.current_streak += 1
        else:
            # Streak broken, reset
            habit.current_streak = 1
    else:
        habit.current_streak = 1
    
    # Update longest streak
    if habit.current_streak > habit.longest_streak:
        habit.longest_streak = habit.current_streak
    
    # Update completion info
    habit.total_completions += 1
    habit.last_completed_at = now
    
    # Calculate next reminder
    if habit.schedule:
        habit.next_reminder_at = calculate_next_reminder(habit.schedule)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Habit completed!',
        'habit': habit.to_dict(),
        'streak_milestone': habit.current_streak in [7, 14, 30, 60, 90, 100, 365]
    }), 200


@bp.route('/<int:habit_id>', methods=['DELETE'])
@jwt_required()
def delete_habit(habit_id):
    """Delete a habit"""
    current_user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    db.session.delete(habit)
    db.session.commit()
    
    return jsonify({'message': 'Habit deleted successfully'}), 200


@bp.route('/reminders/upcoming', methods=['GET'])
@jwt_required()
def get_upcoming_reminders():
    """Get upcoming reminders for the next 24 hours"""
    current_user_id = int(get_jwt_identity())
    
    lookahead_hours = request.args.get('hours', 24, type=int)
    now = datetime.utcnow()
    future = now + timedelta(hours=lookahead_hours)
    
    habits = Habit.query.filter_by(user_id=current_user_id, is_active=True)\
        .filter(Habit.next_reminder_at.between(now, future))\
        .order_by(Habit.next_reminder_at.asc())\
        .all()
    
    return jsonify({
        'reminders': [{
            'habit': h.to_dict(),
            'time_until_reminder': (h.next_reminder_at - now).total_seconds() / 60  # minutes
        } for h in habits]
    }), 200


def calculate_next_reminder(schedule):
    """Calculate next reminder time based on schedule
    
    Schedule format:
    {
        "days": [1, 3, 5],  # Monday=1, Sunday=7
        "time": "07:00"     # HH:MM format
    }
    """
    if not schedule or not schedule.get('days') or not schedule.get('time'):
        return None
    
    now = datetime.utcnow()
    target_time = datetime.strptime(schedule['time'], '%H:%M').time()
    
    # Find next scheduled day
    current_weekday = now.isoweekday()  # Monday=1, Sunday=7
    days = sorted(schedule['days'])
    
    # Try to find next occurrence this week
    next_day = None
    for day in days:
        if day > current_weekday:
            next_day = day
            break
        elif day == current_weekday and now.time() < target_time:
            next_day = day
            break
    
    # If no day this week, use first day next week
    if next_day is None:
        next_day = days[0]
        days_until = (7 - current_weekday) + next_day
    else:
        days_until = next_day - current_weekday
    
    next_reminder = now + timedelta(days=days_until)
    next_reminder = next_reminder.replace(
        hour=target_time.hour,
        minute=target_time.minute,
        second=0,
        microsecond=0
    )
    
    return next_reminder
