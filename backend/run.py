import os
from app import create_app, db

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Create Flask app
app = create_app(os.getenv('FLASK_ENV', 'development'))


@app.cli.command()
def init_db():
    """Initialize the database"""
    db.create_all()
    print("Database initialized!")


@app.cli.command()
def seed_db():
    """Seed database with sample data"""
    from app.models import User, WorkoutRoutine
    import json
    
    # Create sample user
    user = User(
        email='demo@fitness.com',
        username='demo_user',
        name='Demo User',
        fitness_level='intermediate',
        goals=json.dumps(['Build muscle', 'Improve endurance'])
    )
    user.set_password('demo123')
    
    db.session.add(user)
    db.session.commit()
    
    # Create sample routine
    routine = WorkoutRoutine(
        user_id=user.id,
        name='Full Body Workout',
        description='A comprehensive full-body workout routine',
        exercises=[
            {'name': 'Squats', 'sets': 3, 'reps': 12},
            {'name': 'Push-ups', 'sets': 3, 'reps': 15},
            {'name': 'Planks', 'sets': 3, 'duration': 60}
        ],
        difficulty='medium',
        estimated_duration_minutes=30,
        is_camera_based=True
    )
    
    db.session.add(routine)
    db.session.commit()
    
    print(f"Sample data created!")
    print(f"Email: demo@fitness.com")
    print(f"Password: demo123")


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )
