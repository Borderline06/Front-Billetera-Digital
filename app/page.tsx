// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <Image
            src="/PixelMoneyLogo.png"
            alt="Pixel Money"
            width={32}
            height={32}
          />
          <span className="font-bold text-xl text-indigo-700">Pixel Money</span>
        </div>

        <div className="flex space-x-4">
          < Link href="/login" className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition">
            Iniciar sesión
          </ Link>
          <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
            Crear cuenta
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 max-w-6xl mx-auto">
        {/* Texto */}
        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Tu dinero, tu ritmo <br />
            <span className="text-indigo-700">Bienvenido a Pixel Money</span>
          </h1>

          <p className="text-gray-600 text-lg">
            Gestiona tus finanzas de forma fácil, segura e inteligente. 
            Todo desde un solo lugar.
          </p>

          <ul className="space-y-2 text-gray-700">
            <li>✅ Transferencias rápidas y seguras</li>
            <li>✅ Control total de tus gastos</li>
            <li>✅ Tecnología confiable y moderna</li>
          </ul>

          <div className="flex space-x-4 pt-4">
            <Link href="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Crear cuenta gratis
            </Link>
            <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">
              Más información
            </button>
          </div>
        </div>

        {/* Imagen */}
        <div className="mt-10 md:mt-0">
          <Image
            src="/PixelMoneyHero.png"
            alt="Hero Pixel Money"
            width={450}
            height={450}
            className="drop-shadow-lg"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t py-6 text-center text-sm text-gray-500">
        <div className="flex justify-center space-x-6 mb-2">
          <a href="#" className="hover:text-indigo-600">Términos y condiciones</a>
          <a href="#" className="hover:text-indigo-600">Política de privacidad</a>
          <a href="#" className="hover:text-indigo-600">Soporte</a>
        </div>

        <p className="text-gray-400">© 2025 Pixel Money</p>
      </footer>
    </main>
  );
}
