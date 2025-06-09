import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
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

interface RecordingOption {
  id: string;
  duration: number;
  label: string;
}

interface Effect {
  id: string;
  name: string;
  icon: string;
}

interface Sound {
  id: string;
  name: string;
  artist: string;
  duration: number;
  coverUrl: string;
}

export default function VideoRecordScreen() {
  const navigation = useNavigation<any>();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [showBeautify, setShowBeautify] = useState(false);
  const [beautifyLevel, setBeautifyLevel] = useState(0.5);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(3);
  const [showEffects, setShowEffects] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [showSounds, setShowSounds] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const recordingProgressAnim = useRef(new Animated.Value(0)).current;
  const timerCountdown = useRef<number>(3);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const recordingOptions: RecordingOption[] = [
    { id: '15s', duration: 15, label: '15s' },
    { id: '30s', duration: 30, label: '30s' },
    { id: '60s', duration: 60, label: '60s' },
    { id: '3m', duration: 180, label: '3m' },
  ];

  const speeds = [
    { value: 0.3, label: '0.3x' },
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
  ];

  const effects: Effect[] = [
    { id: 'none', name: 'None', icon: 'close-circle-outline' },
    { id: 'beauty', name: 'Beauty', icon: 'sparkles' },
    { id: 'vintage', name: 'Vintage', icon: 'camera-outline' },
    { id: 'bw', name: 'B&W', icon: 'contrast-outline' },
    { id: 'neon', name: 'Neon', icon: 'color-palette-outline' },
    { id: 'blur', name: 'Blur', icon: 'water-outline' },
  ];

  const trendingSounds: Sound[] = [
    { id: '1', name: 'Trending Beat #1', artist: 'DJ Mix', duration: 30, coverUrl: 'https://picsum.photos/50/50?random=1' },
    { id: '2', name: 'Viral Dance', artist: 'Pop Artist', duration: 15, coverUrl: 'https://picsum.photos/50/50?random=2' },
    { id: '3', name: 'Chill Vibes', artist: 'Lo-Fi Producer', duration: 60, coverUrl: 'https://picsum.photos/50/50?random=3' },
  ];

  const pinchGesture = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          // Simple pinch zoom simulation
          const distance = Math.sqrt(
            Math.pow(evt.nativeEvent.touches[0].pageX - evt.nativeEvent.touches[1].pageX, 2) +
            Math.pow(evt.nativeEvent.touches[0].pageY - evt.nativeEvent.touches[1].pageY, 2)
          );
          const newZoom = Math.max(1, Math.min(5, distance / 100));
          setZoomLevel(newZoom);
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingProgress((prev) => {
          if (prev >= 1) {
            stopRecording();
            return 1;
          }
          return prev + 1 / (selectedDuration * 10);
        });
      }, 100);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording, selectedDuration]);

  const startRecording = () => {
    if (showTimer) {
      // Start countdown timer
      let countdown = timerSeconds;
      const timerInterval = setInterval(() => {
        countdown--;
        if (countdown === 0) {
          clearInterval(timerInterval);
          setIsRecording(true);
        }
      }, 1000);
    } else {
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingProgress(0);
    
    // Get the mode from navigation params
    const route = navigation.getState().routes.find(r => r.name === 'VideoRecord');
    const mode = route?.params?.mode || 'standalone';
    
    // Navigate based on mode
    Alert.alert(
      'Recording Complete',
      'In a real app, this would navigate to the appropriate screen',
      [
        { text: 'Retake', style: 'cancel' },
        { 
          text: 'Next', 
          onPress: () => {
            if (mode === 'review') {
              // Go back to review screen with video
              navigation.navigate('Home', { screen: 'WriteReview', params: { videoUri: 'mock-video-uri' } });
            } else {
              // Go to video edit screen
              navigation.navigate('VideoEdit');
            }
          }
        }
      ]
    );
  };
  const toggleCamera = () => {
    setCameraType(cameraType === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    const modes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flashMode);
    setFlashMode(modes[(currentIndex + 1) % modes.length]);
  };

  const handleUpload = () => {
    Alert.alert(
      'Upload Video',
      'Select a video from your gallery',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose Video', onPress: () => console.log('Open gallery') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Camera View Placeholder */}
      <View style={styles.cameraContainer} {...pinchGesture.panHandlers}>
        <View style={styles.cameraPlaceholder}>
          <Ionicons name="camera" size={80} color="rgba(255,255,255,0.3)" />
          <Text style={styles.cameraPlaceholderText}>Camera Preview</Text>
          <Text style={styles.zoomText}>Zoom: {zoomLevel.toFixed(1)}x</Text>
        </View>

        {/* Top Controls */}
        <SafeAreaView style={styles.topControls}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topButton}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.topCenterControls}>
            {selectedSound && (
              <TouchableOpacity style={styles.soundPill} onPress={() => setShowSounds(true)}>
                <Ionicons name="musical-notes" size={16} color="white" />
                <Text style={styles.soundPillText}>{selectedSound.name}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.topRightControls}>
            <TouchableOpacity onPress={toggleFlash} style={styles.topButton}>
              <Ionicons 
                name={flashMode === 'off' ? 'flash-off' : flashMode === 'on' ? 'flash' : 'flash-outline'} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCamera} style={styles.topButton}>
              <Ionicons name="camera-reverse-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Recording Progress Bar */}
        {isRecording && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  { width: `${recordingProgress * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Right Side Controls */}
        <View style={styles.rightControls}>
          <TouchableOpacity 
            style={styles.sideButton}
            onPress={() => setShowSounds(true)}
          >
            <Ionicons name="musical-notes" size={24} color="white" />
            <Text style={styles.sideButtonText}>Sounds</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sideButton}
            onPress={() => setShowEffects(true)}
          >
            <MaterialCommunityIcons name="auto-fix" size={24} color="white" />
            <Text style={styles.sideButtonText}>Effects</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sideButton}
            onPress={() => setShowBeautify(!showBeautify)}
          >
            <Ionicons name="sparkles" size={24} color="white" />
            <Text style={styles.sideButtonText}>Beauty</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sideButton}
            onPress={() => setShowTimer(!showTimer)}
          >
            <Ionicons name="timer-outline" size={24} color="white" />
            <Text style={styles.sideButtonText}>Timer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideButton}>
            <MaterialCommunityIcons name="sticker-emoji" size={24} color="white" />
            <Text style={styles.sideButtonText}>Stickers</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Speed Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.speedSelector}
          >
            {speeds.map((speed) => (
              <TouchableOpacity
                key={speed.value}
                style={[
                  styles.speedButton,
                  selectedSpeed === speed.value && styles.speedButtonActive
                ]}
                onPress={() => setSelectedSpeed(speed.value)}
              >
                <Text style={[
                  styles.speedButtonText,
                  selectedSpeed === speed.value && styles.speedButtonTextActive
                ]}>
                  {speed.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recording Controls */}
          <View style={styles.recordingControls}>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              <Ionicons name="image-outline" size={32} color="white" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonRecording]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerRecording]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.effectsButton}>
              <MaterialCommunityIcons name="face-recognition" size={32} color="white" />
              <Text style={styles.uploadButtonText}>Effects</Text>
            </TouchableOpacity>
          </View>

          {/* Duration Selector */}
          <View style={styles.durationSelector}>
            {recordingOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.durationButton,
                  selectedDuration === option.duration && styles.durationButtonActive
                ]}
                onPress={() => setSelectedDuration(option.duration)}
              >
                <Text style={[
                  styles.durationButtonText,
                  selectedDuration === option.duration && styles.durationButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Beauty Slider */}
        {showBeautify && (
          <BlurView intensity={80} tint="dark" style={styles.beautyControls}>
            <Text style={styles.beautyTitle}>Beauty Level</Text>
            <View style={styles.beautySlider}>
              <Text style={styles.beautyValue}>0</Text>
              <View style={styles.sliderTrack}>
                <View 
                  style={[styles.sliderFill, { width: `${beautifyLevel * 100}%` }]} 
                />
                <View 
                  style={[styles.sliderThumb, { left: `${beautifyLevel * 100}%` }]} 
                />
              </View>
              <Text style={styles.beautyValue}>100</Text>
            </View>
          </BlurView>
        )}

        {/* Timer Options */}
        {showTimer && (
          <BlurView intensity={80} tint="dark" style={styles.timerControls}>
            <Text style={styles.timerTitle}>Timer</Text>
            <View style={styles.timerOptions}>
              {[3, 5, 10].map((seconds) => (
                <TouchableOpacity
                  key={seconds}
                  style={[
                    styles.timerOption,
                    timerSeconds === seconds && styles.timerOptionActive
                  ]}
                  onPress={() => setTimerSeconds(seconds)}
                >
                  <Text style={[
                    styles.timerOptionText,
                    timerSeconds === seconds && styles.timerOptionTextActive
                  ]}>
                    {seconds}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        )}
      </View>

      {/* Effects Panel */}
      {showEffects && (
        <View style={styles.effectsPanel}>
          <View style={styles.effectsHeader}>
            <Text style={styles.effectsTitle}>Effects</Text>
            <TouchableOpacity onPress={() => setShowEffects(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.effectsList}>
              {effects.map((effect) => (
                <TouchableOpacity
                  key={effect.id}
                  style={[
                    styles.effectItem,
                    selectedEffect === effect.id && styles.effectItemActive
                  ]}
                  onPress={() => {
                    setSelectedEffect(effect.id);
                    setShowEffects(false);
                  }}
                >
                  <Ionicons name={effect.icon as any} size={32} color="white" />
                  <Text style={styles.effectName}>{effect.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Sounds Panel */}
      {showSounds && (
        <View style={styles.soundsPanel}>
          <View style={styles.soundsHeader}>
            <Text style={styles.soundsTitle}>Add Sound</Text>
            <TouchableOpacity onPress={() => setShowSounds(false)}>
              <Ionicons name="close" size={24} color={dscvrColors.midnightNavy} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <TouchableOpacity style={styles.soundSearchBar}>
              <Ionicons name="search" size={20} color="#999" />
              <Text style={styles.soundSearchText}>Search sounds</Text>
            </TouchableOpacity>
            <Text style={styles.soundsSection}>Trending</Text>
            {trendingSounds.map((sound) => (
              <TouchableOpacity
                key={sound.id}
                style={styles.soundItem}
                onPress={() => {
                  setSelectedSound(sound);
                  setShowSounds(false);
                }}
              >
                <View style={styles.soundCover} />
                <View style={styles.soundInfo}>
                  <Text style={styles.soundName}>{sound.name}</Text>
                  <Text style={styles.soundArtist}>{sound.artist} • {sound.duration}s</Text>
                </View>
                <TouchableOpacity style={styles.soundUse}>
                  <Text style={styles.soundUseText}>Use</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 16,
    fontFamily: FONTS.medium,
  },
  zoomText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 8,
    fontFamily: FONTS.regular,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  topCenterControls: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  soundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  soundPillText: {
    color: 'white',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: dscvrColors.electricMagenta,
  },
  rightControls: {
    position: 'absolute',
    right: 16,
    top: '25%',
    gap: 20,
  },
  sideButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sideButtonText: {
    color: 'white',
    fontSize: 10,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
  },
  speedSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  speedButtonActive: {
    backgroundColor: dscvrColors.electricMagenta,
  },
  speedButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  speedButtonTextActive: {
    fontFamily: FONTS.semiBold,
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  uploadButton: {
    alignItems: 'center',
    flex: 1,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 10,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonRecording: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  recordButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: dscvrColors.electricMagenta,
  },
  recordButtonInnerRecording: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  effectsButton: {
    alignItems: 'center',
    flex: 1,
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  durationButton: {
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  durationButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },
  durationButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  durationButtonTextActive: {
    color: 'white',
    fontFamily: FONTS.semiBold,
  },
  beautyControls: {
    position: 'absolute',
    bottom: 240,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    padding: 20,
  },
  beautyTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginBottom: 16,
  },
  beautySlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  beautyValue: {
    color: 'white',
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: dscvrColors.electricMagenta,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    top: -8,
    marginLeft: -10,
  },
  timerControls: {
    position: 'absolute',
    bottom: 240,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    padding: 20,
  },
  timerTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginBottom: 16,
  },
  timerOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  timerOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerOptionActive: {
    borderColor: dscvrColors.electricMagenta,
    backgroundColor: 'rgba(229, 0, 164, 0.2)',
  },
  timerOptionText: {
    color: 'white',
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  timerOptionTextActive: {
    fontFamily: FONTS.semiBold,
  },
  effectsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  effectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  effectsTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  effectsList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  effectItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  effectItemActive: {
    backgroundColor: dscvrColors.electricMagenta,
  },
  effectName: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    fontFamily: FONTS.regular,
  },
  soundsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.8,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  soundsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  soundsTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  soundSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  soundSearchText: {
    fontSize: 16,
    color: '#999',
    fontFamily: FONTS.regular,
  },
  soundsSection: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  soundCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  soundInfo: {
    flex: 1,
    marginLeft: 12,
  },
  soundName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  soundArtist: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: 2,
  },
  soundUse: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: dscvrColors.electricMagenta,
    borderRadius: 20,
  },
  soundUseText: {
    color: 'white',
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
});
