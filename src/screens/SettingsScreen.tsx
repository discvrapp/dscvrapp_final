import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';

const { width, height } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

interface SettingSection {
  id: string;
  title: string;
  icon: string;
  iconFamily: 'ionicons' | 'material';
  badge?: string;
  showArrow: boolean;
}

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [showSubSettings, setShowSubSettings] = useState<string | null>(null);
  
  // Account Settings States
  const [email] = useState('user@example.com');
  const [phone] = useState('+1 (555) 123-4567');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Privacy Settings States
  const [profilePrivacy, setProfilePrivacy] = useState<'public' | 'private' | 'friends'>('public');
  const [whoCanMessage, setWhoCanMessage] = useState<'everyone' | 'friends' | 'no_one'>('everyone');
  const [whoCanSeeLikes, setWhoCanSeeLikes] = useState<'public' | 'friends' | 'only_me'>('public');
  const [locationSharing, setLocationSharing] = useState(true);
  
  // Content Preferences States
  const [personalizedFeed, setPersonalizedFeed] = useState(true);
  const [restrictedMode, setRestrictedMode] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  
  // Notification Settings States
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    newFollowers: true,
    messages: true,
    events: true,
    locationUpdates: false,
  });

  const mainSettings: SettingSection[] = [
    { id: 'account', title: 'Manage Account', icon: 'person-circle-outline', iconFamily: 'ionicons', showArrow: true },
    { id: 'privacy', title: 'Privacy & Security', icon: 'shield-checkmark-outline', iconFamily: 'ionicons', showArrow: true },
    { id: 'content', title: 'Content Preferences', icon: 'options-outline', iconFamily: 'ionicons', showArrow: true },
    { id: 'notifications', title: 'Push Notifications', icon: 'notifications-outline', iconFamily: 'ionicons', badge: '3', showArrow: true },
    { id: 'data', title: 'Manage Data & Activity', icon: 'analytics-outline', iconFamily: 'ionicons', showArrow: true },
    { id: 'help', title: 'Help Center', icon: 'help-circle-outline', iconFamily: 'ionicons', showArrow: true },
    { id: 'about', title: 'About', icon: 'information-circle-outline', iconFamily: 'ionicons', showArrow: true },
  ];

  const categories = [
    'Politics', 'Sports', 'Entertainment', 'Technology', 
    'Fashion', 'Food', 'Travel', 'Music', 'Gaming', 'Art'
  ];

  const handleSettingPress = (settingId: string) => {
    setShowSubSettings(settingId);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            navigation.navigate('Auth');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
          }
        }
      ]
    );
  };

  const renderMainSettings = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        {mainSettings.slice(0, 2).map(renderSettingItem)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        {mainSettings.slice(2, 4).map(renderSettingItem)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA & SUPPORT</Text>
        {mainSettings.slice(4).map(renderSettingItem)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LOGIN</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={24} color={dscvrColors.midnightNavy} />
            <Text style={styles.settingText}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>dscvr v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ in NYC</Text>
      </View>
    </ScrollView>
  );

  const renderSettingItem = (setting: SettingSection) => (
    <TouchableOpacity 
      key={setting.id}
      style={styles.settingItem} 
      onPress={() => handleSettingPress(setting.id)}
    >
      <View style={styles.settingLeft}>
        {setting.iconFamily === 'ionicons' ? (
          <Ionicons name={setting.icon as any} size={24} color={dscvrColors.midnightNavy} />
        ) : (
          <MaterialCommunityIcons name={setting.icon as any} size={24} color={dscvrColors.midnightNavy} />
        )}
        <Text style={styles.settingText}>{setting.title}</Text>
      </View>
      <View style={styles.settingRight}>
        {setting.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{setting.badge}</Text>
          </View>
        )}
        {setting.showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#999" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAccountSettings = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setShowSubSettings(null)}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Manage Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT INFORMATION</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Email</Text>
          </View>
          <Text style={styles.settingValue}>{email}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Phone</Text>
          </View>
          <Text style={styles.settingValue}>{phone}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Password</Text>
          </View>
          <Text style={styles.settingValue}>Change</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SECURITY</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Two-Factor Authentication</Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={twoFactorEnabled ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPrivacySettings = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setShowSubSettings(null)}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROFILE PRIVACY</Text>
        
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioItem}
            onPress={() => setProfilePrivacy('public')}
          >
            <View style={[styles.radio, profilePrivacy === 'public' && styles.radioSelected]}>
              {profilePrivacy === 'public' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>Public</Text>
              <Text style={styles.radioSubtext}>Anyone can see your profile and content</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioItem}
            onPress={() => setProfilePrivacy('friends')}
          >
            <View style={[styles.radio, profilePrivacy === 'friends' && styles.radioSelected]}>
              {profilePrivacy === 'friends' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>Friends Only</Text>
              <Text style={styles.radioSubtext}>Only friends can see your profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioItem}
            onPress={() => setProfilePrivacy('private')}
          >
            <View style={[styles.radio, profilePrivacy === 'private' && styles.radioSelected]}>
              {profilePrivacy === 'private' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>Private</Text>
              <Text style={styles.radioSubtext}>You approve who can follow you</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INTERACTIONS</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Who Can Message Me</Text>
          </View>
          <Text style={styles.settingValue}>
            {whoCanMessage === 'everyone' ? 'Everyone' : whoCanMessage === 'friends' ? 'Friends' : 'No One'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Who Can See My Likes</Text>
          </View>
          <Text style={styles.settingValue}>
            {whoCanSeeLikes === 'public' ? 'Public' : whoCanSeeLikes === 'friends' ? 'Friends' : 'Only Me'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Blocked Accounts</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>0</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LOCATION</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Location Sharing</Text>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={setLocationSharing}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={locationSharing ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderContentPreferences = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setShowSubSettings(null)}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Content Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FEED SETTINGS</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Personalized Feed</Text>
          </View>
          <Switch
            value={personalizedFeed}
            onValueChange={setPersonalizedFeed}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={personalizedFeed ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Restricted Mode</Text>
          </View>
          <Switch
            value={restrictedMode}
            onValueChange={setRestrictedMode}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={restrictedMode ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HIDE CATEGORIES</Text>
        <Text style={styles.sectionSubtext}>Select categories you don't want to see</Text>
        
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                hiddenCategories.includes(category) && styles.categoryChipSelected
              ]}
              onPress={() => {
                if (hiddenCategories.includes(category)) {
                  setHiddenCategories(hiddenCategories.filter(c => c !== category));
                } else {
                  setHiddenCategories([...hiddenCategories, category]);
                }
              }}
            >
              <Text style={[
                styles.categoryChipText,
                hiddenCategories.includes(category) && styles.categoryChipTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset All Preferences</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderNotificationSettings = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setShowSubSettings(null)}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Push Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INTERACTIONS</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Likes</Text>
          </View>
          <Switch
            value={notifications.likes}
            onValueChange={(value) => setNotifications({...notifications, likes: value})}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={notifications.likes ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Comments</Text>
          </View>
          <Switch
            value={notifications.comments}
            onValueChange={(value) => setNotifications({...notifications, comments: value})}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={notifications.comments ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>New Followers</Text>
          </View>
          <Switch
            value={notifications.newFollowers}
            onValueChange={(value) => setNotifications({...notifications, newFollowers: value})}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={notifications.newFollowers ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Messages</Text>
          </View>
          <Switch
            value={notifications.messages}
            onValueChange={(value) => setNotifications({...notifications, messages: value})}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={notifications.messages ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DISCOVERIES</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Events</Text>
          </View>
          <Switch
            value={notifications.events}
            onValueChange={(value) => setNotifications({...notifications, events: value})}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={notifications.events ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Location Updates</Text>
          </View>
          <Switch
            value={notifications.locationUpdates}
            onValueChange={(value) => setNotifications({...notifications, locationUpdates: value})}
            trackColor={{ false: '#E0E0E0', true: dscvrColors.seafoamTeal }}
            thumbColor={notifications.locationUpdates ? dscvrColors.pureWhite : '#f4f3f4'}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderDataSettings = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setShowSubSettings(null)}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Manage Data & Activity</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>YOUR DATA</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Download Your Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>View Activity History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Manage Cookies & Tracking</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Request Data Deletion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderHelpCenter = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setShowSubSettings(null)}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Report a Problem</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>FAQs</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Contact Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Community Guidelines</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAbout = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setShowSubSettings(null)}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.aboutSection}>
        <View style={styles.aboutLogo}>
          <Text style={styles.aboutLogoText}>dscvr</Text>
        </View>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutDescription}>
          Discover amazing places and experiences through the eyes of your community.
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Licenses</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Check for Updates</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (showSubSettings) {
      case 'account':
        return renderAccountSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'content':
        return renderContentPreferences();
      case 'notifications':
        return renderNotificationSettings();
      case 'data':
        return renderDataSettings();
      case 'help':
        return renderHelpCenter();
      case 'about':
        return renderAbout();
      default:
        return renderMainSettings();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!showSubSettings ? (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings & Privacy</Text>
          <View style={{ width: 24 }} />
        </View>
      ) : null}
      
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  subHeaderTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#999',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#999',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#999',
    marginRight: 8,
  },
  badge: {
    backgroundColor: dscvrColors.electricMagenta,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#999',
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#BBB',
    marginTop: 4,
  },
  radioGroup: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: dscvrColors.vividBlue,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: dscvrColors.vividBlue,
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  radioSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: 'white',
  },
  categoryChipSelected: {
    backgroundColor: dscvrColors.midnightNavy,
    borderColor: dscvrColors.midnightNavy,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
  },
  categoryChipTextSelected: {
    color: 'white',
  },
  resetButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  dangerButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  dangerButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#DC2626',
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    marginTop: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  aboutLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: dscvrColors.midnightNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aboutLogoText: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: 'white',
  },
  aboutVersion: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});
