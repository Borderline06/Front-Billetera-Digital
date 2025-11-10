'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, Users, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Inicio', icon: <Home size={18} /> },
    { href: '/transactions', label: 'Transacciones', icon: <CreditCard size={18} /> },
    { href: '/groups', label: 'Grupos', icon: <Users size={18} /> },
    { href: '/settings', label: 'Configuración', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-6 font-bold text-xl border-b">💰 Pixel Money</div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 ${
              pathname === link.href ? 'bg-gray-200 font-medium' : ''
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
