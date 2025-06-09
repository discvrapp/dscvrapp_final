import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';

import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EventDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [ticketType, setTicketType] = useState('general');
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('EventDetailScreen mounted with params:', route.params);
    loadEventDetails();
  }, []);

  const loadEventDetails = async () => {
    try {
      const passedEventData = route.params?.eventData;
      if (passedEventData) {
        console.log('Using passed event data:', passedEventData);
        
        let basePrice = 45;
        if (passedEventData.price && passedEventData.price !== 'See Tickets') {
          const priceMatch = passedEventData.price.match(/\d+/);
          if (priceMatch) {
            basePrice = parseInt(priceMatch[0]);
          }
        }

        setEventDetails({
          ...passedEventData,
          images: [passedEventData.image],
          ticketTypes: [
            { id: 'general', name: 'General Admission', price: basePrice, description: 'Standard entry' },
            { id: 'vip', name: 'VIP', price: basePrice * 2, description: 'Premium experience' },
          ],
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading event details:', error);
      setLoading(false);
    }
  };

  const handleReserve = () => {
    console.log('Get Tickets button pressed!');
    setShowTicketModal(true);
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout...');
    setShowTicketModal(false);
    const selectedTicketType = eventDetails.ticketTypes.find(t => t.id === ticketType);
    navigation.navigate('EventReservation', {
      eventId: route.params?.eventId || eventDetails.id,
      ticketType: selectedTicketType,
      quantity: selectedTickets,
      totalPrice: selectedTicketType.price * selectedTickets,
    });
  };

  if (loading || !eventDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={dscvrColors.electricMagenta} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Event Details</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Image */}
        <Image 
          source={{ uri: eventDetails.image }} 
          style={styles.mainImage}
          defaultSource={{ uri: 'https://via.placeholder.com/400x250' }}
        />

        {/* Event Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{eventDetails.title}</Text>
          <Text style={styles.venue}>{eventDetails.venue}</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{eventDetails.date} at {eventDetails.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{eventDetails.venue_address || eventDetails.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{eventDetails.attendees} people interested</Text>
          </View>
        </View>

        {/* Map */}
        {eventDetails.coordinates?.latitude && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: eventDetails.coordinates.latitude,
                longitude: eventDetails.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={eventDetails.coordinates} />
            </MapView>
          </View>
        )}

        {/* Add extra padding at bottom for the fixed button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Bar - Positioned above tab bar */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.price}>
              {eventDetails.price === 'See Tickets' ? '$45' : eventDetails.price}
            </Text>
            <Text style={styles.priceUnit}>/ ticket</Text>
          </View>
          <TouchableOpacity 
            style={styles.getTicketsButton} 
            onPress={handleReserve}
            activeOpacity={0.8}
          >
            <Text style={styles.getTicketsText}>Get Tickets</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ticket Selection Modal */}
      <Modal
        visible={showTicketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Tickets</Text>
              <TouchableOpacity onPress={() => setShowTicketModal(false)}>
                <Ionicons name="close" size={24} color={dscvrColors.midnightNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {eventDetails.ticketTypes.map((ticket) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={[
                    styles.ticketOption,
                    ticketType === ticket.id && styles.ticketOptionSelected
                  ]}
                  onPress={() => setTicketType(ticket.id)}
                >
                  <View>
                    <Text style={styles.ticketName}>{ticket.name}</Text>
                    <Text style={styles.ticketDescription}>{ticket.description}</Text>
                  </View>
                  <Text style={styles.ticketPrice}>${ticket.price}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Number of tickets</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setSelectedTickets(Math.max(1, selectedTickets - 1))}
                  >
                    <Ionicons name="remove" size={20} color={dscvrColors.midnightNavy} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{selectedTickets}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setSelectedTickets(selectedTickets + 1)}
                  >
                    <Ionicons name="add" size={20} color={dscvrColors.midnightNavy} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>
                  ${eventDetails.ticketTypes.find(t => t.id === ticketType)?.price * selectedTickets}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Continue to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mainImage: {
    width: screenWidth,
    height: 250,
    backgroundColor: '#F0F0F0',
  },
  infoSection: {
    padding: 20,
    backgroundColor: dscvrColors.pureWhite,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  venue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  mapSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 12,
  },
  map: {
    height: 200,
    borderRadius: 12,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 85 : 65, // Account for tab bar height
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  price: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  getTicketsButton: {
    backgroundColor: dscvrColors.electricMagenta,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  getTicketsText: {
    color: dscvrColors.pureWhite,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: dscvrColors.pureWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
  },
  modalScroll: {
    padding: 20,
  },
  ticketOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
  },
  ticketOptionSelected: {
    borderColor: dscvrColors.electricMagenta,
    backgroundColor: dscvrColors.electricMagenta + '10',
  },
  ticketName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ticketPrice: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
  },
  quantitySection: {
    marginTop: 24,
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    minWidth: 30,
    textAlign: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  totalPrice: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: dscvrColors.electricMagenta,
  },
  checkoutButton: {
    backgroundColor: dscvrColors.electricMagenta,
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: dscvrColors.pureWhite,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});
