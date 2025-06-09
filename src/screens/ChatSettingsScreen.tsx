import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

export default function ChatSettingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { chatId, userName } = route.params;

  const [notificationsMuted, setNotificationsMuted] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const handleBlock = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${userName}? They won't be able to send you messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            // Handle block action
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleReport = () => {
    navigation.navigate('ReportUser', { chatId, userName });
  };

  const handleDeleteChat = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle delete action
            navigation.navigate('Messages');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-off" size={24} color={dscvrColors.midnightNavy} />
              <Text style={styles.settingText}>Mute Notifications</Text>
            </View>
            <Switch
              value={notificationsMuted}
              onValueChange={setNotificationsMuted}
              trackColor={{ false: '#E0E0E0', true: dscvrColors.electricMagenta }}
              thumbColor={dscvrColors.pureWhite}
            />
          </View>
        </View>

        {/* Chat Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat Management</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="archive" size={24} color={dscvrColors.midnightNavy} />
              <Text style={styles.settingText}>Archive Chat</Text>
            </View>
            <Switch
              value={isArchived}
              onValueChange={setIsArchived}
              trackColor={{ false: '#E0E0E0', true: dscvrColors.electricMagenta }}
              thumbColor={dscvrColors.pureWhite}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="search" size={24} color={dscvrColors.midnightNavy} />
              <Text style={styles.settingText}>Search in Conversation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="download" size={24} color={dscvrColors.midnightNavy} />
              <Text style={styles.settingText}>Export Chat</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Media & Files */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media & Files</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="images" size={24} color={dscvrColors.midnightNavy} />
              <Text style={styles.settingText}>Shared Media</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="location" size={24} color={dscvrColors.midnightNavy} />
              <Text style={styles.settingText}>Shared Locations</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Privacy & Safety */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Safety</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleBlock}>
            <View style={styles.settingLeft}>
              <Ionicons name="ban" size={24} color="#FF3B30" />
              <Text style={[styles.settingText, { color: '#FF3B30' }]}>Block User</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleReport}>
            <View style={styles.settingLeft}>
              <Ionicons name="flag" size={24} color="#FF9500" />
              <Text style={[styles.settingText, { color: '#FF9500' }]}>Report User</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Delete Chat */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteChat}>
          <Text style={styles.deleteButtonText}>Delete Chat</Text>
        </TouchableOpacity>
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
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  section: {
    backgroundColor: dscvrColors.pureWhite,
    marginTop: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    marginLeft: 16,
  },
  deleteButton: {
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.pureWhite,
  },
});
