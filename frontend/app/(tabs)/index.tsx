// import { View, Text, StyleSheet } from 'react-native'

// const app = () => {
//   return (
//     // Note: style = ... is an ATTRIBUTE, not a prop
//     <View style={styles.container}> 
//       <Text style={styles.text} className = "text-white" >Coffee Shop</Text> 
//       <Text style={styles.text} className = "text-blue-100">Banana Shop</Text>
//       {/* flex-1 fills view */}
//     </View>
//   )
// }

// export default app

// const styles = StyleSheet.create({
//   container: {
//     flex:1,
//     flexDirection: "column",
//   },
//   text: {
//     color:"white",
//     fontSize:42,
//     fontWeight:'bold',
//     textAlign:'center'
//   }
// })

// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Import our WebRTC components
import { useWebRTCContext } from '../_context/WebRTCContext';
import CallScreen from '../../components/CallScreen';
import ChatScreen from '../../components/ChatScreen';
import IncomingCallModal from '../../components/IncomingCallModal';

import { requestMediaPermissions } from '../../utils/permissions';

export default function TabOneScreen() {
  // State for user input and authentication
  const [targetEmail, setTargetEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<{
    userId: string;
    name: string;
    email: string;
  } | null>(null);

  // Get WebRTC context
  const { 
    callState, 
    startCall
  } = useWebRTCContext();

  // Load user data from storage on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Handle starting different types of calls
  const handleStartChat = () => {
    if (targetEmail && targetEmail.trim()) {
      startCall({
        type: 'chat',
        targetEmail: targetEmail.trim()
      });
    }
  };

  const handleStartVoiceCall = async () => {
    const granted = await requestMediaPermissions();
    if (!granted) {
      alert('Mic permission is required');
      return;
    }

    if (targetEmail.trim()) {
      startCall({ type: 'audio', targetEmail: targetEmail.trim() });
    }
};

  const handleStartVideoCall = () => {
    if (targetEmail && targetEmail.trim()) {
      startCall({
        type: 'video',
        targetEmail: targetEmail.trim()
      });
    }
  };

  // Render call/chat screens if a call is active
  if (callState.isCallActive) {
    if (callState.callType === 'chat') {
      return <ChatScreen />;
    } else {
      return <CallScreen />;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WebRTC Communication</Text>
        {currentUser && (
          <Text style={styles.userInfo}>
            Logged in as: {currentUser.name}
          </Text>
        )}
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start Communication</Text>
          
          {/* Input for target user */}
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#8e8e93"
            value={targetEmail}
            onChangeText={setTargetEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartChat}
              disabled={!targetEmail.trim()}
            >
              <Ionicons name="chatbubbles" size={24} color="white" />
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartVoiceCall}
              disabled={!targetEmail.trim()}
            >
              <Ionicons name="call" size={24} color="white" />
              <Text style={styles.actionText}>Voice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartVideoCall}
              disabled={!targetEmail.trim()}
            >
              <Ionicons name="videocam" size={24} color="white" />
              <Text style={styles.actionText}>Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <Text style={styles.instructionText}>
            1. Enter the email of the person you want to connect with
          </Text>
          <Text style={styles.instructionText}>
            2. Choose whether to start a chat, voice call, or video call
          </Text>
          <Text style={styles.instructionText}>
            3. Wait for the other person to accept your invitation
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Incoming Call Modal */}
      <IncomingCallModal visible={callState.isIncomingCall} />

      {/* Outgoing Call Modal */}
      <Modal
        visible={callState.isOutgoingCall && !callState.isCallActive}
        transparent
        animationType="fade"
      >
        <View style={styles.outgoingCallModal}>
          <View style={styles.outgoingCallContent}>
            <Text style={styles.outgoingCallTitle}>
              Calling {callState.remoteName}...
            </Text>
            <Text style={styles.outgoingCallSubtitle}>
              {callState.callType === 'video' 
                ? 'Video Call' 
                : callState.callType === 'audio' 
                  ? 'Voice Call' 
                  : 'Chat Invitation'}
            </Text>
            
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={() => {
                // This would be your endCall function from the WebRTC context
                const { endCall } = useWebRTCContext();
                endCall();
              }}
            >
              <Ionicons name="close-circle" size={60} color="#ff453a" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 14,
    color: '#8e8e93',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  instructionsContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  outgoingCallModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  outgoingCallContent: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  outgoingCallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  outgoingCallSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 24,
  },
  endCallButton: {
    marginTop: 16,
  },
});