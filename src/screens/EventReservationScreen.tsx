import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStripe } from '@stripe/stripe-react-native';
import * as Calendar from 'expo-calendar';
import * as WebBrowser from 'expo-web-browser';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';
import { initializePaymentSheet } from '../services/stripe';
import { generateTicketmasterCheckoutUrl } from '../services/payment';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EventReservationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { ticketType, quantity, totalPrice, eventId } = route.params || {};

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('ticketmaster');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { id: 'ticketmaster', type: 'Buy on Ticketmaster', icon: 'ticket-outline', description: 'Official tickets with buyer protection' },
    { id: 'stripe', type: 'Credit/Debit Card', icon: 'card-outline', description: 'Secure payment via Stripe' },
    { id: 'apple-pay', type: 'Apple Pay', icon: 'logo-apple', description: 'Fast and secure' },
  ];

  const handleAddToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Calendar access is required to add events.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar found on device.');
        return;
      }

      const eventDetails = {
        title: 'Summer Music Festival',
        startDate: new Date('2025-06-08T18:00:00'),
        endDate: new Date('2025-06-08T23:00:00'),
        location: 'Piedmont Park, Atlanta, GA',
        notes: `Ticket Type: ${ticketType?.name}\nQuantity: ${quantity}\nTotal: $${totalPrice}`,
      };

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: eventDetails.title,
        startDate: eventDetails.startDate,
        endDate: eventDetails.endDate,
        location: eventDetails.location,
        notes: eventDetails.notes,
        alarms: [{ relativeOffset: -60 }],
      });

      Alert.alert('Success', 'Event added to calendar!');
    } catch (error) {
      console.error('Calendar error:', error);
      Alert.alert('Error', 'Failed to add event to calendar.');
    }
  };

  const handleStripePayment = async () => {
    try {
      // Initialize payment sheet
      const { clientSecret } = await initializePaymentSheet(totalPrice, 'usd', email);
      
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'DSCVR Events',
        defaultBillingDetails: {
          email: email,
          phone: phone,
        },
        applePay: {
          merchantCountryCode: 'US',
        },
        googlePay: {
          merchantCountryCode: 'US',
          testEnv: true,
        },
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          throw new Error(paymentError.message);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Stripe payment error:', error);
      Alert.alert('Payment Error', error.message || 'Failed to process payment');
      return false;
    }
  };

  const handlePurchase = async () => {
    if (!email || !phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions.');
      return;
    }

    setProcessing(true);

    try {
      if (selectedPayment === 'ticketmaster') {
        // Redirect to Ticketmaster
        const url = generateTicketmasterCheckoutUrl(eventId);
        await WebBrowser.openBrowserAsync(url);
        setProcessing(false);
        navigation.goBack();
      } else if (selectedPayment === 'stripe' || selectedPayment === 'apple-pay') {
        // Process with Stripe
        const success = await handleStripePayment();
        
        if (success) {
          // Navigate to confirmation
          navigation.navigate('TicketConfirmation', {
            eventId,
            ticketType,
            quantity,
            totalPrice,
            confirmationNumber: `DSC${Date.now()}`,
          });
        }
        setProcessing(false);
      }
    } catch (error) {
      setProcessing(false);
      console.error('Purchase error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>{ticketType?.name}</Text>
              <Text style={styles.orderValue}>x{quantity}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Service Fee</Text>
              <Text style={styles.orderValue}>$5.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.orderRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>${totalPrice + 5}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionSelected,
                method.id === 'ticketmaster' && styles.recommendedOption
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentInfo}>
                <Ionicons name={method.icon as any} size={24} color={dscvrColors.midnightNavy} />
                <View style={styles.paymentText}>
                  <Text style={styles.paymentType}>{method.type}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
              </View>
              <View style={[
                styles.radio,
                selectedPayment === method.id && styles.radioSelected
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            {agreeToTerms && (
              <Ionicons name="checkmark" size={16} color={dscvrColors.electricMagenta} />
            )}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Refund Policy</Text>
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={handleAddToCalendar}
          >
            <Ionicons name="calendar-outline" size={20} color={dscvrColors.electricMagenta} />
            <Text style={styles.calendarButtonText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.purchaseButton, processing && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color={dscvrColors.pureWhite} />
            ) : (
              <Text style={styles.purchaseButtonText}>
                {selectedPayment === 'ticketmaster' ? 'Continue to Ticketmaster' : 'Pay Now'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Ionicons name="lock-closed" size={16} color="#666" />
            <Text style={styles.securityText}>
              Payments are secure and encrypted
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: FONTS.regular,
  },
  orderValue: {
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: dscvrColors.midnightNavy,
    fontFamily: FONTS.regular,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    borderColor: dscvrColors.electricMagenta,
  },
  recommendedOption: {
    backgroundColor: dscvrColors.electricMagenta + '10',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentText: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  paymentDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  radioSelected: {
    borderColor: dscvrColors.electricMagenta,
    backgroundColor: dscvrColors.electricMagenta,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.regular,
  },
  termsLink: {
    color: dscvrColors.electricMagenta,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
  },
  purchaseButton: {
    backgroundColor: dscvrColors.electricMagenta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: dscvrColors.pureWhite,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  calendarButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: dscvrColors.electricMagenta,
  },
  calendarButtonText: {
    color: dscvrColors.electricMagenta,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    fontFamily: FONTS.regular,
  },
});
