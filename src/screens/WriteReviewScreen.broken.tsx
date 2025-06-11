import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { addReview } from '../services/firebase';
import { auth } from '../services/firebase';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'WriteReview'>;

interface Amenity {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

const availableAmenities: Amenity[] = [
  { id: 'wifi', name: 'WiFi', icon: 'wifi-outline', selected: false },
  { id: 'parking', name: 'Parking', icon: 'car-outline', selected: false },
  { id: 'outdoor', name: 'Outdoor Seating', icon: 'sunny-outline', selected: false },
  { id: 'pets', name: 'Pet Friendly', icon: 'paw-outline', selected: false },
  { id: 'wheelchair', name: 'Wheelchair Access', icon: 'accessibility-outline', selected: false },
  { id: 'music', name: 'Live Music', icon: 'musical-notes-outline', selected: false },
  { id: 'games', name: 'Games/Activities', icon: 'game-controller-outline', selected: false },
  { id: 'kids', name: 'Kid Friendly', icon: 'happy-outline', selected: false },
  { id: 'vegan', name: 'Vegan Options', icon: 'leaf-outline', selected: false },
  { id: 'delivery', name: 'Delivery', icon: 'bicycle-outline', selected: false },
  { id: 'reservation', name: 'Reservations', icon: 'calendar-outline', selected: false },
  { id: 'bar', name: 'Full Bar', icon: 'wine-outline', selected: false },
];

export default function WriteReviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { placeId = 'temp-place-id', placeName = 'New Review' } = route.params || {};

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [videoReview, setVideoReview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewType, setReviewType] = useState<'text' | 'video'>('text');
  const [amenities, setAmenities] = useState<Amenity[]>(availableAmenities);
  const [useVideoCaption, setUseVideoCaption] = useState(true);
  const [videoCaption, setVideoCaption] = useState('');

  const toggleAmenity = (amenityId: string) => {
    setAmenities(prev => 
      prev.map(amenity => 
        amenity.id === amenityId 
          ? { ...amenity, selected: !amenity.selected }
          : amenity
      )
    );
  };

  const pickMedia = async () => {
    try {
      console.log("About to call Firebase addReview...");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to add media to your review.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => console.log('Open settings') }
          ]
        );
        return;
      }
    } catch (validationError) {
      console.log("Validation error:", validationError);
    }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'All',
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        videoMaxDuration: 60,
      });
      console.log("Firebase addReview completed successfully!");

      if (!result.canceled && result.assets) {
        const newMedia = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image',
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
        }));
        
        setSelectedMedia(prev => [...prev, ...newMedia].slice(0, 5));
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      console.log("About to call Firebase addReview...");
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your camera.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => console.log('Open settings') }
          ]
        );
        return;
      }
    } catch (validationError) {
      console.log("Validation error:", validationError);
    }
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });
      console.log("Firebase addReview completed successfully!");

      if (!result.canceled && result.assets) {
        const newMedia = [{
          uri: result.assets[0].uri,
          type: 'image',
          width: result.assets[0].width,
          height: result.assets[0].height,
        }];
        
        setSelectedMedia(prev => [...prev, ...newMedia].slice(0, 5));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const recordVideoReview = () => {
    navigation.navigate('VideoRecord', {
      onVideoRecorded: (videoData: any) => {
        setVideoReview(videoData);
        setReviewType('video');
      }
    });
  };

  const showMediaOptions = () => {
    Alert.alert(
      'Add Media',
      'Choose how you want to add media',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickMedia },
        { text: 'Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const submitReview = async () => {
    console.log("=== SUBMIT REVIEW START ===");
    console.log("Rating:", rating);
    console.log("Review text:", reviewText);
    
    if (isSubmitting) {
      console.log("Already submitting, ignoring...");
      return;
      }
    } catch (validationError) {
      console.log("Validation error:", validationError);
    }
    }
    
    console.log("Checking rating validation...");
    if (!rating) {
      Alert.alert("Rating Required", "Please select a rating");
      return;
      }
    } catch (validationError) {
      console.log("Validation error:", validationError);
    }
    }
    
    const finalReviewText = videoReview && useVideoCaption ? reviewText : (videoCaption || reviewText);
    console.log("Final review text:", finalReviewText);
    console.log("Final review text type:", typeof finalReviewText);
    console.log("About to check review text validation...");
    
    try {
      if (!finalReviewText.trim() && !videoReview) {
      console.log("Review text validation failed!");
      Alert.alert("Review Required", "Please write a review or record a video");
      return;
      }
    } catch (validationError) {
      console.log("Validation error:", validationError);
    }
    }
    
    console.log("Current user:", auth.currentUser);
    console.log("Current user exists:", !!auth.currentUser);
    console.log("About to check auth validation...");
    if (!auth.currentUser) {
      Alert.alert("Login Required", "Please login to submit a review");
      return;
      }
    } catch (validationError) {
      console.log("Validation error:", validationError);
    }
    }
    
    console.log("All validations passed, setting isSubmitting...");
    console.log("Setting isSubmitting to true...");
    setIsSubmitting(true);
    
    try {
      console.log("About to call Firebase addReview...");
      const selectedAmenities = amenities
        .filter(a => a.selected)
        .map(a => ({ id: a.id, name: a.name }));
      
      await addReview({
        placeId,
        placeName,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
        rating,
        text: finalReviewText.trim(),
        images: selectedMedia.map(m => m.uri),
        video: videoReview?.uri,
        amenities: selectedAmenities,
        reviewType,
        createdAt: new Date().toISOString(),
      });
      
      console.log("Firebase addReview completed successfully!");
      
      Alert.alert(
        "Review Posted!", 
        "Thank you for sharing your experience!", 
        [
          { 
            text: "OK", 
            onPress: () => {
              setRating(0);
              setReviewText("");
              setSelectedMedia([]);
              setVideoReview(null);
              setAmenities(availableAmenities);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      console.log("Setting isSubmitting to false...");
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Write a Review</Text>
          <TouchableOpacity 
            onPress={submitReview} 
            disabled={isSubmitting} 
            style={styles.postButtonContainer}
          >
            <Text style={[
              styles.submitButton, 
              isSubmitting && styles.submitButtonDisabled
            ]}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Place Name */}
          <View style={styles.placeSection}>
            <Text style={styles.placeName}>{placeName}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= rating ? dscvrColors.electricMagenta : '#D0D0D0'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Review Type Toggle */}
          <View style={styles.reviewTypeSection}>
            <Text style={styles.sectionTitle}>Review Type</Text>
            <View style={styles.reviewTypeToggle}>
              <TouchableOpacity
                style={[styles.reviewTypeOption, reviewType === 'text' && styles.reviewTypeActive]}
                onPress={() => setReviewType('text')}
              >
                <Ionicons name="create-outline" size={20} color={reviewType === 'text' ? dscvrColors.pureWhite : dscvrColors.midnightNavy} />
                <Text style={[styles.reviewTypeText, reviewType === 'text' && styles.reviewTypeTextActive]}>
                  Written Review
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewTypeOption, reviewType === 'video' && styles.reviewTypeActive]}
                onPress={() => setReviewType('video')}
              >
                <Ionicons name="videocam-outline" size={20} color={reviewType === 'video' ? dscvrColors.pureWhite : dscvrColors.midnightNavy} />
                <Text style={[styles.reviewTypeText, reviewType === 'video' && styles.reviewTypeTextActive]}>
                  Video Review
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Review Text */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>
              {videoReview ? 'Video Caption' : 'Your Review'}
            </Text>
            <TextInput
              style={styles.reviewInput}
              placeholder={videoReview ? "Add a caption to your video..." : "Share your experience..."}
              placeholderTextColor="#999"
              multiline
              value={videoReview ? videoCaption : reviewText}
              onChangeText={videoReview ? setVideoCaption : setReviewText}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {(videoReview ? videoCaption : reviewText).length}/500
            </Text>
            
            {videoReview && (
              <TouchableOpacity 
                style={styles.useCaptionToggle}
                onPress={() => setUseVideoCaption(!useVideoCaption)}
              >
                <Ionicons 
                  name={useVideoCaption ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={dscvrColors.electricMagenta} 
                />
                <Text style={styles.useCaptionText}>
                  Use written review as video caption
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Video Recording Button */}
          {reviewType === 'video' && !videoReview && (
            <View style={styles.videoSection}>
              <TouchableOpacity style={styles.recordVideoButton} onPress={recordVideoReview}>
                <LinearGradient
                  colors={[dscvrColors.electricMagenta, dscvrColors.royalPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.recordVideoGradient}
                >
                  <Ionicons name="videocam" size={24} color={dscvrColors.pureWhite} />
                  <Text style={styles.recordVideoText}>Record Video Review</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.videoHint}>
                Create a TikTok-style video review (up to 60 seconds)
              </Text>
            </View>
          )}

          {/* Video Preview */}
          {videoReview && (
            <View style={styles.videoPreviewSection}>
              <View style={styles.videoPreview}>
                <Image source={{ uri: videoReview.thumbnail }} style={styles.videoThumbnail} />
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={50} color={dscvrColors.pureWhite} />
                </View>
                <TouchableOpacity 
                  style={styles.removeVideoButton}
                  onPress={() => setVideoReview(null)}
                >
                  <Ionicons name="close-circle" size={30} color={dscvrColors.electricMagenta} />
                </TouchableOpacity>
              </View>
              <Text style={styles.videoDuration}>Duration: {videoReview.duration}s</Text>
            </View>
          )}

          {/* Media Section (for written reviews) */}
          {reviewType === 'text' && (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Add Photos & Videos</Text>
              
              <TouchableOpacity style={styles.mediaButton} onPress={showMediaOptions}>
                <Ionicons name="images-outline" size={24} color={dscvrColors.electricMagenta} />
                <Text style={styles.mediaButtonText}>
                  Add Media ({selectedMedia.length}/5)
                </Text>
              </TouchableOpacity>

              {selectedMedia.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.mediaPreviewContainer}
                >
                  {selectedMedia.map((media, index) => (
                    <View key={index} style={styles.mediaPreview}>
                      <Image source={{ uri: media.uri }} style={styles.mediaPreviewImage} />
                      <TouchableOpacity 
                        style={styles.removeMediaButton}
                        onPress={() => removeMedia(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={dscvrColors.electricMagenta} />
                      </TouchableOpacity>
                      {media.type === 'video' && (
                        <View style={styles.videoIndicator}>
                          <Ionicons name="play-circle" size={30} color={dscvrColors.pureWhite} />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Amenities Section */}
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Amenities & Features</Text>
            <Text style={styles.amenitiesSubtitle}>
              Select the amenities available at this place
            </Text>
            <View style={styles.amenitiesGrid}>
              {amenities.map((amenity) => (
                <TouchableOpacity
                  key={amenity.id}
                  style={[
                    styles.amenityItem,
                    amenity.selected && styles.amenityItemSelected
                  ]}
                  onPress={() => toggleAmenity(amenity.id)}
                >
                  <Ionicons 
                    name={amenity.icon as any} 
                    size={24} 
                    color={amenity.selected ? dscvrColors.pureWhite : dscvrColors.midnightNavy} 
                  />
                  <Text style={[
                    styles.amenityText,
                    amenity.selected && styles.amenityTextSelected
                  ]}>
                    {amenity.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>Writing tips:</Text>
            <Text style={styles.tipText}>• Be specific about what you liked or didn't like</Text>
            <Text style={styles.tipText}>• Mention the atmosphere, service, and food quality</Text>
            <Text style={styles.tipText}>• Help others by sharing helpful details</Text>
            <Text style={styles.tipText}>• Select amenities to help others know what to expect</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dscvrColors.pureWhite,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  submitButton: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.electricMagenta,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  postButtonContainer: {
    minWidth: 60,
    minHeight: 44,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  placeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  placeName: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  ratingSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  reviewTypeSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  reviewTypeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: dscvrColors.pureWhite,
  },
  reviewTypeActive: {
    backgroundColor: dscvrColors.electricMagenta,
    borderColor: dscvrColors.electricMagenta,
  },
  reviewTypeText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  reviewTypeTextActive: {
    color: dscvrColors.pureWhite,
  },
  reviewSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    fontSize: 16,
    color: dscvrColors.midnightNavy,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  useCaptionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  useCaptionText: {
    fontSize: 14,
    color: dscvrColors.midnightNavy,
  },
  videoSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  recordVideoButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  recordVideoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  recordVideoText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.pureWhite,
  },
  videoHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  videoPreviewSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  removeVideoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
  },
  videoDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  mediaSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  mediaButtonText: {
    fontSize: 16,
    color: dscvrColors.electricMagenta,
    fontFamily: FONTS.medium,
  },
  mediaPreviewContainer: {
    marginTop: 16,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaPreviewImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  amenitiesSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  amenitiesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    marginTop: -8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amenityItemSelected: {
    backgroundColor: dscvrColors.electricMagenta,
    borderColor: dscvrColors.electricMagenta,
  },
  amenityText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  amenityTextSelected: {
    color: dscvrColors.pureWhite,
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
