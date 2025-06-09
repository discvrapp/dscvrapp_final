import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { searchNearbyPlaces, buildPhotoUrl } from '../services/googlePlaces';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  venues?: any[];
  itinerary?: any;
}

interface QuickOption {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

const quickOptions: QuickOption[] = [
  {
    id: 'romantic',
    label: 'Romantic Date',
    icon: 'heart-outline',
    prompt: 'Plan a romantic date night for two',
  },
  {
    id: 'friends',
    label: 'Night with Friends',
    icon: 'people-outline',
    prompt: 'Plan a fun night out with friends',
  },
  {
    id: 'adventure',
    label: 'Adventure Night',
    icon: 'compass-outline',
    prompt: 'Plan an adventurous evening',
  },
  {
    id: 'chill',
    label: 'Chill Evening',
    icon: 'cafe-outline',
    prompt: 'Plan a relaxed, low-key evening',
  },
];

// Conversation templates for free AI experience
const conversationFlows = {
  greeting: "Hey! I'm your personal night planner. What kind of evening are you looking for? 🌙",
  
  romantic: {
    followUp: "Perfect! A romantic evening it is 💕 What time would you like to start?",
    timeResponse: "Great! For a romantic evening starting at {time}, I'd suggest:",
    venues: ['romantic restaurant', 'cocktail bar', 'scenic viewpoint'],
  },
  
  friends: {
    followUp: "Awesome! Let's plan something fun with your crew 🎉 How many people?",
    sizeResponse: "Nice! For a group of {size}, here's what I recommend:",
    venues: ['trendy bar', 'live music venue', 'late night food'],
  },
  
  adventure: {
    followUp: "Love the adventurous spirit! 🎭 Are you up for something active or more cultural?",
    typeResponse: "Excellent choice! Here's an {type} adventure for you:",
    venues: ['escape room', 'bowling alley', 'karaoke bar', 'comedy club'],
  },
  
  chill: {
    followUp: "Sometimes chill is the way to go 😌 Coffee, dinner, or something else?",
    preferenceResponse: "Sounds perfect! Here are some great {preference} spots:",
    venues: ['cozy cafe', 'quiet restaurant', 'bookstore cafe', 'wine bar'],
  },
};

export default function PlanMyNightScreen() {
  const navigation = useNavigation<NavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: conversationFlows.greeting,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [conversationState, setConversationState] = useState<{
    type?: string;
    step?: string;
    data?: any;
  }>({});

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      processUserInput(text);
    }, 1000);
  };

  const processUserInput = async (input: string) => {
    const lowerInput = input.toLowerCase();
    let aiResponse: Message;

    // Check if it's a quick option or initial choice
    if (!conversationState.type) {
      // Determine conversation type
      let type = '';
      if (lowerInput.includes('romantic') || lowerInput.includes('date')) {
        type = 'romantic';
      } else if (lowerInput.includes('friend')) {
        type = 'friends';
      } else if (lowerInput.includes('adventure')) {
        type = 'adventure';
      } else if (lowerInput.includes('chill') || lowerInput.includes('relax')) {
        type = 'chill';
      }

      if (type) {
        setConversationState({ type, step: 'details' });
        aiResponse = {
          id: Date.now().toString(),
          text: conversationFlows[type].followUp,
          sender: 'ai',
          timestamp: new Date(),
        };
      } else {
        aiResponse = {
          id: Date.now().toString(),
          text: "I didn't quite catch that. Are you looking for something romantic, fun with friends, adventurous, or just chill?",
          sender: 'ai',
          timestamp: new Date(),
        };
      }
    } else if (conversationState.step === 'details') {
      // Process details and fetch venues
      await fetchAndRecommendVenues(input);
      return;
    } else if (conversationState.step === 'venues_shown') {
      // Handle venue selection or modifications
      if (lowerInput.includes('perfect') || lowerInput.includes('great') || lowerInput.includes('yes')) {
        createItinerary();
        return;
      } else {
        aiResponse = {
          id: Date.now().toString(),
          text: "Would you like me to find different options? Just tell me what you'd prefer!",
          sender: 'ai',
          timestamp: new Date(),
        };
      }
    }

    setMessages(prev => [...prev, aiResponse!]);
    setIsTyping(false);
    scrollToBottom();
  };


  const fetchAndRecommendVenues = async (details: string) => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location to get personalized recommendations');
      setIsTyping(false);
      return;
    }

    try {
      const { type } = conversationState;
      const venueTypes = conversationFlows[type!].venues;
      
      const venuePromises = venueTypes.map(query => 
        searchNearbyPlaces(
          userLocation.lat,
          userLocation.lng,
          5000,
          ['restaurant', 'bar', 'cafe', 'night_club'],
          query
        )
      );

      const results = await Promise.all(venuePromises);
      const venues = results.flatMap((result, index) => 
        result.slice(0, 2).map(place => ({
          ...place,
          venueType: venueTypes[index],
          image: place.photos?.[0] ? buildPhotoUrl(place.photos[0].photo_reference) : null,
        }))
      );

      const aiResponse: Message = {
        id: Date.now().toString(),
        text: `Based on what you told me, here's my personalized itinerary for your ${type} evening:`,
        sender: 'ai',
        timestamp: new Date(),
        venues,
      };

      setMessages(prev => [...prev, aiResponse]);
      setConversationState({ ...conversationState, step: 'venues_shown', venues });
      setIsTyping(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching venues:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I had trouble finding venues. Let me try again!",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const createItinerary = () => {
    const { venues } = conversationState;
    const itinerary = {
      id: Date.now().toString(),
      title: `Your ${conversationState.type} Night`,
      venues: venues || [],
      createdAt: new Date(),
    };

    const aiResponse: Message = {
      id: Date.now().toString(),
      text: "Perfect! I've saved your itinerary. Have an amazing night! 🎉",
      sender: 'ai',
      timestamp: new Date(),
      itinerary,
    };

    setMessages(prev => [...prev, aiResponse]);
    setConversationState({ ...conversationState, step: 'complete' });
    setIsTyping(false);
    scrollToBottom();
  };

  const handleQuickOption = (option: QuickOption) => {
    sendMessage(option.prompt);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (message: Message) => {
    const isAI = message.sender === 'ai';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isAI ? styles.aiMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isAI && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color={dscvrColors.electricMagenta} />
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isAI ? styles.aiMessageBubble : styles.userMessageBubble,
          ]}
        >
          <Text style={[styles.messageText, isAI ? styles.aiMessageText : styles.userMessageText]}>
            {message.text}
          </Text>
        </View>

        {/* Render venues if present */}
        {message.venues && message.venues.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.venuesContainer}
            contentContainerStyle={styles.venuesContent}
          >
            {message.venues.map((venue, index) => (
              <TouchableOpacity
                key={venue.place_id}
                style={styles.venueCard}
                onPress={() => navigation.navigate('PlaceDetail', { placeId: venue.place_id })}
              >
                {venue.image ? (
                  <Image source={{ uri: venue.image }} style={styles.venueImage} />
                ) : (
                  <View style={styles.venueImagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#CCC" />
                  </View>
                )}
                <View style={styles.venueInfo}>
                  <Text style={styles.venueStep}>Stop {index + 1}: {venue.venueType}</Text>
                  <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
                  <View style={styles.venueDetails}>
                    {venue.rating && (
                      <View style={styles.venueRating}>
                        <Ionicons name="star" size={12} color={dscvrColors.electricMagenta} />
                        <Text style={styles.venueRatingText}>{venue.rating}</Text>
                      </View>
                    )}
                    <Text style={styles.venueAddress} numberOfLines={1}>
                      {venue.vicinity}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Render itinerary summary if present */}
        {message.itinerary && (
          <View style={styles.itineraryCard}>
            <LinearGradient
              colors={[dscvrColors.electricMagenta, dscvrColors.royalPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.itineraryGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color={dscvrColors.pureWhite} />
              <Text style={styles.itineraryTitle}>Itinerary Saved!</Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.viewItineraryButton}
              onPress={() => console.log('View itinerary')}
            >
              <Text style={styles.viewItineraryText}>View Full Itinerary</Text>
              <Ionicons name="arrow-forward" size={16} color={dscvrColors.electricMagenta} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan My Night</Text>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={dscvrColors.electricMagenta} />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          )}

          {/* Quick Options - show only at start */}
          {messages.length === 1 && (
            <View style={styles.quickOptionsContainer}>
              <Text style={styles.quickOptionsTitle}>Quick Start:</Text>
              <View style={styles.quickOptionsGrid}>
                {quickOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.quickOption}
                    onPress={() => handleQuickOption(option)}
                  >
                    <Ionicons name={option.icon as any} size={24} color={dscvrColors.electricMagenta} />
                    <Text style={styles.quickOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? dscvrColors.pureWhite : '#999'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: dscvrColors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  messagesContainer: {
    flex: 1,
    paddingBottom: 60,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: dscvrColors.electricMagenta + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  aiMessageBubble: {
    backgroundColor: dscvrColors.pureWhite,
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: {
    backgroundColor: dscvrColors.electricMagenta,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageText: {
    color: dscvrColors.midnightNavy,
  },
  userMessageText: {
    color: dscvrColors.pureWhite,
  },
  venuesContainer: {
    marginTop: 12,
    maxWidth: '100%',
  },
  venuesContent: {
    gap: 12,
  },
  venueCard: {
    width: 250,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueImage: {
    width: '100%',
    height: 120,
  },
  venueImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfo: {
    padding: 12,
  },
  venueStep: {
    fontSize: 12,
    color: dscvrColors.electricMagenta,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  venueName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueRatingText: {
    fontSize: 12,
    color: dscvrColors.midnightNavy,
  },
  venueAddress: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  itineraryCard: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: dscvrColors.pureWhite,
  },
  itineraryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  itineraryTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.pureWhite,
  },
  viewItineraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewItineraryText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
  },
  quickOptionsContainer: {
    marginTop: 20,
  },
  quickOptionsTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#666',
    marginBottom: 12,
  },
  quickOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: dscvrColors.electricMagenta + '30',
  },
  quickOptionText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: dscvrColors.midnightNavy,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: dscvrColors.electricMagenta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});
