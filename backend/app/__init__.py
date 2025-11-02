from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Custom function to skip rate limiting for OPTIONS requests
def get_remote_address_skip_options():
    from flask import request
    if request.method == 'OPTIONS':
        return None  # Skip rate limiting for OPTIONS
    return get_remote_address()

limiter = Limiter(
    key_func=get_remote_address_skip_options,  # Rate limit by IP, but skip OPTIONS
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",  # Use in-memory storage (for development)
)


def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    
    # Rate limit error handler
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.',
            'retry_after': e.description
        }), 429
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"DEBUG: Token expired! {jwt_payload}")
        return jsonify({'error': 'Token has expired'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"DEBUG: Invalid token! Error: {error}")
        return jsonify({'error': 'Invalid token', 'message': str(error)}), 422
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"DEBUG: No authorization header! Error: {error}")
        return jsonify({'error': 'Missing authorization header'}), 401
    
    # Configure CORS to allow frontend requests
    CORS(app, 
         resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Add request logging
    @app.before_request
    def log_request():
        from flask import request
        print(f"DEBUG: {request.method} {request.path}")
        print(f"DEBUG: Headers: Authorization={request.headers.get('Authorization', 'MISSING')}")
        print(f"DEBUG: Content-Type={request.headers.get('Content-Type')}")
    
    # Register blueprints
    from app.routes import auth, workouts, llm, pose, habits
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(workouts.bp, url_prefix='/api/workouts')
    app.register_blueprint(llm.bp, url_prefix='/api/llm')
    app.register_blueprint(pose.bp, url_prefix='/api/pose')
    app.register_blueprint(habits.bp, url_prefix='/api/habits')
    
    # Initialize LLM service
    with app.app_context():
        from app.services.llm_service import llm_service
        llm_service.initialize()
    
    # Health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'message': 'Fitness Companion API is running'}, 200
    
    # Create upload folder
    import os
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    return app
