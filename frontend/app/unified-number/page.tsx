"use client";

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed,
  Users, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Pause,
  Play,
  Clock,
  User,
  Calendar,
  Download,
  Filter,
  Search,
  Plus,
  Settings,
  Headphones,
  UserPlus,
  Shield,
  TrendingUp,
  Loader2,
  BarChart3,
  Timer,
  Star,
  MessageSquare,
  Zap,
  Activity,
  Award,
  Target,
  Bell,
  X
} from 'lucide-react';
import { useVoiceCall } from '@/lib/hooks/useVoiceCall';
import Dialpad from '@/components/Dialpad';

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface CallRecord {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callerName: string;
  callerNumber: string;
  employeeName: string;
  duration: string;
  timestamp: string;
  status: 'completed' | 'missed' | 'ongoing';
  recordingUrl?: string;
}

interface Employee {
  id: string;
  name: string;
  extension: string;
  department: string;
  status: 'available' | 'busy' | 'offline';
  totalCalls: number;
  avgDuration: string;
}

export default function CallCenterPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calls' | 'agents' | 'analytics' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const [showNewCallDialog, setShowNewCallDialog] = useState(false);
  const [newCallNumber, setNewCallNumber] = useState('');
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [showNewCallModal, setShowNewCallModal] = useState(false);
  const [modalCallNumber, setModalCallNumber] = useState('');
  const [realCallRecords, setRealCallRecords] = useState<CallRecord[]>([]);
  const [isSoftphoneRunning, setIsSoftphoneRunning] = useState(false);

  // Real voice call hook
  const voiceCall = useVoiceCall();

  // Load real call records from backend
  useEffect(() => {
    loadCallRecords();
    checkSoftphoneStatus();
    
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadCallRecords();
      checkSoftphoneStatus();
    }, 5000); // تحديث كل 5 ثواني للاستجابة الفورية
    return () => clearInterval(interval);
  }, []);

  const loadCallRecords = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/calls`);
      if (response.ok) {
        const calls = await response.json();
        
        // Transform backend data to CallRecord format
        const transformedCalls: CallRecord[] = calls.map((call: any) => {
          // تحديد الحالة بشكل صحيح
          let callStatus: 'completed' | 'missed' | 'ongoing' = 'completed';
          
          // التحقق من وقت المكالمة - إذا مر أكثر من دقيقتين، تعتبر منتهية
          const callAge = Date.now() - new Date(call.createdAt).getTime();
          const twoMinutes = 2 * 60 * 1000;
          
          if (call.status === 'completed') {
            callStatus = 'completed';
          } else if (call.status === 'failed' || call.status === 'no-answer' || call.status === 'busy' || call.status === 'cancelled') {
            callStatus = 'missed';
          } else if ((call.status === 'in-progress' || call.status === 'ringing' || call.status === 'initiated') && callAge < twoMinutes) {
            // فقط إذا كانت المكالمة حديثة (أقل من دقيقتين)
            callStatus = 'ongoing';
          } else if (callAge >= twoMinutes) {
            // إذا مر وقت طويل ولم يتم التحديث، تعتبر منتهية
            callStatus = call.durationSeconds > 0 ? 'completed' : 'missed';
          }
          
          return {
            id: call.id,
            type: call.direction === 'inbound' ? 'incoming' : 'outgoing',
            callerName: call.customerName || call.toNumber || 'غير معروف',
            callerNumber: call.direction === 'inbound' ? call.fromNumber : call.toNumber,
            employeeName: call.agentName || 'موبايل كول',
            duration: call.durationSeconds ? `${Math.floor(call.durationSeconds / 60)}:${(call.durationSeconds % 60).toString().padStart(2, '0')}` : '0:00',
            timestamp: new Date(call.createdAt).toLocaleString('ar-EG', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: callStatus,
            recordingUrl: call.recordingUrl
          };
        });
        
        setRealCallRecords(transformedCalls);
      }
    } catch (error) {
      console.error('خطأ في تحميل سجل المكالمات:', error);
    }
  };

  // Mock Data
  const callRecords: CallRecord[] = [
    {
      id: '1',
      type: 'incoming',
      callerName: 'أحمد محمد السعيد',
      callerNumber: '+966501234567',
      employeeName: 'فاطمة علي',
      duration: '5:23',
      timestamp: '2024-01-20 10:30 AM',
      status: 'completed',
      recordingUrl: '/recordings/call1.mp3'
    },
    {
      id: '2',
      type: 'outgoing',
      callerName: 'سارة أحمد الغامدي',
      callerNumber: '+966509876543',
      employeeName: 'محمود سعيد',
      duration: '3:15',
      timestamp: '2024-01-20 11:15 AM',
      status: 'completed',
      recordingUrl: '/recordings/call2.mp3'
    },
    {
      id: '3',
      type: 'missed',
      callerName: 'خالد عبدالله',
      callerNumber: '+966551234567',
      employeeName: '-',
      duration: '0:00',
      timestamp: '2024-01-20 11:45 AM',
      status: 'missed'
    },
  ];

  const employees: Employee[] = [
    {
      id: '1',
      name: 'فاطمة علي',
      extension: '101',
      department: 'خدمة العملاء',
      status: 'available',
      totalCalls: 45,
      avgDuration: '4:23'
    },
    {
      id: '2',
      name: 'محمود سعيد',
      extension: '102',
      department: 'المبيعات',
      status: 'busy',
      totalCalls: 67,
      avgDuration: '6:12'
    },
    {
      id: '3',
      name: 'سارة أحمد',
      extension: '103',
      department: 'الدعم الفني',
      status: 'available',
      totalCalls: 34,
      avgDuration: '5:45'
    },
  ];

  // Start real call using Click-to-Call (working method)
  const handleStartCall = async (number: string) => {
    setShowNewCallDialog(false);
    setNewCallNumber('');
    
    try {
      // استخدام Click-to-Call API بدلاً من WebRTC
      const response = await fetch(`${apiUrl}/api/calls/make-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: number,
          from: '+18154860356', // رقم Twilio
          agentPhone: '+966559902557', // رقم الموظف
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ المكالمة بدأت:', result.message);
        alert('✅ جاري الاتصال... سيتم الاتصال بك أولاً ثم توصيلك بالعميل');
        
        // إعادة تحميل سجل المكالمات
        setTimeout(() => loadCallRecords(), 2000);
      } else {
        console.error('❌ فشل بدء المكالمة:', result.error);
        alert('❌ فشل بدء المكالمة. الرجاء المحاولة مرة أخرى');
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال:', error);
      alert('❌ خطأ في الاتصال بالخادم');
    }
  };

  // End real call
  const handleEndCall = () => {
    voiceCall.endCall();
    
    // Add to call history
    if (voiceCall.duration > 0) {
      const newRecord: CallRecord = {
        id: Date.now().toString(),
        type: 'outgoing',
        callerName: 'مكالمة صادرة',
        callerNumber: newCallNumber || 'غير معروف',
        employeeName: 'أنت',
        duration: voiceCall.formattedDuration,
        timestamp: new Date().toLocaleString('ar-SA'),
        status: 'completed'
      };
      setCallHistory(prev => [newRecord, ...prev]);
    }
  };

  const handleNewCallClick = () => {
    setShowNewCallDialog(true);
  };

  const handleStartNewCall = () => {
    if (newCallNumber.trim()) {
      handleStartCall(newCallNumber);
    }
  };

  const checkSoftphoneStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/softphone/status`);
      const result = await response.json();
      setIsSoftphoneRunning(result.running);
    } catch (error) {
      console.error('خطأ في التحقق من حالة التطبيق:', error);
      setIsSoftphoneRunning(false);
    }
  };

  const openSoftphone = async () => {
    try {
      // Launch softphone via backend API
      const response = await fetch(`${apiUrl}/api/softphone/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ تم تشغيل موبايل كول');
        // Check status after 2 seconds
        setTimeout(() => checkSoftphoneStatus(), 2000);
      } else {
        console.error('❌ فشل تشغيل التطبيق:', result.error);
        alert('فشل تشغيل تطبيق موبايل كول. الرجاء المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('خطأ في فتح التطبيق:', error);
      alert('خطأ في الاتصال بالخادم. تأكد من تشغيل Backend.');
    }
  };

  const togglePlayRecording = (recordingId: string) => {
    if (playingRecordingId === recordingId) {
      setPlayingRecordingId(null);
    } else {
      setPlayingRecordingId(recordingId);
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'incoming': return <PhoneIncoming className="text-green-600" size={20} />;
      case 'outgoing': return <PhoneOutgoing className="text-blue-600" size={20} />;
      case 'missed': return <PhoneMissed className="text-red-600" size={20} />;
      default: return <Phone size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-700 border-green-300',
      busy: 'bg-red-100 text-red-700 border-red-300',
      offline: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    const labels = {
      available: 'متاح',
      busy: 'مشغول',
      offline: 'غير متصل',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  ☎️ مركز الاتصالات - Call Center
                </h1>
                <p className="text-gray-600">نظام متكامل لإدارة مركز الاتصالات والعملاء | المملكة العربية السعودية 🇸🇦</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100">
                <div className="text-sm text-gray-600">رقم مركز الاتصالات</div>
                <div className="text-xl font-bold text-green-600 text-center" dir="ltr">0555254915</div>
              </div>
              <button 
                onClick={() => {
                  loadCallRecords();
                  checkSoftphoneStatus();
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition flex items-center gap-2"
                title="تحديث سجل المكالمات"
              >
                <Activity size={20} />
                <span>تحديث</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <PhoneCall className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">إجمالي المكالمات</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">1,234</div>
            <div className="text-sm text-green-600 mt-1">اليوم</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <PhoneIncoming className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">واردة</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">856</div>
            <div className="text-sm text-blue-600 mt-1">+12% عن الأمس</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-cyan-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <PhoneOutgoing className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">صادرة</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">345</div>
            <div className="text-sm text-cyan-600 mt-1">متابعات</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <PhoneMissed className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">فائتة</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">33</div>
            <div className="text-sm text-red-600 mt-1">تحتاج متابعة</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <span className="text-gray-600 text-sm">متوسط المدة</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">4:23</div>
            <div className="text-sm text-yellow-600 mt-1">دقائق</div>
          </div>
        </div>

        {/* Active Call Banner */}
        {voiceCall.isActive && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 shadow-2xl border-2 border-green-300 mb-8 animate-fadeInUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-pulse">
                  {voiceCall.status === 'connecting' || voiceCall.status === 'ringing' ? (
                    <Loader2 className="text-green-500 animate-spin" size={32} />
                  ) : (
                    <PhoneCall className="text-green-500" size={32} />
                  )}
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold">
                    {voiceCall.status === 'connecting' && 'جاري الاتصال...'}
                    {voiceCall.status === 'ringing' && 'رنين...'}
                    {voiceCall.status === 'active' && 'مكالمة نشطة'}
                    {voiceCall.status === 'ended' && 'تم إنهاء المكالمة'}
                  </h3>
                  <p className="text-green-100" dir="ltr">{newCallNumber}</p>
                  <p className="text-sm text-green-100">⏱️ {voiceCall.formattedDuration}</p>
                  {voiceCall.error && (
                    <p className="text-sm text-red-200 mt-1">⚠️ {voiceCall.error}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={voiceCall.toggleMute}
                  disabled={voiceCall.status !== 'active'}
                  className={`p-4 rounded-full transition ${
                    voiceCall.isMuted ? 'bg-red-500' : 'bg-white/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={voiceCall.isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                >
                  {voiceCall.isMuted ? <MicOff className="text-white" size={24} /> : <Mic className="text-white" size={24} />}
                </button>
                <button
                  onClick={voiceCall.toggleSpeaker}
                  disabled={voiceCall.status !== 'active'}
                  className={`p-4 rounded-full transition ${
                    voiceCall.isSpeakerOn ? 'bg-white' : 'bg-white/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={voiceCall.isSpeakerOn ? 'إيقاف السماعة' : 'تشغيل السماعة'}
                >
                  {voiceCall.isSpeakerOn ? <Volume2 className="text-green-500" size={24} /> : <VolumeX className="text-white" size={24} />}
                </button>
                <button
                  onClick={handleEndCall}
                  className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition flex items-center gap-2"
                >
                  <Phone className="rotate-135" size={24} />
                  <span>إنهاء المكالمة</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white shadow-lg text-gray-900 scale-105'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={20} />
              <span>لوحة التحكم</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              activeTab === 'calls'
                ? 'bg-white shadow-lg text-gray-900 scale-105'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <Phone size={20} />
              <span>سجل المكالمات</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              activeTab === 'agents'
                ? 'bg-white shadow-lg text-gray-900 scale-105'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <Headphones size={20} />
              <span>موظفي الكول سنتر</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white shadow-lg text-gray-900 scale-105'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              <span>التحليلات والتقارير</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white shadow-lg text-gray-900 scale-105'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings size={20} />
              <span>إعدادات المركز</span>
            </div>
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Real-Time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 opacity-80" />
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
                <div className="text-4xl font-bold mb-2">12</div>
                <div className="text-green-100">مكالمات نشطة الآن</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 opacity-80" />
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-4xl font-bold mb-2">45 / 60</div>
                <div className="text-blue-100">موظفين متاحين</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <Timer className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-4xl font-bold mb-2">23 ث</div>
                <div className="text-yellow-100">متوسط وقت الانتظار</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <Star className="w-8 h-8 opacity-80" />
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-4xl font-bold mb-2">4.8 ⭐</div>
                <div className="text-purple-100">تقييم خدمة العملاء</div>
              </div>
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Performance */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="text-green-500" />
                  أداء اليوم
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div>
                      <div className="text-sm text-gray-600">إجمالي المكالمات</div>
                      <div className="text-2xl font-bold text-green-600">1,234</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-bold">+18%</div>
                      <div className="text-xs text-gray-500">عن الأمس</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div>
                      <div className="text-sm text-gray-600">معدل الرد</div>
                      <div className="text-2xl font-bold text-blue-600">96.8%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-600 font-bold">+2.3%</div>
                      <div className="text-xs text-gray-500">تحسن</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div>
                      <div className="text-sm text-gray-600">متوسط مدة المكالمة</div>
                      <div className="text-2xl font-bold text-purple-600">4:23</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-600 font-bold">-12 ث</div>
                      <div className="text-xs text-gray-500">أسرع</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                    <div>
                      <div className="text-sm text-gray-600">معدل الحل من أول مكالمة</div>
                      <div className="text-2xl font-bold text-orange-600">84%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-orange-600 font-bold">+5%</div>
                      <div className="text-xs text-gray-500">تحسن</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Agents */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Award className="text-yellow-500" />
                  أفضل موظفي الأداء اليوم
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'فاطمة علي', calls: 87, rating: 4.9, dept: 'خدمة العملاء', badge: '🥇' },
                    { name: 'محمود سعيد', calls: 82, rating: 4.8, dept: 'المبيعات', badge: '🥈' },
                    { name: 'سارة أحمد', calls: 78, rating: 4.7, dept: 'الدعم الفني', badge: '🥉' },
                    { name: 'خالد محمد', calls: 72, rating: 4.6, dept: 'خدمة العملاء', badge: '⭐' },
                    { name: 'نورا عبدالله', calls: 68, rating: 4.6, dept: 'المبيعات', badge: '⭐' },
                  ].map((agent, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:scale-105 transition">
                      <div className="text-3xl">{agent.badge}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-600">{agent.dept}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{agent.calls}</div>
                        <div className="text-xs text-gray-500">مكالمة</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{agent.rating} ⭐</div>
                        <div className="text-xs text-gray-500">تقييم</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Queue Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="text-indigo-500" />
                حالة طوابير الانتظار
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'خدمة العملاء', waiting: 8, avgWait: '25 ث', color: 'from-green-500 to-emerald-500' },
                  { name: 'الدعم الفني', waiting: 12, avgWait: '45 ث', color: 'from-blue-500 to-cyan-500' },
                  { name: 'المبيعات', waiting: 5, avgWait: '18 ث', color: 'from-purple-500 to-pink-500' },
                ].map((queue, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${queue.color} rounded-xl p-6 text-white`}>
                    <h4 className="font-bold mb-4">{queue.name}</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{queue.waiting}</div>
                        <div className="text-sm opacity-80">في الانتظار</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{queue.avgWait}</div>
                        <div className="text-sm opacity-80">متوسط الانتظار</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call Records Tab */}
        {activeTab === 'calls' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="بحث برقم الهاتف أو الاسم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                  <option>كل المكالمات</option>
                  <option>واردة</option>
                  <option>صادرة</option>
                  <option>فائتة</option>
                </select>
                <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2">
                  <Download size={20} />
                  <span>تصدير</span>
                </button>
              </div>
            </div>

            {/* Call Records List */}
            {[...realCallRecords, ...callHistory, ...callRecords].map((call) => (
              <div
                key={call.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:scale-[1.01] transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      call.type === 'incoming' ? 'bg-green-100' :
                      call.type === 'outgoing' ? 'bg-blue-100' :
                      'bg-red-100'
                    }`}>
                      {getCallTypeIcon(call.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{call.callerName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          call.status === 'completed' ? 'bg-green-100 text-green-700' :
                          call.status === 'missed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {call.status === 'completed' ? 'مكتملة' : call.status === 'missed' ? 'فائتة' : 'جارية'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-green-500" />
                          <span dir="ltr">{call.callerNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-blue-500" />
                          <span>{call.employeeName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-cyan-500" />
                          <span>{call.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-orange-500" />
                          <span>{call.timestamp}</span>
                        </div>
                      </div>

                      {/* Recording Player */}
                      {call.recordingUrl && (
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => togglePlayRecording(call.id)}
                              className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition"
                            >
                              {playingRecordingId === call.id ? (
                                <Pause size={20} />
                              ) : (
                                <Play size={20} />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Headphones size={16} className="text-indigo-600" />
                                <span className="text-sm font-medium text-indigo-900">تسجيل المكالمة</span>
                              </div>
                              <div className="w-full bg-indigo-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: playingRecordingId === call.id ? '45%' : '0%' }}
                                ></div>
                              </div>
                            </div>
                            <a
                              href={call.recordingUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                              title="تحميل التسجيل"
                            >
                              <Download size={20} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="بحث عن موظف..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 shadow-lg"
                />
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition flex items-center gap-2">
                <UserPlus size={20} />
                <span>إضافة موظف كول سنتر</span>
              </button>
            </div>

            {/* Agents Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-green-100">
                <div className="text-sm text-gray-600 mb-1">متاح</div>
                <div className="text-2xl font-bold text-green-600">45</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-red-100">
                <div className="text-sm text-gray-600 mb-1">مشغول</div>
                <div className="text-2xl font-bold text-red-600">12</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-yellow-100">
                <div className="text-sm text-gray-600 mb-1">في استراحة</div>
                <div className="text-2xl font-bold text-yellow-600">8</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-1">غير متصل</div>
                <div className="text-2xl font-bold text-gray-600">3</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:scale-105 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                        <p className="text-xs text-gray-500" dir="ltr">Ext: {employee.extension}</p>
                      </div>
                    </div>
                    {getStatusBadge(employee.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
                      <div className="text-2xl font-bold text-blue-600">{employee.totalCalls}</div>
                      <div className="text-xs text-gray-600">مكالمة</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
                      <div className="text-2xl font-bold text-cyan-600">{employee.avgDuration}</div>
                      <div className="text-xs text-gray-600">متوسط المدة</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartCall(employee.extension)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <PhoneCall size={16} />
                      <span>اتصال</span>
                    </button>
                    <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Time Period Selector */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">التحليلات والتقارير</h3>
                <div className="flex gap-2">
                  {['اليوم', 'أسبوع', 'شهر', 'سنة'].map((period) => (
                    <button
                      key={period}
                      className="px-4 py-2 bg-gray-100 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white rounded-lg transition font-medium"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <PhoneCall className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">إجمالي المكالمات</div>
                    <div className="text-2xl font-bold text-blue-600">24,567</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className="text-xs text-gray-600 mt-2">78% من الهدف الشهري</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">معدل الرضا</div>
                    <div className="text-2xl font-bold text-green-600">94.5%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '94.5%' }}></div>
                </div>
                <div className="text-xs text-green-600 mt-2">+5.2% عن الشهر الماضي</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Timer className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">متوسط وقت الحل</div>
                    <div className="text-2xl font-bold text-purple-600">3:45</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="text-xs text-purple-600 mt-2">-15 ث عن المعدل السابق</div>
              </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="text-indigo-500" />
                أداء الأقسام
              </h3>
              <div className="space-y-4">
                {[
                  { dept: 'خدمة العملاء', calls: 12453, satisfaction: 95, avgTime: '3:20', color: 'green' },
                  { dept: 'الدعم الفني', calls: 8765, satisfaction: 92, avgTime: '5:45', color: 'blue' },
                  { dept: 'المبيعات', calls: 6543, satisfaction: 96, avgTime: '4:10', color: 'purple' },
                  { dept: 'الشكاوى', calls: 2345, satisfaction: 89, avgTime: '6:30', color: 'orange' },
                ].map((dept, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900">{dept.dept}</h4>
                      <div className="text-sm text-gray-600">{dept.calls.toLocaleString()} مكالمة</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">معدل الرضا</div>
                        <div className={`text-lg font-bold text-${dept.color}-600`}>{dept.satisfaction}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">متوسط الوقت</div>
                        <div className="text-lg font-bold text-gray-900">{dept.avgTime}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">الأداء</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(dept.satisfaction / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">ساعات الذروة</h3>
              <div className="grid grid-cols-12 gap-2 items-end" style={{ height: '200px' }}>
                {[20, 35, 45, 60, 80, 95, 100, 90, 75, 50, 30, 25].map((height, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg hover:from-green-600 hover:to-emerald-500 transition cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${height}% من السعة`}
                    ></div>
                    <div className="text-xs text-gray-600">{9 + idx}:00</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Reports */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">تصدير التقارير</h3>
                  <p className="text-indigo-100">احصل على تقارير شاملة عن أداء مركز الاتصالات</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:shadow-lg transition">
                    PDF تصدير
                  </button>
                  <button className="px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition">
                    Excel تصدير
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Call Center Configuration */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="text-green-500" size={24} />
                إعدادات مركز الاتصالات
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم مركز الاتصالات</label>
                    <input
                      type="text"
                      value="0555254915"
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-center"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الدولي</label>
                    <input
                      type="text"
                      value="+966 11 234 5678"
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-center"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رسالة الترحيب (IVR)</label>
                  <textarea
                    rows={3}
                    placeholder="مرحباً بك في مركز خدمة العملاء، نحن سعداء بخدمتك... للمبيعات اضغط 1، للدعم الفني اضغط 2، لخدمة العملاء اضغط 3..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ساعات العمل - من</label>
                    <input
                      type="time"
                      value="08:00"
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ساعات العمل - إلى</label>
                    <input
                      type="time"
                      value="20:00"
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Queue Management */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="text-blue-500" size={24} />
                إدارة طوابير الانتظار
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-900">تفعيل نظام الانتظار</h4>
                    <p className="text-sm text-gray-600">السماح بطوابير الانتظار عند انشغال الموظفين</p>
                  </div>
                  <button className="p-2">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
                      <div className="w-5 h-5 bg-white rounded-full transform translate-x-6"></div>
                    </div>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى لوقت الانتظار (بالثواني)</label>
                  <input
                    type="number"
                    value="120"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">موسيقى الانتظار</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option>موسيقى هادئة - 1</option>
                    <option>موسيقى كلاسيكية</option>
                    <option>موسيقى عربية</option>
                    <option>بلا موسيقى</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recording & Quality */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Headphones className="text-indigo-500" size={24} />
                التسجيل ومراقبة الجودة
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-900">تسجيل المكالمات تلقائياً</h4>
                    <p className="text-sm text-gray-600">تسجيل جميع المكالمات الواردة والصادرة</p>
                  </div>
                  <button className="p-2">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
                      <div className="w-5 h-5 bg-white rounded-full transform translate-x-6"></div>
                    </div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-900">إشعار التسجيل</h4>
                    <p className="text-sm text-gray-600">تنبيه العميل بأن المكالمة مسجلة لضمان الجودة</p>
                  </div>
                  <button className="p-2">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
                      <div className="w-5 h-5 bg-white rounded-full transform translate-x-6"></div>
                    </div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-900">المراقبة المباشرة</h4>
                    <p className="text-sm text-gray-600">السماح للمشرفين بمراقبة المكالمات مباشرة</p>
                  </div>
                  <button className="p-2">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
                      <div className="w-5 h-5 bg-white rounded-full transform translate-x-6"></div>
                    </div>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مدة حفظ التسجيلات</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                    <option>30 يوم</option>
                    <option>60 يوم</option>
                    <option>90 يوم</option>
                    <option>180 يوم</option>
                    <option>سنة واحدة</option>
                    <option>سنتان</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">جودة التسجيل</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                    <option>جودة عالية (HD)</option>
                    <option>جودة متوسطة</option>
                    <option>جودة منخفضة (توفير مساحة)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={24} />
                تقييم رضا العملاء
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-900">طلب التقييم بعد المكالمة</h4>
                    <p className="text-sm text-gray-600">إرسال رسالة نصية للعميل لتقييم الخدمة</p>
                  </div>
                  <button className="p-2">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
                      <div className="w-5 h-5 bg-white rounded-full transform translate-x-6"></div>
                    </div>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص رسالة التقييم</label>
                  <textarea
                    rows={2}
                    placeholder="نشكرك على تواصلك معنا. نرجو تقييم خدمتنا من 1 إلى 5 نجوم"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Roles & Permissions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="text-blue-500" size={24} />
                الأدوار والصلاحيات
              </h3>
              <div className="space-y-3">
                {[
                  { role: 'مدير الكول سنتر', icon: '👔', calls: true, monitor: true, recordings: true, reports: true, settings: true, badge: 'primary' },
                  { role: 'مشرف القسم', icon: '📊', calls: true, monitor: true, recordings: true, reports: true, settings: false, badge: 'success' },
                  { role: 'موظف استقبال مكالمات', icon: '🎧', calls: true, monitor: false, recordings: false, reports: false, settings: false, badge: 'info' },
                  { role: 'موظف دعم فني', icon: '🔧', calls: true, monitor: false, recordings: false, reports: false, settings: false, badge: 'warning' },
                  { role: 'موظف مبيعات', icon: '💼', calls: true, monitor: false, recordings: false, reports: false, settings: false, badge: 'purple' },
                  { role: 'مراقب الجودة', icon: '⭐', calls: false, monitor: true, recordings: true, reports: true, settings: false, badge: 'secondary' },
                ].map((perm, idx) => (
                  <div key={idx} className={`p-4 bg-gradient-to-r ${
                    perm.badge === 'primary' ? 'from-blue-50 to-cyan-50' :
                    perm.badge === 'success' ? 'from-green-50 to-emerald-50' :
                    perm.badge === 'info' ? 'from-indigo-50 to-purple-50' :
                    perm.badge === 'warning' ? 'from-yellow-50 to-orange-50' :
                    perm.badge === 'purple' ? 'from-purple-50 to-pink-50' :
                    'from-gray-50 to-slate-50'
                  } rounded-xl border border-gray-200`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{perm.icon}</span>
                        <span className="font-bold text-gray-900">{perm.role}</span>
                      </div>
                      <button className="px-3 py-1 bg-white text-gray-600 text-xs rounded-lg hover:bg-gray-100 transition">
                        تعديل
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      <div className={`p-2 rounded-lg text-center ${perm.calls ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {perm.calls ? '✓' : '✗'} المكالمات
                      </div>
                      <div className={`p-2 rounded-lg text-center ${perm.monitor ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                        {perm.monitor ? '✓' : '✗'} المراقبة
                      </div>
                      <div className={`p-2 rounded-lg text-center ${perm.recordings ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                        {perm.recordings ? '✓' : '✗'} التسجيلات
                      </div>
                      <div className={`p-2 rounded-lg text-center ${perm.reports ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                        {perm.reports ? '✓' : '✗'} التقارير
                      </div>
                      <div className={`p-2 rounded-lg text-center ${perm.settings ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                        {perm.settings ? '✓' : '✗'} الإعدادات
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="text-orange-500" size={24} />
                التكامل مع الأنظمة الأخرى
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="text-green-600" size={20} />
                      <span className="font-bold text-gray-900">واتساب للأعمال</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-gray-600">متصل</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📧</span>
                      <span className="font-bold text-gray-900">البريد الإلكتروني</span>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-gray-600">متصل</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💳</span>
                      <span className="font-bold text-gray-900">نظام CRM</span>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-600">غير متصل</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      <span className="font-bold text-gray-900">نظام التذاكر</span>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-600">غير متصل</p>
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-center">
              <button className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition flex items-center gap-3">
                <Settings size={24} />
                <span>حفظ جميع الإعدادات</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialpad Dialog - لوحة الاتصال */}
      {showNewCallDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNewCallDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <PhoneCall className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">اتصال جديد</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewCallDialog(false);
                  setNewCallNumber('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <Dialpad
              value={newCallNumber}
              onChange={setNewCallNumber}
              onCall={handleStartNewCall}
              disabled={voiceCall.isActive}
            />
          </div>
        </div>
      )}

      {/* New Call Modal with Dialpad */}
      {showNewCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-cyan-600/30 backdrop-blur-sm border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">اتصال جديد</h2>
                <button
                  onClick={() => {
                    setShowNewCallModal(false);
                    setModalCallNumber('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-cyan-300" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium text-sm">
                  اتصال
                </button>
                <button className="flex-1 px-4 py-2 text-cyan-300 hover:bg-white/5 rounded-lg font-medium text-sm transition-all">
                  سجل المكالمات
                </button>
                <button className="flex-1 px-4 py-2 text-cyan-300 hover:bg-white/5 rounded-lg font-medium text-sm transition-all">
                  جهات الاتصال
                </button>
              </div>

              {/* Phone Number Input */}
              <div className="mb-6">
                <input
                  type="tel"
                  value={modalCallNumber}
                  onChange={(e) => setModalCallNumber(e.target.value)}
                  placeholder="ex. 12345"
                  dir="ltr"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-cyan-300/50 text-lg text-center focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              {/* Dialpad Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { digit: '1', letters: '' },
                  { digit: '2', letters: 'ABC' },
                  { digit: '3', letters: 'DEF' },
                  { digit: '4', letters: 'GHI' },
                  { digit: '5', letters: 'JKL' },
                  { digit: '6', letters: 'MNO' },
                  { digit: '7', letters: 'PQRS' },
                  { digit: '8', letters: 'TUV' },
                  { digit: '9', letters: 'WXYZ' },
                  { digit: '*', letters: '' },
                  { digit: '0', letters: '+' },
                  { digit: '#', letters: '' },
                ].map(({ digit, letters }) => (
                  <button
                    key={digit}
                    onClick={() => setModalCallNumber(modalCallNumber + digit)}
                    className="aspect-square bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <span className="text-2xl font-semibold text-white">{digit}</span>
                    {letters && (
                      <span className="text-xs text-cyan-300/70">{letters}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Call Button */}
              <button
                onClick={async () => {
                  if (modalCallNumber.trim()) {
                    await handleStartCall(modalCallNumber);
                    setShowNewCallModal(false);
                    setModalCallNumber('');
                  }
                }}
                disabled={!modalCallNumber.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:cursor-not-allowed"
              >
                <Phone size={24} />
                <span className="text-lg">اتصال</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
