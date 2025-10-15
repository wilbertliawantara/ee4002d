import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { workoutsAPI } from '../services/api';

export default function ManualWorkoutScreen({ navigation }) {
  const [exercises, setExercises] = useState([
    { name: 'Push-ups', sets: '', reps: '', completed: false },
  ]);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: '', sets: '', reps: '', completed: false },
    ]);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const removeExercise = (index) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
  };

  const saveWorkout = async () => {
    const completedExercises = exercises.filter(
      (e) => e.name && (e.sets || e.reps)
    );

    if (completedExercises.length === 0) {
      if (typeof window !== 'undefined') {
        window.alert('Please add at least one exercise');
      } else {
        Alert.alert('Error', 'Please add at least one exercise');
      }
      return;
    }

    try {
      await workoutsAPI.createSession({
        session_type: 'manual',
        completed_at: new Date().toISOString(),
        duration_minutes: parseInt(duration) || 0,
        exercises_completed: completedExercises.map((e) => ({
          name: e.name,
          sets: parseInt(e.sets) || 0,
          reps: parseInt(e.reps) || 0,
        })),
        notes,
      });

      if (typeof window !== 'undefined') {
        window.alert('Workout saved successfully! 💪');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Workout saved successfully! 💪', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Save workout error:', error);
      if (typeof window !== 'undefined') {
        window.alert('Could not save workout. Please try again.');
      } else {
        Alert.alert('Error', 'Could not save workout. Please try again.');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✏️ Log Workout</Text>
        <Text style={styles.subtitle}>
          Track your progress without camera
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <TextInput
              style={styles.input}
              placeholder="Exercise name (e.g., Squats)"
              value={exercise.name}
              onChangeText={(value) => updateExercise(index, 'name', value)}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.smallInput]}
                placeholder="Sets"
                keyboardType="number-pad"
                value={exercise.sets}
                onChangeText={(value) => updateExercise(index, 'sets', value)}
              />
              <TextInput
                style={[styles.input, styles.smallInput]}
                placeholder="Reps"
                keyboardType="number-pad"
                value={exercise.reps}
                onChangeText={(value) => updateExercise(index, 'reps', value)}
              />
            </View>
            {exercises.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeExercise(index)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addExercise}>
          <Text style={styles.addButtonText}>+ Add Exercise</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Duration (minutes)"
          keyboardType="number-pad"
          value={duration}
          onChangeText={setDuration}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notes (optional)"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
        <Text style={styles.saveButtonText}>Save Workout</Text>
      </TouchableOpacity>
    </ScrollView>
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
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  smallInput: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  removeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  removeText: {
    color: '#f44336',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
