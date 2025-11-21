'use client'; 

import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Shield, Smartphone } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  
  // Estados de UI
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // URL del API Gateway (Asegúrate de que esto apunte a tu backend corriendo)
  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Payload limpio sin telegram_chat_id para el modo de prueba
    const payload = {
      name: name,
      email: email,
      password: password,
      phone_number: phone,
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
        let errorMessage = 'Error al registrar el usuario.';
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail[0].msg || 'Error de validación.';
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          }
        }
        throw new Error(errorMessage);
      }

      // Éxito Inmediato (Flow simplificado para tests)
      console.log('Registro directo exitoso:', data);
      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo al login...');
      
      // Limpiar formulario
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');

      // Redirigir tras 1.5 segundos usando navegación estándar
      setTimeout(() => {
        window.location.href = '/login'; 
      }, 1500);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Error desconocido al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl shadow-lg shadow-blue-500/25 mb-6">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-light text-slate-800 dark:text-slate-100 tracking-tight mb-2">
              Pixel Money
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Registro Directo (Test Mode)
            </p>
          </div>

          {/* Tarjeta del Formulario */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-sky-100 dark:border-slate-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Crear Cuenta
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Únete a nuestra comunidad financiera
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              {/* Campo de Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>
              
              {/* Campo de Teléfono */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Número de Celular
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel" 
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="987654321"
                    maxLength={9}
                  />
                </div>
              </div>
              
              {/* Campo de Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Información de Seguridad (Simplificada) */}
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl">
                <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <span>Tus datos están protegidos. (Test Mode: Verificación desactivada)</span>
              </div>

              {/* Mensajes de Estado */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 animate-pulse">
                  <p className="text-rose-700 dark:text-rose-400 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 animate-bounce">
                  <p className="text-emerald-700 dark:text-emerald-400 text-sm text-center font-medium">{successMessage}</p>
                </div>
              )}

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={loading || !!successMessage}
                className="w-full py-3.5 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Crear Cuenta
                  </>
                )}
              </button>

              {/* Enlace de Login */}
              <div className="text-center pt-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  ¿Ya tienes cuenta?{' '}
                  <a href="/login" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors underline-offset-4 hover:underline">
                    Inicia sesión aquí
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Pixel Money • Billetera Digital
            </p>
          </div>
        </div>
      </main>
    </>
  );
}