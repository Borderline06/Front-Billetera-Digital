// src/app/register/page.tsx
'use client'; // <-- Componente interactivo

import { useState } from 'react';
import Link from 'next/link'; // Para el enlace de "Volver"

export default function RegisterPage() {
  // --- Estados ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  /**
   * Maneja el envío del formulario de registro.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // ¡El endpoint de registro SÍ espera JSON!
    const payload = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch(`${API_GATEWAY_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Error 400 (email duplicado) o 500
        throw new Error(data.detail || 'Error al registrar el usuario');
      }

      // ¡ÉXITO!
      console.log('Registro exitoso:', data);
      setSuccessMessage(`¡Usuario ${data.email} creado! Ya puedes iniciar sesión.`);
      setEmail('');
      setPassword('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // (El HTML es casi idéntico al del login, pero con títulos cambiados)
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-400">
          Crear Cuenta
        </h1>

        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          {/* Mensajes de Error o Éxito */}
          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}
          {successMessage && (
            <p className="text-center text-sm text-green-400">{successMessage}</p>
          )}

          {/* Enlace para volver */}
          <div className="text-center">
            <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}