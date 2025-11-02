import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authAPI } from '../services/api';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRegistration,
  formatValidationErrors,
} from '../utils/validation';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (value) => {
    setEmail(value);
    if (value.trim()) {
      const validation = validateEmail(value);
      setEmailError(validation.valid ? '' : validation.error);
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (value) {
      const validation = validatePassword(value);
      setPasswordError(validation.valid ? '' : validation.error);
    } else {
      setPasswordError('');
    }
  };

  const handleUsernameChange = (value) => {
    setUsername(value);
    if (value.trim()) {
      const validation = validateUsername(value);
      setUsernameError(validation.valid ? '' : validation.error);
    } else {
      setUsernameError('');
    }
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    if (value) {
      const validation = validatePassword(value);
      setNewPasswordError(validation.valid ? '' : validation.error);
    } else {
      setNewPasswordError('');
    }
  };

  const handleForgotPassword = async () => {
    // Validate email
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.valid) {
      setErrorMessage(emailValidation.error);
      return;
    }

    // Validate username
    const usernameValidation = validateUsername(username.trim());
    if (!usernameValidation.valid) {
      setErrorMessage(usernameValidation.error);
      return;
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setErrorMessage(passwordValidation.error);
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const response = await authAPI.resetPassword(
        email.trim(),
        username.trim(),
        newPassword
      );
      
      setSuccessMessage('✅ Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
        setPassword('');
        setNewPassword('');
        setEmail('');
        setUsername('');
        setSuccessMessage('');
        setErrorMessage('');
      }, 2500);
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.data?.details) {
        setErrorMessage('❌ ' + formatValidationErrors(error.response.data.details));
      } else {
        setErrorMessage('❌ ' + (error.response?.data?.error || 'Could not reset password. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Trim inputs
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    // Validate inputs
    if (isLogin) {
      // Login validation
      const emailValidation = validateEmail(trimmedEmail);
      if (!emailValidation.valid) {
        Alert.alert('Validation Error', emailValidation.error);
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        Alert.alert('Validation Error', passwordValidation.error);
        return;
      }
    } else {
      // Registration validation
      const validation = validateRegistration({
        email: trimmedEmail,
        password,
        username: trimmedUsername,
        name: trimmedName,
      });

      if (!validation.valid) {
        Alert.alert('Validation Error', formatValidationErrors(validation.errors));
        return;
      }
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      if (isLogin) {
        const response = await authAPI.login(trimmedEmail, password);
        setSuccessMessage(`✅ Welcome back, ${response.user.name || response.user.username}!`);
        setTimeout(() => {
          onLoginSuccess(response.user);
        }, 1000);
      } else {
        const response = await authAPI.register({
          email: trimmedEmail,
          password,
          username: trimmedUsername,
          name: trimmedName,
          fitness_level: 'beginner',
        });
        setSuccessMessage(`🎉 Account created! Welcome, ${response.user.name || response.user.username}!`);
        setTimeout(() => {
          onLoginSuccess(response.user);
        }, 1500);
      }
    } catch (error) {
      console.error('Request error:', error);
      
      // Parse backend validation errors
      if (error.response?.data?.details) {
        const backendErrors = error.response.data.details;
        setErrorMessage('❌ ' + formatValidationErrors(backendErrors));
      } else if (error.response?.status === 409) {
        // Handle duplicate email/username
        setErrorMessage('⚠️ ' + (error.response?.data?.error || 'This email or username is already registered.'));
      } else if (error.response?.status === 401) {
        // Handle wrong password
        setErrorMessage('🔒 Invalid email or password. Please try again.');
      } else {
        setErrorMessage('❌ ' + (error.response?.data?.error || 'Something went wrong. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>💪 Fitness Companion</Text>
        <Text style={styles.subtitle}>
          {isForgotPassword
            ? 'Reset your password'
            : isLogin 
            ? 'Sore today, strong tomorrow 💯'
            : 'Your only limit is you 🔥'}
        </Text>

        {successMessage ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {isForgotPassword ? (
            // Forgot Password Form
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Email"
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, usernameError ? styles.inputError : null]}
                  placeholder="Username (for verification)"
                  value={username}
                  onChangeText={handleUsernameChange}
                  autoCapitalize="none"
                />
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, newPasswordError ? styles.inputError : null]}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  secureTextEntry
                />
                {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
                {!newPasswordError && newPassword.length > 0 && (
                  <Text style={styles.hintText}>
                    Min 8 chars, uppercase, lowercase, and digit
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsForgotPassword(false);
                  setEmail('');
                  setUsername('');
                  setNewPassword('');
                }}
                style={styles.switchButton}
              >
                <Text style={styles.switchText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Login/Register Form
            <>
              {!isLogin && (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, usernameError ? styles.inputError : null]}
                  placeholder="Username"
                  value={username}
                  onChangeText={handleUsernameChange}
                  autoCapitalize="none"
                />
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full Name (optional)"
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Email"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            {!isLogin && !passwordError && password.length > 0 && (
              <Text style={styles.hintText}>
                Min 8 chars, uppercase, lowercase, and digit
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity
              onPress={() => {
                setIsForgotPassword(true);
                setPassword('');
              }}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            No pain, no gain... but we'll make it fun! 😎
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  successText: {
    color: '#155724',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  errorText: {
    color: '#721c24',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
});
