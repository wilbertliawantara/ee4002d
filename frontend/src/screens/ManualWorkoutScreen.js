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
import { validateExercise, validateNumber, sanitizeText } from '../utils/validation';

export default function ManualWorkoutScreen({ navigation }) {
  const [exercises, setExercises] = useState([
    { name: 'Push-ups', sets: '', reps: '', completed: false },
  ]);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    if (saving) return; // Prevent double submission
    
    const completedExercises = exercises.filter(
      (e) => e.name && (e.sets || e.reps)
    );

    if (completedExercises.length === 0) {
      setErrorMessage('❌ Please add at least one exercise');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Validate all exercises
    const errors = [];
    completedExercises.forEach((exercise, index) => {
      const validation = validateExercise(exercise);
      if (!validation.valid) {
        errors.push(`Exercise ${index + 1}: ${Object.values(validation.errors).join(', ')}`);
      }
    });

    if (errors.length > 0) {
      setErrorMessage('❌ ' + errors.join('\n'));
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    // Validate duration
    if (duration) {
      const durationValidation = validateNumber(duration, 'Duration', 1, 600);
      if (!durationValidation.valid) {
        setErrorMessage('❌ ' + durationValidation.error);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await workoutsAPI.createSession({
        session_type: 'manual',
        completed_at: new Date().toISOString(),
        duration_minutes: parseInt(duration) || 0,
        exercises_completed: completedExercises.map((e) => ({
          name: sanitizeText(e.name),
          sets: parseInt(e.sets) || 0,
          reps: parseInt(e.reps) || 0,
        })),
        notes: sanitizeText(notes),
      });

      setSuccessMessage('✅ Workout saved successfully! Redirecting...');
      
      // Clear form and redirect after 1.5 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Save workout error:', error);
      
      // Show backend validation errors if available
      if (error.response?.data?.details) {
        const errorMessages = Object.values(error.response.data.details).join('\n');
        setErrorMessage('❌ ' + errorMessages);
      } else {
        setErrorMessage('❌ Could not save workout. Please try again.');
      }
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
      <View style={styles.header}>
        <Text style={styles.title}>✏️ Log Workout</Text>
        <Text style={styles.subtitle}>
          Track your progress without camera
        </Text>
      </View>

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
      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
        onPress={saveWorkout}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Workout'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  saveButtonDisabled: {
    backgroundColor: '#9E9E9E',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    margin: 15,
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
    margin: 15,
    marginTop: 10,
  },
  errorText: {
    color: '#721c24',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});
