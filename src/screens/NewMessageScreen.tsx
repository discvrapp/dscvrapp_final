import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isFollowing: boolean;
}

export default function NewMessageScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      username: '@sarahj',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isFollowing: true,
    },
    {
      id: '2',
      name: 'Mike Chen',
      username: '@mikechen',
      avatar: 'https://i.pravatar.cc/150?img=3',
      isFollowing: true,
    },
    {
      id: '3',
      name: 'Emma Wilson',
      username: '@emmaw',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isFollowing: false,
    },
    {
      id: '4',
      name: 'David Park',
      username: '@davidp',
      avatar: 'https://i.pravatar.cc/150?img=8',
      isFollowing: true,
    },
    {
      id: '5',
      name: 'Lisa Brown',
      username: '@lisab',
      avatar: 'https://i.pravatar.cc/150?img=9',
      isFollowing: false,
    },
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const startChat = () => {
    if (selectedUsers.length === 0) return;
    
    if (selectedUsers.length === 1) {
      const user = users.find(u => u.id === selectedUsers[0]);
      navigation.replace('MessageChat', {
        chatId: user?.id,
        userName: user?.name,
        userAvatar: user?.avatar,
        isGroup: false,
      });
    } else {
      // Navigate to group creation screen
      navigation.navigate('CreateGroup', { selectedUsers });
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleUserSelection(item.id)}
      >
        <View style={styles.userLeft}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color="#999" />
            </View>
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userUsername}>{item.username}</Text>
          </View>
        </View>
        
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color={dscvrColors.pureWhite} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
        <TouchableOpacity
          onPress={startChat}
          disabled={selectedUsers.length === 0}
        >
          <Text style={[
            styles.nextButton,
            selectedUsers.length === 0 && styles.nextButtonDisabled
          ]}>
            {selectedUsers.length > 1 ? 'Next' : 'Chat'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            autoFocus
          />
        </View>
      </View>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedUsers.map(userId => {
              const user = users.find(u => u.id === userId);
              return (
                <TouchableOpacity
                  key={userId}
                  style={styles.selectedUser}
                  onPress={() => toggleUserSelection(userId)}
                >
                  <Text style={styles.selectedUserName}>{user?.name}</Text>
                  <Ionicons name="close-circle" size={16} color={dscvrColors.electricMagenta} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.userList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dscvrColors.pureWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  nextButton: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
  nextButtonDisabled: {
    color: '#999',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
  },
  selectedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedUserName: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    marginRight: 4,
  },
  userList: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  userUsername: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#999',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: dscvrColors.electricMagenta,
    borderColor: dscvrColors.electricMagenta,
  },
  emptyState: {
    paddingTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#999',
  },
});
