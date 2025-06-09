import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';

const { width } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

export default function CreateScreen() {
  const navigation = useNavigation<any>();

  const createOptions = [
    {
      id: 'record',
      title: 'Record a Video',
      subtitle: 'Create a short video about a place',
      icon: 'videocam',
      iconFamily: 'ionicons',
      color: dscvrColors.electricMagenta,
      onPress: () => navigation.navigate('VideoRecord', { mode: 'standalone' }),
    },
    {
      id: 'review',
      title: 'Write a Review',
      subtitle: 'Share your experience at a location',
      icon: 'star-half',
      iconFamily: 'ionicons',
      color: dscvrColors.vividBlue,
      onPress: () => navigation.navigate('Home', { screen: 'WriteReview', params: { placeId: 'temp-place-id', placeName: 'New Review' } }),
    },
    {
      id: 'collection',
      title: 'Create Collection',
      subtitle: 'Curate your favorite spots',
      icon: 'bookmark-multiple',
      iconFamily: 'material',
      color: dscvrColors.seafoamTeal,
      onPress: () => console.log('Create Collection'),
    },
    {
      id: 'event',
      title: 'Host an Event',
      subtitle: 'Organize a meetup at a location',
      icon: 'calendar',
      iconFamily: 'ionicons',
      color: dscvrColors.royalPurple,
      onPress: () => console.log('Host Event'),
    },
  ];

  const quickActions = [
    {
      id: 'checkin',
      title: 'Check In',
      icon: 'location',
      color: dscvrColors.electricMagenta,
    },
    {
      id: 'photo',
      title: 'Add Photo',
      icon: 'camera',
      color: dscvrColors.vividBlue,
    },
    {
      id: 'tip',
      title: 'Quick Tip',
      icon: 'bulb',
      color: dscvrColors.seafoamTeal,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create</Text>
          <Text style={styles.headerSubtitle}>Share your discoveries with the community</Text>
        </View>

        {/* Main Create Options */}
        <View style={styles.mainOptions}>
          {createOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color + '15' }]}>
                {option.iconFamily === 'ionicons' ? (
                  <Ionicons name={option.icon as any} size={32} color={option.color} />
                ) : (
                  <MaterialCommunityIcons name={option.icon as any} size={32} color={option.color} />
                )}
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Continue Creating</Text>
          <View style={styles.draftCard}>
            <View style={styles.draftIcon}>
              <Ionicons name="document-text-outline" size={24} color={dscvrColors.midnightNavy} />
            </View>
            <View style={styles.draftContent}>
              <Text style={styles.draftTitle}>Draft: Blue Bottle Coffee Review</Text>
              <Text style={styles.draftTime}>Started 2 hours ago</Text>
            </View>
            <TouchableOpacity style={styles.draftAction}>
              <Text style={styles.draftActionText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#666',
  },
  mainOptions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
  },
  quickActionsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 56) / 3,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    textAlign: 'center',
  },
  recentSection: {
    marginTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  draftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  draftContent: {
    flex: 1,
  },
  draftTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    marginBottom: 2,
  },
  draftTime: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#999',
  },
  draftAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: dscvrColors.electricMagenta + '15',
    borderRadius: 20,
  },
  draftActionText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.electricMagenta,
  },
});
