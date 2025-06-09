import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { searchNearbyPlaces, buildPhotoUrl } from '../services/googlePlaces';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FilterOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface Filter {
  id: string;
  title: string;
  icon: string;
  color: string;
  options: FilterOption[];
  selected?: string;
}

interface Venue {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  price: string;
  image: string;
  tags: string[];
  description: string;
  place_id: string;
  address: string;
  isOpen?: boolean;
}

export default function DiscoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredVenues, setDiscoveredVenues] = useState<Venue[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  
  // Get user location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to discover nearby places');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    })();
  }, []);
  
  const filters: Filter[] = [
    {
      id: 'venue',
      title: 'What are you looking for?',
      icon: 'business-outline',
      color: dscvrColors.vividBlue,
      options: [
        { id: 'cafe', label: 'Café', icon: 'cafe-outline', color: dscvrColors.royalPurple },
        { id: 'bar', label: 'Bar', icon: 'wine-outline', color: dscvrColors.electricMagenta },
        { id: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline', color: dscvrColors.seafoamTeal },
        { id: 'club', label: 'Club', icon: 'musical-notes-outline', color: dscvrColors.vividBlue },
      ],
    },
    {
      id: 'vibe',
      title: 'What\'s the vibe?',
      icon: 'sparkles-outline',
      color: dscvrColors.electricMagenta,
      options: [
        { id: 'romantic', label: 'Romantic', icon: 'heart-outline', color: dscvrColors.electricMagenta },
        { id: 'casual', label: 'Casual', icon: 'happy-outline', color: dscvrColors.seafoamTeal },
        { id: 'trendy', label: 'Trendy', icon: 'trending-up-outline', color: dscvrColors.royalPurple },
        { id: 'cozy', label: 'Cozy', icon: 'home-outline', color: dscvrColors.vividBlue },
      ],
    },
    {
      id: 'price',
      title: 'What\'s your budget?',
      icon: 'cash-outline',
      color: dscvrColors.royalPurple,
      options: [
        { id: 'budget', label: '$', icon: 'cash-outline', color: dscvrColors.seafoamTeal },
        { id: 'moderate', label: '$$', icon: 'cash-outline', color: dscvrColors.vividBlue },
        { id: 'upscale', label: '$$$', icon: 'cash-outline', color: dscvrColors.royalPurple },
        { id: 'luxury', label: '$$$$', icon: 'cash-outline', color: dscvrColors.electricMagenta },
      ],
    },
    {
      id: 'distance',
      title: 'How far will you go?',
      icon: 'location-outline',
      color: dscvrColors.seafoamTeal,
      options: [
        { id: 'walking', label: 'Walking', icon: 'walk-outline', color: dscvrColors.seafoamTeal },
        { id: 'close', label: '< 2 mi', icon: 'bicycle-outline', color: dscvrColors.vividBlue },
        { id: 'moderate', label: '< 5 mi', icon: 'car-outline', color: dscvrColors.royalPurple },
        { id: 'anywhere', label: 'Anywhere', icon: 'airplane-outline', color: dscvrColors.electricMagenta },
      ],
    },
  ];
  const handleFilterSelect = (filterId: string, optionId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: prev[filterId] === optionId ? '' : optionId,
    }));
  };

  const startDiscovery = async () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to discover nearby places');
      return;
    }

    setIsDiscovering(true);
    
    // Animate the discovery process
    Animated.sequence([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
    ]).start();

    try {
      // Build search parameters based on filters
      let types = [];
      let keyword = '';
      
      // Map venue filter to Google Places types
      if (selectedFilters.venue) {
        switch (selectedFilters.venue) {
          case 'cafe':
            types = ['cafe', 'coffee_shop'];
            keyword = 'coffee cafe';
            break;
          case 'bar':
            types = ['bar', 'night_club'];
            keyword = 'bar cocktail';
            break;
          case 'restaurant':
            types = ['restaurant'];
            keyword = 'restaurant dining';
            break;
          case 'club':
            types = ['night_club'];
            keyword = 'club dance nightlife';
            break;
        }
      }

      // Add vibe to keyword search
      if (selectedFilters.vibe) {
        switch (selectedFilters.vibe) {
          case 'romantic':
            keyword += ' romantic intimate date';
            break;
          case 'casual':
            keyword += ' casual relaxed';
            break;
          case 'trendy':
            keyword += ' trendy popular hip';
            break;
          case 'cozy':
            keyword += ' cozy comfortable';
            break;
        }
      }

      // Calculate radius based on distance filter
      let radius = 5000; // default 5km
      // Add price level to search
      let minPriceLevel = 0;
      let maxPriceLevel = 4;
      
      if (selectedFilters.price) {
        switch (selectedFilters.price) {
          case 'budget':
            minPriceLevel = 0;
            maxPriceLevel = 1;
            break;
          case 'moderate':
            minPriceLevel = 1;
            maxPriceLevel = 2;
            break;
          case 'upscale':
            minPriceLevel = 2;
            maxPriceLevel = 3;
            break;
          case 'luxury':
            minPriceLevel = 3;
            maxPriceLevel = 4;
            break;
        }
      }
      if (selectedFilters.distance) {
        switch (selectedFilters.distance) {
          case 'walking':
            radius = 800; // 0.5 miles
            break;
          case 'close':
            radius = 3200; // 2 miles
            break;
          case 'moderate':
            radius = 8000; // 5 miles
            break;
          case 'anywhere':
            radius = 20000; // 12+ miles
            break;
        }
      }

      // Search for places
      const results = await searchNearbyPlaces(
        userLocation.lat,
        userLocation.lng,
        radius,
        types.length > 0 ? types : ['restaurant', 'bar', 'cafe'],
        keyword.trim() || undefined
      );

      // Transform results to our Venue format
      const venues: Venue[] = results.map((place: any, index: number) => {
        // Calculate distance
        const distance = place.distance ? `${(place.distance / 1609.34).toFixed(1)} mi` : 'Unknown';
        
        // Determine price level
        const priceLevel = place.price_level ? '$'.repeat(place.price_level) : '$$';
        
        // Extract types as tags
        const tags = place.types ? place.types.slice(0, 3).map((type: string) => 
          type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1)
        ) : [];

        // Add vibe-based tags
        if (selectedFilters.vibe === 'romantic' && place.rating > 4) {
          tags.push('Date Night');
        }
        if (place.rating >= 4.5) {
          tags.push('Highly Rated');
        }

        return {
          id: place.place_id,
          name: place.name,
          category: place.types?.[0]?.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                    place.types?.[0]?.replace(/_/g, ' ').slice(1) || 'Restaurant',
          rating: place.rating || 0,
          reviews: place.user_ratings_total || 0,
          distance: distance,
          price: priceLevel,
          image: place.photos?.[0] ? buildPhotoUrl(place.photos[0].photo_reference) : 'https://via.placeholder.com/400x300',
          tags: tags,
          description: place.vicinity || place.formatted_address || '',
          place_id: place.place_id,
          address: place.formatted_address || place.vicinity || '',
          isOpen: place.opening_hours?.open_now,
        };
      });

      // Sort by rating and distance
      const sortedVenues = venues.sort((a, b) => {
        // Prioritize rating first, then distance
        const ratingDiff = b.rating - a.rating;
        if (Math.abs(ratingDiff) > 0.2) {
          return ratingDiff;
        }
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      setDiscoveredVenues(sortedVenues.slice(0, 10)); // Limit to top 10 results

      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsDiscovering(false);
        
        // Slide in venues
        Animated.spring(slideAnimation, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      console.error('Error discovering places:', error);
      Alert.alert('Error', 'Failed to discover places. Please try again.');
      setIsDiscovering(false);
      fadeAnimation.setValue(0);
    }
  };

  const resetDiscovery = () => {
    setSelectedFilters({});
    setDiscoveredVenues([]);
    slideAnimation.setValue(0);
  };

  const renderVenueCard = ({ item, index }: { item: Venue; index: number }) => {
    const animatedStyle = {
      transform: [
        {
          translateY: slideAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [screenHeight, 0],
          }),
        },
      ],
      opacity: slideAnimation,
    };

    return (
      <Animated.View style={[styles.venueCard, animatedStyle, { animationDelay: `${index * 100}ms` }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PlaceDetail', { placeId: item.place_id })}
        >
          <Image source={{ uri: item.image }} style={styles.venueImage} />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          >
            <View style={styles.venueHeader}>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
              <View style={styles.ratingTag}>
                <Ionicons name="star" size={14} color={dscvrColors.pureWhite} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
            {item.isOpen !== undefined && (
              <View style={[styles.openStatus, { backgroundColor: item.isOpen ? dscvrColors.seafoamTeal : '#FF6B6B' }]}>
                <Text style={styles.openStatusText}>{item.isOpen ? 'Open Now' : 'Closed'}</Text>
              </View>
            )}
          </LinearGradient>

          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{item.name}</Text>
            <View style={styles.venueMetaRow}>
              <Text style={styles.venueCategory}>{item.category}</Text>
              <Text style={styles.venueDot}>·</Text>
              <Text style={styles.venueDistance}>{item.distance}</Text>
              <Text style={styles.venueDot}>·</Text>
              <Text style={styles.venueReviews}>{item.reviews} reviews</Text>
            </View>
            <Text style={styles.venueDescription} numberOfLines={2}>
              {item.description || item.address}
            </Text>
            <View style={styles.venueTags}>
              {item.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFilterOption = (filter: Filter) => (
    <View key={filter.id} style={styles.filterSection}>
      <View style={styles.filterHeader}>
        <Ionicons name={filter.icon as any} size={24} color={filter.color} />
        <Text style={styles.filterTitle}>{filter.title}</Text>
      </View>
      <View style={styles.filterOptions}>
        {filter.options.map((option) => {
          const isSelected = selectedFilters[filter.id] === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterOption,
                isSelected && { backgroundColor: option.color + '20', borderColor: option.color },
              ]}
              onPress={() => handleFilterSelect(filter.id, option.id)}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={isSelected ? option.color : '#666'}
              />
              <Text style={[styles.filterOptionText, isSelected && { color: option.color }]}>
                {option.label}
              </Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: option.color }]}>
                  <Ionicons name="checkmark" size={16} color={dscvrColors.pureWhite} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const hasActiveFilters = Object.values(selectedFilters).some(value => value);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={resetDiscovery} style={styles.resetButton}>
            <Text style={styles.resetText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {discoveredVenues.length === 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Let's find your perfect spot</Text>
            <Text style={styles.heroSubtitle}>
              Tell us what you're in the mood for and we'll handle the rest
            </Text>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            {filters.map(renderFilterOption)}
          </View>

          {/* Discover Button */}
          <TouchableOpacity
            style={[
              styles.discoverButton,
              !hasActiveFilters && styles.discoverButtonDisabled,
            ]}
            onPress={startDiscovery}
            disabled={!hasActiveFilters}
          >
            <LinearGradient
              colors={
                hasActiveFilters
                  ? [dscvrColors.electricMagenta, dscvrColors.royalPurple]
                  : ['#E0E0E0', '#D0D0D0']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.discoverButtonGradient}
            >
              <Ionicons name="compass-outline" size={24} color={dscvrColors.pureWhite} />
              <Text style={styles.discoverButtonText}>Discover Places</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Or Random */}
          <TouchableOpacity style={styles.randomButton} onPress={() => {
            // Select random filters
            const randomFilters: Record<string, string> = {};
            filters.forEach(filter => {
              const randomOption = filter.options[Math.floor(Math.random() * filter.options.length)];
              randomFilters[filter.id] = randomOption.id;
            });
            setSelectedFilters(randomFilters);
            // Start discovery with random filters
            setTimeout(() => startDiscovery(), 100);
          }}>
            <Ionicons name="dice-outline" size={20} color={dscvrColors.electricMagenta} />
            <Text style={styles.randomButtonText}>Surprise me!</Text>
          </TouchableOpacity>        </ScrollView>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Perfect matches for you</Text>
            <TouchableOpacity onPress={resetDiscovery}>
              <Text style={styles.newSearchText}>New search</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={discoveredVenues}
            renderItem={renderVenueCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.venuesList}
          />
        </View>
      )}

      {/* Loading Overlay */}
      {isDiscovering && (
        <Animated.View
          style={[
            styles.loadingOverlay,
            {
              opacity: fadeAnimation,
            },
          ]}
        >
          <ActivityIndicator size="large" color={dscvrColors.electricMagenta} />
          <Text style={styles.loadingText}>Finding perfect places...</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  resetButton: {
    padding: 4,
  },
  resetText: {
    fontSize: 16,
    color: dscvrColors.electricMagenta,
    fontFamily: FONTS.medium,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  filtersContainer: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    minWidth: (screenWidth - 52) / 2,
  },
  filterOptionText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: '#666',
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverButton: {
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  discoverButtonDisabled: {
    opacity: 0.5,
  },
  discoverButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  discoverButtonText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.pureWhite,
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginBottom: 32,
  },
  randomButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultsTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  newSearchText: {
    fontSize: 16,
    color: dscvrColors.electricMagenta,
    fontFamily: FONTS.medium,
  },
  venuesList: {
    padding: 20,
  },
  venueCard: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'space-between',
    padding: 16,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceTag: {
    backgroundColor: dscvrColors.pureWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: dscvrColors.electricMagenta,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.pureWhite,
  },
  venueInfo: {
    padding: 20,
  },
  venueName: {
    fontSize: 22,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  venueCategory: {
    fontSize: 14,
    color: '#666',
  },
  venueDot: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 8,
  },
  venueDistance: {
    fontSize: 14,
    color: '#666',
  },
  venueReviews: {
    fontSize: 14,
    color: '#666',
  },
  venueDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 16,
  },
  venueTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: dscvrColors.midnightNavy,
    fontFamily: FONTS.medium,
    marginTop: 16,
  },
  openStatus: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  openStatusText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.pureWhite,
  },
});
