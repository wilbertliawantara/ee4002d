import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { workoutsAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function WorkoutHistoryScreen() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [sessionsData, statsData] = await Promise.all([
        workoutsAPI.getSessions(),
        workoutsAPI.getStats(),
      ]);
      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading workout history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'camera':
        return '📸';
      case 'manual':
        return '✏️';
      case 'guided':
        return '🎯';
      default:
        return '💪';
    }
  };

  const handleDeleteWorkout = async (sessionId) => {
    const confirmed = window.confirm('Are you sure you want to delete this workout? This cannot be undone.');
    
    if (confirmed) {
      try {
        await workoutsAPI.deleteSession(sessionId);
        // Show success message
        window.alert('Workout deleted successfully!');
        // Refresh the list
        loadData();
      } catch (error) {
        console.error('Delete error:', error);
        window.alert('Could not delete workout. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Workout History</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </View>

      {stats && (
        <View style={styles.statsCard}>
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
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💪</Text>
            <Text style={styles.emptyText}>
              No workouts yet! Start your first workout to see your progress here.
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionTitle}>
                  <Text style={styles.sessionIcon}>
                    {getSessionTypeIcon(session.session_type)}
                  </Text>
                  <View>
                    <Text style={styles.sessionType}>
                      {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Workout
                    </Text>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.started_at)} at {formatTime(session.started_at)}
                    </Text>
                  </View>
                </View>
                {session.completed_at && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓</Text>
                  </View>
                )}
              </View>

              <View style={styles.sessionDetails}>
                {session.duration_minutes && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>⏱️</Text>
                    <Text style={styles.detailText}>{session.duration_minutes} min</Text>
                  </View>
                )}
                {session.calories_burned && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🔥</Text>
                    <Text style={styles.detailText}>{session.calories_burned} cal</Text>
                  </View>
                )}
                {session.exercises_completed && session.exercises_completed.length > 0 && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>💪</Text>
                    <Text style={styles.detailText}>
                      {session.exercises_completed.length} exercises
                    </Text>
                  </View>
                )}
              </View>

              {session.exercises_completed && session.exercises_completed.length > 0 && (
                <View style={styles.exercisesList}>
                  {session.exercises_completed.map((exercise, index) => (
                    <View key={index} style={styles.exerciseItem}>
                      <Text style={styles.exerciseName}>• {exercise.name}</Text>
                      {exercise.sets && exercise.reps && (
                        <Text style={styles.exerciseDetails}>
                          {exercise.sets} × {exercise.reps}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {session.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{session.notes}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteWorkout(session.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete Workout</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  statsCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginHorizontal: 15,
    marginTop: -20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 15,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  sessionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  sessionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  exercisesList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  exerciseName: {
    fontSize: 14,
    color: '#333',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  notesLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  deleteButton: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
});
