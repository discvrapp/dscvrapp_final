import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const dscvrColors = {
  electricMagenta: '#E500A4',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DiscoButtonProps {
  style?: any;
}

export default function DiscoButton({ style }: DiscoButtonProps) {
  const navigation = useNavigation<NavigationProp>();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Disco');
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.discoButton, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Ionicons name="dice-outline" size={24} color={dscvrColors.pureWhite} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  discoButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: dscvrColors.electricMagenta,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: dscvrColors.electricMagenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
