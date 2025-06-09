const GOOGLE_API_KEY = 'AIzaSyC2J_XE5brFPmhLXFKY4uBabq6AYNSBerU';

export const searchPlacesAutocomplete = async (
 input: string,
 latitude?: number,
 longitude?: number
) => {
 try {
   let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
     input
   )}&key=${GOOGLE_API_KEY}&types=establishment`;

   // Add location bias if coordinates are provided
   if (latitude && longitude) {
     url += `&location=${latitude},${longitude}&radius=50000`; // 50km radius
   }

   const response = await fetch(url);
   const data = await response.json();

   if (data.status === 'OK') {
     return data.predictions.map((prediction: any) => ({
       place_id: prediction.place_id,
       description: prediction.description,
       main_text: prediction.structured_formatting.main_text,
       secondary_text: prediction.structured_formatting.secondary_text,
       types: prediction.types,
     }));
   }
   
   return [];
 } catch (error) {
   console.error('Autocomplete error:', error);
   return [];
 }
};

export const getPlaceDetails = async (placeId: string) => {
 try {
   const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,formatted_phone_number,opening_hours,photos,reviews,types,price_level,website,geometry&key=${GOOGLE_API_KEY}`;
   
   const response = await fetch(url);
   const data = await response.json();
   
   if (data.status === 'OK') {
     return data.result;
   }
   
   return null;
 } catch (error) {
   console.error('Place details error:', error);
   return null;
 }
};
