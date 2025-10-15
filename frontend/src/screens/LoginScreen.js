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

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('handleSubmit called', { isLogin, email, username, password: '***' });
    
    if (!email || !password || (!isLogin && !username)) {
      console.log('Validation failed');
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    console.log('Starting request...');
    setLoading(true);
    try {
      if (isLogin) {
        console.log('Attempting login...');
        const response = await authAPI.login(email, password);
        console.log('Login successful:', response);
        Alert.alert('Success', 'Welcome back!');
        onLoginSuccess(response.user);
      } else {
        console.log('Attempting registration...');
        const response = await authAPI.register({
          email,
          password,
          username,
          name,
          fitness_level: 'beginner',
        });
        console.log('Registration successful:', response);
        Alert.alert('Success', 'Account created successfully!');
        onLoginSuccess(response.user);
      }
    } catch (error) {
      console.error('Request error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Something went wrong. Please try again.'
      );
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
          AI-powered workout coach with pose detection
        </Text>

        <View style={styles.form}>
          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name (optional)"
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

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
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🆓 100% Free • Google Gemini AI • Local PostgreSQL
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
});
