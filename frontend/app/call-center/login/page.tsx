'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallCenterLogin() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-cyan-300 text-lg">جاري التحويل لصفحة تسجيل الدخول الرئيسية...</p>
        <p className="text-slate-400 text-sm mt-2">يرجى تسجيل الدخول بحسابك من النظام الرئيسي</p>
      </div>
    </div>
  );
}
