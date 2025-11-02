import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { workoutsAPI, llmAPI, habitsAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [habits, setHabits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState({
    stats: true,
    motivation: true,
    habits: true
  });

  // Refresh data every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Load fast data first (stats and habits)
      Promise.all([
        workoutsAPI.getStats(),
        habitsAPI.getHabits(true),
      ]).then(([statsData, habitsData]) => {
        setStats(statsData);
        setHabits(habitsData);
        setLoading(prev => ({ ...prev, stats: false, habits: false }));
      }).catch(error => {
        console.error('Error loading stats/habits:', error);
        setLoading(prev => ({ ...prev, stats: false, habits: false }));
        
        // Check for authentication errors
        if (error.response?.status === 401 || error.response?.status === 422) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                },
              },
            ]
          );
        }
      });

      // Load slow AI data separately (doesn't block UI)
      llmAPI.getMotivation()
        .then(motivationData => {
          setMotivation(motivationData);
          setLoading(prev => ({ ...prev, motivation: false }));
        })
        .catch(error => {
          console.error('Error loading motivation:', error);
          setMotivation('Stay consistent! Every workout counts. 💪');
          setLoading(prev => ({ ...prev, motivation: false }));
        });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const result = await habitsAPI.completeHabit(habitId);
      Alert.alert(
        'Great job! 🎉',
        result.streak_milestone
          ? `Streak milestone: ${result.habit.current_streak} days!`
          : `Current streak: ${result.habit.current_streak} days`
      );
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Could not complete habit');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.name || user?.username || 'Athlete'}! 👋
          </Text>
          <Text style={styles.level}>
            Level: {user?.fitness_level || 'Beginner'}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Motivation Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Daily Motivation</Text>
          {loading.motivation ? (
            <View style={styles.loadingSkeleton}>
              <Text style={styles.loadingText}>Loading your daily motivation...</Text>
            </View>
          ) : (
            <Text style={styles.motivationText}>{motivation}</Text>
          )}
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📊 Your Progress</Text>
              <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory')}>
                <Text style={styles.viewAllText}>View All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completed_sessions}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_minutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_calories || 0}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </View>
        )}

        {/* Active Habits */}
        {habits.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔥 Active Habits</Text>
            {habits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={styles.habitItem}
                onPress={() => handleCompleteHabit(habit.id)}
              >
                <View>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitStreak}>
                    🔥 {habit.current_streak} day streak
                  </Text>
                </View>
                <Text style={styles.habitCheck}>✓</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Quick Actions</Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.actionIcon}>📸</Text>
            <Text style={styles.actionText}>Start Camera Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={() => navigation.navigate('ManualWorkout')}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionText}>Log Workout Manually</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Chat with AI Coach</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
            onPress={() => navigation.navigate('Habits')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Manage Habits</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  level: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  loadingSkeleton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontStyle: 'italic',
  },
  motivationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  habitStreak: {
    fontSize: 14,
    color: '#FF5722',
    marginTop: 4,
  },
  habitCheck: {
    fontSize: 24,
    color: '#4CAF50',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
