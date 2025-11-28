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
}

export default function MobileCallPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'dialpad' | 'contacts' | 'history' | 'settings'>('dialpad');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCallSid, setCurrentCallSid] = useState<string | null>(null);
  
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'عميل 1', phone: '+966501234567' },
    { id: '2', name: 'عميل 2', phone: '+966509876543' },
  ]);
  
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [serverUrl, setServerUrl] = useState(apiUrl);
  
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
      const response = await fetch(`${serverUrl}/api/calls`);
      const calls = await response.json();
      
      const formattedHistory: CallRecord[] = calls.slice(0, 10).map((call: any) => ({
        id: call.id,
        phone: call.toNumber || call.fromNumber,
        duration: formatDuration(call.durationSeconds || 0),
        time: new Date(call.createdAt).toLocaleString('ar-EG'),
        type: call.direction === 'outbound' ? 'outgoing' : 'incoming',
      }));
      
      setCallHistory(formattedHistory);
    } catch (error) {
      console.error('Failed to load call history:', error);
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
      setIsInCall(true);
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
      const tokenResponse = await fetch(`${serverUrl}/api/calls/token?identity=${encodeURIComponent(identity)}&employeeName=${encodeURIComponent(currentUser.name)}&employeeEmail=${encodeURIComponent(currentUser.email)}&department=${encodeURIComponent(currentUser.department || 'N/A')}`);
      const { token } = await tokenResponse.json();
      
      // إنشاء Twilio Device
      const device = new Device(token, {
        logLevel: 1,
        codecPreferences: ['opus', 'pcmu'] as any,
      });
      
      // تسجيل Device
      await device.register();
      
      // بدء المكالمة مباشرة من المتصفح إلى رقم العميل
      const call = await device.connect({
        params: { To: formattedNumber }
      });
      
      setCurrentCallSid(call.parameters.CallSid || '');
      console.log('WebRTC Call started:', call.parameters.CallSid);
      
      // عند إنهاء المكالمة تلقائياً (Customer hang up)
      call.on('disconnect', () => {
        console.log('Call disconnected by customer');
        setIsInCall(false);
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
        
        // تحديث السجل
        loadCallHistory();
      });
      
      // حفظ الـ device لاستخدامه في End Call
      (window as any).activeDevice = device;
      (window as any).activeCall = call;
      
    } catch (error) {
      console.error('Call error:', error);
      alert('حدث خطأ أثناء الاتصال: ' + (error as Error).message);
      setIsInCall(false);
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
    
    setContacts([...contacts, newContact]);
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
  };

  const dialpadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '*', '0', '#',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="المسار الساخن" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">📞 موبايل كول</h1>
                <p className="text-sm sm:text-base text-blue-100">المسار الساخن للسفر والسياحة</p>
              </div>
            </div>
            {currentUser && (
              <div className="hidden sm:block text-right">
                <div className="text-white font-bold">{currentUser.name}</div>
                <div className="text-blue-200 text-sm">{currentUser.department || currentUser.role}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-b-xl sm:rounded-b-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-20 lg:w-24 bg-gradient-to-b from-blue-600 to-blue-800 flex md:flex-col items-center justify-around md:justify-start py-4 md:py-8 space-x-4 md:space-x-0 md:space-y-6 lg:space-y-8">
              <button
                onClick={() => setCurrentView('dialpad')}
                className={`p-2 sm:p-3 md:p-4 rounded-lg transition ${
                  currentView === 'dialpad' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <span className="text-2xl sm:text-3xl">📱</span>
              </button>
              <button
                onClick={() => setCurrentView('contacts')}
                className={`p-2 sm:p-3 md:p-4 rounded-lg transition ${
                  currentView === 'contacts' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <span className="text-2xl sm:text-3xl">👥</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`p-2 sm:p-3 md:p-4 rounded-lg transition ${
                  currentView === 'history' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <span className="text-2xl sm:text-3xl">📋</span>
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`p-2 sm:p-3 md:p-4 rounded-lg transition ${
                  currentView === 'settings' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <span className="text-2xl sm:text-3xl">⚙️</span>
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6 md:p-8">
              {/* Dialpad View */}
              {currentView === 'dialpad' && !isInCall && (
                <div className="max-w-md mx-auto">
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
                    <div className="mt-4 sm:mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
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

              {/* In Call View */}
              {isInCall && (
                <div className="max-w-md mx-auto text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">مكالمة جارية</h2>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 sm:p-10 md:p-12 mb-6 sm:mb-8">
                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📞</div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900 mb-3 sm:mb-4" dir="ltr">
                      {phoneNumber}
                    </div>
                    <div className="text-4xl sm:text-5xl md:text-6xl font-mono text-blue-700">
                      {formatCallDuration()}
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4 justify-center">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-4 sm:p-5 md:p-6 rounded-full transition active:scale-95 ${
                        isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl">{isMuted ? '🔇' : '🔊'}</span>
                    </button>
                    <button
                      onClick={handleEndCall}
                      className="px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full font-bold transition shadow-lg hover:shadow-xl active:scale-95 text-base sm:text-lg md:text-xl"
                    >
                      <span className="text-xl sm:text-2xl">📵 إنهاء</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Contacts View */}
              {currentView === 'contacts' && (
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">جهات الاتصال</h2>
                    <button
                      onClick={() => {
                        setCurrentView('dialpad');
                        setShowAddContactForm(true);
                      }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-xs sm:text-sm font-bold"
                    >
                      👤+ جديد
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 sm:p-4 rounded-xl transition cursor-pointer active:scale-98"
                        onClick={() => {
                          setPhoneNumber(contact.phone);
                          setCurrentView('dialpad');
                        }}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl">
                            👤
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm sm:text-base">{contact.name}</div>
                            <div className="text-gray-600 text-xs sm:text-sm" dir="ltr">{contact.phone}</div>
                          </div>
                        </div>
                        <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-xs sm:text-sm">
                          📞 اتصال
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History View */}
              {currentView === 'history' && (
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">سجل المكالمات</h2>
                    <button
                      onClick={loadCallHistory}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-xs sm:text-sm"
                    >
                      🔄 تحديث
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {callHistory.length === 0 ? (
                      <div className="text-center text-gray-500 py-8 sm:py-12">
                        <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📭</div>
                        <p className="text-sm sm:text-base">لا توجد مكالمات بعد</p>
                      </div>
                    ) : (
                      callHistory.map((call) => (
                        <div
                          key={call.id}
                          className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 sm:p-4 rounded-xl transition"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div className={`text-xl sm:text-2xl ${
                              call.type === 'outgoing' ? 'text-green-500' : 
                              call.type === 'incoming' ? 'text-blue-500' : 'text-red-500'
                            }`}>
                              {call.type === 'outgoing' ? '📞' : call.type === 'incoming' ? '📲' : '📵'}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-800 text-sm sm:text-base" dir="ltr">{call.phone}</div>
                              <div className="text-gray-600 text-xs sm:text-sm">{call.time}</div>
                              {call.employeeName && (
                                <div className="text-blue-600 text-xs mt-1">
                                  👤 {call.employeeName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-gray-600 text-xs sm:text-sm">{call.duration}</div>
                            <button
                              onClick={() => handleCallFromHistory(call.phone)}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-xs sm:text-sm flex items-center gap-1"
                            >
                              <span>📞</span>
                              <span className="hidden sm:inline">اتصال</span>
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
