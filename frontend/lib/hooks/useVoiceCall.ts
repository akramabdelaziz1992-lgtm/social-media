import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceCallState {
  isActive: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  duration: number;
  status: 'idle' | 'connecting' | 'ringing' | 'active' | 'ended';
  error?: string;
}

export function useVoiceCall() {
  const [state, setState] = useState<VoiceCallState>({
    isActive: false,
    isMuted: false,
    isSpeakerOn: true,
    duration: 0,
    status: 'idle',
  });

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioElementRef.current = new Audio();
      audioElementRef.current.autoplay = true;
    }
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
      }
    };
  }, []);

  // Duration counter
  useEffect(() => {
    if (state.status === 'active') {
      durationIntervalRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [state.status]);

  const startCall = useCallback(async (phoneNumber: string) => {
    try {
      setState(prev => ({ ...prev, status: 'connecting', isActive: true, duration: 0, error: undefined }));

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      localStreamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
        }
        setState(prev => ({ ...prev, status: 'active' }));
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real implementation, send this to your signaling server
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setState(prev => ({ ...prev, status: 'active' }));
        } else if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
          endCall();
        }
      };

      // Simulate ringing and connection (in real app, this would be handled by signaling server)
      setState(prev => ({ ...prev, status: 'ringing' }));
      
      // For demo: simulate connection after 2 seconds
      setTimeout(() => {
        if (peerConnectionRef.current) {
          setState(prev => ({ ...prev, status: 'active' }));
        }
      }, 2000);

      // In a real implementation, you would:
      // 1. Send call request to your backend with phoneNumber
      // 2. Backend connects to VoIP provider (Twilio, Vonage, etc.)
      // 3. Exchange SDP offers/answers through signaling server
      // 4. Establish WebRTC connection

    } catch (error) {
      console.error('Error starting call:', error);
      setState(prev => ({ 
        ...prev, 
        status: 'idle', 
        isActive: false,
        error: error instanceof Error ? error.message : 'فشل بدء المكالمة'
      }));
      cleanup();
    }
  }, []);

  const endCall = useCallback(() => {
    setState(prev => ({ ...prev, status: 'ended' }));
    
    setTimeout(() => {
      cleanup();
      setState({
        isActive: false,
        isMuted: false,
        isSpeakerOn: true,
        duration: 0,
        status: 'idle',
      });
    }, 1000);
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
      }
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    if (audioElementRef.current) {
      setState(prev => {
        const newSpeakerState = !prev.isSpeakerOn;
        if (audioElementRef.current) {
          audioElementRef.current.volume = newSpeakerState ? 1 : 0;
        }
        return { ...prev, isSpeakerOn: newSpeakerState };
      });
    }
  }, []);

  const cleanup = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear audio element
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }

    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    startCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    formattedDuration: formatDuration(state.duration),
  };
}
