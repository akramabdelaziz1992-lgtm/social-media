"use client";

import React, { useState, useEffect } from 'react';
import { Phone, Users, History, Grid3x3, X, Mic, MicOff } from 'lucide-react';
import Dialpad from '@/components/Dialpad';
import ContactsList, { Contact } from '@/components/ContactsList';
import CallHistory from '@/components/CallHistory';
import { useVoiceCall } from '@/lib/hooks/useVoiceCall';

export default function CallCenterPage() {
  const [activeView, setActiveView] = useState<'dialpad' | 'contacts' | 'history'>('dialpad');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCallDialog, setShowCallDialog] = useState(false);
  
  // Real voice call hook
  const voiceCall = useVoiceCall();

  // Sample contacts data
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      phone: '+966501234567',
      company: 'شركة التقنية',
      isFavorite: true
    },
    {
      id: '2',
      name: 'فاطمة علي',
      phone: '+966509876543',
      company: 'مؤسسة الإبداع',
      isFavorite: true
    },
    {
      id: '3',
      name: 'محمود سعيد',
      phone: '+966555555555',
      isFavorite: false
    },
    {
      id: '4',
      name: 'سارة أحمد',
      phone: '+966544444444',
      company: 'مكتب الاستشارات',
      isFavorite: false
    },
  ]);

  // Call history will be fetched from API by CallHistory component

  const handleCall = async (number: string) => {
    if (!number.trim()) return;
    
    // Make the actual call using WebRTC
    try {
      await voiceCall.startCall(number);
      setShowCallDialog(true);
      setPhoneNumber('');
    } catch (error) {
      console.error('Failed to make call:', error);
      alert('فشل بدء المكالمة: ' + (error instanceof Error ? error.message : 'خطأ غير متوقع'));
    }
  };

  const handleEndCall = () => {
    voiceCall.endCall();
    setShowCallDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Header */}
      <div className="relative bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
              مركز الاتصالات
            </h1>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md ${
                voiceCall.isDeviceReady && voiceCall.isActive 
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
                  : voiceCall.isDeviceReady
                  ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                  : 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/50'
              }`}>
                {voiceCall.isActive ? '📞 متصل' : voiceCall.isDeviceReady ? '✅ جاهز' : '⏳ جاري التهيئة...'}
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {voiceCall.error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="text-red-400 text-xl">⚠️</div>
                <div className="flex-1">
                  <h4 className="text-red-200 font-semibold mb-1">خطأ في النظام</h4>
                  <p className="text-red-300 text-sm">{voiceCall.error}</p>
                  <p className="text-red-400 text-xs mt-2">
                    تأكد من:
                    <br />• السماح بالوصول للميكروفون
                    <br />• تكوين Twilio بشكل صحيح
                    <br />• اتصالك بالإنترنت
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Device Not Ready Warning */}
          {!voiceCall.isDeviceReady && !voiceCall.error && (
            <div className="mt-4 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 text-xl animate-pulse">🔄</div>
                <div className="flex-1">
                  <h4 className="text-blue-200 font-semibold mb-1">جاري تهيئة نظام الاتصالات...</h4>
                  <p className="text-blue-300 text-sm">يرجى الانتظار حتى يتم تجهيز Twilio Device</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveView('dialpad')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'dialpad'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'bg-white/10 text-cyan-200 hover:bg-white/20 border border-white/20'
              }`}
            >
              <Grid3x3 size={20} />
              <span>لوحة الاتصال</span>
            </button>
            <button
              onClick={() => setActiveView('contacts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'contacts'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'bg-white/10 text-cyan-200 hover:bg-white/20 border border-white/20'
              }`}
            >
              <Users size={20} />
              <span>جهات الاتصال</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {contacts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'history'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'bg-white/10 text-cyan-200 hover:bg-white/20 border border-white/20'
              }`}
            >
              <History size={20} />
              <span>سجل المكالمات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {activeView === 'dialpad' && (
            <div className="p-8">
              <Dialpad
                value={phoneNumber}
                onChange={setPhoneNumber}
                onCall={() => handleCall(phoneNumber)}
                disabled={voiceCall.isActive}
              />
            </div>
          )}

          {activeView === 'contacts' && (
            <div className="h-[600px]">
              <ContactsList
                contacts={contacts}
                onCall={handleCall}
                disabled={voiceCall.isActive}
              />
            </div>
          )}

          {activeView === 'history' && (
            <div className="h-[600px]">
              <CallHistory
                onCall={handleCall}
                disabled={voiceCall.isActive}
                autoRefresh={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Active Call Dialog */}
      {showCallDialog && voiceCall.isActive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8">
            {/* Status */}
            <div className="text-center mb-6">
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                voiceCall.status === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                voiceCall.status === 'ringing' ? 'bg-blue-100 text-blue-800' :
                voiceCall.status === 'active' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {voiceCall.status === 'connecting' && 'جاري الاتصال...'}
                {voiceCall.status === 'ringing' && 'يرن...'}
                {voiceCall.status === 'active' && 'متصل'}
                {voiceCall.status === 'ended' && 'انتهت المكالمة'}
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Phone size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {contacts.find(c => c.phone === phoneNumber)?.name || 'غير معروف'}
              </h3>
              <p className="text-cyan-200 font-mono" dir="ltr">
                {phoneNumber}
              </p>
            </div>

            {/* Duration */}
            {voiceCall.status === 'active' && (
              <div className="text-center mb-8">
                <div className="text-3xl font-mono text-white">
                  {voiceCall.formattedDuration}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={voiceCall.toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  voiceCall.isMuted
                    ? 'bg-red-600 text-white'
                    : 'bg-white/10 text-cyan-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                {voiceCall.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </div>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 
                       rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <X size={24} />
              <span className="text-lg">إنهاء المكالمة</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
