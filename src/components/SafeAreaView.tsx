import React from 'react';
import {
  SafeAreaView as RNSafeAreaView,
  StyleSheet,
  View,
  Platform,
  StatusBar,
} from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: any;
}

export default function SafeAreaView({ children, style }: Props) {
  return (
    <RNSafeAreaView style={[styles.safeArea, style]}>
      <View style={styles.inner}>{children}</View>
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  inner: {
    flex: 1,
  },
});
