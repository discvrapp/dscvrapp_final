import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { searchNearbyPlaces, buildPhotoUrl } from '../services/googlePlaces';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'SearchResults'>;

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: any[];
  opening_hours?: {
    open_now: boolean;
  };
  price_level?: number;
  types?: string[];
}

export default function SearchResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { query, category } = route.params;

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlaces();
  }, [query]);

  const loadPlaces = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const results = await searchNearbyPlaces(
        location.coords.latitude,
        location.coords.longitude,
        5000, // 5km radius
        query
      );

      setPlaces(results);
      setLoading(false);
    } catch (error) {
      console.error('Error loading places:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlaces();
    setRefreshing(false);
  };

  const renderPlaceItem = ({ item }: { item: Place }) => {
    const photoUrl = item.photos?.[0] 
      ? buildPhotoUrl(item.photos[0].photo_reference, 400)
      : null;

    const priceSymbol = item.price_level ? '$'.repeat(item.price_level) : '';

    return (
      <TouchableOpacity
        style={styles.placeCard}
        onPress={() => navigation.navigate('PlaceDetail', { placeId: item.place_id })}
        activeOpacity={0.9}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.placeImage} />
        ) : (
          <View style={[styles.placeImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#CCC" />
          </View>
        )}
        
        <View style={styles.placeInfo}>
          <View style={styles.placeHeader}>
            <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
            {item.opening_hours && (
              <View style={[
                styles.statusBadge,
                { backgroundColor: item.opening_hours.open_now ? dscvrColors.seafoamTeal : '#FF6B6B' }
              ]}>
                <Text style={styles.statusText}>
                  {item.opening_hours.open_now ? 'Open' : 'Closed'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.placeAddress} numberOfLines={1}>{item.vicinity}</Text>
          
          <View style={styles.placeFooter}>
            <View style={styles.ratingContainer}>
              {item.rating && (
                <>
                  <Ionicons name="star" size={14} color={dscvrColors.electricMagenta} />
                  <Text style={styles.rating}>{item.rating}</Text>
                  <Text style={styles.reviewCount}>({item.user_ratings_total})</Text>
                </>
              )}
            </View>
            {priceSymbol && <Text style={styles.price}>{priceSymbol}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={dscvrColors.electricMagenta} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{category}</Text>
          <Text style={styles.headerSubtitle}>{places.length} places found</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={places}
        renderItem={renderPlaceItem}
        keyExtractor={(item) => item.place_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No places found for "{query}"</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.exploreButtonText}>Back to Explore</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  listContent: {
    padding: 20,
  },
  placeCard: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeImage: {
    width: '100%',
    height: 180,
  },
  placeholderImage: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: dscvrColors.pureWhite,
    fontFamily: FONTS.medium,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: dscvrColors.electricMagenta,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: dscvrColors.pureWhite,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
});