'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import Image from 'next/image';

// Generate static star positions to avoid hydration mismatch
const generateStars = (count: number) => {
  const stars = [];
  const seed = 12345; // Fixed seed for consistent random values
  let random = seed;
  
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  
  for (let i = 0; i < count; i++) {
    stars.push({
      width: 1 + seededRandom() * 2,
      height: 1 + seededRandom() * 2,
      top: seededRandom() * 100,
      left: seededRandom() * 100,
      delay: seededRandom() * 3,
      duration: 2 + seededRandom() * 3,
    });
  }
  return stars;
};

// Generate static bubble positions
const generateBubbles = (count: number) => {
  const bubbles = [];
  const seed = 54321; // Different seed for bubbles
  let random = seed;
  
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  
  for (let i = 0; i < count; i++) {
    const size = 20 + seededRandom() * 60;
    bubbles.push({
      width: size,
      height: size,
      left: seededRandom() * 100,
      bottom: -(seededRandom() * 100),
      delay: seededRandom() * 5,
      duration: 10 + seededRandom() * 10,
    });
  }
  return bubbles;
};

const STARS = generateStars(30);
const BUBBLES = generateBubbles(15);

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('خطأ في البريد الإلكتروني أو كلمة المرور');
      }

      const data = await response.json();
      
      authStorage.setTokens(data.accessToken, data.refreshToken || '');
      authStorage.setUser(data.user);

      // توجيه الموظفين إلى صفحة Mobile Call فقط
      router.push('/mobile-call');
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
        
        {/* Animated Stars */}
        {STARS.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}

        {/* Floating Bubbles */}
        {BUBBLES.map((bubble, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-400/20 backdrop-blur-sm animate-float"
            style={{
              width: `${bubble.width}px`,
              height: `${bubble.height}px`,
              left: `${bubble.left}%`,
              bottom: `${bubble.bottom}px`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
            }}
          />
        ))}
        
        {/* Animated Lines */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBkOTQ4OCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/50"></div>
      </div>
      
      <div className={`relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-teal-100/30 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className={`relative transition-all duration-1000 ${mounted ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-xl opacity-40 animate-spin-slow"></div>
              <Image 
                src="/logo.png" 
                alt="المسار الساخن" 
                width={100} 
                height={100}
                className="relative z-10 drop-shadow-2xl animate-bounce-slow"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
          </div>
          <h1 className={`text-3xl font-bold text-slate-800 mb-2 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            المسار الساخن
          </h1>
          <p className={`text-teal-700 font-semibold text-lg transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>للسفر والسياحة</p>
          <div className={`mt-4 h-1 mx-auto bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 delay-700 ${mounted ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}></div>
        </div>

        <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-700 delay-900 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake">
              {error}
            </div>
          )}

          <div className="group">
            <label className="block text-slate-700 font-bold mb-2 text-sm transition-colors group-focus-within:text-teal-600">
              📧 البريد الإلكتروني
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/30 focus:border-teal-600 transition-all duration-200 text-slate-700 placeholder:text-slate-400 hover:border-teal-300"
              placeholder="admin@elmasarelsa5en.com"
              required
              disabled={loading}
            />
          </div>

          <div className="group">
            <label className="block text-slate-700 font-bold mb-2 text-sm transition-colors group-focus-within:text-teal-600">
              🔐 كلمة المرور
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/30 focus:border-teal-600 transition-all duration-200 text-slate-700 placeholder:text-slate-400 hover:border-teal-300"
              placeholder="••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:via-emerald-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
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

          {/* Quick Access Button */}
          <button
            type="button"
            onClick={() => {
              // Store fake token and user data
              localStorage.setItem('accessToken', 'demo-token-' + Date.now());
              localStorage.setItem('user', JSON.stringify({
                id: '1',
                email: 'akram@local.com',
                name: 'Akram',
                role: 'admin'
              }));
              // توجيه إلى صفحة Mobile Call
              router.push('/mobile-call');
            }}
            className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            🚀 دخول سريع (بدون كلمة مرور)
          </button>
        </form>

        <div className={`mt-6 p-5 bg-gradient-to-br from-slate-50 to-teal-50 rounded-2xl border-2 border-teal-100 shadow-inner transition-all duration-700 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-center text-sm font-bold text-slate-700 mb-4 flex items-center justify-center gap-2">
            <span className="text-teal-600 animate-bounce-slow">🔑</span>
            الحساب المتاح
          </p>
          <div className="bg-white p-4 rounded-xl border-2 border-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <p className="font-bold text-teal-700 mb-2 text-lg">👨‍💻 Akram</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 group">
                <span className="text-xs text-slate-500 group-hover:scale-125 transition-transform">📧</span>
                <p className="text-sm text-slate-700 font-mono font-bold">akram@local.com</p>
              </div>
              <div className="flex items-center gap-2 group">
                <span className="text-xs text-slate-500 group-hover:scale-125 transition-transform">🔐</span>
                <p className="text-sm text-slate-700 font-mono font-bold">Aazxc123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
