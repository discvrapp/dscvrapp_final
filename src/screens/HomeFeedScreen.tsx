import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';

const { width, height } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

interface VideoPost {
  id: string;
  videoUrl: string;
  thumbnail: string;
  user: {
    username: string;
    avatar: string;
    verified: boolean;
  };
  location: {
    id: string;
    name: string;
    type: string;
  };
  caption: string;
  sound: string;
  likes: number;
  comments: number;
  shares: number;
  saved: boolean;
  liked: boolean;
}

interface Comment {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  text: string;
  time: string;
  likes: number;
  replies: Comment[];
}

export default function HomeFeedScreen() {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [posts, setPosts] = useState<VideoPost[]>([
    {
      id: '1',
      videoUrl: '',
      thumbnail: 'https://picsum.photos/400/800?random=1',
      user: {
        username: 'foodie_adventures',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        verified: true,
      },
      location: {
        id: 'loc1',
        name: 'Blue Bottle Coffee',
        type: 'Coffee Shop',
      },
      caption: 'Best morning vibes at this hidden gem! ☕️ The latte art here is insane 🎨',
      sound: 'Chill Café Beats - Lofi Mix',
      likes: 2341,
      comments: 89,
      shares: 45,
      saved: false,
      liked: false,
    },
    {
      id: '2',
      videoUrl: '',
      thumbnail: 'https://picsum.photos/400/800?random=2',
      user: {
        username: 'nyc_explorer',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        verified: false,
      },
      location: {
        id: 'loc2',
        name: 'Westlight Rooftop',
        type: 'Bar',
      },
      caption: 'Sunset views that hit different 🌅 Tag your crew!',
      sound: 'Golden Hour - JVKE',
      likes: 5672,
      comments: 234,
      shares: 123,
      saved: true,
      liked: true,
    },
  ]);

  // Mock data for location-based videos
  const locationPosts: { [key: string]: VideoPost[] } = {
    'loc1': [
      {
        id: '3',
        videoUrl: '',
        thumbnail: 'https://picsum.photos/400/800?random=3',
        user: {
          username: 'coffee_lover23',
          avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
          verified: false,
        },
        location: {
          id: 'loc1',
          name: 'Blue Bottle Coffee',
          type: 'Coffee Shop',
        },
        caption: 'Their pour over is life changing! Must try the single origin 👌',
        sound: 'Coffee Shop Ambience',
        likes: 1234,
        comments: 45,
        shares: 23,
        saved: false,
        liked: false,
      },
      {
        id: '4',
        videoUrl: '',
        thumbnail: 'https://picsum.photos/400/800?random=4',
        user: {
          username: 'brunch_squad',
          avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
          verified: true,
        },
        location: {
          id: 'loc1',
          name: 'Blue Bottle Coffee',
          type: 'Coffee Shop',
        },
        caption: 'Weekend brunch spot found! The avocado toast is 🔥',
        sound: 'Sunday Morning - Maroon 5',
        likes: 3456,
        comments: 123,
        shares: 67,
        saved: true,
        liked: false,
      },
    ],
    'loc2': [
      {
        id: '5',
        videoUrl: '',
        thumbnail: 'https://picsum.photos/400/800?random=5',
        user: {
          username: 'sunset_chaser',
          avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
          verified: false,
        },
        location: {
          id: 'loc2',
          name: 'Westlight Rooftop',
          type: 'Bar',
        },
        caption: 'Cocktails with a view! Best spot in Brooklyn 🍹',
        sound: 'Summer Nights - The Weeknd',
        likes: 4567,
        comments: 234,
        shares: 89,
        saved: false,
        liked: false,
      },
    ],
  };

  const [comments] = useState<Comment[]>([
    {
      id: '1',
      user: {
        username: 'sarah_nyc',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      },
      text: 'This place looks amazing! Adding to my list 😍',
      time: '2h',
      likes: 23,
      replies: [],
    },
    {
      id: '2',
      user: {
        username: 'coffeeaddict22',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      },
      text: '@sarah_nyc you HAVE to try their seasonal blend!',
      time: '1h',
      likes: 5,
      replies: [],
    },
  ]);

  const navigateToLocationFeed = (location: any) => {
    setSelectedLocation(location);
    scrollViewRef.current?.scrollTo({ x: width, animated: true });
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const handleShare = async (post: VideoPost) => {
    try {
      const shareContent = {
        message: `Check out this amazing spot: ${post.location.name}\n\n"${post.caption}"\n\nShared via dscvr app`,
        url: `https://dscvr.app/post/${post.id}`,
        title: `${post.user.username} on dscvr`,
      };
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareContent.url, {
          dialogTitle: shareContent.title,
        });
      } else {
        if (navigator.share) {
          await navigator.share(shareContent);
        } else {
          console.log('Share not available');
        }
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handlePostComment = () => {
    if (commentText.trim()) {
      setCommentText('');
    }
  };

  const renderVideoPost = ({ item, index }: { item: VideoPost; index: number }, isLocationFeed: boolean = false) => (
    <View style={styles.videoContainer}>
      {/* Video/Image Background */}
      <Image source={{ uri: item.thumbnail }} style={styles.videoBackground} />
      
      {/* Dark gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Top Bar */}
      {!isLocationFeed && (
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.topTabs}>
            <TouchableOpacity style={styles.tabItem}>
              <Text style={styles.tabText}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>For You</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Content Overlay */}
      <View style={styles.contentOverlay}>
        {/* Left side - Post info */}
        <View style={styles.postInfo}>
          <TouchableOpacity style={styles.userInfo}>
            <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
            <Text style={styles.username}>@{item.user.username}</Text>
            {item.user.verified && (
              <MaterialCommunityIcons name="check-decagram" size={16} color={dscvrColors.vividBlue} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.locationInfo}
            onPress={() => !isLocationFeed && navigateToLocationFeed(item.location)}
            activeOpacity={0.7}
          >
            <Ionicons name="location-sharp" size={16} color="white" />
            <Text style={styles.locationName}>{item.location.name}</Text>
            <Text style={styles.locationType}>• {item.location.type}</Text>
          </TouchableOpacity>

          <Text style={styles.caption}>{item.caption}</Text>

          <TouchableOpacity style={styles.soundInfo}>
            <MaterialCommunityIcons name="music-note" size={16} color="white" />
            <Text style={styles.soundName}>{item.sound}</Text>
          </TouchableOpacity>
        </View>

        {/* Right side - Engagement buttons */}
        <View style={styles.engagementButtons}>
          <TouchableOpacity 
            style={styles.engagementButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={item.liked ? "heart" : "heart-outline"} 
              size={32} 
              color={item.liked ? dscvrColors.electricMagenta : "white"} 
            />
            <Text style={styles.engagementCount}>{item.likes > 999 ? `${(item.likes/1000).toFixed(1)}K` : item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.engagementButton}
            onPress={() => setShowComments(true)}
          >
            <Ionicons name="chatbubble-outline" size={30} color="white" />
            <Text style={styles.engagementCount}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.engagementButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={30} color="white" />
            <Text style={styles.engagementCount}>{item.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.engagementButton}
            onPress={() => handleSave(item.id)}
          >
            <Ionicons 
              name={item.saved ? "bookmark" : "bookmark-outline"} 
              size={30} 
              color={item.saved ? dscvrColors.seafoamTeal : "white"} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.engagementButton}>
            <Ionicons name="ellipsis-horizontal" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Hint */}
      {!isLocationFeed && (
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>Swipe right for more at {item.location.name} →</Text>
        </View>
      )}
    </View>
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>@{item.user.username}</Text>
          <Text style={styles.commentTime}>{item.time}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.commentAction}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={styles.commentActionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction}>
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const currentPost = posts[currentIndex];
  const currentLocationPosts = selectedLocation ? locationPosts[selectedLocation.id] || [] : 
                             currentPost ? locationPosts[currentPost.location.id] || [] : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / width);
          if (page === 0) {
            // Back to main feed
            setSelectedLocation(null);
          } else {
            // Update selected location based on current post
            const currentPost = posts[currentIndex];
            if (currentPost) {
              setSelectedLocation(currentPost.location);
            }
          }
        }}
      >
        {/* Main Feed Page */}
        <View style={styles.page}>
          <FlatList
            data={posts}
            renderItem={({ item, index }) => renderVideoPost({ item, index }, false)}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / height);
              setCurrentIndex(index);
            }}
          />
        </View>

        {/* Location Feed Page */}
        <View style={styles.page}>
          {/* Location Header */}
          <View style={styles.locationFeedHeader}>
            <TouchableOpacity 
              onPress={() => {
                setSelectedLocation(null);
                scrollViewRef.current?.scrollTo({ x: 0, animated: true });
              }}
            >
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.locationFeedTitleContainer}>
              <Ionicons name="location-sharp" size={20} color="white" />
              <Text style={styles.locationFeedTitle}>
                {selectedLocation?.name || currentPost?.location.name}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={currentLocationPosts}
            renderItem={({ item, index }) => renderVideoPost({ item, index }, true)}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            decelerationRate="fast"
          />
        </View>
      </Animated.ScrollView>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowComments(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.commentsContainer}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                  {posts[currentIndex]?.comments || 0} Comments
                </Text>
                <TouchableOpacity onPress={() => setShowComments(false)}>
                  <Ionicons name="close" size={24} color={dscvrColors.midnightNavy} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                style={styles.commentsList}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.commentInputContainer}>
                <Image 
                  source={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
                  style={styles.commentInputAvatar}
                />
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor="#999"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity 
                  onPress={handlePostComment}
                  disabled={!commentText.trim()}
                >
                  <Text style={[
                    styles.postButton,
                    !commentText.trim() && styles.postButtonDisabled
                  ]}>
                    Post
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  page: {
    width,
    height,
  },
  videoContainer: {
    width,
    height,
    position: 'relative',
  },
  videoBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topTabs: {
    flexDirection: 'row',
    gap: 20,
  },
  tabItem: {
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },
  activeTabText: {
    color: 'white',
    fontFamily: FONTS.semiBold,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: dscvrColors.electricMagenta,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  postInfo: {
    flex: 1,
    paddingRight: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  username: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: 'white',
    marginRight: 6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: 'white',
    marginLeft: 6,
  },
  locationType: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  caption: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: 'white',
    lineHeight: 18,
    marginBottom: 8,
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundName: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: 'white',
    marginLeft: 6,
  },
  engagementButtons: {
    alignItems: 'center',
    gap: 16,
  },
  engagementButton: {
    alignItems: 'center',
  },
  engagementCount: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: 'white',
    marginTop: 2,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationFeedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingBottom: 16,
  },
  locationFeedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationFeedTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  commentsTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  commentsList: {
    padding: 16,
    maxHeight: height * 0.5,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  commentTime: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: '#666',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    maxHeight: 80,
  },
  postButton: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.electricMagenta,
    marginLeft: 12,
  },
  postButtonDisabled: {
    color: '#CCC',
  },
});
