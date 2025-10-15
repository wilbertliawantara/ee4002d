from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import PoseAnalysis, WorkoutSession
from app.services.llm_service import llm_service
from datetime import datetime

bp = Blueprint('pose', __name__)


@bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_pose():
    """Analyze pose data from camera workout
    
    Expected payload:
    {
        "session_id": 123,
        "exercise_name": "squat",
        "keypoints": [...],  # MediaPipe pose landmarks
        "form_score": 85,
        "rep_count": 10,
        "range_of_motion": 90
    }
    """
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('session_id') or not data.get('exercise_name'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Verify session belongs to user
    session = WorkoutSession.query.filter_by(
        id=data['session_id'],
        user_id=current_user_id
    ).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # Create pose analysis record
    analysis = PoseAnalysis(
        session_id=data['session_id'],
        exercise_name=data['exercise_name'],
        keypoints=data.get('keypoints', []),
        form_score=data.get('form_score', 0),
        rep_count=data.get('rep_count', 0),
        range_of_motion=data.get('range_of_motion', 0)
    )
    
    # Generate AI feedback
    feedback = llm_service.analyze_pose_feedback(
        user_id=current_user_id,
        pose_data={
            'form_score': analysis.form_score,
            'rep_count': analysis.rep_count,
            'range_of_motion': analysis.range_of_motion
        },
        exercise_name=analysis.exercise_name
    )
    
    analysis.feedback_text = feedback
    
    db.session.add(analysis)
    db.session.commit()
    
    return jsonify({
        'message': 'Pose analyzed successfully',
        'analysis': analysis.to_dict(),
        'feedback': feedback
    }), 201


@bp.route('/session/<int:session_id>/analyses', methods=['GET'])
@jwt_required()
def get_session_analyses(session_id):
    """Get all pose analyses for a workout session"""
    current_user_id = int(get_jwt_identity())
    
    # Verify session belongs to user
    session = WorkoutSession.query.filter_by(
        id=session_id,
        user_id=current_user_id
    ).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    analyses = PoseAnalysis.query.filter_by(session_id=session_id)\
        .order_by(PoseAnalysis.timestamp.asc())\
        .all()
    
    return jsonify({
        'analyses': [a.to_dict() for a in analyses]
    }), 200


@bp.route('/feedback', methods=['POST'])
@jwt_required()
def get_pose_feedback():
    """Get real-time feedback on pose data without saving
    
    Useful for live camera workouts before final analysis
    """
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('exercise_name'):
        return jsonify({'error': 'Missing exercise_name'}), 400
    
    feedback = llm_service.analyze_pose_feedback(
        user_id=current_user_id,
        pose_data={
            'form_score': data.get('form_score', 0),
            'rep_count': data.get('rep_count', 0),
            'range_of_motion': data.get('range_of_motion', 0)
        },
        exercise_name=data['exercise_name']
    )
    
    return jsonify({
        'feedback': feedback
    }), 200
