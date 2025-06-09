import React from 'react';
import { SafeAreaView as RNSafeAreaView, StyleSheet } from 'react-native';

export default function SafeAreaView({ children, style }) {
  return (
    <RNSafeAreaView style={[styles.container, style]}>
      {children}
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
