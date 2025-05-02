// app/components/IncomingCallModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWebRTCContext } from '../app/_context/WebRTCContext';

interface IncomingCallModalProps {
  visible: boolean;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ visible }) => {
  const { callState, acceptCall, rejectCall } = useWebRTCContext();
  const { remoteName, remoteEmail, callType } = callState;

  const callTypeIcon = callType === 'video' 
    ? 'videocam' 
    : callType === 'audio' 
      ? 'call' 
      : 'chatbubble';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.callerInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {remoteName ? remoteName[0].toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.callerName}>{remoteName}</Text>
            <Text style={styles.callerEmail}>{remoteEmail}</Text>
            <View style={styles.callTypeContainer}>
              <Ionicons name={callTypeIcon} size={20} color="white" />
              <Text style={styles.callTypeText}>
                {callType === 'video' 
                  ? 'Video Call' 
                  : callType === 'audio' 
                    ? 'Audio Call' 
                    : 'Chat Request'}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={rejectCall}
            >
              <Ionicons name="close" size={28} color="white" />
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={acceptCall}
            >
              <Ionicons name={callTypeIcon} size={28} color="white" />
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  callerInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4080ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  callerEmail: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 16,
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  callTypeText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 110,
  },
  rejectButton: {
    backgroundColor: '#ff453a',
    borderRadius: 40,
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: '#34c759',
    borderRadius: 40,
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    marginTop: 8,
    fontSize: 16,
  },
});

export default IncomingCallModal;