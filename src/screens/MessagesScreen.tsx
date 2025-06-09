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

interface Chat {
  id: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  isGroup?: boolean;
  groupMembers?: number;
}

export default function MessagesScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'primary' | 'general'>('primary');
  
  const [chats] = useState<Chat[]>([
    {
      id: '1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: "Let's get lunch! How about pizza? 🍕",
      timestamp: '10:02',
      unread: true,
      isGroup: false,
    },
    {
      id: '2',
      userName: 'Weekend Crew',
      lastMessage: 'John: Anyone up for brunch tomorrow?',
      timestamp: 'Yesterday',
      unread: false,
      isGroup: true,
      groupMembers: 5,
    },
    {
      id: '3',
      userName: 'Mike Chen',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: 'Thanks for the recommendation!',
      timestamp: '2 days ago',
      unread: false,
      isGroup: false,
    },
    {
      id: '4',
      userName: 'Emma Wilson',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      lastMessage: 'That place was amazing 🔥',
      timestamp: '1 week ago',
      unread: false,
      isGroup: false,
    },
    {
      id: '5',
      userName: 'Food Lovers',
      lastMessage: 'New restaurant alert! 📍',
      timestamp: '2 weeks ago',
      unread: true,
      isGroup: true,
      groupMembers: 12,
    },
  ]);

  const filteredChats = chats.filter(chat => 
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChat = ({ item }: { item: Chat }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('MessageChat', { 
        chatId: item.id,
        userName: item.userName,
        userAvatar: item.userAvatar,
        isGroup: item.isGroup,
      })}
    >
      <View style={styles.avatarContainer}>
        {item.userAvatar ? (
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons 
              name={item.isGroup ? 'people' : 'person'} 
              size={24} 
              color="#999" 
            />
          </View>
        )}
        {item.unread && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={[styles.lastMessage, item.unread && styles.unreadMessage]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.isGroup && (
            <Text style={styles.groupMembers}>
              {item.groupMembers} members
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NewMessage')}>
          <Ionicons name="create-outline" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Messages"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'primary' && styles.activeTab]}
          onPress={() => setActiveTab('primary')}
        >
          <Text style={[styles.tabText, activeTab === 'primary' && styles.activeTabText]}>
            Primary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
            General
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <TouchableOpacity 
              style={styles.startChatButton}
              onPress={() => navigation.navigate('NewMessage')}
            >
              <Text style={styles.startChatText}>Start a conversation</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: dscvrColors.pureWhite,
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: dscvrColors.pureWhite,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: dscvrColors.electricMagenta,
  },
  tabText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#999',
  },
  activeTabText: {
    color: dscvrColors.electricMagenta,
  },
  chatList: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: dscvrColors.electricMagenta,
    borderWidth: 2,
    borderColor: dscvrColors.pureWhite,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#999',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  groupMembers: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#999',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#999',
    marginTop: 12,
  },
  startChatButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: dscvrColors.electricMagenta,
    borderRadius: 25,
  },
  startChatText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.pureWhite,
  },
});
