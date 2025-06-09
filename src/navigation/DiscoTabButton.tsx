import React from 'react';
import { View, StyleSheet } from 'react-native';
import DiscoButton from '../components/DiscoButton';

export default function DiscoTabButton() {
  return (
    <View style={styles.container}>
      <DiscoButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 999,
  },
});
