import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
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

interface Message {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function MessageChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { chatId, userName, userAvatar, isGroup } = route.params;
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Let's get lunch! How about pizza? 🍕",
      createdAt: new Date(Date.now() - 60000),
      user: {
        id: '2',
        name: userName,
        avatar: userAvatar,
      },
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      createdAt: new Date(),
      user: {
        id: '1',
        name: 'You',
      },
    };

    setMessages([newMessage, ...messages]);
    setInputText('');
  };

  const handleLocationShare = () => {
    setShowLocationModal(false);
    const locationMessage: Message = {
      id: Date.now().toString(),
      text: '📍 Shared location',
      createdAt: new Date(),
      user: {
        id: '1',
        name: 'You',
      },
    };
    setMessages([locationMessage, ...messages]);
  };

  const handleMediaSelect = (type: string) => {
    setShowAttachmentMenu(false);
    console.log('Selected media type:', type);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.user.id === '1';
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && (
          <Image 
            source={{ uri: item.user.avatar || 'https://via.placeholder.com/40' }} 
            style={styles.messageAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
            {item.createdAt.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </Text>
        </View>
      </View>
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
        
        <View style={styles.headerCenter}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
              <Ionicons name={isGroup ? 'people' : 'person'} size={16} color="#999" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{userName}</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('ChatSettings', { chatId, userName })}>
          <Ionicons name="ellipsis-vertical" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowAttachmentMenu(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxHeight={100}
          />
          
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? dscvrColors.electricMagenta : '#999'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <View style={styles.attachmentMenuHeader}>
              <Text style={styles.attachmentMenuTitle}>Send Media</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentOptions}>
              <TouchableOpacity style={styles.attachmentOption} onPress={() => handleMediaSelect('photo')}>
                <View style={[styles.attachmentIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="image" size={24} color="#2196F3" />
                </View>
                <Text style={styles.attachmentLabel}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachmentOption} onPress={() => handleMediaSelect('camera')}>
                <View style={[styles.attachmentIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="camera" size={24} color="#9C27B0" />
                </View>
                <Text style={styles.attachmentLabel}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachmentOption} onPress={() => handleMediaSelect('gif')}>
                <View style={[styles.attachmentIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="happy" size={24} color="#FF9800" />
                </View>
                <Text style={styles.attachmentLabel}>GIF</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachmentOption} onPress={() => setShowLocationModal(true)}>
                <View style={[styles.attachmentIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="location" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.attachmentLabel}>Location</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachmentOption} onPress={() => handleMediaSelect('voice')}>
                <View style={[styles.attachmentIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="mic" size={24} color="#F44336" />
                </View>
                <Text style={styles.attachmentLabel}>Voice</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Location Share Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.locationModal}>
            <Text style={styles.locationModalTitle}>Share Location</Text>
            
            <TouchableOpacity style={styles.locationOption} onPress={handleLocationShare}>
              <Ionicons name="location" size={24} color={dscvrColors.vividBlue} />
              <Text style={styles.locationOptionText}>Current Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.locationOption} onPress={handleLocationShare}>
              <Ionicons name="bookmark" size={24} color={dscvrColors.royalPurple} />
              <Text style={styles.locationOptionText}>Saved Venues</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.locationOption} onPress={handleLocationShare}>
              <Ionicons name="shuffle" size={24} color={dscvrColors.electricMagenta} />
              <Text style={styles.locationOptionText}>Adventure Mode Pick</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowLocationModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 70 : 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: dscvrColors.electricMagenta,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  ownMessageText: {
    color: dscvrColors.pureWhite,
  },
  otherMessageText: {
    color: dscvrColors.midnightNavy,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 70 : 25,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachButton: {
    marginRight: 12,
    marginBottom: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: dscvrColors.pureWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  attachmentMenuHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  attachmentMenuTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  attachmentOptions: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  attachmentOption: {
    alignItems: 'center',
    marginRight: 20,
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
  },
  locationModal: {
    backgroundColor: dscvrColors.pureWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  locationModalTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    textAlign: 'center',
    marginBottom: 20,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationOptionText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    marginLeft: 16,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#999',
  },
});
