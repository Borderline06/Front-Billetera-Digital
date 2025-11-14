'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CreditCard, Users, Settings, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

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

  const links = [
    { href: '/dashboard', label: 'Inicio', icon: <Home size={18} /> },
    { href: '/transactions', label: 'Transacciones', icon: <CreditCard size={18} /> },
    { href: '/groups', label: 'Grupos', icon: <Users size={18} /> },
    { href: '/settings', label: 'Configuración', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
      
      <div>
        {/* Usuario */}
        <div className="p-6 border-b">
          {user ? (
            <div className="flex items-center space-x-3">
              <img
                src="/avatar.png"
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Cargando usuario...</p>
          )}
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 ${
                pathname === link.href ? 'bg-gray-200 font-medium' : ''
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Cerrar sesión */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 border border-red-500 text-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-50"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>

    </aside>
  );
}
