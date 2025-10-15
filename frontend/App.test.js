import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  console.log('App is loading!');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ Fitness Companion</Text>
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});
