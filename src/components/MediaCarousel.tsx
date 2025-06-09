import React from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface MediaCarouselProps {
  images: string[];
}

export default function MediaCarousel({ images }: MediaCarouselProps) {
  return (
    <FlatList
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      data={images}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={styles.image} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width,
    height: 250,
    resizeMode: 'cover',
  },
});
