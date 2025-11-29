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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-orange-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="المسار الساخن" 
              width={120} 
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            المسار الساخن
          </h1>
          <p className="text-gray-600 font-medium">للسفر والسياحة</p>
          <p className="text-sm text-gray-500 mt-1">تسجيل الدخول</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
              placeholder="admin@elmasarelsa5en.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
              placeholder="••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-700 to-emerald-700 text-white py-3 rounded-lg font-medium hover:from-teal-800 hover:to-emerald-800 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ جاري تسجيل الدخول...' : '🔓 تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
          <p className="text-center text-sm font-medium text-gray-700 mb-3">الحسابات المتاحة:</p>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="bg-white p-2 rounded border border-teal-100">
              <p className="font-medium text-teal-700">👨‍💼 الإدارة</p>
              <p>admin@elmasarelsa5en.com / Admin@123</p>
            </div>
            <div className="bg-white p-2 rounded border border-teal-100">
              <p className="font-medium text-teal-700">💰 المبيعات</p>
              <p>sales@elmasarelsa5en.com / Sales@123</p>
            </div>
            <div className="bg-white p-2 rounded border border-teal-100">
              <p className="font-medium text-teal-700">📊 المحاسبة</p>
              <p>accounting@elmasarelsa5en.com / Accounting@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
