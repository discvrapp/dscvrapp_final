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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';

import SafeAreaView from '../components/SafeAreaView';
import ReviewCard from '../components/ReviewCard';
import MediaCarousel from '../components/MediaCarousel';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { fetchPlaceDetails, buildPhotoUrl } from '../services/googlePlaces';
import { getReviewsByPlaceId } from '../services/firebase';
import { calculateAverageRating, formatReviewDate } from '../utils/reviewUtils';

const { width: screenWidth } = Dimensions.get('window');

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
type RoutePropType = RouteProp<RootStackParamList, 'PlaceDetail'>;

export default function PlaceDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { placeId } = route.params;

  const [place, setPlace] = useState<any>(null);
  const [dscvrReviews, setDscvrReviews] = useState<any[]>([]);
  const [googleReviews, setGoogleReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [eventsExpanded, setEventsExpanded] = useState(false);

  // Mock events data
  const mockEvents = [
    {
      id: '1',
      title: 'Live Jazz Night',
      date: 'Tonight',
      time: '8:00 PM',
      description: 'Enjoy smooth jazz with local artists',
    },
    {
      id: '2',
      title: 'Wine Tasting',
      date: 'Tomorrow',
      time: '6:00 PM',
      description: 'Sample our selection of imported wines',
    },
  ];

  useEffect(() => {
    loadPlaceData();
  }, [placeId]);

  const loadPlaceData = async () => {
    try {
      // Fetch place details from Google
      const placeData = await fetchPlaceDetails(placeId);
      if (!placeData) {
        console.error('No place data found');
        setLoading(false);
        return;
      }

      // Process media
      const media = placeData.photos?.slice(0, 5).map((photo: any) => ({
        type: 'image',
        url: buildPhotoUrl(photo.photo_reference),
      })) || [];

      // Get Google reviews
      const gReviews = placeData.reviews?.map((review: any) => ({
        id: `google_${review.time}`,
        userName: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.relative_time_description,
        profilePhoto: review.profile_photo_url,
        source: 'google'
      })) || [];

      // Get dscvr reviews from Firebase
      const dReviews = await getReviewsByPlaceId(placeId);

      setPlace({ ...placeData, media });
      setGoogleReviews(gReviews);
      setDscvrReviews(dReviews);
      setLoading(false);
    } catch (error) {
      console.error('Error loading place details:', error);
      setLoading(false);
    }
  };

  if (loading || !place) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={dscvrColors.electricMagenta} />
      </SafeAreaView>
    );
  }

  const dscvrAvgRating = calculateAverageRating(dscvrReviews);
  const allReviews = [...dscvrReviews, ...googleReviews];

  const renderQuickInfo = (icon: string, text: string, color: string) => (
    <View style={styles.quickInfoItem}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.quickInfoText}>{text}</Text>
    </View>
  );

  const renderActionButton = (icon: string, label: string, color: string, onPress: () => void) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const handleCall = () => {
    if (place.formatted_phone_number) {
      console.log('Calling:', place.formatted_phone_number);
    }
  };

  const handleDirections = () => {
    console.log('Getting directions to:', place.formatted_address);
  };

  const handleWebsite = () => {
    if (place.website) {
      console.log('Opening website:', place.website);
    }
  };

  const handleShare = () => {
    console.log('Sharing:', place.name);
  };

  const renderReview = (review: any) => {
    const isDscvr = review.source !== 'google';
    return (
      <View key={review.id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View>
            <Text style={styles.reviewerName}>{review.userName}</Text>
            <View style={styles.reviewMeta}>
              <View style={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={14}
                    color={i < review.rating ? dscvrColors.electricMagenta : '#E0E0E0'}
                  />
                ))}
              </View>
              <Text style={styles.reviewTime}>
                {isDscvr ? formatReviewDate(review.createdAt) : review.time}
              </Text>
            </View>
          </View>
          {isDscvr && (
            <View style={styles.dscvrBadge}>
              <Text style={styles.dscvrBadgeText}>dscvr</Text>
            </View>
          )}
        </View>
        <Text style={styles.reviewText}>{review.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="bookmark-outline" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Media Carousel */}
        <MediaCarousel media={place.media} />

        {/* Place Info Card */}
        <View style={styles.placeInfoCard}>
          <Text style={styles.placeName}>{place.name}</Text>
          
          <View style={styles.ratingsContainer}>
            {dscvrAvgRating && (
              <View style={styles.ratingItem}>
                <Ionicons name="star" size={18} color={dscvrColors.electricMagenta} />
                <Text style={styles.rating}>{dscvrAvgRating}</Text>
                <Text style={styles.ratingLabel}>dscvr ({dscvrReviews.length})</Text>
              </View>
            )}
            {place.rating && (
              <View style={styles.ratingItem}>
                <Ionicons name="star" size={18} color={dscvrColors.vividBlue} />
                <Text style={styles.rating}>{place.rating}</Text>
                <Text style={styles.ratingLabel}>Google ({place.user_ratings_total})</Text>
              </View>
            )}
          </View>

          <Text style={styles.placeType}>Restaurant • $$</Text>
          {place.opening_hours && (
            <Text style={[styles.status, { color: place.opening_hours.open_now ? dscvrColors.seafoamTeal : '#FF6B6B' }]}>
              {place.opening_hours.open_now ? 'Open now' : 'Closed'}
            </Text>
          )}
        </View>

        {/* Quick Info */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickInfoContainer}
          contentContainerStyle={styles.quickInfoContent}
        >
          {renderQuickInfo('restaurant-outline', 'Dine-in', dscvrColors.vividBlue)}
          {renderQuickInfo('bag-handle-outline', 'Takeout', dscvrColors.royalPurple)}
          {renderQuickInfo('bicycle-outline', 'Delivery', dscvrColors.seafoamTeal)}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {place.formatted_phone_number && renderActionButton('call-outline', 'Call', dscvrColors.vividBlue, handleCall)}
          {renderActionButton('navigate-outline', 'Directions', dscvrColors.electricMagenta, handleDirections)}
          {place.website && renderActionButton('globe-outline', 'Website', dscvrColors.royalPurple, handleWebsite)}
          {renderActionButton('share-social-outline', 'Share', dscvrColors.seafoamTeal, handleShare)}
        </View>

        {/* Reserve Button */}
        <TouchableOpacity 
          style={styles.reserveButton}
          onPress={() => navigation.navigate('Reservation', { place })}
        >
          <Text style={styles.reserveButtonText}>Reserve a Table</Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]}
            onPress={() => setSelectedTab('reviews')}
          >
            <Text style={[styles.tabText, selectedTab === 'reviews' && styles.activeTabText]}>
              Reviews ({allReviews.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'events' && styles.activeTab]}
            onPress={() => setSelectedTab('events')}
          >
            <Text style={[styles.tabText, selectedTab === 'events' && styles.activeTabText]}>
              Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <>
            {/* Address Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={24} color={dscvrColors.electricMagenta} />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>
              <Text style={styles.address}>{place.formatted_address}</Text>
              
              {/* Map */}
              <TouchableOpacity style={styles.mapContainer} onPress={handleDirections}>
                <MapView
                  style={styles.map}
                  scrollEnabled={false}
                  zoomEnabled={false}
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
                <View style={styles.mapOverlay}>
                  <Text style={styles.mapOverlayText}>Tap for directions</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Hours Section */}
            {place.opening_hours?.weekday_text && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={24} color={dscvrColors.vividBlue} />
                  <Text style={styles.sectionTitle}>Hours</Text>
                </View>
                <View style={styles.hoursContainer}>
                  {place.opening_hours.weekday_text.map((hours: string, index: number) => (
                    <Text key={index} style={styles.hoursText}>{hours}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Contact Section */}
            {(place.formatted_phone_number || place.website) && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle" size={24} color={dscvrColors.royalPurple} />
                  <Text style={styles.sectionTitle}>Contact</Text>
                </View>
                {place.formatted_phone_number && (
                  <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                    <Ionicons name="call-outline" size={20} color={dscvrColors.vividBlue} />
                    <Text style={styles.contactText}>{place.formatted_phone_number}</Text>
                  </TouchableOpacity>
                )}
                {place.website && (
                  <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                    <Ionicons name="globe-outline" size={20} color={dscvrColors.royalPurple} />
                    <Text style={styles.contactText} numberOfLines={1}>{place.website}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        {selectedTab === 'reviews' && (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <TouchableOpacity 
                style={styles.writeReviewButton}
                onPress={() => navigation.navigate('WriteReview', { placeId, placeName: place.name })}
              >
                <Ionicons name="create-outline" size={20} color={dscvrColors.pureWhite} />
                <Text style={styles.writeReviewText}>Write a Review</Text>
              </TouchableOpacity>
            </View>

            {allReviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews yet. Be the first to write one!</Text>
            ) : (
              <>
                {dscvrReviews.length > 0 && (
                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewSectionTitle}>dscvr Reviews</Text>
                    {dscvrReviews.slice(0, 3).map(renderReview)}
                  </View>
                )}
                
                {googleReviews.length > 0 && (
                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewSectionTitle}>Google Reviews</Text>
                    {googleReviews.slice(0, 3).map(renderReview)}
                  </View>
                )}
                
                {allReviews.length > 3 && (
                  <TouchableOpacity 
                    style={styles.viewAllReviewsButton}
                    onPress={() => navigation.navigate('AllReviews', { placeId })}
                  >
                    <Text style={styles.viewAllReviewsText}>View all {allReviews.length} reviews</Text>
                    <Ionicons name="arrow-forward" size={20} color={dscvrColors.electricMagenta} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {selectedTab === 'events' && (
          <View style={styles.eventsSection}>
            <TouchableOpacity 
              style={styles.eventsHeader}
              onPress={() => setEventsExpanded(!eventsExpanded)}
            >
              <View>
                <Text style={styles.eventsHeaderTitle}>Upcoming Events</Text>
                <Text style={styles.eventsHeaderSubtitle}>
                  {mockEvents.length} events this week
                </Text>
              </View>
              <Ionicons 
                name={eventsExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={dscvrColors.midnightNavy} 
              />
            </TouchableOpacity>

            {eventsExpanded && mockEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDateText}>{event.date}</Text>
                  <Text style={styles.eventTimeText}>{event.time}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Similar Venues Section - Always visible at bottom */}
        <View style={styles.similarVenuesSection}>
          <Text style={styles.similarVenuesTitle}>Similar Venues</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarVenuesContainer}
          >
            {[
              { id: '1', name: 'The Coffee House', type: 'Café', rating: 4.5, distance: '0.3 mi' },
              { id: '2', name: 'Blue Moon Bar', type: 'Bar', rating: 4.7, distance: '0.5 mi' },
              { id: '3', name: 'Sunset Grill', type: 'Restaurant', rating: 4.3, distance: '0.8 mi' },
            ].map((venue) => (
              <TouchableOpacity
                key={venue.id}
                style={styles.similarVenueCard}
                onPress={() => navigation.push('PlaceDetail', { placeId: venue.id })}
              >
                <View style={styles.similarVenueImage}>
                  <Ionicons name="image-outline" size={40} color="#CCC" />
                </View>
                <View style={styles.similarVenueInfo}>
                  <Text style={styles.similarVenueName} numberOfLines={1}>{venue.name}</Text>
                  <Text style={styles.similarVenueType}>{venue.type}</Text>
                  <View style={styles.similarVenueFooter}>
                    <View style={styles.similarVenueRating}>
                      <Ionicons name="star" size={12} color={dscvrColors.electricMagenta} />
                      <Text style={styles.similarVenueRatingText}>{venue.rating}</Text>
                    </View>
                    <Text style={styles.similarVenueDistance}>{venue.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: dscvrColors.pureWhite,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  placeInfoCard: {
    backgroundColor: dscvrColors.pureWhite,
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  placeName: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 12,
  },
  ratingsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  placeType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  quickInfoContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  quickInfoContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  quickInfoText: {
    fontSize: 14,
    color: dscvrColors.midnightNavy,
    fontFamily: FONTS.medium,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: dscvrColors.midnightNavy,
    fontFamily: FONTS.medium,
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: dscvrColors.electricMagenta,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  activeTabText: {
    color: dscvrColors.electricMagenta,
  },
  sectionCard: {
    backgroundColor: dscvrColors.pureWhite,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  address: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  mapContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 45, 79, 0.8)',
    padding: 8,
    alignItems: 'center',
  },
  mapOverlayText: {
    color: dscvrColors.pureWhite,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  hoursContainer: {
    gap: 4,
  },
  hoursText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: dscvrColors.vividBlue,
    flex: 1,
  },
  reviewsSection: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  reviewsHeader: {
    marginBottom: 20,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: dscvrColors.electricMagenta,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  writeReviewText: {
    fontSize: 16,
    color: dscvrColors.pureWhite,
    fontFamily: FONTS.medium,
  },
  noReviews: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTime: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  dscvrBadge: {
    backgroundColor: dscvrColors.electricMagenta,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dscvrBadgeText: {
    fontSize: 12,
    color: dscvrColors.pureWhite,
    fontFamily: FONTS.semiBold,
  },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: dscvrColors.electricMagenta,
  },
  viewAllReviewsText: {
    fontSize: 16,
    color: dscvrColors.electricMagenta,
    fontFamily: FONTS.medium,
  },
  eventsSection: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
  },
  eventsHeaderTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  eventsHeaderSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  eventDate: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  eventDateText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.electricMagenta,
  },
  eventTimeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  similarVenuesSection: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  similarVenuesTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  similarVenuesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  similarVenueCard: {
    width: 160,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  similarVenueImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarVenueInfo: {
    padding: 12,
  },
  similarVenueName: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  similarVenueType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  similarVenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  similarVenueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  similarVenueRatingText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  similarVenueDistance: {
    fontSize: 12,
    color: '#666',
  },
});
