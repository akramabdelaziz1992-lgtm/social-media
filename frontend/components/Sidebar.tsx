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
  const [expandedChannels, setExpandedChannels] = React.useState<string[]>(['whatsapp']);

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

  const toggleChannel = (channelId: string) => {
    setExpandedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    );
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-y-auto shadow-2xl border-r border-cyan-500/20 sidebar-scroll">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-xl">💬</span>
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              المسار الساخن
            </div>
            <div className="text-xs text-cyan-400">نظام إدارة المحادثات</div>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/dashboard' 
              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-cyan-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/dashboard' 
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <BarChart3 size={18} className={pathname === '/dashboard' ? 'text-white' : 'text-cyan-300'} />
          </div>
          <span className={`font-semibold ${pathname === '/dashboard' ? 'text-white' : 'text-slate-300'}`}>
            لوحة التحكم
          </span>
        </Link>

        {/* Shared Inbox */}
        <Link
          href="/inbox"
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/inbox' 
              ? 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 backdrop-blur-sm border border-blue-400/30 shadow-lg shadow-blue-500/20' 
              : 'text-slate-300 hover:bg-white/5 hover:border-blue-400/20 border border-transparent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            pathname === '/inbox' 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg' 
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <MessageSquare size={18} className={pathname === '/inbox' ? 'text-white' : 'text-blue-300'} />
          </div>
          <span className={`font-semibold ${pathname === '/inbox' ? 'text-white' : 'text-slate-300'}`}>
            صندوق الوارد المشترك
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

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent my-4"></div>

        {/* Channels Section */}
        <div className="space-y-2">
          <div className="px-4 py-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">منصات التواصل</span>
          </div>
          {channels.map((channel) => (
            <div key={channel.id}>
              <button
                onClick={() => toggleChannel(channel.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                  expandedChannels.includes(channel.id) 
                    ? 'bg-white/10 text-white font-semibold backdrop-blur-sm border border-white/10' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    expandedChannels.includes(channel.id) 
                      ? 'bg-white/15 shadow-md' 
                      : 'bg-white/5'
                  }`}>
                    <span className="text-xl">{channel.icon}</span>
                  </div>
                  <span className="font-semibold">{channel.name}</span>
                </div>
                {channel.submenus.length > 0 && (
                  expandedChannels.includes(channel.id) ? (
                    <ChevronDown size={16} className="text-cyan-300" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )
                )}
              </button>

              {/* Submenu */}
              {expandedChannels.includes(channel.id) && channel.submenus.length > 0 && (
                <div className="ml-3 mt-2 space-y-1 animate-fadeInUp border-l-2 border-cyan-500/30 pl-3">
                  {channel.submenus.map((submenu) => (
                    <Link
                      key={submenu.href}
                      href={submenu.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                        pathname === submenu.href
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white font-medium shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{submenu.icon}</span>
                        <span className="text-xs">{submenu.name}</span>
                      </div>
                      {submenu.badge && (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] rounded-full font-bold shadow-md animate-pulse">
                          {submenu.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-cyan-500/20 bg-gradient-to-b from-transparent to-black/20">
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
 
