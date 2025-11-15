"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Moon, Sun } from "lucide-react";

export default function AppHeader() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [dark, setDark] = useState(false);
  const router = useRouter();

  // Cargar tema guardado
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";

    setDark(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Activar modo oscuro
  const toggleDark = () => {
    const newMode = !dark;
    setDark(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

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

      {/* Notificaciones + DarkMode + Avatar */}
      <div className="flex items-center space-x-6">

        {/* BOTÓN DE MODO OSCURO */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg border text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

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
