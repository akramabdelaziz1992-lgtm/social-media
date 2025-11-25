"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, QrCode, Link2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import QRCodeLib from 'qrcode';

export default function WhatsAppConnectPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // رسم QR Code على Canvas
  useEffect(() => {
    if (qrCode && qrCanvasRef.current) {
      QRCodeLib.toCanvas(qrCanvasRef.current, qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    }
  }, [qrCode]);

  useEffect(() => {
    // الاتصال بـ WebSocket للحصول على QR Code
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const newSocket = io(`${apiUrl}/whatsapp`, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('✅ متصل بـ WebSocket');
    });

    newSocket.on('qr', (data: { qr: string }) => {
      console.log('📱 QR Code وصل!');
      setQrCode(data.qr);
      setShowQR(true);
      setConnectionStatus('connecting');
    });

    newSocket.on('status', (data: { status: string }) => {
      console.log('📢 حالة الاتصال:', data.status);
      if (data.status === 'connected') {
        setConnectionStatus('connected');
        setShowQR(false);
      } else if (data.status === 'disconnected') {
        setConnectionStatus('disconnected');
        setShowQR(false);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleConnect = async () => {
    setConnectionStatus('connecting');
    setShowQR(false);
    setQrCode('');
    setErrorMessage('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/whatsapp/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ جاري الاتصال... انتظر QR Code');
        // QR Code سيظهر تلقائياً عبر WebSocket
      } else {
        console.error('❌', result.error || result.message);
        setErrorMessage(result.error || result.message || 'حدث خطأ غير متوقع');
        setConnectionStatus('error');
      }
    } catch (error: any) {
      console.error('❌ خطأ في الاتصال:', error);
      const msg = error.message || 'تأكد من تشغيل Backend على localhost:4000';
      setErrorMessage(msg);
      setConnectionStatus('error');
    }
  };

  const handleDisconnect = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅', result.message);
        setConnectionStatus('disconnected');
        setPhoneNumber('');
        setShowQR(false);
        setQrCode('');
      }
    } catch (error) {
      console.error('❌ خطأ في قطع الاتصال:', error);
    }
  };

  const handleLogout = async () => {
    if (!confirm('هل تريد تسجيل الخروج وحذف جلسة الواتساب؟ ستحتاج لمسح QR Code مرة أخرى.')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/whatsapp/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅', result.message);
        setConnectionStatus('disconnected');
        setPhoneNumber('');
        setShowQR(false);
        setQrCode('');
        setErrorMessage('');
        
        // إعادة تحميل الصفحة لتنظيف كل شيء
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('❌ خطأ في تسجيل الخروج:', error);
    }
  };

  // فحص الحالة عند تحميل الصفحة
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/whatsapp/status`);
        const data = await response.json();
        
        if (data.isReady) {
          setConnectionStatus('connected');
          setPhoneNumber('متصل');
        } else {
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        console.error('❌ خطأ في فحص الحالة:', error);
        setConnectionStatus('disconnected');
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Smartphone className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent mb-3">
            ربط حساب واتساب
          </h1>
          <p className="text-slate-400 text-lg">اربط حساب واتساب الأعمال الخاص بك وابدأ في إدارة المحادثات بذكاء</p>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${
                connectionStatus === 'connected' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/50' :
                connectionStatus === 'connecting' ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-500/50' :
                connectionStatus === 'error' ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/50' :
                'bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-500/50'
              }`}>
                {connectionStatus === 'connected' ? (
                  <CheckCircle className="text-white" size={36} />
                ) : connectionStatus === 'connecting' ? (
                  <RefreshCw className="text-white animate-spin" size={36} />
                ) : connectionStatus === 'error' ? (
                  <AlertCircle className="text-white" size={36} />
                ) : (
                  <AlertCircle className="text-slate-300" size={36} />
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  {connectionStatus === 'connected' ? '✅ متصل بنجاح' :
                   connectionStatus === 'connecting' ? '⏳ جاري الاتصال...' :
                   connectionStatus === 'error' ? '❌ فشل الاتصال' :
                   '⚠️ غير متصل'}
                </h2>
                <p className="text-slate-400 text-lg">
                  {connectionStatus === 'connected' ? `📱 ${phoneNumber || '+966 50 123 4567'}` :
                   connectionStatus === 'connecting' ? 'امسح رمز QR باستخدام هاتفك' :
                   connectionStatus === 'error' ? 'حدث خطأ أثناء الاتصال بالخادم' :
                   'ابدأ بربط حساب واتساب الأعمال'}
                </p>
              </div>
            </div>
            {connectionStatus === 'connected' && (
              <div className="flex gap-3">
                <button
                  onClick={handleDisconnect}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
                >
                  قطع الاتصال
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all"
                >
                  تسجيل خروج
                </button>
              </div>
            )}
          </div>

          {/* QR Code Display */}
          {showQR && connectionStatus === 'connecting' && qrCode && (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-10 text-center animate-fadeInUp border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
              <div className="inline-block relative mb-8">
                <div className="w-80 h-80 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-8 border-4 border-emerald-400 relative overflow-hidden">
                  <canvas 
                    ref={qrCanvasRef}
                    className="max-w-full relative z-10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 pointer-events-none"></div>
                </div>
                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl p-6 mb-6 border border-emerald-400/30">
                <p className="text-white font-bold text-xl mb-3 flex items-center justify-center gap-2">
                  <Smartphone size={24} className="text-emerald-400" />
                  امسح رمز QR بواسطة واتساب
                </p>
                <div className="text-slate-300 space-y-2">
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-emerald-400">1.</span> افتح تطبيق واتساب على هاتفك
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-emerald-400">2.</span> اضغط على الإعدادات ⚙️
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-emerald-400">3.</span> اختر "الأجهزة المرتبطة"
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-emerald-400">4.</span> اضغط "ربط جهاز" وامسح الكود
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 text-yellow-300 bg-yellow-500/20 backdrop-blur-md rounded-xl p-4 border border-yellow-400/30">
                <RefreshCw className="animate-spin" size={20} />
                <span className="font-bold">في انتظار المسح الضوئي...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {connectionStatus === 'error' && (
            <div className="space-y-5 animate-fadeInUp">
              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl shadow-red-500/20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                    <AlertCircle className="text-white" size={40} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">❌ فشل الاتصال</h3>
                <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-red-400/30">
                  <p className="text-red-300 text-center font-medium">{errorMessage}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-300 text-sm mb-2">🔍 <span className="font-bold text-white">تحقق من:</span></p>
                    <ul className="space-y-2 text-slate-400 text-sm mr-4">
                      <li>• Backend شغال على localhost:4000</li>
                      <li>• اتصال الإنترنت يعمل</li>
                      <li>• لا يوجد Firewall يمنع الاتصال</li>
                      <li>• المنفذ 4000 غير محجوز من برنامج آخر</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={handleConnect}
                    className="w-full px-8 py-5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-red-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    <RefreshCw size={24} />
                    <span>إعادة المحاولة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Connection Steps */}
          {connectionStatus === 'disconnected' && (
            <div className="space-y-5">
              {/* Status Check Message */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-4 border border-blue-400/30 mb-6">
                <p className="text-center text-slate-300 text-sm">
                  💡 <span className="font-bold text-white">تأكد من تشغيل Backend</span> على localhost:4000 قبل الربط
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl border border-emerald-400/30 hover:border-emerald-400/50 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg flex-shrink-0">1</span>
                    <div>
                      <h3 className="font-bold text-white mb-2">افتح واتساب</h3>
                      <p className="text-sm text-slate-400">شغّل تطبيق واتساب على هاتفك</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg flex-shrink-0">2</span>
                    <div>
                      <h3 className="font-bold text-white mb-2">الإعدادات</h3>
                      <p className="text-sm text-slate-400">انتقل إلى الأجهزة المرتبطة</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl border border-indigo-400/30 hover:border-indigo-400/50 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg flex-shrink-0">3</span>
                    <div>
                      <h3 className="font-bold text-white mb-2">امسح الكود</h3>
                      <p className="text-sm text-slate-400">وجّه الكاميرا نحو QR</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Smartphone size={18} />
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  placeholder="+966 50 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-900/50 border-2 border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 mb-5 transition-all"
                  dir="ltr"
                />
                <button
                  onClick={handleConnect}
                  className="w-full px-8 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
                >
                  <QrCode size={28} className="group-hover:rotate-12 transition-transform" />
                  <span>ربط حساب واتساب الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* Connected Features */}
          {connectionStatus === 'connected' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeInUp">
              <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl border border-emerald-400/30 hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-emerald-400 mb-2">24/7</div>
                <div className="text-sm text-slate-300 font-medium">الرد التلقائي نشط</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl border border-cyan-400/30 hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-cyan-400 mb-2">1,234</div>
                <div className="text-sm text-slate-300 font-medium">رسائل مُرسلة</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl border border-indigo-400/30 hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-indigo-400 mb-2">856</div>
                <div className="text-sm text-slate-300 font-medium">جهات اتصال نشطة</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-yellow-400/30 hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-yellow-400 mb-2">98%</div>
                <div className="text-sm text-slate-300 font-medium">معدل الاستجابة</div>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span>
              المميزات
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-white font-medium">ردود تلقائية ذكية</p>
                  <p className="text-slate-400 text-sm">رد فوري على استفسارات العملاء 24/7</p>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-white font-medium">رسائل جماعية</p>
                  <p className="text-slate-400 text-sm">أرسل لآلاف العملاء بضغطة زر</p>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-white font-medium">بوت ذكاء اصطناعي</p>
                  <p className="text-slate-400 text-sm">مساعد AI يفهم ويرد على العملاء</p>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-white font-medium">تحليلات متقدمة</p>
                  <p className="text-slate-400 text-sm">تقارير شاملة عن أداء المحادثات</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              ملاحظات هامة
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></span>
                <p className="text-slate-300">استخدم <span className="text-white font-bold">حساب واتساب الأعمال</span> فقط</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></span>
                <p className="text-slate-300">أبقِ هاتفك <span className="text-white font-bold">متصلاً بالإنترنت</span></p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></span>
                <p className="text-slate-300">لا تسجل الخروج من <span className="text-white font-bold">واتساب ويب</span></p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></span>
                <p className="text-slate-300">قد يتطلب إعادة مسح <span className="text-white font-bold">QR Code</span> بعد فترة</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
