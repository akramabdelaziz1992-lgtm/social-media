'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { authStorage } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      alert('ليس لديك صلاحية الوصول لهذه الصفحة');
      router.push('/inbox');
      return;
    }
    setUser(currentUser);
  }, [router, setUser]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-dark-50">
      <aside className="w-64 bg-white border-l border-dark-200 p-6">
        <h2 className="text-xl font-bold text-primary mb-8">لوحة التحكم</h2>
        <nav className="space-y-2">
          <Link href="/admin/channels" className="block p-2 rounded-lg hover:bg-dark-100">
            إدارة القنوات
          </Link>
          {/* Add other admin links here */}
        </nav>
        <div className="mt-auto pt-8">
           <Link href="/inbox" className="btn btn-secondary w-full mb-2">
            العودة للصندوق
          </Link>
          <button onClick={logout} className="btn btn-danger w-full">
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}