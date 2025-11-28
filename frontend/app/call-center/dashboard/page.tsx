'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Phone, Users, History, TrendingUp, Clock, 
  PhoneIncoming, PhoneOutgoing, PhoneMissed,
  LogOut, BarChart3, Calendar, Filter
} from 'lucide-react';

interface CallStats {
  total: number;
  inbound: number;
  outbound: number;
  missed: number;
  avgDuration: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface RecentCall {
  id: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  status: string;
  durationSeconds: number;
  createdAt: string;
  agentName?: string;
}

export default function CallCenterDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<CallStats>({
    total: 0,
    inbound: 0,
    outbound: 0,
    missed: 0,
    avgDuration: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('call_center_token');
    const userData = localStorage.getItem('call_center_user');
    
    if (!token || !userData) {
      router.push('/call-center/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData(token);
  }, [timeFilter]);

  const loadDashboardData = async (token: string) => {
    try {
      const [statsRes, callsRes] = await Promise.all([
        fetch(`${apiUrl}/api/calls/stats?period=${timeFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/calls/recent?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setRecentCalls(callsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('call_center_token');
    localStorage.removeItem('call_center_user');
    router.push('/call-center/login');
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `اليوم ${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `أمس ${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ar-SA', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-200">جاري التحميل...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="المسار الساخن" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  لوحة التحكم - المسار الساخن
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  مرحباً {user?.name || user?.username} 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/call-center')}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg flex items-center gap-2"
              >
                <Phone size={18} />
                <span>بدء مكالمة</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-white/10 hover:bg-white/20 text-red-400 rounded-lg transition-all border border-white/20"
                title="تسجيل الخروج"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 relative">
        {/* Time Filter */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={20} className="text-cyan-400" />
          <div className="flex gap-2">
            {[
              { value: 'today' as const, label: 'اليوم' },
              { value: 'week' as const, label: 'هذا الأسبوع' },
              { value: 'month' as const, label: 'هذا الشهر' },
              { value: 'all' as const, label: 'الكل' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeFilter === filter.value
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-cyan-200 hover:bg-white/20 border border-white/20'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                <Phone size={24} className="text-white" />
              </div>
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <h3 className="text-slate-400 text-sm mb-1">إجمالي المكالمات</h3>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <PhoneIncoming size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">مكالمات واردة</h3>
            <p className="text-3xl font-bold text-white">{stats.inbound}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                <PhoneOutgoing size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">مكالمات صادرة</h3>
            <p className="text-3xl font-bold text-white">{stats.outbound}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                <Clock size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">متوسط المدة</h3>
            <p className="text-3xl font-bold text-white">{formatDuration(stats.avgDuration)}</p>
          </div>
        </div>

        {/* Recent Calls Table */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History size={24} className="text-cyan-400" />
              آخر المكالمات
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-cyan-300">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-cyan-300">من</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-cyan-300">إلى</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-cyan-300">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-cyan-300">المدة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-cyan-300">الموظف</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-cyan-300">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {recentCalls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      لا توجد مكالمات بعد
                    </td>
                  </tr>
                ) : (
                  recentCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {call.direction === 'inbound' ? (
                            <PhoneIncoming size={16} className="text-green-400" />
                          ) : (
                            <PhoneOutgoing size={16} className="text-blue-400" />
                          )}
                          <span className="text-white text-sm">
                            {call.direction === 'inbound' ? 'وارد' : 'صادر'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white text-sm font-mono" dir="ltr">
                        {call.fromNumber}
                      </td>
                      <td className="px-6 py-4 text-white text-sm font-mono" dir="ltr">
                        {call.toNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          call.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          call.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {call.status === 'completed' ? 'مكتمل' :
                           call.status === 'failed' ? 'فاشل' :
                           call.status === 'no-answer' ? 'لم يرد' : call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">
                        {formatDuration(call.durationSeconds)}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {call.agentName || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {formatDate(call.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
