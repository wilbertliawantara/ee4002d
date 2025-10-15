from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.llm_service import llm_service
from app.models import LLMConversation
import uuid

bp = Blueprint('llm', __name__)


@bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """Send a message to the LLM and get a response"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    print(f"DEBUG: Received data: {data}")
    print(f"DEBUG: User ID: {current_user_id}")
    
    if not data or not data.get('message'):
        print("DEBUG: Missing message in request")
        return jsonify({'error': 'Missing message'}), 400
    
    # Get or create session ID
    session_id = data.get('session_id') or str(uuid.uuid4())
    user_message = data['message']
    
    print(f"DEBUG: Generating response for message: {user_message[:50]}...")
    
    try:
        # Generate response
        response = llm_service.generate_response(
            user_id=current_user_id,
            user_message=user_message,
            session_id=session_id
        )
        
        print(f"DEBUG: Got response: {response}")
        
        return jsonify({
            'session_id': session_id,
            'message': response['message'],
            'model': response.get('model'),
            'tokens_used': response.get('tokens_used', 0)
        }), 200
    except Exception as e:
        print(f"DEBUG: Error generating response: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@bp.route('/motivation', methods=['GET'])
@jwt_required()
def get_motivation():
    """Get a motivational message"""
    current_user_id = int(get_jwt_identity())
    
    message = llm_service.generate_motivation(current_user_id)
    
    return jsonify({
        'message': message
    }), 200


@bp.route('/history', methods=['GET'])
@jwt_required()
def get_conversation_history():
    """Get conversation history for a session"""
    current_user_id = int(get_jwt_identity())
    session_id = request.args.get('session_id', 'default')
    limit = request.args.get('limit', 50, type=int)
    
    messages = LLMConversation.query.filter_by(
        user_id=current_user_id,
        session_id=session_id
    ).order_by(LLMConversation.timestamp.desc()).limit(limit).all()
    
    return jsonify({
        'messages': [m.to_dict() for m in reversed(messages)]
    }), 200


@bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_chat_sessions():
    """Get all chat session IDs for current user"""
    current_user_id = int(get_jwt_identity())
    
    # Get distinct session IDs
    sessions = LLMConversation.query.filter_by(user_id=current_user_id)\
        .distinct(LLMConversation.session_id)\
        .order_by(LLMConversation.session_id, LLMConversation.timestamp.desc())\
        .all()
    
    session_ids = list(set([s.session_id for s in sessions]))
    
    return jsonify({
        'sessions': session_ids
    }), 200
