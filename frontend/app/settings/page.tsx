'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Settings,
  Bell,
  Lock,
  Globe,
  Database,
  Users,
  Zap,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Activity,
} from 'lucide-react';

interface SettingsItem {
  name: string;
  href: string;
  icon: string;
  description: string;
  badge?: string;
}

export default function SettingsPage() {
  const pathname = usePathname();

  const settingsSections: {
    id: string;
    title: string;
    icon: any;
    color: string;
    items: SettingsItem[];
  }[] = [
    {
      id: 'general',
      title: 'الإعدادات العامة',
      icon: Settings,
      color: 'from-cyan-500 to-blue-600',
      items: [
        { name: 'معلومات الشركة', href: '/settings/company', icon: '🏢', description: 'الاسم، الشعار، والمعلومات الأساسية' },
        { name: 'اللغة والمنطقة', href: '/settings/locale', icon: '🌍', description: 'اللغة، المنطقة الزمنية، والعملة' },
        { name: 'التخصيص', href: '/settings/customization', icon: '🎨', description: 'الألوان، الخطوط، والمظهر العام' },
      ]
    },
    {
      id: 'callcenter',
      title: 'إعدادات مركز الاتصالات',
      icon: Phone,
      color: 'from-green-500 to-emerald-600',
      items: [
        { name: 'إعدادات Twilio', href: '/settings/twilio', icon: '📞', description: 'إعدادات حساب Twilio' },
        { name: 'أرقام الهاتف', href: '/settings/phone-numbers', icon: '📱', description: 'إدارة أرقام الاتصال' },
        { name: 'التسجيلات الصوتية', href: '/settings/recordings', icon: '🎙️', description: 'تسجيلات المكالمات' },
        { name: 'قوائم الانتظار', href: '/settings/call-queues', icon: '⏳', description: 'إدارة قوائم الانتظار' },
      ]
    },
    {
      id: 'security',
      title: 'الأمان والخصوصية',
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      items: [
        { name: 'كلمات المرور', href: '/settings/security/password', icon: '🔒', description: 'تغيير كلمة المرور' },
        { name: 'المصادقة الثنائية', href: '/settings/security/2fa', icon: '🔐', description: '2FA' },
        { name: 'الجلسات النشطة', href: '/settings/security/sessions', icon: '📱', description: 'الأجهزة المتصلة' },
        { name: 'سجل الأنشطة', href: '/settings/security/activity', icon: '📋', description: 'سجل تسجيل الدخول' },
      ]
    },
    {
      id: 'users',
      title: 'إدارة المستخدمين',
      icon: Users,
      color: 'from-purple-500 to-indigo-600',
      items: [
        { name: 'الموظفين', href: '/employees', icon: '👨‍💼', description: 'إدارة الموظفين والصلاحيات' },
        { name: 'العملاء', href: '/customers', icon: '👥', description: 'إدارة العملاء' },
        { name: 'الأدوار والصلاحيات', href: '/settings/users/roles', icon: '🎭', description: 'تحديد الأدوار' },
      ]
    },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative">
      <div className="p-6 pb-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                الإعدادات
              </h1>
              <p className="text-slate-400 mt-1">إدارة جميع إعدادات النظام من مكان واحد</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingsSections.map((section, idx) => (
            <div 
              key={section.id}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  {typeof section.icon === 'string' ? (
                    <span className="text-3xl">{section.icon}</span>
                  ) : (
                    <section.icon className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  <p className="text-slate-400 text-sm">{section.items.length} إعدادات متاحة</p>
                </div>
              </div>

              {/* Section Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => {
                  // صفحات نشطة يمكن فتحها
                  const activePages = [
                    '/settings/whatsapp',
                    '/bot-manager',
                    '/whatsapp/subscribers',
                    '/whatsapp/broadcast',
                    '/whatsapp/webhooks',
                    '/whatsapp/click-ads',
                    '/whatsapp/catalog',
                    '/whatsapp/appointments',
                    '/whatsapp/live-chat'
                  ];
                  
                  const isActive = activePages.includes(item.href);
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        if (isActive) {
                          window.location.href = item.href;
                        } else {
                          alert(`🚧 صفحة "${item.name}" قيد التطوير\n\nسيتم إضافتها قريباً 🔜`);
                        }
                      }}
                      className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 text-right w-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{item.icon}</span>
                          <div>
                            <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {item.name}
                            </h3>
                          </div>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full font-bold shadow-md animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{item.description}</p>
                      
                      {/* Hover Arrow */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-cyan-400">→</span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        {isActive ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full font-bold border border-green-500/30 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            نشط
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full font-bold border border-yellow-500/30">
                            قريباً
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* System Info */}
        <div className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-300">إصدار النظام: <span className="text-white font-bold">v2.5.1</span></span>
            </div>
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">حالة قاعدة البيانات: <span className="text-green-400 font-bold">متصلة ✓</span></span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">الخادم: <span className="text-white font-bold">نشط</span></span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
