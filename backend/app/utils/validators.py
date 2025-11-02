"""Input validation utilities for API endpoints"""

import re
from datetime import datetime


class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, message, field=None):
        self.message = message
        self.field = field
        super().__init__(self.message)


class Validator:
    """Input validation helper class"""
    
    # Email regex (RFC 5322 simplified)
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    # Allowed values for enum fields
    FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced']
    WORKOUT_DIFFICULTIES = ['easy', 'medium', 'hard']
    SESSION_TYPES = ['camera', 'manual']
    HABIT_FREQUENCIES = ['daily', 'weekly', 'custom']
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        if not email:
            raise ValidationError("Email is required", "email")
        
        if not isinstance(email, str):
            raise ValidationError("Email must be a string", "email")
        
        email = email.strip()
        
        if len(email) > 120:
            raise ValidationError("Email too long (max 120 characters)", "email")
        
        if not Validator.EMAIL_REGEX.match(email):
            raise ValidationError("Invalid email format", "email")
        
        return email.lower()  # Normalize to lowercase
    
    @staticmethod
    def validate_password(password, min_length=8, max_length=128):
        """Validate password strength"""
        if not password:
            raise ValidationError("Password is required", "password")
        
        if not isinstance(password, str):
            raise ValidationError("Password must be a string", "password")
        
        if len(password) < min_length:
            raise ValidationError(f"Password too short (min {min_length} characters)", "password")
        
        if len(password) > max_length:
            raise ValidationError(f"Password too long (max {max_length} characters)", "password")
        
        # Check complexity
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        
        if not (has_upper and has_lower and has_digit):
            raise ValidationError(
                "Password must contain uppercase, lowercase, and digit",
                "password"
            )
        
        return password
    
    @staticmethod
    def validate_username(username, min_length=3, max_length=80):
        """Validate username"""
        if not username:
            raise ValidationError("Username is required", "username")
        
        if not isinstance(username, str):
            raise ValidationError("Username must be a string", "username")
        
        username = username.strip()
        
        if len(username) < min_length:
            raise ValidationError(f"Username too short (min {min_length} characters)", "username")
        
        if len(username) > max_length:
            raise ValidationError(f"Username too long (max {max_length} characters)", "username")
        
        # Only alphanumeric and underscore
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            raise ValidationError("Username can only contain letters, numbers, and underscores", "username")
        
        return username
    
    @staticmethod
    def validate_string(value, field_name, min_length=1, max_length=255, required=True):
        """Validate generic string field"""
        if value is None:
            if required:
                raise ValidationError(f"{field_name} is required", field_name)
            return None
        
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string", field_name)
        
        value = value.strip()
        
        if required and len(value) < min_length:
            raise ValidationError(f"{field_name} too short (min {min_length} characters)", field_name)
        
        if len(value) > max_length:
            raise ValidationError(f"{field_name} too long (max {max_length} characters)", field_name)
        
        return value
    
    @staticmethod
    def validate_number(value, field_name, min_val=None, max_val=None, required=True, allow_float=True):
        """Validate numeric field"""
        if value is None:
            if required:
                raise ValidationError(f"{field_name} is required", field_name)
            return None
        
        try:
            if allow_float:
                value = float(value)
            else:
                value = int(value)
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a number", field_name)
        
        if min_val is not None and value < min_val:
            raise ValidationError(f"{field_name} too small (min {min_val})", field_name)
        
        if max_val is not None and value > max_val:
            raise ValidationError(f"{field_name} too large (max {max_val})", field_name)
        
        return value
    
    @staticmethod
    def validate_enum(value, field_name, allowed_values, required=True):
        """Validate enum field (must be one of allowed values)"""
        if value is None:
            if required:
                raise ValidationError(f"{field_name} is required", field_name)
            return None
        
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string", field_name)
        
        value = value.lower().strip()
        
        if value not in allowed_values:
            raise ValidationError(
                f"{field_name} must be one of: {', '.join(allowed_values)}",
                field_name
            )
        
        return value
    
    @staticmethod
    def validate_boolean(value, field_name, required=True):
        """Validate boolean field"""
        if value is None:
            if required:
                raise ValidationError(f"{field_name} is required", field_name)
            return None
        
        if not isinstance(value, bool):
            raise ValidationError(f"{field_name} must be a boolean", field_name)
        
        return value
    
    @staticmethod
    def validate_json(value, field_name, required=True):
        """Validate JSON field (dict or list)"""
        if value is None:
            if required:
                raise ValidationError(f"{field_name} is required", field_name)
            return None
        
        if not isinstance(value, (dict, list)):
            raise ValidationError(f"{field_name} must be a JSON object or array", field_name)
        
        return value
    
    @staticmethod
    def validate_datetime_iso(value, field_name, required=True):
        """Validate ISO datetime string"""
        if value is None:
            if required:
                raise ValidationError(f"{field_name} is required", field_name)
            return None
        
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be an ISO datetime string", field_name)
        
        try:
            dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
            return dt
        except (ValueError, AttributeError):
            raise ValidationError(f"{field_name} must be a valid ISO datetime", field_name)
    
    @staticmethod
    def sanitize_text(text, max_length=5000):
        """Sanitize text input (strip dangerous characters)"""
        if not text:
            return ""
        
        if not isinstance(text, str):
            return ""
        
        # Remove null bytes and other control characters
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
        
        # Truncate if too long
        if len(text) > max_length:
            text = text[:max_length]
        
        return text.strip()


def validate_user_registration(data):
    """Validate user registration data"""
    errors = {}
    validated = {}
    
    try:
        validated['email'] = Validator.validate_email(data.get('email'))
    except ValidationError as e:
        errors[e.field] = e.message
    
    try:
        validated['password'] = Validator.validate_password(data.get('password'))
    except ValidationError as e:
        errors[e.field] = e.message
    
    try:
        validated['username'] = Validator.validate_username(data.get('username'))
    except ValidationError as e:
        errors[e.field] = e.message
    
    try:
        validated['name'] = Validator.validate_string(
            data.get('name'), 'name', max_length=120, required=False
        )
    except ValidationError as e:
        errors[e.field] = e.message
    
    try:
        validated['fitness_level'] = Validator.validate_enum(
            data.get('fitness_level', 'beginner'),
            'fitness_level',
            Validator.FITNESS_LEVELS,
            required=False
        )
    except ValidationError as e:
        errors[e.field] = e.message
    
    if errors:
        return None, errors
    
    return validated, None


def validate_user_profile_update(data):
    """Validate user profile update data"""
    errors = {}
    validated = {}
    
    if 'name' in data:
        try:
            validated['name'] = Validator.validate_string(
                data.get('name'), 'name', max_length=120, required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'height_cm' in data:
        try:
            validated['height_cm'] = Validator.validate_number(
                data.get('height_cm'), 'height_cm',
                min_val=50, max_val=300,  # Realistic human height range
                required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'weight_kg' in data:
        try:
            validated['weight_kg'] = Validator.validate_number(
                data.get('weight_kg'), 'weight_kg',
                min_val=20, max_val=500,  # Realistic weight range
                required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'fitness_level' in data:
        try:
            validated['fitness_level'] = Validator.validate_enum(
                data.get('fitness_level'), 'fitness_level',
                Validator.FITNESS_LEVELS,
                required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'goals' in data:
        try:
            validated['goals'] = Validator.validate_json(
                data.get('goals'), 'goals', required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if errors:
        return None, errors
    
    return validated, None


def validate_workout_routine(data, is_update=False):
    """Validate workout routine data"""
    errors = {}
    validated = {}
    
    try:
        validated['name'] = Validator.validate_string(
            data.get('name'), 'name', max_length=120, required=not is_update
        )
    except ValidationError as e:
        errors[e.field] = e.message
    
    if 'description' in data:
        try:
            validated['description'] = Validator.sanitize_text(
                data.get('description'), max_length=2000
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'exercises' in data:
        try:
            validated['exercises'] = Validator.validate_json(
                data.get('exercises'), 'exercises', required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'difficulty' in data:
        try:
            validated['difficulty'] = Validator.validate_enum(
                data.get('difficulty'), 'difficulty',
                Validator.WORKOUT_DIFFICULTIES,
                required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'estimated_duration_minutes' in data:
        try:
            validated['estimated_duration_minutes'] = Validator.validate_number(
                data.get('estimated_duration_minutes'),
                'estimated_duration_minutes',
                min_val=1, max_val=600,  # 1 min to 10 hours
                required=False,
                allow_float=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'is_camera_based' in data:
        try:
            validated['is_camera_based'] = Validator.validate_boolean(
                data.get('is_camera_based'), 'is_camera_based', required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if errors:
        return None, errors
    
    return validated, None


def validate_workout_session(data, is_update=False):
    """Validate workout session data"""
    errors = {}
    validated = {}
    
    if 'session_type' in data:
        try:
            validated['session_type'] = Validator.validate_enum(
                data.get('session_type'), 'session_type',
                Validator.SESSION_TYPES,
                required=not is_update
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'started_at' in data:
        try:
            validated['started_at'] = Validator.validate_datetime_iso(
                data.get('started_at'), 'started_at', required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'completed_at' in data:
        try:
            validated['completed_at'] = Validator.validate_datetime_iso(
                data.get('completed_at'), 'completed_at', required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'duration_minutes' in data:
        try:
            validated['duration_minutes'] = Validator.validate_number(
                data.get('duration_minutes'),
                'duration_minutes',
                min_val=1, max_val=600,
                required=False,
                allow_float=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'calories_burned' in data:
        try:
            validated['calories_burned'] = Validator.validate_number(
                data.get('calories_burned'),
                'calories_burned',
                min_val=0, max_val=10000,
                required=False,
                allow_float=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'exercises_completed' in data:
        try:
            validated['exercises_completed'] = Validator.validate_json(
                data.get('exercises_completed'), 'exercises_completed', required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'notes' in data:
        validated['notes'] = Validator.sanitize_text(data.get('notes'), max_length=2000)
    
    if errors:
        return None, errors
    
    return validated, None


def validate_habit(data, is_update=False):
    """Validate habit data"""
    errors = {}
    validated = {}
    
    try:
        validated['name'] = Validator.validate_string(
            data.get('name'), 'name', max_length=120, required=not is_update
        )
    except ValidationError as e:
        errors[e.field] = e.message
    
    if 'frequency' in data:
        try:
            validated['frequency'] = Validator.validate_enum(
                data.get('frequency'), 'frequency',
                Validator.HABIT_FREQUENCIES,
                required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'schedule' in data:
        try:
            validated['schedule'] = Validator.validate_json(
                data.get('schedule'), 'schedule', required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if 'is_active' in data:
        try:
            validated['is_active'] = Validator.validate_boolean(
                data.get('is_active'), 'is_active', required=False
            )
        except ValidationError as e:
            errors[e.field] = e.message
    
    if errors:
        return None, errors
    
    return validated, None
