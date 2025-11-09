// src/app/page.tsx
'use client'; // <-- ¡Esto es crucial! Le dice a Next.js que este es un componente de cliente (interactivo)

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // --- Estados para manejar el formulario ---
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  // --- URL de tu API Gateway ---
  // (Asegúrate de que tu backend esté corriendo en localhost:8080)
  const API_GATEWAY_URL = 'http://localhost:8080';

  /**
   * Maneja el envío del formulario de login.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene que la página se recargue
    setLoading(true);
    setError(null);
    setWelcomeMessage(null);

    // OJO: El endpoint de login espera 'application/x-www-form-urlencoded'
    // ¡No JSON! Así que tenemos que formatear los datos.
    const formData = new URLSearchParams();
    formData.append('username', email); // Tu API de auth espera 'username'
    formData.append('password', password);

    try {
      const response = await fetch(`${API_GATEWAY_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el servidor devuelve 401, 500, etc.
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // ¡ÉXITO!
      console.log('Login exitoso:', data);
      setWelcomeMessage(`¡Bienvenido! Tu token es: ${data.access_token.substring(0, 15)}...`);
      localStorage.setItem('pixel-token', data.access_token);
      // Aquí es donde guardarías el token (lo veremos después)
      // Redirigir al Dashboard
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-400">
          Pixel Money
        </h1>

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="tu@correo.com"
            />
          </div>

          {/* Campo de Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {/* Botón de Enviar */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>

          {/* Mensajes de Error o Éxito */}
          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}
          {welcomeMessage && (
            <p className="text-center text-sm text-green-400">{welcomeMessage}</p>
          )}

          {/* Enlace para ir a Registro */}
          <div className="text-center">
            <Link href="/register" className="text-sm text-indigo-400 hover:text-indigo-300">
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </div>
          
        </form>
      </div>
    </main>
  );
}