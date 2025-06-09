import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 4) / 3;

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  // Use the actual logged-in user data
  const userData = {
    username: user?.username || 'username',
    displayName: user?.name || 'Your Name',
    bio: user?.bio || 'Add a bio to tell people about yourself',
    avatar: user?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
    verified: user?.verified || false,
    website: user?.website || '',
  };

  // User's actual stats (in a real app, these would come from API)
  const stats = {
    posts: user?.postsCount || 0,
    followers: user?.followersCount || 0,
    following: user?.followingCount || 0,
  };

  // Mock data for user's video posts
  const myVideoPosts = Array(6).fill({}).map((_, i) => ({
    id: `my-video-${i}`,
    thumbnail: `https://picsum.photos/300/300?random=${i}`,
    views: `${Math.floor(Math.random() * 100)}K`,
    rating: (Math.random() * 2 + 3).toFixed(1),
    hasVideo: true,
  }));

  // Mock data for user's written reviews
  const myWrittenReviews = [
    {
      id: 'review-1',
      placeName: 'The Coffee House',
      placeType: 'Cafe',
      rating: 4.5,
      reviewText: 'Amazing coffee and cozy atmosphere. The baristas really know their craft and the pastries are fresh daily.',
      date: '2 days ago',
      likes: 24,
      comments: 5,
      thumbnail: 'https://picsum.photos/300/300?random=50',
    },
    {
      id: 'review-2',
      placeName: 'Sunset Grill',
      placeType: 'Restaurant',
      rating: 5.0,
      reviewText: 'Best sunset views in the city! The seafood platter was incredible and the service was top-notch.',
      date: '1 week ago',
      likes: 45,
      comments: 12,
      thumbnail: 'https://picsum.photos/300/300?random=51',
    },
    {
      id: 'review-3',
      placeName: 'Urban Garden Bar',
      placeType: 'Bar',
      rating: 4.0,
      reviewText: 'Great cocktails and live music on weekends. The rooftop garden setting is unique.',
      date: '2 weeks ago',
      likes: 18,
      comments: 3,
      thumbnail: 'https://picsum.photos/300/300?random=52',
    },
  ];

  // User's saved places
  const mySavedPlaces = Array(6).fill({}).map((_, i) => ({
    id: `my-saved-${i}`,
    thumbnail: `https://picsum.photos/300/300?random=${i + 20}`,
    name: ['Favorite Cafe', 'Best Pizza', 'Cozy Bar', 'Brunch Spot'][i % 4],
    category: ['Restaurant', 'Cafe', 'Bar', 'Brunch'][i % 4],
  }));

  // User's collections
  const myCollections = [
    { id: '1', name: 'Date Night Spots', count: 12, cover: 'https://picsum.photos/300/300?random=30' },
    { id: '2', name: 'Coffee Shops', count: 8, cover: 'https://picsum.photos/300/300?random=31' },
    { id: '3', name: 'Weekend Vibes', count: 15, cover: 'https://picsum.photos/300/300?random=32' },
  ];

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Profile Info Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{formatCount(stats.posts)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('Followers', { type: 'followers' })}
            >
              <Text style={styles.statNumber}>{formatCount(stats.followers)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('Followers', { type: 'following' })}
            >
              <Text style={styles.statNumber}>{formatCount(stats.following)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name and Bio */}
        <View style={styles.bioSection}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{userData.displayName}</Text>
            {userData.verified && (
              <MaterialCommunityIcons name="check-decagram" size={18} color={dscvrColors.vividBlue} />
            )}
          </View>
          <Text style={styles.username}>@{userData.username}</Text>
          {userData.bio && <Text style={styles.bio}>{userData.bio}</Text>}
          {userData.website && (
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.website}>{userData.website}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.insightsButton}>
            <Ionicons name="bar-chart-outline" size={20} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollContainer}
      >
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons name="videocam-outline" size={22} color={activeTab === 'posts' ? dscvrColors.midnightNavy : '#999'} />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <MaterialCommunityIcons name="text-box-outline" size={22} color={activeTab === 'reviews' ? dscvrColors.midnightNavy : '#999'} />
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons name="bookmark-outline" size={22} color={activeTab === 'saved' ? dscvrColors.midnightNavy : '#999'} />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'collections' && styles.activeTab]}
            onPress={() => setActiveTab('collections')}
          >
            <MaterialCommunityIcons name="folder-multiple-outline" size={22} color={activeTab === 'collections' ? dscvrColors.midnightNavy : '#999'} />
            <Text style={[styles.tabText, activeTab === 'collections' && styles.activeTabText]}>Lists</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderVideoPost = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.gridImage} />
      <View style={styles.videoIndicator}>
        <Ionicons name="play-circle" size={24} color="white" />
      </View>
      <View style={styles.postOverlay}>
        <View style={styles.postStat}>
          <Ionicons name="eye-outline" size={16} color="white" />
          <Text style={styles.postStatText}>{item.views}</Text>
        </View>
        <View style={styles.postStat}>
          <Ionicons name="star" size={16} color="white" />
          <Text style={styles.postStatText}>{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderWrittenReview = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.reviewCard}
      onPress={() => navigation.navigate('ReviewDetail', { reviewId: item.id })}
    >
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.thumbnail }} style={styles.reviewThumbnail} />
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewPlaceName} numberOfLines={1}>{item.placeName}</Text>
          <Text style={styles.reviewPlaceType}>{item.placeType}</Text>
          <View style={styles.reviewRating}>
            {[...Array(5)].map((_, i) => (
              <Ionicons 
                key={i} 
                name="star" 
                size={14} 
                color={i < Math.floor(item.rating) ? '#FFD700' : '#E0E0E0'} 
              />
            ))}
            <Text style={styles.reviewRatingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText} numberOfLines={3}>{item.reviewText}</Text>
      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{item.date}</Text>
        <View style={styles.reviewStats}>
          <View style={styles.reviewStat}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={styles.reviewStatText}>{item.likes}</Text>
          </View>
          <View style={styles.reviewStat}>
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.reviewStatText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSavedPlace = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => navigation.navigate('PlaceDetail', { placeId: item.id })}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.gridImage} />
      <View style={styles.savedOverlay}>
        <Text style={styles.savedName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.savedCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCollection = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.collectionItem}
      onPress={() => navigation.navigate('CollectionDetail', { collectionId: item.id })}
    >
      <Image source={{ uri: item.cover }} style={styles.collectionImage} />
      <View style={styles.collectionOverlay}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.collectionCount}>{item.count} places</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    let message = '';
    let icon = '';
    let buttonText = '';
    
    switch (activeTab) {
      case 'posts':
        message = "Share your experiences through video";
        icon = 'videocam-outline';
        buttonText = 'Record your first video';
        break;
      case 'reviews':
        message = "Write about places you've visited";
        icon = 'create-outline';
        buttonText = 'Write your first review';
        break;
      case 'saved':
        message = "Save places you want to remember";
        icon = 'bookmark-outline';
        break;
      case 'collections':
        message = "Create lists to organize your favorites";
        icon = 'folder-outline';
        buttonText = 'Create a list';
        break;
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name={icon as any} size={48} color="#CCC" />
        <Text style={styles.emptyStateText}>{message}</Text>
        {buttonText && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('Create')}
          >
            <Text style={styles.createButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return myVideoPosts.length > 0 ? (
          <FlatList
            data={myVideoPosts}
            renderItem={renderVideoPost}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        ) : renderEmptyState();
      case 'reviews':
        return myWrittenReviews.length > 0 ? (
          <FlatList
            data={myWrittenReviews}
            renderItem={renderWrittenReview}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reviewsContainer}
          />
        ) : renderEmptyState();
      case 'saved':
        return mySavedPlaces.length > 0 ? (
          <FlatList
            data={mySavedPlaces}
            renderItem={renderSavedPlace}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        ) : renderEmptyState();
      case 'collections':
        return myCollections.length > 0 ? (
          <FlatList
            data={myCollections}
            renderItem={renderCollection}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.collectionRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.collectionsContainer}
          />
        ) : renderEmptyState();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('AddFriends')}>
          <Ionicons name="person-add-outline" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerUsername}>{userData.username}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={renderHeader}
        data={[]}
        renderItem={null}
        ListFooterComponent={renderContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dscvrColors.pureWhite,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerUsername: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  header: {
    backgroundColor: dscvrColors.pureWhite,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 24,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: dscvrColors.electricMagenta,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: dscvrColors.pureWhite,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: 2,
  },
  bioSection: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  username: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    marginTop: 8,
    lineHeight: 20,
  },
  website: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.vividBlue,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  shareButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabScrollContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: dscvrColors.midnightNavy,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#999',
  },
  activeTabText: {
    color: dscvrColors.midnightNavy,
    fontFamily: FONTS.semiBold,
  },
  row: {
    gap: 2,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  postOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  postStatText: {
    color: 'white',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  reviewsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  reviewCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewPlaceName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  reviewPlaceType: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  reviewRatingText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#999',
  },
  reviewStats: {
    flexDirection: 'row',
    gap: 16,
  },
  reviewStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewStatText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#666',
  },
  savedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  savedName: {
    color: 'white',
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  savedCategory: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  collectionRow: {
    paddingHorizontal: 16,
    gap: 16,
  },
  collectionsContainer: {
    paddingVertical: 16,
  },
  collectionItem: {
    flex: 1,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  collectionName: {
    color: 'white',
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  collectionCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: dscvrColors.electricMagenta,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
});
