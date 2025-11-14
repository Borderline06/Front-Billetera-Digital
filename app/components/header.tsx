// src/components/AppHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("pixel-token");
    if (!token) return;

    fetch("http://localhost:8080/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser({ name: data.name, email: data.email }))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pixel-token");
    router.push("/");
  };

  return (
    <header className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {user && (
          <p className="text-gray-600 text-sm">
            {user.name} — {user.email}
          </p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="text-sm text-red-500 hover:underline"
      >
        Cerrar sesión
      </button>
    </header>
  );
}