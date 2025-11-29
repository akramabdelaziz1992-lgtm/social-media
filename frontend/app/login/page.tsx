'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://almasar-backend2025.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('خطأ في البريد الإلكتروني أو كلمة المرور');
      }

      const data = await response.json();
      
      authStorage.setTokens(data.access_token, data.refresh_token || '');
      authStorage.setUser(data.user);

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Animated Lines */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBkOTQ4OCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/50"></div>
      </div>
      
      <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-teal-100/30">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <Image 
                src="/logo.png" 
                alt="المسار الساخن" 
                width={100} 
                height={100}
                className="object-contain relative z-10 drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            المسار الساخن
          </h1>
          <p className="text-teal-700 font-semibold text-lg">للسفر والسياحة</p>
          <div className="mt-4 h-1 w-20 mx-auto bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-2 text-sm">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/30 focus:border-teal-600 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
              placeholder="admin@elmasarelsa5en.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-2 text-sm">
              كلمة المرور
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/30 focus:border-teal-600 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
              placeholder="••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:via-emerald-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري تسجيل الدخول...
              </span>
            ) : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-teal-50 rounded-2xl border-2 border-teal-100 shadow-inner">
          <p className="text-center text-sm font-bold text-slate-700 mb-4 flex items-center justify-center gap-2">
            <span className="text-teal-600">🔑</span>
            الحسابات المتاحة
          </p>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-xl border-l-4 border-teal-600 shadow-sm hover:shadow-md transition-shadow">
              <p className="font-bold text-teal-700 mb-1">👨‍💼 الإدارة</p>
              <p className="text-xs text-slate-600 font-mono">admin@elmasarelsa5en.com</p>
              <p className="text-xs text-slate-500 font-mono">كلمة المرور: Admin@123</p>
            </div>
            <div className="bg-white p-3 rounded-xl border-l-4 border-emerald-600 shadow-sm hover:shadow-md transition-shadow">
              <p className="font-bold text-emerald-700 mb-1">💰 المبيعات</p>
              <p className="text-xs text-slate-600 font-mono">sales@elmasarelsa5en.com</p>
              <p className="text-xs text-slate-500 font-mono">كلمة المرور: Sales@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
