import axios from 'axios';

// API Keys - Using the second app registration key
const TICKETMASTER_API_KEY = 'N4S5PAemIr9ueFRA7ziog2AvarhC4Vcf';

// Ticketmaster API
export const searchTicketmasterEvents = async (
  latitude: number,
  longitude: number,
  radius: number = 25, // miles
  category?: string
) => {
  try {
    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: {
        apikey: TICKETMASTER_API_KEY,
        latlong: `${latitude.toFixed(6)},${longitude.toFixed(6)}`,
        radius: radius.toString(),
        unit: 'miles',
        sort: 'date,asc',
        size: '50',
        ...(category && category !== 'All' && { keyword: category }),
      },
    });

    if (response.data._embedded?.events) {
      return response.data._embedded.events.map((event: any) => ({
        id: event.id,
        title: event.name,
        venue: event._embedded?.venues?.[0]?.name || 'Venue TBA',
        date: new Date(event.dates.start.localDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        time: event.dates.start.localTime 
          ? new Date(`2000-01-01T${event.dates.start.localTime}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'Time TBA',
        price: event.priceRanges?.[0]?.min 
          ? `$${Math.round(event.priceRanges[0].min)}` 
          : 'See Tickets',
        image: event.images?.find((img: any) => img.width > 500)?.url || event.images?.[0]?.url || 'https://via.placeholder.com/400x250',
        category: event.classifications?.[0]?.segment?.name || 'Event',
        description: event.info || event.pleaseNote || '',
        url: event.url,
        attendees: Math.floor(Math.random() * 1000) + 50,
        location: `${event._embedded?.venues?.[0]?.city?.name || 'Unknown'}, ${event._embedded?.venues?.[0]?.state?.stateCode || ''}`,
        ticketLimit: event.ticketLimit?.info || null,
        seatmap: event.seatmap?.staticUrl || null,
        venue_address: event._embedded?.venues?.[0]?.address?.line1 || '',
        coordinates: {
          latitude: parseFloat(event._embedded?.venues?.[0]?.location?.latitude) || latitude,
          longitude: parseFloat(event._embedded?.venues?.[0]?.location?.longitude) || longitude,
        },
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching Ticketmaster events:', error.response?.data || error);
    return [];
  }
};

// Main search function
export const searchEvents = async (
  latitude: number,
  longitude: number,
  radius: number = 25,
  category?: string
) => {
  try {
    const events = await searchTicketmasterEvents(latitude, longitude, radius, category);
    
    // Sort by date
    return events.sort((a: any, b: any) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
};

// Get specific event details
export const getEventDetails = async (eventId: string) => {
  try {
    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json`,
      {
        params: { 
          apikey: TICKETMASTER_API_KEY,
          locale: 'en-us',
        },
      }
    );
    
    const event = response.data;
    return {
      id: event.id,
      title: event.name,
      venue: event._embedded?.venues?.[0]?.name || 'Venue TBA',
      venue_address: event._embedded?.venues?.[0]?.address?.line1 || '',
      date: new Date(event.dates.start.localDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      time: event.dates.start.localTime 
        ? new Date(`2000-01-01T${event.dates.start.localTime}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'Time TBA',
      price: event.priceRanges?.[0]?.min 
        ? `$${Math.round(event.priceRanges[0].min)}` 
        : 'See Tickets',
      priceRange: event.priceRanges?.[0] ? {
        min: event.priceRanges[0].min,
        max: event.priceRanges[0].max,
        currency: event.priceRanges[0].currency,
      } : null,
      images: event.images || [],
      category: event.classifications?.[0]?.segment?.name || 'Event',
      description: event.info || event.pleaseNote || '',
      url: event.url,
      seatmap: event.seatmap?.staticUrl || null,
      ticketLimit: event.ticketLimit?.info || null,
      ageRestrictions: event.ageRestrictions?.legalAgeEnforced ? 'Ages 21+' : 'All Ages',
      coordinates: {
        latitude: parseFloat(event._embedded?.venues?.[0]?.location?.latitude) || 0,
        longitude: parseFloat(event._embedded?.venues?.[0]?.location?.longitude) || 0,
      },
      parking: event._embedded?.venues?.[0]?.parkingDetail || null,
      generalInfo: event._embedded?.venues?.[0]?.generalInfo?.generalRule || null,
    };
  } catch (error) {
    console.error('Error fetching event details:', error);
    return null;
  }
};
