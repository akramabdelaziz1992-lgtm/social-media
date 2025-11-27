'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface VoiceCallState {
  isActive: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  duration: number;
  phoneNumber: string;
  error: string | null;
  isDeviceReady: boolean;
  status: 'idle' | 'connecting' | 'ringing' | 'active' | 'ended';
}

interface VoiceCallHook extends VoiceCallState {
  startCall: (phoneNumber: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  formattedDuration: string;
}

export function useVoiceCall(): VoiceCallHook {
  const [state, setState] = useState<VoiceCallState>({
    isActive: false,
    isMuted: false,
    isSpeakerOn: false,
    duration: 0,
    phoneNumber: '',
    error: null,
    isDeviceReady: false,
    status: 'idle',
  });

  // Format duration as MM:SS
  const formattedDuration = `${Math.floor(state.duration / 60).toString().padStart(2, '0')}:${(state.duration % 60).toString().padStart(2, '0')}`;

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<any>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Twilio Device
  useEffect(() => {
    let mounted = true;

    const initializeDevice = async () => {
      try {
        console.log('🔧 جاري تهيئة Twilio Device...');

        // Check microphone permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          console.log('🎤 تم السماح بالوصول للميكروفون');
        } catch (micError: any) {
          console.error('❌ لم يتم السماح بالوصول للميكروفون:', micError);
          throw new Error('يرجى السماح بالوصول للميكروفون لإجراء المكالمات');
        }

        const response = await fetch(`${apiUrl}/api/calls/token?identity=agent`);
        if (!response.ok) {
          throw new Error('فشل الحصول على access token من الخادم');
        }

        const { token } = await response.json();
        console.log('🎫 تم الحصول على access token');

        const device = new Device(token, {
          logLevel: 1,
          codecPreferences: ['opus', 'pcmu'] as any,
        });

        if (!mounted) return;

        device.on('registered', () => {
          console.log('✅ Twilio Device مسجل ✅');
          if (mounted) {
            setState(prev => ({ ...prev, isDeviceReady: true, error: null }));
          }
        });

        device.on('error', (error) => {
          console.error('❌ خطأ في Twilio Device:', error);
          if (mounted) {
            let errorMessage = error?.message || 'خطأ في الجهاز';
            
            // إذا كان الخطأ JWT Invalid
            if (error?.message?.includes('JWT') || error?.message?.includes('AccessToken') || error?.code === 20101) {
              errorMessage = '❌ خطأ في Token المكالمات. الـ API Key غير صالح. راجع ملف FIX_TWILIO_API_KEY.md';
            }
            
            setState(prev => ({ 
              ...prev, 
              error: errorMessage,
              isDeviceReady: false,
            }));
          }
        });

        await device.register();
        deviceRef.current = device;

        console.log('✅ Twilio Device جاهز للاتصال من المتصفح! 🎤');

      } catch (error: any) {
        console.error('❌ فشل تهيئة Twilio Device:', error);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            error: error?.message || String(error) || 'فشل تهيئة الجهاز',
            isDeviceReady: false,
          }));
        }
      }
    };

    initializeDevice();

    return () => {
      mounted = false;
      if (deviceRef.current) {
        deviceRef.current.unregister();
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startCall = useCallback(async (phoneNumber: string) => {
    try {
      if (!deviceRef.current) {
        throw new Error('الجهاز غير جاهز');
      }

      if (!state.isDeviceReady) {
        throw new Error('الجهاز غير مسجل');
      }

      setState(prev => ({ 
        ...prev, 
        phoneNumber,
        error: null,
        status: 'connecting',
      }));

      let formattedNumber = phoneNumber.replace(/\s+/g, '');
      if (!formattedNumber.startsWith('+')) {
        if (formattedNumber.startsWith('05')) {
          formattedNumber = '+966' + formattedNumber.substring(1);
        } else if (formattedNumber.startsWith('5')) {
          formattedNumber = '+966' + formattedNumber;
        } else {
          formattedNumber = '+' + formattedNumber;
        }
      }

      console.log(`📞 اتصال WebRTC إلى: ${formattedNumber}`);

      const call = await deviceRef.current.connect({
        params: {
          To: formattedNumber,
        },
      });

      callRef.current = call;

      call.on('accept', () => {
        console.log('✅ المكالمة متصلة!');
        setState(prev => ({ ...prev, isActive: true, status: 'active' }));

        let duration = 0;
        durationIntervalRef.current = setInterval(() => {
          duration++;
          setState(prev => ({ ...prev, duration }));
        }, 1000);
      });

      call.on('disconnect', () => {
        console.log('📴 المكالمة انتهت');
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        setState(prev => ({
          ...prev,
          isActive: false,
          duration: 0,
          phoneNumber: '',
          status: 'ended',
        }));
        callRef.current = null;
      });

      call.on('error', (error) => {
        console.error('❌ خطأ في المكالمة:', error);
        setState(prev => ({ 
          ...prev, 
          error: error?.message || 'خطأ في المكالمة',
          isActive: false,
        }));
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        callRef.current = null;
      });

    } catch (error: any) {
      console.error('❌ فشل بدء المكالمة:', error);
      setState(prev => ({ 
        ...prev, 
        error: error?.message || String(error) || 'فشل بدء المكالمة',
        isActive: false,
      }));
      throw error;
    }
  }, [state.isDeviceReady]);

  const endCall = useCallback(() => {
    try {
      console.log('📴 إنهاء المكالمة');
      
      if (callRef.current) {
        callRef.current.disconnect();
        callRef.current = null;
      }

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      setState(prev => ({
        ...prev,
        isActive: false,
        duration: 0,
        phoneNumber: '',
        status: 'idle',
      }));
    } catch (error: any) {
      console.error('❌ فشل إنهاء المكالمة:', error);
    }
  }, []);

  const toggleMute = useCallback(() => {
    try {
      if (callRef.current) {
        const newMutedState = !state.isMuted;
        callRef.current.mute(newMutedState);
        setState(prev => ({ ...prev, isMuted: newMutedState }));
        console.log(newMutedState ? '🔇 كتم الصوت' : '🔊 تشغيل الصوت');
      }
    } catch (error: any) {
      console.error('❌ فشل كتم/تشغيل الصوت:', error);
    }
  }, [state.isMuted]);

  const toggleSpeaker = useCallback(() => {
    try {
      setState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
      console.log(!state.isSpeakerOn ? '🔊 السماعة مفعلة' : '🎧 السماعة غير مفعلة');
    } catch (error: any) {
      console.error('❌ فشل تفعيل/تعطيل السماعة:', error);
    }
  }, [state.isSpeakerOn]);

  return {
    ...state,
    startCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    formattedDuration,
  };
}

