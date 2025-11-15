"use client";

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
    <header className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src="/PixelMoneyLogo.png" alt="Pixel Money" className="w-8 h-8" />
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Pixel Money
        </span>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center w-1/2 max-w-md border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800">
        <Search size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Buscar transacciones, contactos..."
          className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Notificaciones + ThemeSwitch + Avatar */}
      <div className="flex items-center space-x-6">

        {/* MODO OSCURO FINAL */}
        <ThemeSwitch />

        {/* Notificaciones */}
        <div className="relative">
          <Bell size={22} className="text-gray-600 dark:text-gray-300 cursor-pointer" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Avatar */}
        {user ? (
          <img
            src="/avatar.png"
            alt="Avatar"
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        )}
      </div>
    </header>
  );
}
