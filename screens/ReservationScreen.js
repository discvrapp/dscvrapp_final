import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SafeAreaView from '../components/SafeAreaView';

export default function ReservationScreen({ route }) {
  const { placeId, placeName } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reserve at {placeName}</Text>
      <Text style={styles.subtitle}>Reservation functionality coming soon...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
