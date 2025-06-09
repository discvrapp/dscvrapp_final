// src/services/googlePlaces.ts

const GOOGLE_API_KEY = 'AIzaSyC2J_XE5brFPmhLXFKY4uBabq6AYNSBerU';
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

interface PlacePhoto {
  height: number;
  width: number;
  photo_reference: string;
}

interface PlaceResult {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: PlacePhoto[];
  types?: string[];
  opening_hours?: {
    open_now: boolean;
  };
  distance?: number;
}

// Calculate distance between two coordinates in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const searchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  radius: number = 5000,
  types: string[] = ['restaurant'],
  keyword?: string
): Promise<PlaceResult[]> => {
  try {
    const typeString = (types && Array.isArray(types) && types.length > 0) ? types.join("|") : "restaurant";
    let url = `${PLACES_API_BASE_URL}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${typeString}&key=${GOOGLE_API_KEY}`;
    
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status);
      return [];
    }

    // Add distance to each result
    const resultsWithDistance = data.results.map((place: PlaceResult) => ({
      ...place,
      distance: calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
    }));

    return resultsWithDistance;
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

export const fetchPlaceDetails = async (placeId: string): Promise<any> => {
  try {
    const fields = 'name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,photos,reviews,opening_hours,price_level,types,geometry';
    const url = `${PLACES_API_BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

export const buildPhotoUrl = (photoReference: string, maxWidth: number = 400): string => {
  return `${PLACES_API_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
};

export const searchPlaces = async (query: string, location?: { lat: number; lng: number }): Promise<PlaceResult[]> => {
  try {
    let url = `${PLACES_API_BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=10000`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status);
      return [];
    }

    return data.results;
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

export const getPlacePhoto = async (placeId: string): Promise<string | null> => {
  try {
    const details = await fetchPlaceDetails(placeId);
    if (details?.photos?.length > 0) {
      return buildPhotoUrl(details.photos[0].photo_reference);
    }
    return null;
  } catch (error) {
    console.error('Error getting place photo:', error);
    return null;
  }
};
