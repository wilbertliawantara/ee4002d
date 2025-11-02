/**
 * Frontend Input Validation Utilities
 * Validates user input before sending to backend
 */

// Email validation regex (matches backend)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Username validation regex (alphanumeric + underscore)
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, error: string}}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();

  if (trimmed.length > 120) {
    return { valid: false, error: 'Email too long (max 120 characters)' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, error: null };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, error: string}}
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password too long (max 128 characters)' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasUppercase) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }

  if (!hasLowercase) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }

  if (!hasDigit) {
    return { valid: false, error: 'Password must contain a digit' };
  }

  return { valid: true, error: null };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {{valid: boolean, error: string}}
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { valid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 80) {
    return { valid: false, error: 'Username too long (max 80 characters)' };
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate number within range
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {{valid: boolean, error: string, value: number}}
 */
export const validateNumber = (value, fieldName, min, max) => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true, error: null, value: num };
};

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {string} fieldName - Name of field
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {boolean} required - Is field required
 * @returns {{valid: boolean, error: string}}
 */
export const validateString = (
  value,
  fieldName,
  minLength = 1,
  maxLength = 255,
  required = true
) => {
  if (!value || !value.trim()) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, error: null };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${maxLength} characters`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Sanitize text input (remove dangerous characters)
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text) return '';

  // Remove null bytes and control characters (except newline, tab, carriage return)
  return text
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 || char === '\n' || char === '\r' || char === '\t';
    })
    .join('');
};

/**
 * Validate workout exercise
 * @param {object} exercise - Exercise object {name, sets, reps}
 * @returns {{valid: boolean, errors: object}}
 */
export const validateExercise = (exercise) => {
  const errors = {};

  const nameValidation = validateString(exercise.name, 'Exercise name', 1, 120);
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
  }

  if (exercise.sets) {
    const setsValidation = validateNumber(exercise.sets, 'Sets', 1, 100);
    if (!setsValidation.valid) {
      errors.sets = setsValidation.error;
    }
  }

  if (exercise.reps) {
    const repsValidation = validateNumber(exercise.reps, 'Reps', 1, 1000);
    if (!repsValidation.valid) {
      errors.reps = repsValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate registration form
 * @param {object} data - Form data {email, password, username, name}
 * @returns {{valid: boolean, errors: object}}
 */
export const validateRegistration = (data) => {
  const errors = {};

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }

  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.valid) {
    errors.username = usernameValidation.error;
  }

  if (data.name) {
    const nameValidation = validateString(data.name, 'Name', 1, 120, false);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate profile update
 * @param {object} data - Profile data
 * @returns {{valid: boolean, errors: object}}
 */
export const validateProfile = (data) => {
  const errors = {};

  if (data.name !== undefined) {
    const nameValidation = validateString(data.name, 'Name', 1, 120, false);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error;
    }
  }

  if (data.height_cm !== undefined) {
    const heightValidation = validateNumber(data.height_cm, 'Height', 50, 300);
    if (!heightValidation.valid) {
      errors.height_cm = heightValidation.error;
    }
  }

  if (data.weight_kg !== undefined) {
    const weightValidation = validateNumber(data.weight_kg, 'Weight', 20, 500);
    if (!weightValidation.valid) {
      errors.weight_kg = weightValidation.error;
    }
  }

  if (data.fitness_level !== undefined) {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(data.fitness_level)) {
      errors.fitness_level = 'Fitness level must be beginner, intermediate, or advanced';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate chat message
 * @param {string} message - Chat message
 * @returns {{valid: boolean, error: string}}
 */
export const validateChatMessage = (message) => {
  if (!message || !message.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (message.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }

  return { valid: true, error: null };
};

/**
 * Format validation errors for display
 * @param {object} errors - Errors object from validation
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  const errorMessages = Object.values(errors);
  if (errorMessages.length === 0) return '';
  if (errorMessages.length === 1) return errorMessages[0];
  return errorMessages.join('\n');
};
