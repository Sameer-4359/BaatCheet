// app/services/WebRTCService.ts
import { useEffect, useRef, useState } from 'react';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import io, { Socket } from 'socket.io-client';
import InCallManager from 'react-native-incall-manager';

// Configure your STUN/TURN servers
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add TURN servers for production
  ],
};

// Types for call options and state
export type CallType = 'video' | 'audio' | 'chat';

export interface CallOptions {
  type: CallType;
  targetEmail: string;
  targetUserId?: string;
  roomId?: string;
}

export interface CallState {
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  isCallActive: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  remoteName: string;
  remoteEmail: string;
  callType: CallType;
  roomId: string;
}

const SERVER_URL = 'http://YOUR_SERVER_URL'; // Replace with your actual server URL

export const useWebRTC = (userId: string, userEmail: string, userName: string) => {
  // Connection refs
  const socket = useRef<Socket | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  
  // Stream refs
  const localStream = useRef<any>(null);
  const remoteStream = useRef<any>(null);
  
  // Call state
  const [callState, setCallState] = useState<CallState>({
    isIncomingCall: false,
    isOutgoingCall: false,
    isCallActive: false,
    isMuted: false,
    isCameraOn: true,
    remoteName: '',
    remoteEmail: '',
    callType: 'video',
    roomId: '',
  });

  // Handle socket initialization
  useEffect(() => {
    if (!socket.current && userId) {
      connectSocket();
    }
    
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
      endCall();
    };
  }, [userId]);

  // Connect to signaling server
  const connectSocket = () => {
    socket.current = io(SERVER_URL, {
      query: { userId, userEmail },
      transports: ['websocket'],
    });

    // Listen for socket events
    socket.current.on('connect', () => {
      console.log('Connected to signaling server');
    });

    socket.current.on('call-invitation', (data: { 
      from: string, 
      fromEmail: string, 
      fromName: string, 
      roomId: string, 
      type: CallType 
    }) => {
      setCallState({
        ...callState,
        isIncomingCall: true,
        remoteName: data.fromName,
        remoteEmail: data.fromEmail,
        callType: data.type,
        roomId: data.roomId,
      });
      // Play ringtone
      InCallManager.startRingtone('ringtone_default');
    });

    socket.current.on('offer', async (data: { 
      from: string, 
      offer: RTCSessionDescription, 
      roomId: string 
    }) => {
      try {
        await handleIncomingOffer(data);
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    socket.current.on('answer', async (data: { 
      from: string, 
      answer: RTCSessionDescription, 
      roomId: string 
    }) => {
      try {
        if (peerConnection.current && data.answer) {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        }
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    socket.current.on('ice-candidate', (data: { 
      from: string, 
      candidate: RTCIceCandidate, 
      roomId: string 
    }) => {
      try {
        if (peerConnection.current && data.candidate) {
          peerConnection.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    socket.current.on('call-ended', () => {
      endCall();
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });
  };

  // Initialize WebRTC peer connection
  const initPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStream.current) {
      localStream.current.getTracks().forEach((track: any) => {
        peerConnection.current?.addTrack(track, localStream.current);
      });
    }

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && socket.current) {
        socket.current.emit('ice-candidate', {
          roomId: callState.roomId,
          from: userId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    peerConnection.current.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.current?.connectionState);
    };

    // Handle incoming tracks (remote stream)
    peerConnection.current.ontrack = (event) => {
      remoteStream.current = event.streams[0];
      // Notify UI that remote stream is available
      setCallState((prev) => ({ ...prev, isCallActive: true }));
    };
  };

  // Get user media (camera, microphone)
  const getUserMedia = async (callType: CallType) => {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      localStream.current = stream;
      
      // Configure audio session
      InCallManager.start({ media: callType === 'video' ? 'video' : 'audio' });
      InCallManager.setKeepScreenOn(true);
      InCallManager.setForceSpeakerphoneOn(callType === 'video');

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  // Create and send offer
  const createOffer = async () => {
    try {
      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);

      if (socket.current && offer) {
        socket.current.emit('offer', {
          roomId: callState.roomId,
          from: userId,
          offer,
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  // Handle incoming offer
  const handleIncomingOffer = async (data: { 
    from: string, 
    offer: RTCSessionDescription, 
    roomId: string 
  }) => {
    try {
      await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);

      if (socket.current && answer) {
        socket.current.emit('answer', {
          roomId: data.roomId,
          from: userId,
          answer,
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  // Start a call
  const startCall = async (options: CallOptions) => {
    try {
      // Create a room ID (using alphabetical order of emails)
      const emails = [userEmail, options.targetEmail].sort();
      const roomId = `${emails[0]}_${emails[1]}`;

      // Update call state
      setCallState({
        ...callState,
        isOutgoingCall: true,
        isCallActive: false,
        remoteName: options.targetEmail.split('@')[0], // Temporary name
        remoteEmail: options.targetEmail,
        callType: options.type,
        roomId,
      });

      // Get user media based on call type
      await getUserMedia(options.type);
      
      // Initialize peer connection
      initPeerConnection();

      // Emit call invitation
      if (socket.current) {
        socket.current.emit('call-invitation', {
          targetEmail: options.targetEmail,
          from: userId,
          fromEmail: userEmail,
          fromName: userName,
          type: options.type,
          roomId,
        });
      }

      // Start ringtone for outgoing call
      InCallManager.startRingback();
    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    try {
      // Stop ringtone
      InCallManager.stopRingtone();
      
      // Get user media
      await getUserMedia(callState.callType);
      
      // Initialize peer connection
      initPeerConnection();
      
      // Join room
      if (socket.current) {
        socket.current.emit('join-room', {
          roomId: callState.roomId,
        });
      }
      
      // Update call state
      setCallState({
        ...callState,
        isIncomingCall: false,
        isCallActive: true,
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    // Stop ringtone
    InCallManager.stopRingtone();
    
    // Notify other user
    if (socket.current) {
      socket.current.emit('call-rejected', {
        roomId: callState.roomId,
      });
    }
    
    // Reset call state
    setCallState({
      ...callState,
      isIncomingCall: false,
      roomId: '',
      remoteName: '',
      remoteEmail: '',
    });
  };

  // End active call
  const endCall = () => {
    // Stop audio session
    InCallManager.stop();
    InCallManager.stopRingback();
    InCallManager.stopRingtone();
    
    // Release media resources
    if (localStream.current) {
      localStream.current.getTracks().forEach((track: any) => track.stop());
      localStream.current = null;
    }
    
    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    // Notify other user
    if (socket.current && callState.roomId) {
      socket.current.emit('call-ended', {
        roomId: callState.roomId,
      });
    }
    
    // Reset call state
    setCallState({
      isIncomingCall: false,
      isOutgoingCall: false,
      isCallActive: false,
      isMuted: false,
      isCameraOn: true,
      remoteName: '',
      remoteEmail: '',
      callType: 'video',
      roomId: '',
    });
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream.current) {
      const audioTracks = localStream.current.getAudioTracks();
      audioTracks.forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      
      setCallState({
        ...callState,
        isMuted: !callState.isMuted,
      });
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream.current && callState.callType === 'video') {
      const videoTracks = localStream.current.getVideoTracks();
      videoTracks.forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      
      setCallState({
        ...callState,
        isCameraOn: !callState.isCameraOn,
      });
    }
  };

  // Switch camera (front/back)
  const switchCamera = () => {
    if (localStream.current && callState.callType === 'video') {
      const videoTrack = localStream.current.getVideoTracks()[0];
      videoTrack._switchCamera();
    }
  };

  // Send chat message
  const sendMessage = (message: string) => {
    if (socket.current && callState.roomId) {
      socket.current.emit('chat-message', {
        roomId: callState.roomId,
        from: userId,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    callState,
    localStream: localStream.current,
    remoteStream: remoteStream.current,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    switchCamera,
    sendMessage,
  };
};