// src/app/page.tsx
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Header */}
      <header className="w-full py-4 px-8 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Pixel Money</h1>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 rounded-xl border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition">
            Iniciar sesión
          </Link>
          <Link href="/register" className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition">
            Crear cuenta
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 px-12 items-center justify-between">
        {/* Left section */}
        <div className="max-w-xl">
          <h2 className="text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
            Tu dinero, tu ritmo <br />
            <span className="text-indigo-600">Bienvenido a Pixel Money</span>
          </h2>
          <p className="text-lg text-gray-600">
            Gestiona tus finanzas de forma fácil, segura e inteligente. Todo desde un solo lugar.
          </p>
        </div>

        {/* Right image placeholder */}
        <div className="w-1/2 flex justify-center">
          <div className="w-80 h-80 bg-indigo-100 rounded-2xl shadow-inner flex items-center justify-center text-indigo-400 text-xl">
            Imagen
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-500 flex flex-col gap-2">
        <div className="flex justify-center gap-8 text-sm">
          <span className="hover:text-indigo-600 cursor-pointer">Términos y condiciones</span>
          <span className="hover:text-indigo-600 cursor-pointer">Política de privacidad</span>
          <span className="hover:text-indigo-600 cursor-pointer">Contacto</span>
        </div>
        <p className="text-xs">©2025 Pixel Money</p>
      </footer>
    </div>
  );
}
