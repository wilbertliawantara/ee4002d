/**
 * Frontend Configuration
 * Centralized config for API URLs and security settings
 */

// Determine environment
const isDevelopment = __DEV__;

// API Base URLs
const API_URLS = {
  development: {
    // Android emulator
    android: 'http://10.0.2.2:5000/api',
    // iOS simulator
    ios: 'http://localhost:5000/api',
    // Web browser
    web: 'http://localhost:5000/api',
  },
  production: {
    // Replace with your production API URL
    android: 'https://your-api.com/api',
    ios: 'https://your-api.com/api',
    web: 'https://your-api.com/api',
  },
};

// Get platform-specific API URL
const getApiUrl = () => {
  const env = isDevelopment ? 'development' : 'production';
  const platform = require('react-native').Platform.OS;
  return API_URLS[env][platform] || API_URLS[env].web;
};

export const config = {
  // API Configuration
  API_BASE_URL: getApiUrl(),

  // Security Settings
  ENFORCE_HTTPS: !isDevelopment, // Enforce HTTPS in production
  
  // Validation Limits
  MAX_EMAIL_LENGTH: 120,
  MAX_USERNAME_LENGTH: 80,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,
  MAX_MESSAGE_LENGTH: 500,
  MAX_NOTES_LENGTH: 2000,
  
  // Number Ranges
  HEIGHT_MIN: 50, // cm
  HEIGHT_MAX: 300,
  WEIGHT_MIN: 20, // kg
  WEIGHT_MAX: 500,
  DURATION_MIN: 1, // minutes
  DURATION_MAX: 600,
  CALORIES_MIN: 0,
  CALORIES_MAX: 10000,
  
  // Allowed Values
  FITNESS_LEVELS: ['beginner', 'intermediate', 'advanced'],
  WORKOUT_DIFFICULTIES: ['easy', 'medium', 'hard'],
  SESSION_TYPES: ['camera', 'manual'],
  
  // Token Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
  },
  
  // Request Timeout
  TIMEOUT: 30000, // 30 seconds
};

export default config;
