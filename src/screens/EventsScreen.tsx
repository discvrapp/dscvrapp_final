import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { searchEvents } from '../services/events';

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

interface Event {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  price: string;
  image: string;
  category: string;
  attendees: number;
  location: string;
  description?: string;
  url?: string;
}

export default function EventsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const categories = ['All', 'Music', 'Sports', 'Arts', 'Food & Drink', 'Comedy', 'Family'];

  // Mock events for testing
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Summer Music Festival',
      venue: 'Piedmont Park',
      date: 'Sat, Jun 8',
      time: '6:00 PM',
      price: '$45',
      image: 'https://picsum.photos/400/250?random=1',
      category: 'Music',
      attendees: 342,
      location: 'Atlanta, GA',
    },
    {
      id: '2',
      title: 'Wine & Jazz Night',
      venue: 'City Winery',
      date: 'Fri, Jun 7',
      time: '7:30 PM',
      price: '$65',
      image: 'https://picsum.photos/400/250?random=2',
      category: 'Food & Drink',
      attendees: 28,
      location: 'Atlanta, GA',
    },
    {
      id: '3',
      title: 'Comedy Showcase',
      venue: 'The Punchline',
      date: 'Thu, Jun 6',
      time: '8:00 PM',
      price: '$25',
      image: 'https://picsum.photos/400/250?random=3',
      category: 'Comedy',
      attendees: 156,
      location: 'Atlanta, GA',
    },
    {
      id: '4',
      title: 'Art After Dark',
      venue: 'High Museum',
      date: 'Sun, Jun 9',
      time: '5:00 PM',
      price: 'Free',
      image: 'https://picsum.photos/400/250?random=4',
      category: 'Art',
      attendees: 89,
      location: 'Atlanta, GA',
    },
  ];

  useEffect(() => {
    getLocationAndEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [selectedCategory, events]);

  const getLocationAndEvents = async () => {
    try {
      // For now, use mock events
      setEvents(mockEvents);
      setLoading(false);
      
      // Try to get real events in background
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation);
        
        const nearbyEvents = await searchEvents(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          25
        );
        
        if (nearbyEvents.length > 0) {
          setEvents(nearbyEvents);
        }
      }
    } catch (error) {
      console.error('Error getting events:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocationAndEvents();
    setRefreshing(false);
  };

  const filterEvents = () => {
    if (selectedCategory === 'All') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => 
        event.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  };

  const handleEventPress = (event: Event) => {
    console.log('Navigating to EventDetail with:', event);
    navigation.navigate('EventDetail', { 
      eventId: event.id,
      eventData: event
    });
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.eventImage}
        defaultSource={{ uri: 'https://via.placeholder.com/400x250' }}
      />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventCategory}>{item.category.toUpperCase()}</Text>
          <View style={styles.attendeesContainer}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.attendeesText}>{item.attendees}</Text>
          </View>
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.eventVenue} numberOfLines={1}>{item.venue}</Text>
        <View style={styles.eventFooter}>
          <View style={styles.eventDateTime}>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Text style={styles.eventDot}>•</Text>
            <Text style={styles.eventTime}>{item.time}</Text>
          </View>
          <Text style={styles.eventPrice}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={dscvrColors.electricMagenta} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No events found</Text>
          <TouchableOpacity onPress={() => setSelectedCategory('All')}>
            <Text style={styles.viewAllText}>View all events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.eventsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={dscvrColors.electricMagenta}
            />
          }
          ListHeaderComponent={
            filteredEvents.length > 0 ? (
              <>
                {/* Featured Event */}
                <TouchableOpacity 
                  style={styles.featuredEvent}
                  onPress={() => handleEventPress(filteredEvents[0])}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: filteredEvents[0].image }} 
                    style={styles.featuredImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/600x300' }}
                  />
                  <View style={styles.featuredOverlay}>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>FEATURED</Text>
                    </View>
                    <Text style={styles.featuredTitle}>{filteredEvents[0].title}</Text>
                    <Text style={styles.featuredDetails}>
                      {filteredEvents[0].venue} • {filteredEvents[0].date} • {filteredEvents[0].time}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {selectedCategory === 'All' ? 'All Events' : `${selectedCategory} Events`}
                  </Text>
                  <Text style={styles.eventCount}>{filteredEvents.length} events</Text>
                </View>
              </>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.regular,
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
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
  },
  categoriesWrapper: {
    backgroundColor: dscvrColors.pureWhite,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: dscvrColors.electricMagenta,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  categoryChipTextActive: {
    color: dscvrColors.pureWhite,
  },
  featuredEvent: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: dscvrColors.electricMagenta,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: dscvrColors.pureWhite,
  },
  featuredTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: dscvrColors.pureWhite,
    marginBottom: 4,
  },
  featuredDetails: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.pureWhite,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
  },
  eventCount: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#666',
  },
  eventsList: {
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCategory: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.electricMagenta,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeesText: {
    fontSize: 12,
    color: '#666',
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDate: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  eventDot: {
    color: '#999',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  eventPrice: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: dscvrColors.electricMagenta,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  viewAllText: {
    fontSize: 16,
    color: dscvrColors.electricMagenta,
    marginTop: 16,
    fontFamily: FONTS.medium,
  },
});
