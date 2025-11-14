'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';

export default function AppHeader() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("pixel-token");
    if (!token) return;

    fetch("http://localhost:8080/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setUser({ name: data.name, email: data.email }))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pixel-token");
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3">

      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img
          src="/logo.svg"
          alt="Pixel Money"
          className="w-8 h-8"
        />
        <span className="text-lg font-semibold text-gray-800">Pixel Money</span>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center w-1/2 max-w-md border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
        <Search size={18} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar transacciones, contactos..."
          className="w-full bg-transparent outline-none text-sm text-gray-700"
        />
      </div>

      {/* Notificaciones + Avatar */}
      <div className="flex items-center space-x-6">

        {/* Notificaciones */}
        <div className="relative">
          <Bell size={22} className="text-gray-600 cursor-pointer" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Avatar */}
        {user ? (
          <img
            src="/avatar.png"
            alt="Avatar"
            className="w-10 h-10 rounded-full border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        )}
      </div>
    </header>
  );
}
