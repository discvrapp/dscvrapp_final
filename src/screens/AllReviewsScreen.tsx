import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import PagerView from 'react-native-pager-view';
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { getReviewsByPlaceId } from '../services/firebase';
import { formatReviewDate } from '../utils/reviewUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type RoutePropType = RouteProp<RootStackParamList, 'AllReviews'>;

// Media Reviews Component (TikTok-style)
const MediaReviewsFeed = ({ reviews, placeId }: { reviews: any[], placeId: string }) => {
  const mediaReviews = reviews.filter(r => r.mediaUris && r.mediaUris.length > 0);

  if (mediaReviews.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="image-outline" size={60} color="#CCC" />
        <Text style={styles.emptyText}>No media reviews yet</Text>
      </View>
    );
  }

  return (
    <PagerView style={styles.pagerView} initialPage={0} orientation="vertical">
      {mediaReviews.map((review, index) => (
        <View key={index} style={styles.mediaReviewContainer}>
          {/* Background Image/Video */}
          <Image
            source={{ uri: review.mediaUris[0] }}
            style={styles.mediaBackground}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />
          
          {/* Review Content */}
          <View style={styles.mediaReviewContent}>
            <View style={styles.reviewerInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {review.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.reviewerName}>{review.userName}</Text>
                <Text style={styles.reviewDate}>
                  {formatReviewDate(review.createdAt)}
                </Text>
              </View>
            </View>
            
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={20}
                  color={i < review.rating ? dscvrColors.electricMagenta : 'rgba(255,255,255,0.3)'}
                />
              ))}
            </View>
            
            <ScrollView style={styles.reviewTextContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.mediaReviewText}>{review.text}</Text>
            </ScrollView>
            
            {/* Media Indicators */}
            {review.mediaUris.length > 1 && (
              <View style={styles.mediaIndicators}>
                {review.mediaUris.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.mediaDot,
                      i === 0 && styles.mediaDotActive
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
          
          {/* Side Actions */}
          <View style={styles.sideActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={28} color={dscvrColors.pureWhite} />
              <Text style={styles.actionText}>324</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={26} color={dscvrColors.pureWhite} />
              <Text style={styles.actionText}>12</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={26} color={dscvrColors.pureWhite} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </PagerView>
  );
};

// Text Reviews Component (Traditional list)
const TextReviewsList = ({ reviews }: { reviews: any[] }) => {
  const renderReview = ({ item }: { item: any }) => (
    <View style={styles.textReviewCard}>
      <View style={styles.textReviewHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewerNameText}>{item.userName}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={14}
                  color={i < item.rating ? dscvrColors.electricMagenta : '#E0E0E0'}
                />
              ))}
            </View>
            <Text style={styles.reviewDateText}>
              {formatReviewDate(item.createdAt)}
            </Text>
          </View>
        </View>
        {item.source !== 'google' && (
          <View style={styles.dscvrBadge}>
            <Text style={styles.dscvrBadgeText}>dscvr</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.reviewBodyText}>{item.text}</Text>
      
      {item.mediaUris && item.mediaUris.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaScroll}
        >
          {item.mediaUris.map((uri: string, index: number) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.reviewImage}
            />
          ))}
        </ScrollView>
      )}
      
      {item.amenities && item.amenities.length > 0 && (
        <View style={styles.amenitiesTags}>
          {item.amenities.slice(0, 3).map((amenity: string) => (
            <View key={amenity} style={styles.amenityTag}>
              <Text style={styles.amenityTagText}>{amenity}</Text>
            </View>
          ))}
          {item.amenities.length > 3 && (
            <Text style={styles.moreAmenities}>+{item.amenities.length - 3} more</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={(item, index) => `${item.id || index}`}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default function AllReviewsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { placeId } = route.params;
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'media', title: 'Media' },
    { key: 'text', title: 'All Reviews' },
  ]);

  useEffect(() => {
    loadReviews();
  }, [placeId]);

  const loadReviews = async () => {
    try {
      // Get reviews from Firebase
      const fetchedReviews = await getReviewsByPlaceId(placeId);
      
      // Add mock media for demo (remove in production)
      const reviewsWithMockMedia = fetchedReviews.map((review, idx) => ({
        ...review,
        mediaUris: idx % 3 === 0 ? ['https://picsum.photos/400/800'] : review.mediaUris,
      }));
      
      setReviews(reviewsWithMockMedia);
      setLoading(false);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setLoading(false);
    }
  };

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'media':
        return <MediaReviewsFeed reviews={reviews} placeId={placeId} />;
      case 'text':
        return <TextReviewsList reviews={reviews} />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={dscvrColors.electricMagenta}
      inactiveColor="#999"
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={renderTabBar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dscvrColors.pureWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  tabBar: {
    backgroundColor: dscvrColors.pureWhite,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabIndicator: {
    backgroundColor: dscvrColors.electricMagenta,
    height: 3,
  },
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  // Media Reviews Styles
  pagerView: {
    flex: 1,
  },
  mediaReviewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  mediaBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
  },
  mediaReviewContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 60,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: dscvrColors.electricMagenta,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: dscvrColors.pureWhite,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  reviewerName: {
    color: dscvrColors.pureWhite,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  reviewDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewTextContainer: {
    maxHeight: 120,
  },
  mediaReviewText: {
    color: dscvrColors.pureWhite,
    fontSize: 14,
    lineHeight: 20,
  },
  mediaIndicators: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 16,
  },
  mediaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  mediaDotActive: {
    backgroundColor: dscvrColors.pureWhite,
  },
  sideActions: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: dscvrColors.pureWhite,
    fontSize: 12,
    marginTop: 4,
  },
  // Text Reviews Styles
  listContent: {
    padding: 20,
  },
  textReviewCard: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textReviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerNameText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDateText: {
    fontSize: 12,
    color: '#666',
  },
  reviewBodyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaScroll: {
    marginBottom: 12,
    marginHorizontal: -4,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  amenitiesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityTagText: {
    fontSize: 12,
    color: '#666',
  },
  moreAmenities: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
  },
  dscvrBadge: {
    backgroundColor: dscvrColors.electricMagenta,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dscvrBadgeText: {
    fontSize: 10,
    color: dscvrColors.pureWhite,
    fontFamily: FONTS.semiBold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
