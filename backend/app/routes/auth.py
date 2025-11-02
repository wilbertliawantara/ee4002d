from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db, limiter
from app.models import User
from app.utils import validate_user_registration, validate_user_profile_update, ValidationError
from datetime import datetime
import json

bp = Blueprint('auth', __name__)


@bp.route('/register', methods=['POST'])
@limiter.limit("5 per hour")  # Max 5 registrations per hour per IP
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate input
    validated, errors = validate_user_registration(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Check if user exists
    if User.query.filter_by(email=validated['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=validated['username']).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create user
    user = User(
        email=validated['email'],
        username=validated['username'],
        name=validated.get('name', ''),
        fitness_level=validated.get('fitness_level', 'beginner')
    )
    user.set_password(validated['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens (user.id must be string)
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")  # Max 10 login attempts per minute per IP
def login():
    """Login user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate tokens (user.id must be string)
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@limiter.limit("30 per hour")  # Max 30 token refreshes per hour
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    
    return jsonify({'access_token': access_token}), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    current_user_id = int(get_jwt_identity())  # Convert string back to int
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200


@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    current_user_id = int(get_jwt_identity())  # Convert string back to int
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate input
    validated, errors = validate_user_profile_update(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Update allowed fields
    if 'name' in validated:
        user.name = validated['name']
    if 'height_cm' in validated:
        user.height_cm = validated['height_cm']
    if 'weight_kg' in validated:
        user.weight_kg = validated['weight_kg']
    if 'fitness_level' in validated:
        user.fitness_level = validated['fitness_level']
    if 'goals' in validated:
        user.goals = json.dumps(validated['goals'])
    
    user.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200


@bp.route('/reset-password', methods=['POST'])
@limiter.limit("3 per hour")  # Max 3 password reset attempts per hour
def reset_password():
    """Reset password (simplified - no email verification for development)"""
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email'].lower().strip()).first()
    
    # Always return success to prevent email enumeration
    # (don't reveal whether email exists in database)
    if not user:
        return jsonify({
            'message': 'If this email exists, a password reset link would be sent. For development, contact admin.',
            'dev_hint': 'User not found - in production, this would send an email'
        }), 200
    
    # For development: Allow direct password reset with username verification
    if data.get('username') and data.get('new_password'):
        # Verify username matches
        if user.username != data.get('username'):
            return jsonify({'error': 'Username does not match this email'}), 400
        
        # Validate new password
        from app.utils import Validator
        try:
            Validator.validate_password(data.get('new_password'))
        except ValidationError as e:
            return jsonify({'error': e.message}), 400
        
        # Reset password
        user.set_password(data.get('new_password'))
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Password reset successfully! You can now login with your new password.'
        }), 200
    
    # Return generic message (production would send email)
    return jsonify({
        'message': 'If this email exists, you can reset your password by providing your username and new password.',
        'dev_hint': 'Send POST with email, username, and new_password to reset'
    }), 200
