"use client";

import React, { useEffect, useState } from 'react';

export default function TestTwilioPage() {
  const [status, setStatus] = useState<string>('جاري الاختبار...');
  const [micPermission, setMicPermission] = useState<string>('جاري الفحص...');
  const [tokenStatus, setTokenStatus] = useState<string>('جاري الفحص...');
  const [deviceStatus, setDeviceStatus] = useState<string>('جاري الفحص...');

  useEffect(() => {
    const runTests = async () => {
      // Test 1: Microphone Permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicPermission('✅ تم السماح بالوصول للميكروفون');
      } catch (error: any) {
        setMicPermission(`❌ فشل: ${error.message}`);
        setStatus('❌ فشل الاختبار: لا يوجد صلاحية للميكروفون');
        return;
      }

      // Test 2: Get Twilio Token
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/calls/token?identity=test-agent`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.token) {
          setTokenStatus(`✅ تم الحصول على Token بنجاح (${data.token.substring(0, 30)}...)`);
        } else {
          throw new Error('لم يتم إرجاع token');
        }
      } catch (error: any) {
        setTokenStatus(`❌ فشل: ${error.message}`);
        setStatus('❌ فشل الاختبار: مشكلة في الحصول على Token');
        return;
      }

      // Test 3: Initialize Twilio Device
      try {
        const { Device } = await import('@twilio/voice-sdk');
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/calls/token?identity=test-agent`);
        const { token } = await response.json();

        const device = new Device(token, {
          logLevel: 1,
          codecPreferences: ['opus', 'pcmu'] as any,
        });

        device.on('registered', () => {
          setDeviceStatus('✅ تم تسجيل Twilio Device بنجاح');
          setStatus('✅ جميع الاختبارات نجحت! نظام الاتصالات جاهز للعمل');
          device.unregister();
          device.destroy();
        });

        device.on('error', (error) => {
          const errorMsg = error?.message || error?.toString() || 'خطأ غير معروف';
          setDeviceStatus(`❌ خطأ في Device: ${errorMsg}`);
          setStatus('❌ فشل الاختبار: مشكلة في Twilio Device');
          console.error('Twilio Device Error:', error);
        });

        await device.register();
        setDeviceStatus('⏳ جاري تسجيل Twilio Device...');

      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || 'خطأ غير معروف';
        setDeviceStatus(`❌ فشل: ${errorMsg}`);
        setStatus('❌ فشل الاختبار: مشكلة في تهيئة Twilio Device');
        console.error('Device Initialization Error:', error);
      }
    };

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">اختبار نظام الاتصالات (Twilio)</h1>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">حالة النظام العامة</h2>
          <p className="text-lg text-white">{status}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-white mb-2">1️⃣ صلاحية الميكروفون</h3>
            <p className="text-slate-300">{micPermission}</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-white mb-2">2️⃣ الحصول على Twilio Token</h3>
            <p className="text-slate-300">{tokenStatus}</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-white mb-2">3️⃣ تهيئة Twilio Device</h3>
            <p className="text-slate-300">{deviceStatus}</p>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/50 border border-blue-700 rounded-lg p-6">
          <h3 className="font-semibold text-blue-200 mb-3">📝 ملاحظات مهمة:</h3>
          <ul className="text-blue-100 space-y-2 text-sm">
            <li>• يجب السماح بالوصول للميكروفون في المتصفح</li>
            <li>• يجب أن يكون Backend شغال على localhost:4000</li>
            <li>• يجب تكوين Twilio في ملف .env بشكل صحيح</li>
            <li>• TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER</li>
            <li>• يجب أن يكون اتصالك بالإنترنت مستقر</li>
          </ul>
        </div>

        <div className="mt-6 flex gap-4">
          <a 
            href="/call-center" 
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition"
          >
            الذهاب لمركز الاتصالات
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
          >
            إعادة الاختبار
          </button>
        </div>
      </div>
    </div>
  );
}
