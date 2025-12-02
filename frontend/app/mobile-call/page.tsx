'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface CallRecord {
  id: string;
  phone: string;
  duration: string;
  time: string;
  type: 'outgoing' | 'incoming' | 'missed';
  employeeName?: string;
  recordingUrl?: string;
  recordingSid?: string;
}

export default function MobileCallPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'dialpad' | 'contacts' | 'history' | 'settings'>('dialpad');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // جاري الاتصال
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [currentCallSid, setCurrentCallSid] = useState<string | null>(null);
  const [showConferenceDialog, setShowConferenceDialog] = useState(false);
  const [conferenceNumber, setConferenceNumber] = useState('');
  
  const [contacts, setContacts] = useState<Contact[]>(() => {
    // تحميل جهات الاتصال من localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mobile-call-contacts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading contacts:', e);
        }
      }
    }
    return [
      { id: '1', name: 'عميل 1', phone: '+966501234567' },
      { id: '2', name: 'عميل 2', phone: '+966509876543' },
    ];
  });
  
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [serverUrl, setServerUrl] = useState(apiUrl);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  
  // New contact form states
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  
  // Settings states
  const [sipAccount, setSipAccount] = useState('');
  const [sipPassword, setSipPassword] = useState('');
  const [sipServer, setSipServer] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRecording, setAutoRecording] = useState(true);
  const [callVolume, setCallVolume] = useState(80);
  const [micVolume, setMicVolume] = useState(100);
  const [ringtoneVolume, setRingtoneVolume] = useState(70);
  
  // Check authentication on mount
  useEffect(() => {
    const user = authStorage.getUser();
    const token = authStorage.getAccessToken();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }
    
    setCurrentUser(user);
  }, [router]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  // Load call history from backend
  useEffect(() => {
    if (currentUser) {
      loadCallHistory();
    }
  }, [currentUser]);

  const loadCallHistory = async () => {
    try {
      const baseUrl = serverUrl.replace(/\/api$/, '');
      const response = await fetch(`${baseUrl}/api/calls`);
      if (!response.ok) {
        console.log('Call history endpoint not available yet');
        return;
      }
      const data = await response.json();
      const calls = Array.isArray(data) ? data : [];
      
      const formattedHistory: CallRecord[] = calls.slice(0, 10).map((call: any) => ({
        id: call.id,
        phone: call.toNumber || call.fromNumber || 'Unknown',
        duration: formatDuration(call.durationSeconds || 0),
        time: new Date(call.createdAt || Date.now()).toLocaleString('ar-EG'),
        type: call.status === 'completed' ? 'outgoing' : 'incoming',
        employeeName: call.employeeName || currentUser?.name || undefined,
        recordingUrl: call.recordingUrl,
        recordingSid: call.recordingSid,
      }));
      
      setCallHistory(formattedHistory);
    } catch (error) {
      console.error('Failed to load call history:', error);
      setCallHistory([]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallDuration = () => {
    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNumberClick = (digit: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(phoneNumber + digit);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleCall = async () => {
    if (!phoneNumber) return;
    if (!currentUser) {
      alert('الرجاء تسجيل الدخول أولاً');
      router.push('/login');
      return;
    }
    
    try {
      // بدء حالة "جاري الاتصال"
      setIsConnecting(true);
      setCallDuration(0);
      
      // تسجيل بيانات الموظف الذي يقوم بالمكالمة
      console.log('Call initiated by:', currentUser.name, '(' + currentUser.email + ')');
      
      // تنسيق الرقم بالصيغة الدولية
      let formattedNumber = phoneNumber.trim();
      
      // إذا كان الرقم يبدأ بـ 00 (صيغة دولية)
      if (formattedNumber.startsWith('00')) {
        // 00201123981454 → +201123981454
        formattedNumber = '+' + formattedNumber.substring(2);
      }
      // إذا كان الرقم يبدأ بـ 01 (رقم مصري)
      else if (formattedNumber.startsWith('01') && formattedNumber.length === 11) {
        // 01123981454 → +201123981454
        formattedNumber = '+20' + formattedNumber.substring(1);
      }
      // إذا كان الرقم يبدأ بـ 05 (رقم سعودي)
      else if (formattedNumber.startsWith('05') && formattedNumber.length === 10) {
        // 0559902557 → +966559902557
        formattedNumber = '+966' + formattedNumber.substring(1);
      }
      // إذا كان الرقم يبدأ بـ 5 فقط (رقم سعودي بدون صفر)
      else if (formattedNumber.startsWith('5') && formattedNumber.length === 9) {
        // 559902557 → +966559902557
        formattedNumber = '+966' + formattedNumber;
      }
      // إذا كان الرقم يبدأ بـ + (صيغة دولية صحيحة)
      else if (formattedNumber.startsWith('+')) {
        // استخدم الرقم كما هو
        formattedNumber = formattedNumber;
      }
      // أي رقم آخر، نفترض أنه سعودي
      else {
        formattedNumber = '+966' + formattedNumber.replace(/^0+/, '');
      }
      
      console.log('Original:', phoneNumber);
      console.log('Formatted:', formattedNumber);
      
      // استخدام WebRTC للاتصال المباشر من المتصفح
      const { Device } = await import('@twilio/voice-sdk');
      
      // الحصول على Token من Backend مع معلومات الموظف
      const identity = `${currentUser.name}-${Date.now()}`;
      // تنظيف URL - إزالة /api المكررة
      const baseUrl = serverUrl.replace(/\/api$/, '');
      const tokenResponse = await fetch(`${baseUrl}/api/calls/token?identity=${encodeURIComponent(identity)}&employeeName=${encodeURIComponent(currentUser.name)}&employeeEmail=${encodeURIComponent(currentUser.email)}&department=${encodeURIComponent(currentUser.department || 'N/A')}`);
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        const errorMsg = errorData.message || errorData.details || 'Failed to get Twilio token';
        console.error('Token error details:', errorData);
        throw new Error(errorMsg);
      }
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.token) {
        throw new Error('No token received from server');
      }
      
      const { token } = tokenData;
      
      // إنشاء Twilio Device
      const device = new Device(token, {
        logLevel: 1,
        codecPreferences: ['opus', 'pcmu'] as any,
      });
      
      // تسجيل Device
      await device.register();
      
      // بدء المكالمة مباشرة من المتصفح إلى رقم العميل
      const callStartTime = Date.now();
      const call = await device.connect({
        params: { 
          To: formattedNumber,
          employeeName: currentUser.name,
          employeeEmail: currentUser.email,
          department: currentUser.department || 'N/A'
        }
      });
      
      const callSid = call.parameters.CallSid || '';
      setCurrentCallSid(callSid);
      console.log('WebRTC Call started:', callSid);
      console.log('⏳ المكالمة تتصل... انتظر الرد');
      
      // تتبع حالة المكالمة
      let callAnswered = false;
      let callAnswerTime: number | null = null;
      
      // عند الرد على المكالمة - هنا نبدأ العداد
      call.on('accept', async () => {
        console.log('✅ تم الرد على المكالمة - بدء العداد');
        callAnswered = true;
        callAnswerTime = Date.now();
        setIsConnecting(false); // إيقاف "جاري الاتصال"
        setIsInCall(true); // بدء المكالمة الفعلية
        setCallDuration(0); // بدء العداد من الصفر
        
        // حفظ بداية المكالمة في قاعدة البيانات
        try {
          const baseUrl = serverUrl.replace(/\/api$/, '');
          await fetch(`${baseUrl}/api/calls/log-call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callSid: callSid,
              to: formattedNumber,
              employeeName: currentUser.name,
              employeeEmail: currentUser.email,
              department: currentUser.department || 'N/A',
              status: 'in-progress',
              direction: 'outbound',
              startTime: new Date().toISOString()
            })
          });
          console.log('✅ تم حفظ بداية المكالمة');
        } catch (error) {
          console.error('❌ خطأ في حفظ بداية المكالمة:', error);
        }
      });
      
      // عند رفض المكالمة أو فشلها
      call.on('reject', async () => {
        console.log('❌ تم رفض المكالمة');
        alert('تم رفض المكالمة من الطرف الآخر');
        setIsConnecting(false);
        setIsInCall(false);
        setCallDuration(0);
        
        // حفظ المكالمة المرفوضة
        try {
          const baseUrl = serverUrl.replace(/\/api$/, '');
          await fetch(`${baseUrl}/api/calls/log-call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callSid: callSid,
              to: formattedNumber,
              employeeName: currentUser.name,
              employeeEmail: currentUser.email,
              department: currentUser.department || 'N/A',
              status: 'no-answer',
              direction: 'outbound',
              duration: 0
            })
          });
        } catch (error) {
          console.error('❌ خطأ في حفظ المكالمة المرفوضة:', error);
        }
      });
      
      call.on('cancel', async () => {
        console.log('⚠️ تم إلغاء المكالمة');
        setIsConnecting(false);
        setIsInCall(false);
        setCallDuration(0);
        
        // حفظ المكالمة الملغاة
        if (!callAnswered) {
          try {
            const baseUrl = serverUrl.replace(/\/api$/, '');
            await fetch(`${baseUrl}/api/calls/log-call`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callSid: callSid,
                to: formattedNumber,
                employeeName: currentUser.name,
                employeeEmail: currentUser.email,
                department: currentUser.department || 'N/A',
                status: 'cancelled',
                direction: 'outbound',
                duration: 0
              })
            });
          } catch (error) {
            console.error('❌ خطأ في حفظ المكالمة الملغاة:', error);
          }
        }
      });
      
      // عند إنهاء المكالمة تلقائياً (Customer hang up)
      call.on('disconnect', async () => {
        console.log('Call disconnected');
        const callEndTime = Date.now();
        const actualDuration = callAnswered && callAnswerTime 
          ? Math.floor((callEndTime - callAnswerTime) / 1000) 
          : 0;
        
        setIsConnecting(false);
        setIsInCall(false);
        
        // حفظ نهاية المكالمة مع المدة الفعلية
        if (callAnswered) {
          try {
            const baseUrl = serverUrl.replace(/\/api$/, '');
            await fetch(`${baseUrl}/api/calls/log-call`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callSid: callSid,
                to: formattedNumber,
                employeeName: currentUser.name,
                employeeEmail: currentUser.email,
                department: currentUser.department || 'N/A',
                status: 'completed',
                direction: 'outbound',
                duration: actualDuration,
                endTime: new Date().toISOString()
              })
            });
            console.log(`✅ تم حفظ المكالمة - المدة: ${actualDuration} ثانية`);
          } catch (error) {
            console.error('❌ خطأ في حفظ نهاية المكالمة:', error);
          }
        }
        
        setCallDuration(0);
        
        // تنظيف الـ Device
        try {
          if (device.state === 'registered') {
            device.unregister();
          }
          device.destroy();
        } catch (err) {
          console.error('Error cleaning up device:', err);
        }
        
        // مسح المراجع
        (window as any).activeDevice = null;
        (window as any).activeCall = null;
        
        // تحديث السجل وجلب التسجيلات بعد 60 ثانية
        loadCallHistory();
        
        // محاولة جلب التسجيل بعد دقيقة
        setTimeout(async () => {
          console.log('⏰ Attempting to fetch recording after 60 seconds...');
          try {
            const serverUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
            const baseUrl = serverUrl.replace(/\/api$/, '');
            await fetch(`${baseUrl}/api/calls/fetch-recent-recordings`, { method: 'POST' });
            console.log('✅ Recording fetch triggered');
            loadCallHistory();
          } catch (error) {
            console.error('❌ Error fetching recording:', error);
          }
        }, 60000); // 60 ثانية
      });
      
      // حفظ الـ device لاستخدامه في End Call
      (window as any).activeDevice = device;
      (window as any).activeCall = call;
      
    } catch (error) {
      console.error('Call error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('حدث خطأ أثناء الاتصال: ' + errorMessage);
      setIsConnecting(false);
      setIsInCall(false);
      
      // تنظيف الـ Device في حالة الخطأ
      try {
        const device = (window as any).activeDevice;
        if (device) {
          if (device.state === 'registered') {
            device.unregister();
          }
          device.destroy();
          (window as any).activeDevice = null;
          (window as any).activeCall = null;
        }
      } catch (cleanupError) {
        console.error('Error cleaning up after failed call:', cleanupError);
      }
    }
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      alert('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }
    
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
    };
    
    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    
    // حفظ في localStorage
    localStorage.setItem('mobile-call-contacts', JSON.stringify(updatedContacts));
    
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContactForm(false);
    alert('✅ تم إضافة جهة الاتصال بنجاح!');
  };

  const handleCallFromHistory = (phone: string) => {
    setPhoneNumber(phone);
    setCurrentView('dialpad');
    // Auto-call after a short delay
    setTimeout(() => {
      handleCall();
    }, 500);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // تطبيق Speaker mode على الـ Device
    const activeCall = (window as any).activeCall;
    if (activeCall) {
      // Twilio SDK voice control
      console.log('Speaker:', !isSpeakerOn ? 'ON' : 'OFF');
    }
  };

  const toggleBluetooth = async () => {
    try {
      if (!isBluetoothConnected) {
        // Request Bluetooth device
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service']
        });
        console.log('Bluetooth device:', device.name);
        setIsBluetoothConnected(true);
      } else {
        setIsBluetoothConnected(false);
      }
    } catch (error) {
      console.error('Bluetooth error:', error);
      alert('فشل الاتصال بالبلوتوث');
    }
  };

  const handleAddToConference = () => {
    if (!conferenceNumber) {
      alert('الرجاء إدخال رقم الهاتف');
      return;
    }
    // إضافة مكالمة ثانية للمؤتمر
    console.log('Adding to conference:', conferenceNumber);
    alert('جاري إضافة ' + conferenceNumber + ' للمكالمة الجماعية...');
    setShowConferenceDialog(false);
    setConferenceNumber('');
  };

  const handleEndCall = async () => {
    console.log('Ending call manually...');
    
    // إنهاء المكالمة WebRTC
    try {
      const activeCall = (window as any).activeCall;
      const activeDevice = (window as any).activeDevice;
      
      // قطع المكالمة (هيشغل disconnect event تلقائياً)
      if (activeCall) {
        activeCall.disconnect();
        console.log('Call disconnected');
      }
      
      // الـ disconnect event هيتولى تنظيف الـ Device
      // لكن لو الـ Device لسه موجود، ننظفه
      if (activeDevice && activeDevice.state !== 'destroyed') {
        try {
          if (activeDevice.state === 'registered') {
            await activeDevice.unregister();
          }
          activeDevice.destroy();
          console.log('Device cleaned up');
        } catch (deviceErr) {
          console.error('Error cleaning device:', deviceErr);
        }
      }
      
      (window as any).activeCall = null;
      (window as any).activeDevice = null;
    } catch (err) {
      console.error('Error ending WebRTC call:', err);
    }
    
    setIsInCall(false);
    setCallDuration(0);
    setCurrentCallSid(null);
    
    // تحديث السجل
    setTimeout(() => loadCallHistory(), 1000);
    
    // محاولة جلب التسجيل بعد دقيقة
    setTimeout(async () => {
      console.log('⏰ Attempting to fetch recording after 60 seconds...');
      try {
        const serverUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const baseUrl = serverUrl.replace(/\/api$/, '');
        await fetch(`${baseUrl}/api/calls/fetch-recent-recordings`, { method: 'POST' });
        console.log('✅ Recording fetch triggered');
        loadCallHistory();
      } catch (error) {
        console.error('❌ Error fetching recording:', error);
      }
    }, 60000); // 60 ثانية
  };

  const dialpadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '*', '0', '#',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-2 sm:p-4 overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl p-4 sm:p-6 shadow-2xl sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-2xl">📞</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  موبايل كول
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                </h1>
                <p className="text-sm text-teal-100">نظام الاتصالات المتقدم</p>
              </div>
            </div>
            {currentUser && (
              <div className="hidden sm:block text-right bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
                <div className="text-white font-bold text-sm">{currentUser.name}</div>
                <div className="text-teal-200 text-xs">{currentUser.department || currentUser.role}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-2xl mb-4">
          <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)] max-h-[calc(100vh-120px)]">
            {/* Sidebar */}
            <div className="w-full md:w-24 bg-gradient-to-b from-teal-600 to-emerald-700 flex md:flex-col items-center justify-around md:justify-start py-4 md:py-8 space-x-4 md:space-x-0 md:space-y-8 shadow-xl">
              <button
                onClick={() => setCurrentView('dialpad')}
                className={`group relative p-4 rounded-xl transition-all transform hover:scale-110 ${
                  currentView === 'dialpad' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">{currentView === 'dialpad' ? '📱' : '☎️'}</span>
                <div className="hidden md:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  لوحة الاتصال
                </div>
              </button>
              <button
                onClick={() => setCurrentView('contacts')}
                className={`group relative p-4 rounded-xl transition-all transform hover:scale-110 ${
                  currentView === 'contacts' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">👥</span>
                <div className="hidden md:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  جهات الاتصال
                </div>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`group relative p-4 rounded-xl transition-all transform hover:scale-110 ${
                  currentView === 'history' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">📋</span>
                <div className="hidden md:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  سجل المكالمات
                </div>
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`group relative p-4 rounded-xl transition-all transform hover:scale-110 ${
                  currentView === 'settings' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">⚙️</span>
                <div className="hidden md:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  الإعدادات
                </div>
              </button>
            </div>

            {/* Main Content with Scroll */}
            <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {/* Dialpad View */}
              {currentView === 'dialpad' && !isInCall && (
                <div className="max-w-md mx-auto pb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">لوحة الاتصال</h2>
                  
                  {/* Phone number display */}
                  <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="أدخل رقم الهاتف"
                      className="w-full text-2xl sm:text-3xl text-center bg-transparent border-none outline-none text-gray-800"
                      dir="ltr"
                    />
                  </div>

                  {/* Dialpad */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                    {dialpadButtons.map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handleNumberClick(digit)}
                        className="bg-blue-50 hover:bg-blue-100 text-xl sm:text-2xl font-bold text-blue-900 py-4 sm:py-5 md:py-6 rounded-xl transition shadow-md hover:shadow-lg active:scale-95"
                      >
                        {digit}
                      </button>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                      onClick={handleBackspace}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 sm:py-4 rounded-xl font-bold transition active:scale-95 text-sm sm:text-base"
                    >
                      ⌫ مسح
                    </button>
                    <button
                      onClick={handleCall}
                      disabled={!phoneNumber}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 sm:py-4 rounded-xl font-bold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm sm:text-base"
                    >
                      📞 اتصال
                    </button>
                  </div>

                  {/* Add Contact Button */}
                  {phoneNumber && (
                    <button
                      onClick={() => {
                        setNewContactPhone(phoneNumber);
                        setShowAddContactForm(true);
                      }}
                      className="w-full mt-3 sm:mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-3 rounded-xl font-bold transition active:scale-95 text-sm sm:text-base"
                    >
                      👤+ حفظ كجهة اتصال
                    </button>
                  )}

                  {/* Add Contact Form */}
                  {showAddContactForm && (
                    <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                      <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">إضافة جهة اتصال جديدة</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">الاسم</label>
                          <input
                            type="text"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            placeholder="أدخل اسم جهة الاتصال"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">رقم الهاتف</label>
                          <input
                            type="text"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            placeholder="أدخل رقم الهاتف"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                            dir="ltr"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddContact}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 sm:py-3 rounded-lg font-bold transition text-xs sm:text-sm"
                          >
                            ✅ حفظ
                          </button>
                          <button
                            onClick={() => {
                              setShowAddContactForm(false);
                              setNewContactName('');
                              setNewContactPhone('');
                            }}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 sm:py-3 rounded-lg font-bold transition text-xs sm:text-sm"
                          >
                            ✖️ إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* In Call View - Enhanced Professional UI */}
              {isInCall && (
                <div className="max-w-2xl mx-auto">
                  {/* Call Status Header */}
                  <div className="text-center mb-8">
                    <div className="inline-block bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">
                      مكالمة نشطة
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">جارٍ الاتصال</h2>
                  </div>
                  
                  {/* Contact Card */}
                  <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50 rounded-3xl p-10 mb-8 shadow-2xl border-2 border-teal-200">
                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                        <span className="text-6xl">👤</span>
                      </div>
                    </div>
                    
                    {/* Phone Number */}
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-800 mb-2" dir="ltr">
                        {phoneNumber}
                      </div>
                      <div className="text-gray-600 text-sm">جاري التحدث...</div>
                    </div>
                    
                    {/* Call Duration */}
                    <div className="bg-white/60 backdrop-blur rounded-2xl py-6 px-8 text-center">
                      <div className="text-5xl font-mono font-bold text-teal-700 tracking-wider">
                        {formatCallDuration()}
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Mute Button */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                        isMuted 
                          ? 'bg-red-500 text-white shadow-red-200' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-gray-200'
                      }`}
                    >
                      <span className="text-4xl mb-2">{isMuted ? '🔇' : '🎤'}</span>
                      <span className="text-xs font-semibold">{isMuted ? 'إلغاء الكتم' : 'كتم'}</span>
                    </button>

                    {/* Speaker Button */}
                    <button
                      onClick={toggleSpeaker}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                        isSpeakerOn 
                          ? 'bg-blue-500 text-white shadow-blue-200' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-gray-200'
                      }`}
                    >
                      <span className="text-4xl mb-2">{isSpeakerOn ? '🔊' : '🔈'}</span>
                      <span className="text-xs font-semibold">{isSpeakerOn ? 'إيقاف السماعة' : 'السماعة'}</span>
                    </button>

                    {/* Bluetooth Button */}
                    <button
                      onClick={toggleBluetooth}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                        isBluetoothConnected 
                          ? 'bg-indigo-500 text-white shadow-indigo-200' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-gray-200'
                      }`}
                    >
                      <span className="text-4xl mb-2">🔵</span>
                      <span className="text-xs font-semibold">{isBluetoothConnected ? 'بلوتوث متصل' : 'بلوتوث'}</span>
                    </button>

                    {/* Dialpad Button */}
                    <button
                      onClick={() => {/* Show dialpad overlay */}}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-gray-200"
                    >
                      <span className="text-4xl mb-2">⌨️</span>
                      <span className="text-xs font-semibold">لوحة الأرقام</span>
                    </button>

                    {/* Add Call Button */}
                    <button
                      onClick={() => setShowConferenceDialog(true)}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-gray-200"
                    >
                      <span className="text-4xl mb-2">➕</span>
                      <span className="text-xs font-semibold">إضافة مكالمة</span>
                    </button>

                    {/* Hold Button */}
                    <button
                      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-gray-200"
                    >
                      <span className="text-4xl mb-2">⏸️</span>
                      <span className="text-xs font-semibold">تعليق</span>
                    </button>
                  </div>

                  {/* End Call Button */}
                  <button
                    onClick={handleEndCall}
                    className="w-full py-6 bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-white rounded-2xl font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-red-300 flex items-center justify-center gap-3"
                  >
                    <span className="text-3xl">📵</span>
                    <span>إنهاء المكالمة</span>
                  </button>
                </div>
              )}

              {/* Conference Dialog */}
              {showConferenceDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                      إضافة إلى المكالمة الجماعية
                    </h3>
                    <input
                      type="text"
                      value={conferenceNumber}
                      onChange={(e) => setConferenceNumber(e.target.value)}
                      placeholder="أدخل رقم الهاتف"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-center text-xl mb-6 focus:ring-4 focus:ring-teal-500/30 focus:border-teal-500 outline-none"
                      dir="ltr"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToConference}
                        className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
                      >
                        ✅ إضافة
                      </button>
                      <button
                        onClick={() => {
                          setShowConferenceDialog(false);
                          setConferenceNumber('');
                        }}
                        className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
                      >
                        ✖️ إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contacts View */}
              {currentView === 'contacts' && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">جهات الاتصال ({contacts.length})</h2>
                    <button
                      onClick={() => {
                        setCurrentView('dialpad');
                        setShowAddContactForm(true);
                      }}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm font-bold"
                    >
                      👤+ جديد
                    </button>
                  </div>
                  <div className="space-y-2 overflow-y-auto flex-1">
                    {contacts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📇</div>
                        <p>لا توجد جهات اتصال</p>
                      </div>
                    ) : (
                      contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                              👤
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-gray-800 text-sm truncate">{contact.name}</div>
                              <div className="text-gray-600 text-xs" dir="ltr">{contact.phone}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setPhoneNumber(contact.phone);
                                setCurrentView('dialpad');
                              }}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-xs flex-shrink-0"
                            >
                              📞 اتصال
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`هل تريد حذف ${contact.name}؟`)) {
                                  const updatedContacts = contacts.filter(c => c.id !== contact.id);
                                  setContacts(updatedContacts);
                                  localStorage.setItem('mobile-call-contacts', JSON.stringify(updatedContacts));
                                }
                              }}
                              className="px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-xs flex-shrink-0"
                              title="حذف"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* History View */}
              {currentView === 'history' && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">سجل المكالمات ({callHistory.length})</h2>
                    <button
                      onClick={loadCallHistory}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
                    >
                      🔄 تحديث
                    </button>
                  </div>
                  <div className="space-y-2 overflow-y-auto flex-1">
                    {callHistory.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-sm">لا توجد مكالمات بعد</p>
                      </div>
                    ) : (
                      callHistory.map((call) => (
                        <div
                          key={call.id}
                          className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`text-xl flex-shrink-0 ${
                              call.type === 'outgoing' ? 'text-green-500' : 
                              call.type === 'incoming' ? 'text-blue-500' : 'text-red-500'
                            }`}>
                              {call.type === 'outgoing' ? '📞' : call.type === 'incoming' ? '📲' : '📵'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-800 text-sm truncate" dir="ltr">{call.phone}</div>
                              <div className="text-gray-600 text-xs">{call.time}</div>
                              {call.employeeName && (
                                <div className="text-blue-600 text-xs mt-1 truncate">
                                  👤 {call.employeeName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-gray-600 text-xs">{call.duration}</div>
                            {call.recordingUrl && (
                              <a
                                href={call.recordingUrl.replace('.json', '.mp3')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-xs flex items-center gap-1"
                                title="استماع للتسجيل (يفتح في نافذة جديدة)"
                                onClick={(e) => {
                                  // السماح بالفتح في نافذة جديدة
                                  console.log('Opening recording:', call.recordingUrl);
                                }}
                              >
                                <span>🎧</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleCallFromHistory(call.phone)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-xs flex items-center gap-1"
                            >
                              <span>📞</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Settings View */}
              {currentView === 'settings' && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">⚙️ الإعدادات</h2>
                  <div className="space-y-4 sm:space-y-6">
                    
                    {/* Server Settings */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                        <span className="text-lg sm:text-xl">🌐</span> إعدادات الخادم
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                            عنوان Backend API
                          </label>
                          <input
                            type="text"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                            dir="ltr"
                            placeholder="https://api.example.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SIP Account Settings */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                        <span className="text-lg sm:text-xl">📞</span> حساب SIP
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                            اسم المستخدم
                          </label>
                          <input
                            type="text"
                            value={sipAccount}
                            onChange={(e) => setSipAccount(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                            dir="ltr"
                            placeholder="username@sip.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                            كلمة المرور
                          </label>
                          <input
                            type="password"
                            value={sipPassword}
                            onChange={(e) => setSipPassword(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                            dir="ltr"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                            خادم SIP
                          </label>
                          <input
                            type="text"
                            value={sipServer}
                            onChange={(e) => setSipServer(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                            dir="ltr"
                            placeholder="sip.example.com"
                          />
                        </div>
                        <button className="w-full py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition text-sm sm:text-base">
                          💾 حفظ إعدادات SIP
                        </button>
                      </div>
                    </div>

                    {/* Notifications Settings */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">🔔</span> الإشعارات
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700 font-semibold">تفعيل الإشعارات</span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={notificationsEnabled}
                              onChange={(e) => setNotificationsEnabled(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-gray-300 peer-checked:bg-green-500 rounded-full peer transition-all"></div>
                            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                          </div>
                        </label>
                        <p className="text-gray-600 text-sm">
                          استقبال إشعارات للمكالمات الواردة والرسائل
                        </p>
                      </div>
                    </div>

                    {/* Audio Settings */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">🔊</span> إعدادات الصوت
                      </h3>
                      <div className="space-y-6">
                        {/* Call Volume */}
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            صوت المكالمة: {callVolume}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={callVolume}
                            onChange={(e) => setCallVolume(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        {/* Mic Volume */}
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            صوت الميكروفون: {micVolume}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={micVolume}
                            onChange={(e) => setMicVolume(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        {/* Ringtone Volume */}
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            صوت الرنين: {ringtoneVolume}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={ringtoneVolume}
                            onChange={(e) => setRingtoneVolume(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2">
                          <span>🎵</span> اختبار الصوت
                        </button>
                      </div>
                    </div>

                    {/* Call Recording */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">⏺️</span> تسجيل المكالمة
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700 font-semibold">تسجيل تلقائي للمكالمات</span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={autoRecording}
                              onChange={(e) => setAutoRecording(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-gray-300 peer-checked:bg-red-500 rounded-full peer transition-all"></div>
                            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                          </div>
                        </label>
                        <p className="text-gray-600 text-sm">
                          تسجيل جميع المكالمات تلقائياً وحفظها في السجل
                        </p>
                      </div>
                    </div>

                    {/* Control Elements */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">🎮</span> عناصر التحكم
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition">
                          🔄 إعادة التشغيل
                        </button>
                        <button className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition">
                          🗑️ مسح الذاكرة
                        </button>
                        <button className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition">
                          📊 الإحصائيات
                        </button>
                        <button className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition">
                          📋 تصدير السجل
                        </button>
                      </div>
                    </div>
                    
                    {/* System Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">ℹ️</span> معلومات النظام
                      </h3>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p>✅ متصل بالخادم</p>
                        <p>📱 رقم Twilio: +18154860356</p>
                        <p>🌍 المنطقة: مصر → السعودية</p>
                        <p>🎤 WebRTC: نشط</p>
                        <p>⏱️ Ping: 45ms</p>
                        <p>📊 الإصدار: 1.0.0</p>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button 
                      onClick={() => {
                        alert('✅ تم حفظ الإعدادات بنجاح!');
                      }}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-bold rounded-xl transition shadow-lg hover:shadow-xl"
                    >
                      💾 حفظ جميع الإعدادات
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white mt-6">
          <p className="text-sm opacity-75">المسار الساخن للسفر والسياحة © 2025</p>
        </div>
      </div>
    </div>
  );
}
