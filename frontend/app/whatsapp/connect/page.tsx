"use client";

import React, { useState } from 'react';
import { Smartphone, QrCode, Link2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function WhatsAppConnectPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [showQR, setShowQR] = useState(false);

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setShowQR(true);
    // Simulate connection after 3 seconds
    setTimeout(() => {
      setConnectionStatus('connected');
      setShowQR(false);
    }, 3000);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setPhoneNumber('');
    setShowQR(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Smartphone className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ربط حساب واتساب
              </h1>
              <p className="text-gray-600">اربط حساب واتساب الأعمال الخاص بك لبدء المراسلة</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                connectionStatus === 'connected' ? 'bg-green-100' :
                connectionStatus === 'connecting' ? 'bg-yellow-100' :
                'bg-gray-100'
              }`}>
                {connectionStatus === 'connected' ? (
                  <CheckCircle className="text-green-600" size={32} />
                ) : connectionStatus === 'connecting' ? (
                  <RefreshCw className="text-yellow-600 animate-spin" size={32} />
                ) : (
                  <AlertCircle className="text-gray-400" size={32} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {connectionStatus === 'connected' ? 'متصل' :
                   connectionStatus === 'connecting' ? 'جاري الاتصال...' :
                   'غير متصل'}
                </h2>
                <p className="text-gray-600">
                  {connectionStatus === 'connected' ? `رقم الهاتف: ${phoneNumber || '+966 50 123 4567'}` :
                   connectionStatus === 'connecting' ? 'امسح رمز QR بهاتفك' :
                   'اضغط أدناه لربط واتساب'}
                </p>
              </div>
            </div>
            {connectionStatus === 'connected' && (
              <button
                onClick={handleDisconnect}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition"
              >
                قطع الاتصال
              </button>
            )}
          </div>

          {/* QR Code Display */}
          {showQR && connectionStatus === 'connecting' && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center animate-fadeInUp">
              <div className="w-64 h-64 bg-white mx-auto rounded-2xl shadow-lg flex items-center justify-center mb-4">
                <QrCode size={200} className="text-gray-800" />
              </div>
              <p className="text-gray-700 font-medium mb-2">امسح رمز QR بواسطة واتساب</p>
              <p className="text-sm text-gray-600">
                افتح واتساب ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز
              </p>
            </div>
          )}

          {/* Connection Steps */}
          {connectionStatus === 'disconnected' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  افتح واتساب على هاتفك
                </h3>
                <p className="text-sm text-gray-600 ml-8">قم بتشغيل تطبيق واتساب على جهازك المحمول</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  انتقل إلى الأجهزة المرتبطة
                </h3>
                <p className="text-sm text-gray-600 ml-8">اضغط الإعدادات ← الأجهزة المرتبطة ← ربط جهاز</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  امسح رمز QR
                </h3>
                <p className="text-sm text-gray-600 ml-8">وجّه هاتفك نحو رمز QR المعروض أدناه</p>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  placeholder="+966 50 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                  dir="ltr"
                />
                <button
                  onClick={handleConnect}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition flex items-center justify-center gap-3"
                >
                  <Link2 size={24} />
                  <span>ربط حساب واتساب</span>
                </button>
              </div>
            </div>
          )}

          {/* Connected Features */}
          {connectionStatus === 'connected' && (
            <div className="grid grid-cols-2 gap-4 animate-fadeInUp">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600">الرد التلقائي نشط</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">1,234</div>
                <div className="text-sm text-gray-600">رسائل مُرسلة</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600 mb-1">856</div>
                <div className="text-sm text-gray-600">جهات اتصال نشطة</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600 mb-1">98%</div>
                <div className="text-sm text-gray-600">معدل الاستجابة</div>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              الفوائد
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                ردود تلقائية على العملاء
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                إرسال رسائل جماعية للآلاف
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                مساعدة بوت ذكاء اصطناعي
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                تحليلات ورؤى تفصيلية
              </li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              ملاحظات مهمة
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                استخدم حساب واتساب الأعمال فقط
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                أبقِ هاتفك متصلاً بالإنترنت
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                لا تسجل الخروج من واتساب ويب
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                قد يتطلب الاتصال مسح QR مجدداً
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
