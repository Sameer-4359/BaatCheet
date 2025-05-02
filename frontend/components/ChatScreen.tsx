// app/components/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWebRTCContext } from '../context/WebRTCContext';

interface Message {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
}

const ChatScreen: React.FC = () => {
  const { callState, sendMessage, endCall } = useWebRTCContext();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Listen for incoming messages
  useEffect(() => {
    // In a real implementation, you would connect this to your socket.io
    // This is where you would subscribe to incoming messages
    
    // Add a welcome message for demo purposes
    setMessages([
      {
        id: '1',
        text: `Chat started with ${callState.remoteName}`,
        isSender: false,
        timestamp: new Date().toISOString(),
      }
    ]);
    
    // Mock socket listener (this would be in WebRTCService in production)
    const mockSocketListener = (data: any) => {
      if (data && data.message) {
        addMessage(data.message, false);
      }
    };
    
    // Clean up function
    return () => {
      // Cleanup socket listeners
    };
  }, []);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Format timestamp to readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Add a new message to the conversation
  const addMessage = (text: string, isSender: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isSender,
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Send message via WebRTC service
      sendMessage(inputMessage.trim());
      
      // Add to local messages
      addMessage(inputMessage.trim(), true);
      
      // Clear input
      setInputMessage('');
    }
  };

  // Render a message bubble
  const renderMessageItem = ({ item }: { item: Message }) => (
    <View 
      style={[
        styles.messageBubble, 
        item.isSender ? styles.sentBubble : styles.receivedBubble
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestampText}>{formatTime(item.timestamp)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{callState.remoteName}</Text>
        <TouchableOpacity 
          style={styles.endButton}
          onPress={endCall}
        >
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type a message..."
            placeholderTextColor="#8e8e93"
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputMessage.trim() ? "#007AFF" : "#8e8e93"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  endButton: {
    padding: 8,
  },
  endButtonText: {
    color: '#ff453a',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  sentBubble: {
    backgroundColor: '#0A84FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#3A3A3C',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  timestampText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#2c2c2e',
    backgroundColor: '#1c1c1e',
  },
  input: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2c2c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;