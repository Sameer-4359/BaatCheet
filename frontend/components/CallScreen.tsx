// app/components/CallScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { Ionicons } from '@expo/vector-icons';
import { useWebRTCContext } from '../app/_context/WebRTCContext';

const { width, height } = Dimensions.get('window');

const CallScreen: React.FC = () => {
  const { 
    callState, 
    localStream, 
    remoteStream, 
    endCall,
    toggleMute,
    toggleCamera,
    switchCamera
  } = useWebRTCContext();
  
  const { isCallActive, remoteName, isMuted, isCameraOn, callType } = callState;
  
  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (isCallActive) {
        endCall();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Stream (Full Screen) */}
      {remoteStream && callType === 'video' ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteStream}
          objectFit="cover"
        />
      ) : (
        <View style={styles.noVideoContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {remoteName ? remoteName[0].toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.remoteNameText}>{remoteName}</Text>
          <Text style={styles.callStatusText}>
            {callType === 'audio' ? 'Audio Call' : 'Video Unavailable'}
          </Text>
        </View>
      )}

      {/* Local Stream (Picture-in-Picture) */}
      {localStream && callType === 'video' && (
        <View style={styles.localStreamContainer}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localStream}
            objectFit="cover"
          />
          <TouchableOpacity
            style={styles.switchCameraButton}
            onPress={switchCamera}
          >
            <Ionicons name="camera-reverse" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Call Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted ? styles.controlButtonActive : null]}
          onPress={toggleMute}
        >
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={endCall}
        >
          <Ionicons name="call" size={28} color="white" />
        </TouchableOpacity>

        {callType === 'video' && (
          <TouchableOpacity
            style={[styles.controlButton, !isCameraOn ? styles.controlButtonActive : null]}
            onPress={toggleCamera}
          >
            <Ionicons
              name={isCameraOn ? "videocam" : "videocam-off"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  remoteStream: {
    flex: 1,
    width: width,
    height: height,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4080ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  remoteNameText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  callStatusText: {
    fontSize: 16,
    color: '#bbb',
  },
  localStreamContainer: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  localStream: {
    width: '100%',
    height: '100%',
  },
  switchCameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3a3a3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#ff453a',
  },
  endCallButton: {
    backgroundColor: '#ff453a',
    transform: [{ rotate: '135deg' }],
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});

export default CallScreen;