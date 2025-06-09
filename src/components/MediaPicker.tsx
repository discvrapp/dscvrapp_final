import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface MediaPickerProps {
  selectedMedia: any[];
  onMediaSelected: (media: any[]) => void;
  onMediaRemoved: (index: number) => void;
  maxItems?: number;
}

const dscvrColors = {
  electricMagenta: '#E500A4',
  pureWhite: '#FFFFFF',
  midnightNavy: '#0D2D4F',
};

export default function MediaPicker({ 
  selectedMedia, 
  onMediaSelected, 
  onMediaRemoved,
  maxItems = 5 
}: MediaPickerProps) {
  
  const pickMedia = async () => {
    if (selectedMedia.length >= maxItems) {
      Alert.alert('Limit Reached', `You can only add up to ${maxItems} items`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to add photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      videoMaxDuration: 30,
      selectionLimit: maxItems - selectedMedia.length,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type || 'image',
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
      }));
      
      onMediaSelected([...selectedMedia, ...newMedia]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const newMedia = [{
        uri: result.assets[0].uri,
        type: 'image',
        width: result.assets[0].width,
        height: result.assets[0].height,
      }];
      
      onMediaSelected([...selectedMedia, ...newMedia]);
    }
  };

  const showMediaOptions = () => {
    Alert.alert(
      'Add Media',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickMedia },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View>
      <TouchableOpacity style={styles.addButton} onPress={showMediaOptions}>
        <Ionicons name="camera-outline" size={24} color={dscvrColors.electricMagenta} />
        <Text style={styles.addButtonText}>
          Add Photos/Videos ({selectedMedia.length}/{maxItems})
        </Text>
      </TouchableOpacity>

      {selectedMedia.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.mediaContainer}
        >
          {selectedMedia.map((media, index) => (
            <View key={index} style={styles.mediaItem}>
              <Image source={{ uri: media.uri }} style={styles.mediaThumbnail} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => onMediaRemoved(index)}
              >
                <Ionicons name="close-circle" size={24} color={dscvrColors.electricMagenta} />
              </TouchableOpacity>
              {media.type === 'video' && (
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={30} color={dscvrColors.pureWhite} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: dscvrColors.electricMagenta,
  },
  mediaContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  mediaItem: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  videoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
});
