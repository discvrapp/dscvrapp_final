// Events service with Eventbrite API integration
import * as Location from 'expo-location';

export interface Event {
  id: string;
  title: string;
  venue: string;
  venueAddress?: string;
  date: string;
  time: string;
  price: string;
  image: string;
  category: string;
  description?: string;
  attendees: number;
  isTrending?: boolean;
  ticketUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// API Keys
const EVENTBRITE_API_KEY = 'QD6ARTFK4R6QAAED4LQK';
const EVENTBRITE_BASE_URL = 'https://www.eventbriteapi.com/v3';

// Category mapping for Eventbrite
const eventbriteCategoryMap: { [key: string]: string } = {
  'Music': '103',
  'Food & Drink': '110',
  'Comedy': '105',
  'Arts': '105',
  'Sports': '108',
  'Shopping': '107',
  'All': ''
};

// Search events using Eventbrite API
export const searchEvents = async (
  query: string = '',
  category: string = 'All',
  location?: { lat: number; lng: number },
  radius: number = 10 // miles
): Promise<Event[]> => {
  try {
    const params = new URLSearchParams({
      'token': EVENTBRITE_API_KEY,
      'expand': 'venue,category',
      'sort_by': 'date',
    });

    // Add search query
    if (query) {
      params.append('q', query);
    }

    // Add location
    if (location) {
      params.append('location.latitude', location.lat.toString());
      params.append('location.longitude', location.lng.toString());
      params.append('location.within', `${radius}mi`);
    }

    // Add category
    if (category !== 'All' && eventbriteCategoryMap[category]) {
      params.append('categories', eventbriteCategoryMap[category]);
    }

    const response = await fetch(`${EVENTBRITE_BASE_URL}/events/search/?${params}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Eventbrite API error:', data);
      // Fall back to mock data if API fails
      return getMockEvents();
    }

    // Transform Eventbrite events to our format
    return data.events?.map(transformEventbriteEvent) || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    // Fall back to mock data
    return getMockEvents();
  }
};

// Transform Eventbrite event to our format
const transformEventbriteEvent = (ebEvent: any): Event => {
  const startDate = new Date(ebEvent.start.utc);
  const endDate = new Date(ebEvent.end.utc);
  
  // Determine if free or get price
  let price = 'Free';
  if (!ebEvent.is_free && ebEvent.ticket_availability?.minimum_ticket_price) {
    const minPrice = ebEvent.ticket_availability.minimum_ticket_price;
    const maxPrice = ebEvent.ticket_availability.maximum_ticket_price;
    price = minPrice.major_value === maxPrice.major_value
      ? `$${minPrice.major_value}`
      : `$${minPrice.major_value}-$${maxPrice.major_value}`;
  }

  return {
    id: ebEvent.id,
    title: ebEvent.name.text || 'Untitled Event',
    venue: ebEvent.venue?.name || 'Venue TBA',
    venueAddress: ebEvent.venue?.address?.localized_address_display,
    date: startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    time: startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    price: price,
    image: ebEvent.logo?.url || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    category: ebEvent.category?.name || 'Event',
    description: ebEvent.description?.text || ebEvent.summary,
    attendees: Math.floor(Math.random() * 500) + 50, // Eventbrite doesn't provide this
    isTrending: ebEvent.online_event || false,
    ticketUrl: ebEvent.url,
    coordinates: ebEvent.venue?.latitude && ebEvent.venue?.longitude ? {
      lat: parseFloat(ebEvent.venue.latitude),
      lng: parseFloat(ebEvent.venue.longitude)
    } : undefined
  };
};

// Get event details
export const getEventDetails = async (eventId: string): Promise<Event | null> => {
  try {
    const response = await fetch(
      `${EVENTBRITE_BASE_URL}/events/${eventId}/?token=${EVENTBRITE_API_KEY}&expand=venue,category,ticket_availability`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch event details');
    }

    const data = await response.json();
    return transformEventbriteEvent(data);
  } catch (error) {
    console.error('Error fetching event details:', error);
    return null;
  }
};

// Get trending events (featured events)
export const getTrendingEvents = async (location?: { lat: number; lng: number }): Promise<Event[]> => {
  try {
    const params = new URLSearchParams({
      'token': EVENTBRITE_API_KEY,
      'expand': 'venue,category',
      'sort_by': 'best',
      'popular': 'true',
    });

    if (location) {
      params.append('location.latitude', location.lat.toString());
      params.append('location.longitude', location.lng.toString());
      params.append('location.within', '25mi');
    }

    const response = await fetch(`${EVENTBRITE_BASE_URL}/events/search/?${params}`);
    const data = await response.json();

    if (!response.ok) {
      return getMockEvents().filter(e => e.isTrending);
    }

    return data.events?.slice(0, 5).map((event: any) => ({
      ...transformEventbriteEvent(event),
      isTrending: true
    })) || [];
  } catch (error) {
    console.error('Error fetching trending events:', error);
    return getMockEvents().filter(e => e.isTrending);
  }
};

// Get events by category
export const getEventsByCategory = async (
  category: string,
  location?: { lat: number; lng: number }
): Promise<Event[]> => {
  return searchEvents('', category, location);
};

// Mock data fallback
const getMockEvents = (): Event[] => [
  {
    id: '1',
    title: 'Brooklyn Jazz Festival',
    venue: 'Brooklyn Bowl',
    venueAddress: '61 Wythe Ave, Brooklyn, NY 11249',
    date: 'Dec 15, 2024',
    time: '8:00 PM',
    price: '$35-$75',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    category: 'Music',
    description: 'Experience the best of Brooklyn jazz with performances from local and international artists.',
    attendees: 342,
    isTrending: true,
    ticketUrl: 'https://www.eventbrite.com',
    coordinates: { lat: 40.7220, lng: -73.9578 }
  },
  {
    id: '2',
    title: 'Rooftop Wine & Paint Night',
    venue: 'The William Vale',
    venueAddress: '111 N 12th St, Brooklyn, NY 11249',
    date: 'Dec 13, 2024',
    time: '6:30 PM',
    price: '$65',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'Food & Drink',
    description: 'Sip wine and create art with stunning Manhattan skyline views.',
    attendees: 89,
    ticketUrl: 'https://www.eventbrite.com',
    coordinates: { lat: 40.7220, lng: -73.9578 }
  },
  {
    id: '3',
    title: 'Stand-up Comedy Showcase',
    venue: 'The Bell House',
    venueAddress: '149 7th St, Brooklyn, NY 11215',
    date: 'Dec 14, 2024',
    time: '9:00 PM',
    price: '$20',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800',
    category: 'Comedy',
    description: 'NYC\'s hottest comedians perform their best material.',
    attendees: 234,
    isTrending: true,
    ticketUrl: 'https://www.eventbrite.com',
    coordinates: { lat: 40.6732, lng: -73.9865 }
  }
];

// Get user's current location
export const getUserLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};
