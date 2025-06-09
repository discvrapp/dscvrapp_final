import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { searchNearbyPlaces } from '../services/googlePlaces';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define dscvr brand colors
const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Category {
  id: string;
  title: string;
  icon: string;
  query: string;
  color: string;
}

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export default function ExploreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    { 
      id: 'trending', 
      title: 'TRENDING', 
      icon: 'flame-outline',
      query: 'popular restaurants',
      color: dscvrColors.electricMagenta 
    },
    { 
      id: 'live-music', 
      title: 'LIVE MUSIC', 
      icon: 'musical-notes-outline',
      query: 'live music venue',
      color: dscvrColors.vividBlue 
    },
    { 
      id: 'friends', 
      title: 'POPULAR WITH FRIENDS', 
      icon: 'people-outline',
      query: 'trendy restaurants',
      color: dscvrColors.royalPurple 
    },
    { 
      id: 'food', 
      title: 'FOOD', 
      icon: 'restaurant-outline',
      query: 'restaurants',
      color: dscvrColors.seafoamTeal 
    },
  ];

  const bottomCategories = [
    { 
      id: 'disco', 
      title: 'DISCO', 
      icon: 'sparkles-outline',
      query: 'nightclub disco',
      color: dscvrColors.royalPurple 
    },
    { 
      id: 'events',
      title: 'EVENTS',
      icon: 'ticket-outline',
      query: 'events',
      color: dscvrColors.vividBlue
    },
    { 
      id: 'plan', 
      title: 'PLAN MY NIGHT', 
      icon: 'calendar-outline',
      query: 'plan',
      color: dscvrColors.electricMagenta 
    },
  ];

  useEffect(() => {
    getLocationAndPlaces();
  }, []);

  const getLocationAndPlaces = async () => {
    try {
      // Get location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      // Get current location
      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);

      // Search for nearby trending places
      const places = await searchNearbyPlaces(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        1500, // 1.5km radius
        'restaurant' // Default to restaurants for the map
      );

      setNearbyPlaces(places.slice(0, 10)); // Show top 10 places on map
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category.id);
    
    if (category.id === 'plan') {
      navigation.navigate('PlanMyNight');
    } else if (category.id === 'disco') {
      navigation.navigate('Disco');
    } else if (category.id === 'events') {
      navigation.navigate('Events');
    } else {
      navigation.navigate('SearchResults', {
        query: category.query,
        category: category.title,
      });
    }
  };

  const handleLocationPress = () => {
    navigation.navigate('LocationList', {
      title: 'Explore Locations',
      description: 'Discover amazing places in your area',
    });
  };

  const renderCategoryCard = (category: Category, isLarge: boolean = false) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        isLarge && styles.largeCategoryCard,
        { borderColor: category.color + '20' }
      ]}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.8}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
        <Ionicons 
          name={category.icon as any} 
          size={isLarge ? 32 : 24} 
          color={category.color} 
        />
      </View>
      <Text style={[styles.categoryTitle, isLarge && styles.largeCategoryTitle]}>
        {category.title}
      </Text>
    </TouchableOpacity>
  );

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
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={20} color="#999" />
          <Text style={styles.searchPlaceholder}>Search for places...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((category) => renderCategoryCard(category))}
        </View>

        {/* Locations Section */}
        <TouchableOpacity 
          style={styles.locationsSection}
          onPress={handleLocationPress}
          activeOpacity={0.9}
        >
          <View style={styles.locationHeader}>
            <View style={styles.locationIconContainer}>
              <Ionicons 
                name="location-outline" 
                size={24} 
                color={dscvrColors.electricMagenta} 
              />
            </View>
            <Text style={styles.locationTitle}>LOCATIONS</Text>
          </View>

          {/* Map */}
          {location && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
              >
                {nearbyPlaces.map((place) => (
                  <Marker
                    key={place.place_id}
                    coordinate={{
                      latitude: place.geometry.location.lat,
                      longitude: place.geometry.location.lng,
                    }}
                    onPress={() => navigation.navigate('PlaceDetail', { placeId: place.place_id })}
                  >
                    <View style={styles.markerContainer}>
                      <View style={styles.marker}>
                        <Ionicons 
                          name="location" 
                          size={20} 
                          color={dscvrColors.pureWhite} 
                        />
                      </View>
                      <View style={styles.markerTail} />
                    </View>
                  </Marker>
                ))}
              </MapView>

              {/* Map Overlay */}
              <View style={styles.mapOverlay}>
                <Text style={styles.mapOverlayText}>
                  {nearbyPlaces.length} places nearby
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color={dscvrColors.pureWhite} 
                />
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom Categories */}
        <View style={styles.bottomCategories}>
          {bottomCategories.map((category) => renderCategoryCard(category, true))}
        </View>

        {/* Discover More Section */}
        <View style={styles.discoverSection}>
          <Text style={styles.discoverTitle}>Discover More</Text>
          <Text style={styles.discoverSubtitle}>
            Explore curated collections and hidden gems
          </Text>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.collectionsContainer}
          >
            <TouchableOpacity style={styles.collectionCard}>
              <View style={[styles.collectionGradient, { backgroundColor: dscvrColors.electricMagenta }]}>
                <Ionicons name="wine-outline" size={32} color={dscvrColors.pureWhite} />
              </View>
              <Text style={styles.collectionTitle}>Date Night</Text>
              <Text style={styles.collectionCount}>24 spots</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.collectionCard}>
              <View style={[styles.collectionGradient, { backgroundColor: dscvrColors.vividBlue }]}>
                <Ionicons name="cafe-outline" size={32} color={dscvrColors.pureWhite} />
              </View>
              <Text style={styles.collectionTitle}>Coffee & Work</Text>
              <Text style={styles.collectionCount}>18 spots</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.collectionCard}>
              <View style={[styles.collectionGradient, { backgroundColor: dscvrColors.seafoamTeal }]}>
                <Ionicons name="leaf-outline" size={32} color={dscvrColors.pureWhite} />
              </View>
              <Text style={styles.collectionTitle}>Vegan Eats</Text>
              <Text style={styles.collectionCount}>15 spots</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: dscvrColors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#999',
    fontFamily: FONTS.regular,
  },
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  categoryCard: {
    width: (screenWidth - 52) / 2,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  largeCategoryCard: {
    width: screenWidth - 40,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    textAlign: 'center',
  },
  largeCategoryTitle: {
    fontSize: 16,
  },
  locationsSection: {
    backgroundColor: dscvrColors.pureWhite,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: dscvrColors.electricMagenta + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  mapContainer: {
    height: 200,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: dscvrColors.electricMagenta,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: dscvrColors.electricMagenta,
    marginTop: -2,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(13, 45, 79, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapOverlayText: {
    color: dscvrColors.pureWhite,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  bottomCategories: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  discoverSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  discoverTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  discoverSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  collectionsContainer: {
    paddingRight: 20,
    gap: 12,
  },
  collectionCard: {
    width: 150,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
  },
  collectionGradient: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  collectionCount: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
