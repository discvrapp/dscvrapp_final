import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants';

interface PlaceCardProps {
  name: string;
  image: string;
  address: string;
  rating: number;
  onPress: () => void;
}

export default function PlaceCard({ name, image, address, rating, onPress }: PlaceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.thumbnail} />
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.address}>{address}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color={COLORS.primary} />
          <Text style={styles.rating}>{rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  details: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  name: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.dark,
  },
  address: {
    fontSize: 14,
    color: COLORS.gray.dark,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rating: {
    marginLeft: 4,
    color: COLORS.gray.dark,
  },
});
