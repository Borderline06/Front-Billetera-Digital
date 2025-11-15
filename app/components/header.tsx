'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import ThemeSwitch from "../components/ThemeSwitch";

export default function AppHeader() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  // Cargar usuario
  useEffect(() => {
    const token = localStorage.getItem("pixel-token");
    if (!token) return;

    fetch("http://localhost:8080/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Unauthorized")))
      .then((data) => setUser({ name: data.name, email: data.email }))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pixel-token");
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 shadow-sm">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img
          src="/PixelMoneyLogoPng.png"
          alt="Pixel Money"
          className="w-10 h-10 object-contain transition-all duration-300 dark:invert"
        />
        <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wide">
          Pixel Money
        </span>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center w-1/2 max-w-md border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 bg-gray-50 dark:bg-gray-800 shadow-sm">
        <Search size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Buscar transacciones, contactos..."
          className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Notificaciones + ThemeSwitch + Avatar */}
      <div className="flex items-center space-x-5">
        {/* Modo oscuro */}
        <ThemeSwitch />

        {/* Notificaciones */}
        <div className="relative">
          <Bell size={24} className="text-gray-600 dark:text-gray-300 cursor-pointer" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </div>

        {/* Avatar */}
        {user ? (
          <img
            src="/avatar.png"
            alt="Avatar"
            className="w-11 h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        )}

        {/* Logout opcional con botón */}
        {user && (
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-300"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}
