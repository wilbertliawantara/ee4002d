import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { habitsAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function HabitsScreen() {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [frequency, setFrequency] = useState('weekly');

  // Refresh habits every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
    }, [])
  );

  const loadHabits = async () => {
    try {
      const data = await habitsAPI.getHabits();
      setHabits(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load habits');
    }
  };

  const createHabit = async () => {
    if (!newHabitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      await habitsAPI.createHabit({
        name: newHabitName,
        frequency,
        schedule: {
          days: [1, 3, 5], // Mon, Wed, Fri
          time: '07:00',
        },
      });

      setNewHabitName('');
      setModalVisible(false);
      loadHabits();
      Alert.alert('Success', 'Habit created! 🎯');
    } catch (error) {
      Alert.alert('Error', 'Could not create habit');
    }
  };

  const completeHabit = async (habitId) => {
    try {
      const result = await habitsAPI.completeHabit(habitId);
      
      if (result.streak_milestone) {
        Alert.alert(
          '🎉 Milestone Reached!',
          `Amazing! You've reached a ${result.habit.current_streak} day streak!`
        );
      } else {
        Alert.alert(
          'Great job! 💪',
          `Current streak: ${result.habit.current_streak} days`
        );
      }
      
      loadHabits();
    } catch (error) {
      Alert.alert('Error', 'Could not complete habit');
    }
  };

  const toggleHabit = async (habitId, isActive) => {
    try {
      await habitsAPI.updateHabit(habitId, { is_active: !isActive });
      loadHabits();
    } catch (error) {
      Alert.alert('Error', 'Could not update habit');
    }
  };

  const deleteHabit = async (habitId) => {
    // Use window.confirm for web compatibility
    const confirmed = window.confirm('Are you sure you want to delete this habit?');
    
    if (confirmed) {
      try {
        await habitsAPI.deleteHabit(habitId);
        loadHabits();
      } catch (error) {
        window.alert('Error: Could not delete habit');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Habit Tracker</Text>
        <Text style={styles.subtitle}>
          Build consistency, track streaks
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>
              No habits yet! Create one to start building your fitness routine.
            </Text>
          </View>
        ) : (
          habits.map((habit) => (
            <View
              key={habit.id}
              style={[
                styles.habitCard,
                !habit.is_active && styles.inactiveCard,
              ]}
            >
              <View style={styles.habitHeader}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleHabit(habit.id, habit.is_active)}
                >
                  <Text style={styles.toggleText}>
                    {habit.is_active ? '✓ Active' : '○ Paused'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.streakContainer}>
                <View style={styles.streakItem}>
                  <Text style={styles.streakValue}>{habit.current_streak}</Text>
                  <Text style={styles.streakLabel}>Current Streak</Text>
                </View>
                <View style={styles.streakItem}>
                  <Text style={styles.streakValue}>{habit.longest_streak}</Text>
                  <Text style={styles.streakLabel}>Best Streak</Text>
                </View>
                <View style={styles.streakItem}>
                  <Text style={styles.streakValue}>
                    {habit.total_completions}
                  </Text>
                  <Text style={styles.streakLabel}>Total</Text>
                </View>
              </View>

              <View style={styles.habitActions}>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => completeHabit(habit.id)}
                  disabled={!habit.is_active}
                >
                  <Text style={styles.completeButtonText}>
                    ✓ Complete Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteHabit(habit.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Habit</Text>

            <TextInput
              style={styles.input}
              placeholder="Habit name (e.g., Morning Workout)"
              value={newHabitName}
              onChangeText={setNewHabitName}
            />

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyButtons}>
              {['daily', 'weekly', 'custom'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    frequency === freq && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === freq && styles.frequencyTextActive,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={createHabit}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#9C27B0',
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
  habitCard: {
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
  inactiveCard: {
    opacity: 0.6,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleText: {
    color: '#9C27B0',
    fontSize: 14,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  habitActions: {
    flexDirection: 'row',
    gap: 10,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  frequencyButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  frequencyText: {
    color: '#666',
    textTransform: 'capitalize',
  },
  frequencyTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
