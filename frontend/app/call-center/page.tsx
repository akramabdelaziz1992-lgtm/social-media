"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallCenterPage() {
  const router = useRouter();
  
  // Redirect to unified-number page
  useEffect(() => {
    router.push('/unified-number');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-teal-300">جاري التحويل إلى مركز الاتصالات...</p>
      </div>
    </div>
  );
}
