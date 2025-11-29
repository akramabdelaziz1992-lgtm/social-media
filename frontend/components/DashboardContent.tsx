'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import StatCard from './StatCard';
import { TrendingUp, MessageSquare, Users, Bot } from 'lucide-react';

// Dynamic import for charts to avoid SSR issues
const LineChartComponent = dynamic(
  () => import('./DashboardCharts').then(mod => mod.LineChartComponent),
  { 
    ssr: false,
    loading: () => (
      <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-[400px] flex items-center justify-center">
        <div className="text-teal-300 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          جاري تحميل الرسم البياني...
        </div>
      </div>
    )
  }
);

const PieChartComponent = dynamic(
  () => import('./DashboardCharts').then(mod => mod.PieChartComponent),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-[400px] flex items-center justify-center">
        <div className="text-cyan-300 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          جاري تحميل الرسم البياني...
        </div>
      </div>
    )
  }
);

const channelStats = [
  { name: 'Facebook', label: 'فيسبوك', data: { messages: 1175, widgets: 0, sequences: 0, flows: 0 }, color: 'from-blue-500 to-blue-600', icon: '📘' },
  { name: 'WhatsApp', label: 'واتس آب', data: { messages: 1, widgets: 0, sequences: 0, flows: 0 }, color: 'from-green-500 to-emerald-600', icon: '💬' },
  { name: 'Telegram', label: 'تيليجرام', data: { messages: 0, widgets: 0, sequences: 0, flows: 0 }, color: 'from-teal-500 to-emerald-500', icon: '✈️' },
];

export default function DashboardContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-teal-600/20 via-emerald-600/20 to-teal-600/20 backdrop-blur-sm p-6 border-b border-white/10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent">لوحة المعلومات</h1>
              <p className="text-teal-200 mt-1">مرحباً بك في نظام إدارة المحادثات</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="group px-6 py-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-md rounded-xl text-sm border border-white/20 hover:scale-105 transition-transform cursor-pointer shadow-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>المشتركون: <strong>9</strong>/500K</span>
            </div>
          </div>
          <div className="group px-6 py-3 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-md rounded-xl text-sm border border-white/20 hover:scale-105 transition-transform cursor-pointer shadow-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>الرسائل: <strong>1317</strong>/5M</span>
            </div>
          </div>
          <div className="group px-6 py-3 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-md rounded-xl text-sm border border-white/20 hover:scale-105 transition-transform cursor-pointer shadow-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span>رصيد AI: <strong>66.5K</strong>/100M</span>
            </div>
          </div>
          <div 
            onClick={() => window.location.href = '/unified-number'}
            className="group px-6 py-3 bg-gradient-to-r from-emerald-500/30 to-green-500/30 backdrop-blur-md rounded-xl text-sm border border-white/20 hover:scale-105 transition-transform cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">☎️</span>
              <span>المكالمات: <strong>1,234</strong> اليوم</span>
              <span className="mr-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-bold">جديد</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative p-6 space-y-6">
        {/* Channel Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channelStats.map((channel, idx) => (
            <div 
              key={channel.name} 
              className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeInUp"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">ملخص {channel.label}</h3>
                <div className={`w-12 h-12 bg-gradient-to-br ${channel.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform`}>
                  {channel.icon}
                </div>
              </div>
              <p className="text-cyan-200 text-sm mb-4">كل الأوقات</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur rounded-xl p-4 border border-white/10 hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-white">{channel.data.messages}</div>
                  <div className="text-sm text-cyan-200 mt-1">الرسائل</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur rounded-xl p-4 border border-white/10 hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-white">{channel.data.widgets}</div>
                  <div className="text-sm text-blue-200 mt-1">ويدجت</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur rounded-xl p-4 border border-white/10 hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-white">{channel.data.sequences}</div>
                  <div className="text-sm text-green-200 mt-1">تسلسل</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur rounded-xl p-4 border border-white/10 hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-white">{channel.data.flows}</div>
                  <div className="text-sm text-orange-200 mt-1">سير الإدخال</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LineChartComponent />
          <PieChartComponent />
        </div>

        {/* Broadcast Summary */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 animate-fadeInUp animation-delay-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">ملخص البث (آخر 7 أيام)</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '💬', label: 'زيادة', value: '2', color: 'from-green-500 to-emerald-500' },
              { icon: '📉', label: 'انخفاض', value: '0', color: 'from-red-500 to-pink-500' },
              { icon: '📊', label: 'المجموع', value: '2', color: 'from-blue-500 to-cyan-500' },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`group bg-gradient-to-br ${item.color} bg-opacity-20 backdrop-blur rounded-xl p-5 text-center border border-white/20 hover:scale-110 hover:shadow-2xl transition-all duration-300 cursor-pointer`}
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">{item.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">{item.value}</div>
                <div className="text-sm text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
