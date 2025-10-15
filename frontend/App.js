import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, TouchableOpacity, Text } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import CameraWorkoutScreen from './src/screens/CameraWorkoutScreen';
import ManualWorkoutScreen from './src/screens/ManualWorkoutScreen';
import HabitsScreen from './src/screens/HabitsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    setIsLoggedIn(false);
  };

  if (loading) {
    return null; // Or a splash screen
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {!isLoggedIn ? (
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
            >
              {(props) => (
                <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: '💪 Fitness Companion',
                  headerRight: () => (
                    <TouchableOpacity
                      onPress={handleLogout}
                      style={{ marginRight: 15 }}
                    >
                      <Text style={{ color: '#fff', fontSize: 16 }}>
                        Logout
                      </Text>
                    </TouchableOpacity>
                  ),
                }}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                  title: 'AI Coach',
                  headerStyle: { backgroundColor: '#FF9800' },
                }}
              />
              <Stack.Screen
                name="Camera"
                component={CameraWorkoutScreen}
                options={{
                  title: 'Camera Workout',
                  headerStyle: { backgroundColor: '#4CAF50' },
                }}
              />
              <Stack.Screen
                name="ManualWorkout"
                component={ManualWorkoutScreen}
                options={{
                  title: 'Log Workout',
                  headerStyle: { backgroundColor: '#2196F3' },
                }}
              />
              <Stack.Screen
                name="Habits"
                component={HabitsScreen}
                options={{
                  title: 'Habit Tracker',
                  headerStyle: { backgroundColor: '#9C27B0' },
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
