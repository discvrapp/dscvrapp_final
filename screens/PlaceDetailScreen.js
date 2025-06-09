import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';

import SafeAreaView from '../components/SafeAreaView';
import ReviewCard from '../components/ReviewCard';
import MediaCarousel from '../components/MediaCarousel';
import { FONTS } from '../constants';
import { fetchPlaceDetails, buildPhotoUrl } from '../services/googlePlaces';
import { getReviewsByPlaceId } from '../services/firebase';
import { calculateAverageRating } from '../utils/reviewUtils';

const { width: screenWidth } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

export default function PlaceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { placeId } = route.params;

  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const placeData = await fetchPlaceDetails(placeId);
        const media = placeData.photos?.slice(0, 3).map((photo) => ({
          type: 'image',
          url: buildPhotoUrl(photo.photo_reference),
        })) || [];
        const fetchedReviews = await getReviewsByPlaceId(placeId);

        setPlace({ ...placeData, media });
        setReviews(fetchedReviews);
        setLoading(false);
      } catch (error) {
        console.error('Error loading place details:', error);
        setLoading(false);
      }
    })();
  }, [placeId]);

  if (loading || !place) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={dscvrColors.electricMagenta} />
      </SafeAreaView>
    );
  }

  const userAvg = calculateAverageRating(reviews);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MediaCarousel media={place.media} />

        <View style={styles.placeInfoCard}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.address}>{place.formatted_address}</Text>
          <Text style={styles.ratingText}>
            {userAvg ? `⭐ ${userAvg} (dscvr)` : ''}
            {place.rating ? `  ⭐ ${place.rating} (Google)` : ''}
          </Text>
        </View>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
          />
        </MapView>

        <TouchableOpacity
          style={styles.reserveButton}
          onPress={() => navigation.navigate('Reservation', { placeId, placeName: place.name })}
        >
          <Text style={styles.reserveButtonText}>Reserve a Table</Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>User Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet. Be the first to leave one!</Text>
          ) : (
            reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dscvrColors.pureWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: dscvrColors.pureWhite,
  },
  placeInfoCard: {
    padding: 16,
  },
  placeName: {
    fontSize: 22,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    marginTop: 6,
    color: dscvrColors.vividBlue,
  },
  map: {
    height: 200,
    margin: 16,
    borderRadius: 12,
  },
  reserveButton: {
    backgroundColor: dscvrColors.electricMagenta,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  reserveButtonText: {
    color: dscvrColors.pureWhite,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  reviewsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 16,
  },
  noReviews: {
    fontSize: 14,
    color: '#999',
  },
});
