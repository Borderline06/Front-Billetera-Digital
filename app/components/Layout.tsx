// src/components/Layout.tsx
'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pixel-token');
    if (!token) {
      // no token: redirect to login
      router.replace('/');
      return;
    }

    fetch('http://localhost:8080/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => setUser({ name: data.name, email: data.email }))
      .catch(() => {
        localStorage.removeItem('pixel-token');
        router.replace('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('pixel-token');
    router.push('/');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            {user && <p className="text-gray-600 text-sm">{user.name} — {user.email}</p>}
          </div>
          <div>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Cerrar sesión</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
