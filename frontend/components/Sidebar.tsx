"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // For mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop

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
    <>
      {/* Mobile Hamburger Button - Fixed at top RIGHT for RTL */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] w-11 h-11 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex flex-col items-center justify-center shadow-2xl hover:shadow-xl transition-all duration-300 active:scale-95 group"
        aria-label="Toggle Menu"
      >
        <div className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'}`}></div>
        <div className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : 'mb-1'}`}></div>
        <div className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
      </button>

      {/* Desktop Toggle Button - Inside Sidebar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:block fixed top-4 z-[60] w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95"
        style={{ right: isCollapsed ? '4px' : '260px' }}
        aria-label="Toggle Sidebar"
      >
        <ChevronRight className={`text-white transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} size={20} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[45] animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative
        h-screen
        bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 
        flex flex-col overflow-y-auto 
        shadow-2xl lg:shadow-none border-l border-teal-500/20 
        sidebar-scroll
        transition-all duration-300 ease-in-out
        z-50
        ${isOpen ? 'right-0 w-[280px]' : '-right-full w-[280px]'} lg:right-0
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
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
      <div className="p-4 lg:p-6 border-b border-teal-500/20 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="لينك كول" 
            className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
          />
          {!isCollapsed && (
            <div>
              <div className="text-base lg:text-lg font-bold text-white">
                لينك كول
              </div>
              <div className="text-xs text-white/80">LinkCall</div>
            </div>
          )}
        </div>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1.5 lg:space-y-2 relative z-10 pb-20 lg:pb-4">
        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${
              pathname === '/dashboard' 
                ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 backdrop-blur-sm border border-orange-400/30 shadow-lg shadow-orange-500/20' 
                : 'text-slate-300 hover:bg-white/5 hover:border-orange-400/20 border border-transparent'
            }`}
            title={isCollapsed ? 'لوحة التحكم' : ''}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`w-9 h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${
                pathname === '/dashboard' 
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg' 
                  : 'bg-white/10 group-hover:bg-white/15'
              }`}
            >
              <BarChart3 size={16} className={pathname === '/dashboard' ? 'text-white' : 'text-orange-300'} />
            </motion.div>
            {!isCollapsed && (
              <span className={`font-medium text-sm lg:text-base ${pathname === '/dashboard' ? 'text-white' : 'text-slate-300'}`}>
                لوحة التحكم
              </span>
            )}
          </Link>
        </motion.div>

        {/* WhatsApp Business */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Link href="/whatsapp" onClick={() => setIsOpen(false)} className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${pathname?.startsWith('/whatsapp') ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-sm border border-green-400/30 shadow-lg shadow-green-500/20' : 'text-slate-300 hover:bg-white/5 hover:border-green-400/20 border border-transparent'}`} title={isCollapsed ? 'واتساب بيزنس' : ''}>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className={`w-9 h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${pathname?.startsWith('/whatsapp') ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg' : 'bg-white/10 group-hover:bg-white/15'}`}>
              <MessageSquare size={16} className={pathname?.startsWith('/whatsapp') ? 'text-white' : 'text-green-300'} />
            </motion.div>
            {!isCollapsed && <span className={`font-medium text-sm lg:text-base ${pathname?.startsWith('/whatsapp') ? 'text-white' : 'text-slate-300'}`}>واتساب بيزنس</span>}
          </Link>
        </motion.div>

        {/* Social Posting */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <Link href="/social-media" onClick={() => setIsOpen(false)} className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${pathname === '/social-media' ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 backdrop-blur-sm border border-violet-400/30 shadow-lg shadow-violet-500/20' : 'text-slate-300 hover:bg-white/5 hover:border-violet-400/20 border border-transparent'}`} title={isCollapsed ? 'النشر الاجتماعي' : ''}>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className={`w-9 h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === '/social-media' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg' : 'bg-white/10 group-hover:bg-white/15'}`}>
              <span className="text-lg">📱</span>
            </motion.div>
            {!isCollapsed && <span className={`font-medium text-sm lg:text-base ${pathname === '/social-media' ? 'text-white' : 'text-slate-300'}`}>النشر الاجتماعي</span>}
          </Link>
        </motion.div>

        {/* Call Center */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
          <Link href="/call-center" onClick={() => setIsOpen(false)} className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${pathname === '/call-center' || pathname === '/unified-number' ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-sm border border-green-400/30 shadow-lg shadow-green-500/20' : 'text-slate-300 hover:bg-white/5 hover:border-green-400/20 border border-transparent'}`} title={isCollapsed ? 'مركز الاتصالات' : ''}>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className={`w-9 h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === '/call-center' || pathname === '/unified-number' ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg' : 'bg-white/10 group-hover:bg-white/15'}`}>
              <span className="text-lg">☎️</span>
            </motion.div>
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span className={`font-medium text-sm lg:text-base ${pathname === '/call-center' || pathname === '/unified-number' ? 'text-white' : 'text-slate-300'}`}>مركز الاتصالات</span>
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[9px] rounded-full font-bold shadow-md animate-pulse">🇸🇦</span>
              </div>
            )}
          </Link>
        </motion.div>

        {/* Mobile Call */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
          <Link href="/mobile-call" onClick={() => setIsOpen(false)} className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${pathname === '/mobile-call' ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm border border-blue-400/30 shadow-lg shadow-blue-500/20' : 'text-slate-300 hover:bg-white/5 hover:border-blue-400/20 border border-transparent'}`} title={isCollapsed ? 'موبايل كول' : ''}>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className={`w-9 h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === '/mobile-call' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg' : 'bg-white/10 group-hover:bg-white/15'}`}>
              <span className="text-lg">📱</span>
            </motion.div>
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span className={`font-medium text-sm lg:text-base ${pathname === '/mobile-call' ? 'text-white' : 'text-slate-300'}`}>موبايل كول</span>
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-[9px] rounded-full font-bold shadow-md">🇪🇬→🇸🇦</span>
              </div>
            )}
          </Link>
        </motion.div>

        {/* Customers */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.6 }}>
          <Link href="/customers" onClick={() => setIsOpen(false)} className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${pathname === '/customers' ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-purple-400/30 shadow-lg shadow-purple-500/20' : 'text-slate-300 hover:bg-white/5 hover:border-purple-400/20 border border-transparent'}`} title={isCollapsed ? 'العملاء' : ''}>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className={`w-9 h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === '/customers' ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg' : 'bg-white/10 group-hover:bg-white/15'}`}>
              <span className="text-lg">👥</span>
            </motion.div>
            {!isCollapsed && <span className={`font-medium text-sm lg:text-base ${pathname === '/customers' ? 'text-white' : 'text-slate-300'}`}>العملاء</span>}
          </Link>
        </motion.div>

        {/* Employees */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.7 }}>
          <Link href="/employees" onClick={() => setIsOpen(false)} className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${pathname === '/employees' ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 backdrop-blur-sm border border-orange-400/30 shadow-lg shadow-orange-500/20' : 'text-slate-300 hover:bg-white/5 hover:border-orange-400/20 border border-transparent'}`} title={isCollapsed ? 'الموظفين' : ''}>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className={`w-9 h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === '/employees' ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg' : 'bg-white/10 group-hover:bg-white/15'}`}>
              <span className="text-lg">👨‍💼</span>
            </motion.div>
            {!isCollapsed && <span className={`font-medium text-sm lg:text-base ${pathname === '/employees' ? 'text-white' : 'text-slate-300'}`}>الموظفين</span>}
          </Link>
        </motion.div>

      </nav>

      {/* Bottom Menu - Settings */}
      <div className="p-3 lg:p-4 border-t border-cyan-500/20 bg-gradient-to-b from-transparent to-black/20 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.8 }}>
          <Link href="/settings" onClick={() => setIsOpen(false)} className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2.5 rounded-lg lg:rounded-xl transition-all duration-300 ${pathname === '/settings' ? 'bg-gradient-to-r from-slate-600/30 to-slate-500/30 backdrop-blur-sm border border-slate-400/30 shadow-lg' : 'text-slate-300 hover:bg-white/5 hover:border-slate-400/20 border border-transparent'}`} title={isCollapsed ? 'الإعدادات' : ''}>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className={`w-9 h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === '/settings' ? 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg' : 'bg-white/10 group-hover:bg-white/15'}`}>
              <Settings size={16} className={pathname === '/settings' ? 'text-white' : 'text-slate-300'} />
            </motion.div>
            {!isCollapsed && <span className={`font-medium text-sm lg:text-base ${pathname === '/settings' ? 'text-white' : 'text-slate-300'}`}>الإعدادات</span>}
          </Link>
        </motion.div>
      </div>
    </div>
    </>
  );
}

