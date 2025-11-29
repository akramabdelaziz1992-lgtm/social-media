"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const channels = [
    { 
      id: 'whatsapp', 
      name: 'واتساب', 
      icon: '💬', 
      color: 'text-green-400',
      submenus: [
        { name: 'ربط الحساب', href: '/whatsapp/connect', icon: '🔗' },
        { name: 'إدارة البوت', href: '/bot-manager', icon: '🤖' },
        { name: 'إدارة المشتركين', href: '/whatsapp/subscribers', icon: '👥' },
        { name: 'الإذاعة والبث', href: '/whatsapp/broadcast', icon: '📢' },
        { name: 'المحادثة المباشرة', href: '/whatsapp/live-chat', icon: '💬' },
        { name: 'سير عمل Webhook', href: '/whatsapp/webhooks', icon: '🔄' },
        { name: 'إعلانات النقر', href: '/whatsapp/click-ads', icon: '🎯' },
        { name: 'كتالوج التجارة', href: '/whatsapp/catalog', icon: '🛍️' },
        { name: 'المواعيد', href: '/whatsapp/appointments', icon: '📅', badge: '3' },
      ]
    },
    { 
      id: 'facebook', 
      name: 'فيسبوك', 
      icon: '👍', 
      color: 'text-blue-500',
      submenus: [
        { name: 'ربط الحساب', href: '/facebook/connect', icon: '🔗' },
        { name: 'إدارة البوت', href: '/facebook/bot-manager', icon: '🤖' },
        { name: 'إدارة المشتركين', href: '/facebook/subscribers', icon: '👥' },
        { name: 'الإذاعة والبث', href: '/facebook/broadcast', icon: '📢' },
        { name: 'المحادثة المباشرة', href: '/facebook/live-chat', icon: '💬' },
        { name: 'أتمتة التعليقات', href: '/facebook/comments', icon: '💭' },
      ]
    },
    { 
      id: 'instagram', 
      name: 'إنستجرام', 
      icon: '📷', 
      color: 'text-pink-500',
      submenus: [
        { name: 'ربط الحساب', href: '/instagram/connect', icon: '🔗' },
        { name: 'إدارة البوت', href: '/instagram/bot-manager', icon: '🤖' },
        { name: 'المحادثة المباشرة', href: '/instagram/live-chat', icon: '💬' },
        { name: 'أتمتة التعليقات', href: '/instagram/comments', icon: '💭' },
      ]
    },
    { 
      id: 'telegram', 
      name: 'تيليجرام', 
      icon: '✈️', 
      color: 'text-sky-400',
      submenus: [
        { name: 'ربط البوت', href: '/telegram/connect', icon: '🔗' },
        { name: 'إدارة البوت', href: '/telegram/bot-manager', icon: '🤖' },
        { name: 'إدارة المجموعات', href: '/telegram/groups', icon: '👥' },
        { name: 'إدارة المشتركين', href: '/telegram/subscribers', icon: '📊' },
        { name: 'الإذاعة والبث', href: '/telegram/broadcast', icon: '📢' },
        { name: 'المحادثة المباشرة', href: '/telegram/live-chat', icon: '💬' },
      ]
    },
    { 
      id: 'webchat', 
      name: 'محادثة الويب', 
      icon: '💭', 
      color: 'text-gray-400',
      submenus: []
    },
  ];



  return (
    <div className="w-64 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex flex-col overflow-y-auto shadow-2xl border-r border-teal-500/20 sidebar-scroll relative">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <div className="absolute top-20 left-5 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-60 right-5 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Animated Lines Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBkOTQ4OCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/50"></div>
      </div>

      {/* Logo */}
      <div className="p-6 border-b border-teal-500/20 relative z-10">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="المسار الساخن" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <div className="text-lg font-bold text-white">
              المسار الساخن
            </div>
            <div className="text-xs text-white/80">للسفر والسياحة</div>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/dashboard' 
              ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 backdrop-blur-sm border border-orange-400/30 shadow-lg shadow-orange-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-orange-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/dashboard' 
              ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <BarChart3 size={18} className={pathname === '/dashboard' ? 'text-white' : 'text-orange-300'} />
          </div>
          <span className={`font-semibold ${pathname === '/dashboard' ? 'text-white' : 'text-slate-300'}`}>
            لوحة التحكم
          </span>
        </Link>

        {/* WhatsApp Business */}
        <Link
          href="/inbox"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/inbox' 
              ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-sm border border-green-400/30 shadow-lg shadow-green-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-green-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/inbox' 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <MessageSquare size={18} className={pathname === '/inbox' ? 'text-white' : 'text-green-300'} />
          </div>
          <span className={`font-semibold ${pathname === '/inbox' ? 'text-white' : 'text-slate-300'}`}>
            واتساب بيزنس
          </span>
        </Link>

        {/* Social Posting */}
        <Link
          href="/social-media"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/social-media' 
              ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 backdrop-blur-sm border border-violet-400/30 shadow-lg shadow-violet-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-violet-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/social-media' 
              ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <span className="text-xl">{pathname === '/social-media' ? '📱' : '📱'}</span>
          </div>
          <span className={`font-semibold ${pathname === '/social-media' ? 'text-white' : 'text-slate-300'}`}>
            النشر الاجتماعي
          </span>
        </Link>

        {/* Call Center - Saudi Arabia */}
        <Link
          href="/call-center"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/call-center' || pathname === '/unified-number'
              ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-sm border border-green-400/30 shadow-lg shadow-green-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-green-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/call-center' || pathname === '/unified-number'
              ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <span className="text-xl">☎️</span>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className={`font-semibold ${pathname === '/call-center' || pathname === '/unified-number' ? 'text-white' : 'text-slate-300'}`}>
              مركز الاتصالات
            </span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] rounded-full font-bold shadow-md animate-pulse">
              🇸🇦 KSA
            </span>
          </div>
        </Link>

        {/* Mobile Call - Egypt to Saudi Arabia */}
        <Link
          href="/mobile-call"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/mobile-call'
              ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm border border-blue-400/30 shadow-lg shadow-blue-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-blue-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/mobile-call'
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <span className="text-xl">📱</span>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className={`font-semibold ${pathname === '/mobile-call' ? 'text-white' : 'text-slate-300'}`}>
              موبايل كول
            </span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-[10px] rounded-full font-bold shadow-md">
              🇪🇬→🇸🇦
            </span>
          </div>
        </Link>

        {/* Customers */}
        <Link
          href="/customers"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/customers' 
              ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-purple-400/30 shadow-lg shadow-purple-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-purple-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/customers' 
              ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <span className="text-xl">👥</span>
          </div>
          <span className={`font-semibold ${pathname === '/customers' ? 'text-white' : 'text-slate-300'}`}>
            العملاء
          </span>
        </Link>

        {/* Employees & Departments */}
        <Link
          href="/employees"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/employees' 
              ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 backdrop-blur-sm border border-orange-400/30 shadow-lg shadow-orange-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-orange-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/employees' 
              ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <span className="text-xl">👨‍💼</span>
          </div>
          <span className={`font-semibold ${pathname === '/employees' ? 'text-white' : 'text-slate-300'}`}>
            الموظفين
          </span>
        </Link>


      </nav>

      {/* Bottom Menu - Settings as Direct Link */}
      <div className="p-4 border-t border-cyan-500/20 bg-gradient-to-b from-transparent to-black/20 relative z-10">
        <Link
          href="/settings"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/settings'
              ? 'bg-gradient-to-r from-slate-600/30 to-slate-500/30 backdrop-blur-sm border border-slate-400/30 shadow-lg' 
              : 'text-slate-300 hover:bg-white/5 hover:border-slate-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/settings'
              ? 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <Settings size={18} className={pathname === '/settings' ? 'text-white' : 'text-slate-300'} />
          </div>
          <span className={`font-semibold ${pathname === '/settings' ? 'text-white' : 'text-slate-300'}`}>
            الإعدادات
          </span>
        </Link>
      </div>
    </div>
  );
}

