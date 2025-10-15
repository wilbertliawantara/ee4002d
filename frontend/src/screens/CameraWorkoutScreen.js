import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Camera } from 'expo-camera';

export default function CameraWorkoutScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [exerciseName, setExerciseName] = useState('Squat');
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(0);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startWorkout = () => {
    setIsRecording(true);
    setRepCount(0);
    setFormScore(0);
    
    // Simulate pose detection (in real app, integrate MediaPipe)
    const interval = setInterval(() => {
      setRepCount((prev) => prev + 1);
      setFormScore(Math.floor(Math.random() * 30) + 70); // 70-100
    }, 3000);

    // Store interval ID to clear later
    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);
      Alert.alert(
        'Workout Complete! 🎉',
        `Great job! You completed ${repCount + 1} reps with an average form score of ${formScore}%.`,
        [
          {
            text: 'Save & Exit',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 15000); // 15 second demo
  };

  const stopWorkout = () => {
    setIsRecording(false);
    Alert.alert(
      'Save Workout?',
      `You completed ${repCount} reps. Save this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            Alert.alert('Success', 'Workout saved!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.infoText}>
          Please enable camera permissions in your device settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera view placeholder (integrate react-native-vision-camera + MediaPipe) */}
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.placeholderText}>
          📸 Camera View
        </Text>
        <Text style={styles.placeholderSubtext}>
          (Integrate MediaPipe for real pose detection)
        </Text>
      </View>

      {/* Overlay with stats */}
      <View style={styles.overlay}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Exercise</Text>
            <Text style={styles.statValue}>{exerciseName}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Reps</Text>
            <Text style={styles.statValue}>{repCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Form</Text>
            <Text style={[styles.statValue, formScore >= 80 && styles.goodForm]}>
              {formScore}%
            </Text>
          </View>
        </View>

        {isRecording && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>
              {formScore >= 90
                ? '✓ Excellent form!'
                : formScore >= 80
                ? '👍 Good form, keep it up!'
                : '⚠️ Watch your posture'}
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <Text style={styles.buttonText}>Start Workout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopWorkout}>
            <Text style={styles.buttonText}>Stop Workout</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🎯 Next Steps:</Text>
        <Text style={styles.infoItem}>
          • Integrate react-native-vision-camera
        </Text>
        <Text style={styles.infoItem}>
          • Add MediaPipe Pose detection
        </Text>
        <Text style={styles.infoItem}>
          • Process keypoints for form analysis
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  goodForm: {
    color: '#4CAF50',
  },
  feedbackBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  stopButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  infoBox: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoItem: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 5,
  },
});
