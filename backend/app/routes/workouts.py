from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import WorkoutRoutine, WorkoutSession
from app.utils import validate_workout_routine, validate_workout_session, ValidationError
from datetime import datetime

bp = Blueprint('workouts', __name__)


@bp.route('/routines', methods=['GET'])
@jwt_required()
def get_routines():
    """Get all workout routines for current user"""
    current_user_id = int(get_jwt_identity())
    routines = WorkoutRoutine.query.filter_by(user_id=current_user_id).all()
    
    return jsonify({
        'routines': [r.to_dict() for r in routines]
    }), 200


@bp.route('/routines', methods=['POST'])
@jwt_required()
def create_routine():
    """Create a new workout routine"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate input
    validated, errors = validate_workout_routine(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    routine = WorkoutRoutine(
        user_id=current_user_id,
        name=validated['name'],
        description=validated.get('description', ''),
        exercises=validated.get('exercises', []),
        difficulty=validated.get('difficulty', 'medium'),
        estimated_duration_minutes=validated.get('estimated_duration_minutes', 30),
        is_camera_based=validated.get('is_camera_based', False)
    )
    
    db.session.add(routine)
    db.session.commit()
    
    return jsonify({
        'message': 'Routine created successfully',
        'routine': routine.to_dict()
    }), 201


@bp.route('/routines/<int:routine_id>', methods=['GET'])
@jwt_required()
def get_routine(routine_id):
    """Get a specific workout routine"""
    current_user_id = int(get_jwt_identity())
    routine = WorkoutRoutine.query.filter_by(id=routine_id, user_id=current_user_id).first()
    
    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    return jsonify({'routine': routine.to_dict()}), 200


@bp.route('/routines/<int:routine_id>', methods=['PUT'])
@jwt_required()
def update_routine(routine_id):
    """Update a workout routine"""
    current_user_id = int(get_jwt_identity())
    routine = WorkoutRoutine.query.filter_by(id=routine_id, user_id=current_user_id).first()
    
    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate input
    validated, errors = validate_workout_routine(data, is_update=True)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Update fields
    if 'name' in validated:
        routine.name = validated['name']
    if 'description' in validated:
        routine.description = validated['description']
    if 'exercises' in validated:
        routine.exercises = validated['exercises']
    if 'difficulty' in validated:
        routine.difficulty = validated['difficulty']
    if 'estimated_duration_minutes' in validated:
        routine.estimated_duration_minutes = validated['estimated_duration_minutes']
    if 'is_camera_based' in validated:
        routine.is_camera_based = validated['is_camera_based']
    
    routine.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Routine updated successfully',
        'routine': routine.to_dict()
    }), 200


@bp.route('/routines/<int:routine_id>', methods=['DELETE'])
@jwt_required()
def delete_routine(routine_id):
    """Delete a workout routine"""
    current_user_id = int(get_jwt_identity())
    routine = WorkoutRoutine.query.filter_by(id=routine_id, user_id=current_user_id).first()
    
    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    db.session.delete(routine)
    db.session.commit()
    
    return jsonify({'message': 'Routine deleted successfully'}), 200


@bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    """Get workout sessions for current user"""
    current_user_id = int(get_jwt_identity())
    
    # Optional filters
    limit = request.args.get('limit', 20, type=int)
    
    sessions = WorkoutSession.query.filter_by(user_id=current_user_id)\
        .order_by(WorkoutSession.started_at.desc())\
        .limit(limit)\
        .all()
    
    return jsonify({
        'sessions': [s.to_dict() for s in sessions]
    }), 200


@bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_session():
    """Create a new workout session (manual entry)"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate input
    validated, errors = validate_workout_session(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    session = WorkoutSession(
        user_id=current_user_id,
        routine_id=data.get('routine_id'),
        session_type=validated['session_type'],
        started_at=validated.get('started_at', datetime.utcnow()),
        completed_at=validated.get('completed_at'),
        duration_minutes=validated.get('duration_minutes'),
        exercises_completed=validated.get('exercises_completed', []),
        calories_burned=validated.get('calories_burned'),
        notes=validated.get('notes', '')
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'message': 'Session created successfully',
        'session': session.to_dict()
    }), 201


@bp.route('/sessions/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_session(session_id):
    """Update a workout session"""
    current_user_id = int(get_jwt_identity())
    session = WorkoutSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate input
    validated, errors = validate_workout_session(data, is_update=True)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Update fields
    if 'completed_at' in validated:
        session.completed_at = validated['completed_at']
    if 'duration_minutes' in validated:
        session.duration_minutes = validated['duration_minutes']
    if 'exercises_completed' in validated:
        session.exercises_completed = validated['exercises_completed']
    if 'calories_burned' in validated:
        session.calories_burned = validated['calories_burned']
    if 'notes' in validated:
        session.notes = validated['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Session updated successfully',
        'session': session.to_dict()
    }), 200


@bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    """Delete a workout session"""
    current_user_id = int(get_jwt_identity())
    session = WorkoutSession.query.filter_by(id=session_id, user_id=current_user_id).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    db.session.delete(session)
    db.session.commit()
    
    return jsonify({'message': 'Session deleted successfully'}), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get workout statistics for current user"""
    current_user_id = int(get_jwt_identity())
    
    total_sessions = WorkoutSession.query.filter_by(user_id=current_user_id).count()
    completed_sessions = WorkoutSession.query.filter_by(user_id=current_user_id)\
        .filter(WorkoutSession.completed_at.isnot(None)).count()
    
    # Total time
    sessions = WorkoutSession.query.filter_by(user_id=current_user_id).all()
    total_minutes = sum(s.duration_minutes for s in sessions if s.duration_minutes)
    total_calories = sum(s.calories_burned for s in sessions if s.calories_burned)
    
    return jsonify({
        'total_sessions': total_sessions,
        'completed_sessions': completed_sessions,
        'total_minutes': total_minutes,
        'total_calories': total_calories
    }), 200
