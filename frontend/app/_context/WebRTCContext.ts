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

  return (
    <WebRTCContext.Provider value={webRTC}>
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