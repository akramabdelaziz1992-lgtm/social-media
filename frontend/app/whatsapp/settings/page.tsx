"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Key, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Save,
  RefreshCw,
  ExternalLink,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  verifyToken: string;
  businessAccountId: string;
}

export default function WhatsAppSettingsPage() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    accessToken: '',
    verifyToken: '',
    businessAccountId: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // تحميل الإعدادات الحالية
    loadSettings();
    checkConnection();
  }, []);

  const loadSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/whatsapp/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig({
          phoneNumberId: data.phoneNumberId || '',
          accessToken: data.accessToken || '',
          verifyToken: data.verifyToken || '',
          businessAccountId: data.businessAccountId || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkConnection = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/whatsapp/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/whatsapp/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        setSaveStatus('success');
        setStatusMessage('تم حفظ الإعدادات بنجاح!');
        setTimeout(() => checkConnection(), 1000);
      } else {
        setSaveStatus('error');
        setStatusMessage('فشل حفظ الإعدادات. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      setSaveStatus('error');
      setStatusMessage('حدث خطأ أثناء الحفظ.');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleTestConnection = async () => {
    setIsSaving(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/whatsapp/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        setSaveStatus('success');
        setStatusMessage('الاتصال ناجح! WhatsApp Business API يعمل بشكل صحيح.');
        setIsConnected(true);
      } else {
        setSaveStatus('error');
        setStatusMessage('فشل الاتصال. يرجى التحقق من البيانات.');
        setIsConnected(false);
      }
    } catch (error) {
      setSaveStatus('error');
      setStatusMessage('فشل الاتصال بـ WhatsApp API.');
      setIsConnected(false);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-teal-400 hover:text-teal-300 transition-colors">
            ← العودة
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageSquare size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">إعدادات WhatsApp Business API</h1>
            <p className="text-white/70 mt-1">قم بإعداد WhatsApp Business Cloud API للتطبيق</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`mt-6 p-4 rounded-xl border ${
          isConnected 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-orange-500/10 border-orange-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <CheckCircle className="text-green-400" size={24} />
                <div>
                  <p className="font-semibold text-green-400">متصل بنجاح</p>
                  <p className="text-sm text-white/70">WhatsApp Business API يعمل بشكل صحيح</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="text-orange-400" size={24} />
                <div>
                  <p className="font-semibold text-orange-400">غير متصل</p>
                  <p className="text-sm text-white/70">يرجى إدخال بيانات WhatsApp Business API</p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8"
      >
        <div className="space-y-6">
          {/* Phone Number ID */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone Number ID
            </label>
            <input
              type="text"
              value={config.phoneNumberId}
              onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
              placeholder="931180146738368"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <p className="text-xs text-white/50 mt-2">
              يمكنك الحصول عليه من: Meta Business Manager → WhatsApp → API Setup
            </p>
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Key size={16} className="inline mr-2" />
              Access Token
            </label>
            <textarea
              value={config.accessToken}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 transition-colors font-mono text-sm"
            />
            <p className="text-xs text-white/50 mt-2">
              Access Token من صفحة API Setup في Meta for Developers
            </p>
          </div>

          {/* Verify Token */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Shield size={16} className="inline mr-2" />
              Verify Token (للـ Webhook)
            </label>
            <input
              type="text"
              value={config.verifyToken}
              onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
              placeholder="almasar_webhook_secret_2024"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <p className="text-xs text-white/50 mt-2">
              رمز سري لحماية Webhook (يمكنك اختيار أي نص عشوائي)
            </p>
          </div>

          {/* Business Account ID */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <MessageSquare size={16} className="inline mr-2" />
              Business Account ID
            </label>
            <input
              type="text"
              value={config.businessAccountId}
              onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
              placeholder="1986298265488975"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <p className="text-xs text-white/50 mt-2">
              معرف حساب WhatsApp Business من Meta Business Manager
            </p>
          </div>

          {/* Status Message */}
          {saveStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                saveStatus === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {saveStatus === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <p>{statusMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              حفظ الإعدادات
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isSaving || !config.accessToken || !config.phoneNumberId}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} />
              اختبار الاتصال
            </button>
          </div>
        </div>
      </motion.div>

      {/* Help Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto mt-8 bg-blue-500/10 backdrop-blur-md rounded-xl border border-blue-500/30 p-6"
      >
        <h3 className="text-lg font-semibold text-blue-400 mb-4">📚 روابط مفيدة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://business.facebook.com/latest/whatsapp_manager"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ExternalLink size={16} className="text-blue-400" />
            <span className="text-sm">WhatsApp Business Manager</span>
          </a>
          <a
            href="https://developers.facebook.com/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ExternalLink size={16} className="text-blue-400" />
            <span className="text-sm">Meta for Developers</span>
          </a>
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ExternalLink size={16} className="text-blue-400" />
            <span className="text-sm">WhatsApp Cloud API Docs</span>
          </a>
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ExternalLink size={16} className="text-blue-400" />
            <span className="text-sm">Webhook Setup Guide</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
