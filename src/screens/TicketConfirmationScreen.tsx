import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TicketConfirmationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { ticketType, quantity, totalPrice, confirmationNumber } = route.params || {};
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Success animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎟️ My tickets for Summer Music Festival!\n\nConfirmation: ${confirmationNumber}\nTickets: ${quantity}x ${ticketType?.name}\n\nSee you there! 🎉`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDone = () => {
    navigation.navigate('HomeFeed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.successIcon,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color={dscvrColors.pureWhite} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContent,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.title}>Purchase Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your tickets have been sent to your email
          </Text>

          {/* Ticket Card */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.eventTitle}>Summer Music Festival</Text>
              <Text style={styles.eventDate}>Saturday, June 8</Text>
            </View>

            <View style={styles.ticketDivider} />

            <View style={styles.qrContainer}>
              <QRCode
                value={confirmationNumber || 'DSC123456789'}
                size={160}
                color={dscvrColors.midnightNavy}
                backgroundColor={dscvrColors.pureWhite}
              />
              <Text style={styles.confirmationNumber}>{confirmationNumber}</Text>
            </View>

            <View style={styles.ticketDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ticket Type</Text>
                <Text style={styles.detailValue}>{ticketType?.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>{quantity}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Paid</Text>
                <Text style={styles.detailValue}>${totalPrice}</Text>
              </View>
            </View>

            <View style={styles.ticketFooter}>
              <Ionicons name="information-circle" size={16} color="#666" />
              <Text style={styles.footerText}>
                Show this QR code at the venue entrance
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={dscvrColors.electricMagenta} />
            <Text style={styles.shareButtonText}>Share Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: dscvrColors.seafoamTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  ticketHeader: {
    padding: 20,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
  },
  confirmationNumber: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#666',
    marginTop: 12,
  },
  ticketDetails: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.regular,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: dscvrColors.electricMagenta,
    marginBottom: 12,
  },
  shareButtonText: {
    color: dscvrColors.electricMagenta,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  doneButton: {
    backgroundColor: dscvrColors.electricMagenta,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  doneButtonText: {
    color: dscvrColors.pureWhite,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});
