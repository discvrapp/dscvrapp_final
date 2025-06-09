import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

export default function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { selectedUsers } = route.params;

  const [groupName, setGroupName] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);

  const createGroup = () => {
    if (!groupName.trim()) return;

    // Navigate to the new group chat
    navigation.replace('MessageChat', {
      chatId: `group-${Date.now()}`,
      userName: groupName,
      userAvatar: groupPhoto,
      isGroup: true,
    });
  };

  const selectGroupPhoto = () => {
    // Handle photo selection
    console.log('Select group photo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Group</Text>
          <TouchableOpacity
            onPress={createGroup}
            disabled={!groupName.trim()}
          >
            <Text style={[
              styles.createButton,
              !groupName.trim() && styles.createButtonDisabled
            ]}>
              Create
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Group Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={selectGroupPhoto} style={styles.photoButton}>
              {groupPhoto ? (
                <Image source={{ uri: groupPhoto }} style={styles.groupPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color="#999" />
                  <Text style={styles.photoText}>Add Group Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Group Name */}
          <View style={styles.nameSection}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
              placeholderTextColor="#999"
              autoFocus
            />
          </View>

          {/* Participants */}
          <View style={styles.participantsSection}>
            <Text style={styles.label}>Participants: {selectedUsers.length}</Text>
            <Text style={styles.participantsHint}>
              You can add or remove participants after creating the group
            </Text>
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Group Settings</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed" size={24} color={dscvrColors.midnightNavy} />
                <Text style={styles.settingText}>Make Group Private</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={24} color={dscvrColors.midnightNavy} />
                <Text style={styles.settingText}>Mute Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark" size={24} color={dscvrColors.midnightNavy} />
                <Text style={styles.settingText}>Admin Privileges</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
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
  createButton: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
  createButtonDisabled: {
    color: '#999',
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: dscvrColors.pureWhite,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  groupPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#999',
    marginTop: 8,
  },
  nameSection: {
    backgroundColor: dscvrColors.pureWhite,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#999',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  participantsSection: {
    backgroundColor: dscvrColors.pureWhite,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  participantsHint: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#999',
    marginTop: 4,
  },
  settingsSection: {
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
});
