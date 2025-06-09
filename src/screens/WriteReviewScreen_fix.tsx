// Add these imports at the top of WriteReviewScreen.tsx
import * as ImagePicker from 'expo-image-picker';

// Inside the WriteReviewScreen component, add this function:
const pickImage = async () => {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'We need camera roll permissions to add photos');
    return;
  }

  // Launch image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows both images and videos
    allowsMultipleSelection: true,
    quality: 0.8,
    videoMaxDuration: 30, // 30 seconds max for videos
  });

  if (!result.canceled) {
    // Add selected media to state
    const newMedia = result.assets.map(asset => ({
      uri: asset.uri,
      type: asset.type || 'image', // 'image' or 'video'
      width: asset.width,
      height: asset.height,
      duration: asset.duration, // for videos
    }));
    
    setSelectedMedia(prev => [...prev, ...newMedia]);
  }
};

// Add state for selected media
const [selectedMedia, setSelectedMedia] = useState<any[]>([]);

// Update the media button to use pickImage
<TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
  <Ionicons name="camera-outline" size={24} color={dscvrColors.electricMagenta} />
  <Text style={styles.mediaButtonText}>Add Photos/Videos</Text>
</TouchableOpacity>

// Add a section to display selected media
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
          onPress={() => {
            setSelectedMedia(prev => prev.filter((_, i) => i !== index));
          }}
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
