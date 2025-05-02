// app/context/WebRTCContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useWebRTC, CallOptions, CallState } from '../services/WebRTCService';

interface WebRTCContextProps {
  callState: CallState;
  localStream: any;
  remoteStream: any;
  startCall: (options: CallOptions) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  switchCamera: () => void;
  sendMessage: (message: string) => void;
}

const WebRTCContext = createContext<WebRTCContextProps | undefined>(undefined);

export const WebRTCProvider: React.FC<{
  children: ReactNode;
  userId: string;
  userEmail: string;
  userName: string;
}> = ({ children, userId, userEmail, userName }) => {
  const webRTC = useWebRTC(userId, userEmail, userName);

  // Explicitly define the context value to match WebRTCContextProps
  const contextValue: WebRTCContextProps = {
    callState: webRTC.callState,
    localStream: webRTC.localStream,
    remoteStream: webRTC.remoteStream,
    startCall: webRTC.startCall,
    acceptCall: webRTC.acceptCall,
    rejectCall: webRTC.rejectCall,
    endCall: webRTC.endCall,
    toggleMute: webRTC.toggleMute,
    toggleCamera: webRTC.toggleCamera,
    switchCamera: webRTC.switchCamera,
    sendMessage: webRTC.sendMessage,
  };

  return (
    <WebRTCContext.Provider value={contextValue}>
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTCContext = (): WebRTCContextProps => {
  const context = useContext(WebRTCContext);
  if (context === undefined) {
    throw new Error('useWebRTCContext must be used within a WebRTCProvider');
  }
  return context;
};