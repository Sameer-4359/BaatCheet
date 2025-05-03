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
  const localStreamRef = useRef<any>(null);
  const remoteStreamRef = useRef<any>(null);
  
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
      localStreamRef.current = stream;
      
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

  // End active call
  const endCall = () => {
    // Stop audio session
    InCallManager.stop();
    InCallManager.stopRingback();
    InCallManager.stopRingtone();
    
    // Release media resources
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => track.stop());
      localStreamRef.current = null;
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

  // Handle incoming offer
  const handleIncomingOffer = async (data: { 
    from: string, 
    offer: RTCSessionDescription, 
    roomId: string 
  }) => {
    try {
      if (!peerConnection.current) {
        initPeerConnection();
      }
      
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

  // Initialize WebRTC peer connection
  const initPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => {
        peerConnection.current?.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    (peerConnection.current as any).addEventListener('icecandidate', (event: {
      candidate: any; streams: any[]; 
}) => {
      if (event.candidate && socket.current) {
        socket.current.emit('ice-candidate', {
          roomId: callState.roomId,
          from: userId,
          candidate: event.candidate,
        });
      }
    });

    // Handle connection state changes
    (peerConnection.current as any).addEventListener('connectionstatechange', () => {
      console.log('Connection state:', peerConnection.current?.connectionState);
    });

    // Handle incoming tracks (remote stream)
    (peerConnection.current as any).addEventListener('track', (event: { streams: any[]; }) => {
      remoteStreamRef.current = event.streams[0];
      // Notify UI that remote stream is available
      setCallState((prev) => ({ ...prev, isCallActive: true }));
    });
  };

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
      InCallManager.startRingtone('ringtone_default', 1, 'default', 1);
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

  // Create and send offer
  const createOffer = async () => {
    try {
      const offer = await peerConnection.current?.createOffer({});
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

      // Create and send offer after joining room
      socket.current?.once('room-joined', () => {
        createOffer();
      });

      // Start ringtone for outgoing call
      InCallManager.startRingback('ringback_default');
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

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
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
    if (localStreamRef.current && callState.callType === 'video') {
      const videoTracks = localStreamRef.current.getVideoTracks();
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
    if (localStreamRef.current && callState.callType === 'video') {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
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
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
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