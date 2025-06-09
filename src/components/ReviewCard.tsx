import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants';

interface Props {
  reviewerName: string;
  rating: number;
  comment: string;
}

export default function ReviewCard({ reviewerName, rating, comment }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.reviewer}>{reviewerName}</Text>
      <Text style={styles.rating}>⭐ {rating}</Text>
      <Text style={styles.comment}>{comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.gray.light,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewer: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  comment: {
    fontSize: 14,
    color: COLORS.gray.dark,
  },
});
