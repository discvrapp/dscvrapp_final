import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { 
  getAvailableSlots, 
  createReservation, 
  TimeSlot,
} from '../services/reservationService';

const { width } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

export default function ReservationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { place } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  
  // Reservation details
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('09:30');
  const [partySize, setPartySize] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isAM, setIsAM] = useState(true);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<(number | null)[]>([]);

  useEffect(() => {
    if (place?.photos?.[0]?.photo_reference) {
      const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=AIzaSyC2J_XE5brFPmhLXFKY4uBabq6AYNSBerU`;
      setPhotoUrl(url);
    }
    if (place?.opening_hours) {
      setIsOpen(place.opening_hours.open_now);
    }
  }, [place]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    setCalendarDays(days);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleTimeChange = (value: string, type: 'hour' | 'minute') => {
    let time = selectedTime;
    const [hour, minute] = time.split(':');
    
    if (type === 'hour') {
      time = `${value.padStart(2, '0')}:${minute}`;
    } else {
      time = `${hour}:${value.padStart(2, '0')}`;
    }
    
    setSelectedTime(time);
  };

  const formatTime = () => {
    const [hour, minute] = selectedTime.split(':');
    let displayHour = parseInt(hour);
    
    if (!isAM && displayHour < 12) displayHour += 12;
    if (isAM && displayHour === 12) displayHour = 0;
    
    return `${displayHour.toString().padStart(2, '0')}:${minute}`;
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedTime || !partySize) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const reservation = await createReservation({
        restaurantId: place?.place_id || '123',
        restaurantName: place?.name || 'Venue',
        date: selectedDate.toISOString(),
        time: formatTime(),
        partySize: parseInt(partySize),
        userName: 'User',
        userPhone: '+1234567890',
        userEmail: 'user@example.com',
        specialRequests,
        status: 'confirmed',
      });

      Alert.alert(
        'Reservation Confirmed!',
        `Your reservation at ${place?.name} for ${formatTime()} on ${selectedDate.toLocaleDateString()} has been confirmed.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {place?.name || "Make Reservation"}
          </Text>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
        </View>

        {/* Venue Info Card */}
        <View style={styles.venueCard}>
          <View style={styles.venueInfo}>
            <Text style={styles.venueName} numberOfLines={2}>
              {place?.name || "Venue"}
            </Text>
            <View style={styles.venueDetails}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{place?.rating || '4.5'} average rating</Text>
              </View>
              <Text style={styles.address} numberOfLines={2}>
                {place?.formatted_address || place?.vicinity || "Address not available"}
              </Text>
              {isOpen !== null && (
                <View style={styles.openStatusContainer}>
                  <View style={[styles.openStatusDot, { backgroundColor: isOpen ? "#4CAF50" : "#F44336" }]} />
                  <Text style={[styles.openStatus, { color: isOpen ? "#4CAF50" : "#F44336" }]}>
                    {isOpen ? "Open Now" : "Closed"}
                  </Text>
                </View>
              )}
              {place?.formatted_phone_number && (
                <View style={styles.phoneContainer}>
                  <Ionicons name="call-outline" size={14} color="#666" />
                  <Text style={styles.phone}>{place.formatted_phone_number}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
        </View>

        {/* Venue Image */}
        <View style={styles.imageContainer}>
          {photoUrl ? (
            <Image 
              source={{ uri: photoUrl }} 
              style={styles.venueImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="image-outline" size={48} color="#CCC" />
              <Text style={styles.imagePlaceholderText}>VENUE IMAGE</Text>
            </View>
          )}
        </View>

        {/* Date/Time/Availability Section */}
        {!showDatePicker ? (
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeButtonText}>Date/Time/Availability</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.dateTimeContainer}>
            <Text style={styles.sectionTitle}>Date/Time/Availability</Text>
            
            {/* Calendar */}
            <View style={styles.calendar}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => handleMonthChange('prev')}>
                  <Ionicons name="chevron-back" size={24} color={dscvrColors.midnightNavy} />
                </TouchableOpacity>
                <Text style={styles.monthYear}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => handleMonthChange('next')}>
                  <Ionicons name="chevron-forward" size={24} color={dscvrColors.midnightNavy} />
                </TouchableOpacity>
              </View>

              <View style={styles.weekDays}>
                {weekDays.map(day => (
                  <Text key={day} style={styles.weekDay}>{day}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => {
                  if (!day) return <View key={`empty-${index}`} style={styles.emptyDay} />;
                  
                  const isToday = day === today.getDate() && 
                    currentMonth.getMonth() === today.getMonth() && 
                    currentMonth.getFullYear() === today.getFullYear();
                  
                  const isSelected = selectedDate && 
                    day === selectedDate.getDate() && 
                    currentMonth.getMonth() === selectedDate.getMonth() && 
                    currentMonth.getFullYear() === selectedDate.getFullYear();
                  
                  const isPast = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < today;

                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[
                        styles.calendarDay,
                        isToday && styles.todayDay,
                        isSelected && styles.selectedDay,
                        isPast && styles.pastDay,
                      ]}
                      onPress={() => !isPast && handleDateSelect(day)}
                      disabled={isPast}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        isToday && styles.todayDayText,
                        isSelected && styles.selectedDayText,
                        isPast && styles.pastDayText,
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time Picker */}
            <View style={styles.timePicker}>
              <Text style={styles.timeLabel}>Time</Text>
              <View style={styles.timeInputs}>
                <TextInput
                  style={styles.timeInput}
                  value={selectedTime.split(':')[0]}
                  onChangeText={(value) => handleTimeChange(value, 'hour')}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="09"
                />
                <Text style={styles.timeColon}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={selectedTime.split(':')[1]}
                  onChangeText={(value) => handleTimeChange(value, 'minute')}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="30"
                />
                <View style={styles.amPmToggle}>
                  <TouchableOpacity
                    style={[styles.amPmButton, isAM && styles.amPmActive]}
                    onPress={() => setIsAM(true)}
                  >
                    <Text style={[styles.amPmText, isAM && styles.amPmActiveText]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.amPmButton, !isAM && styles.amPmActive]}
                    onPress={() => setIsAM(false)}
                  >
                    <Text style={[styles.amPmText, !isAM && styles.amPmActiveText]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Number of Guests */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Number of Guests</Text>
          <TextInput
            style={styles.input}
            placeholder="#"
            value={partySize}
            onChangeText={setPartySize}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        {/* Special Requests */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Special Requests (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any dietary restrictions or special occasions?"
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.buttonDisabled]}
          onPress={handleReservation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
          )}
        </TouchableOpacity>

        {/* Map Section */}
        <View style={styles.mapSection}>
          <Text style={styles.mapTitle}>What to do Nearby</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: place?.geometry?.location?.lat || 40.7128,
                longitude: place?.geometry?.location?.lng || -74.0060,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {place?.geometry?.location && (
                <Marker
                  coordinate={{
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                  }}
                  title={place.name}
                />
              )}
            </MapView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: dscvrColors.pureWhite,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  venueCard: {
    backgroundColor: dscvrColors.pureWhite,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  venueInfo: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  venueDetails: {
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
  },
  address: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#666',
    lineHeight: 18,
  },
  openStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  openStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  openStatus: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phone: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#666',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: dscvrColors.pureWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#999',
    marginTop: 8,
  },
  dateTimeButton: {
    backgroundColor: dscvrColors.pureWhite,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  dateTimeContainer: {
    backgroundColor: dscvrColors.pureWhite,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 16,
  },
  calendar: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDay: {
    width: (width - 80) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#999',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (width - 80) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  emptyDay: {
    width: (width - 80) / 7,
    height: 40,
  },
  calendarDayText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
  },
  todayDay: {
    backgroundColor: dscvrColors.seafoamTeal + '20',
    borderRadius: 20,
  },
  todayDayText: {
    fontFamily: FONTS.medium,
  },
  selectedDay: {
    backgroundColor: dscvrColors.electricMagenta,
    borderRadius: 20,
  },
  selectedDayText: {
    color: dscvrColors.pureWhite,
    fontFamily: FONTS.semiBold,
  },
  pastDay: {
    opacity: 0.3,
  },
  pastDayText: {
    color: '#CCC',
  },
  timePicker: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
  },
  timeLabel: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 12,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeInput: {
    width: 60,
    height: 50,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  timeColon: {
    fontSize: 24,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  amPmToggle: {
    flexDirection: 'row',
    marginLeft: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: dscvrColors.electricMagenta,
  },
  amPmButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: dscvrColors.pureWhite,
  },
  amPmActive: {
    backgroundColor: dscvrColors.electricMagenta,
  },
  amPmText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
  amPmActiveText: {
    color: dscvrColors.pureWhite,
  },
  inputContainer: {
    backgroundColor: dscvrColors.pureWhite,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: dscvrColors.electricMagenta,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: dscvrColors.electricMagenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.pureWhite,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  mapSection: {
    marginTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  mapTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
