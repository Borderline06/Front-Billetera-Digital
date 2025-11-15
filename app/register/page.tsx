// src/app/register/page.tsx
'use client'; 

import { useState } from 'react';
// Asegúrate de que 'next/link' esté instalado en tu package.json
import Link from 'next/link'; 
// Asegúrate de que 'next/navigation' esté disponible (es estándar en Next.js 13+)
import { useRouter } from 'next/navigation'; 

export default function RegisterPage() {
  // --- Estados del Formulario Principal ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramChatId, setTelegramChatId] = useState(''); // <-- NUEVO ESTADO
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // --- Estados del Modal de Verificación ---
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // --- Estado de Éxito Final ---
  const [finalSuccessMessage, setFinalSuccessMessage] = useState<string | null>(null);

  const router = useRouter(); // Hook para redirección
  const API_GATEWAY_URL = 'http://localhost:8080'; // Asumo que tu Gateway corre en 8080

  /**
   * Maneja el envío del formulario de registro.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFinalSuccessMessage(null);

    const payload = {
      name: name,
      email: email,
      password: password,
      phone_number: phone,
      telegram_chat_id: telegramChatId, // <-- NUEVO CAMPO EN PAYLOAD
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
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail[0].msg || 'Error de validación.';
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
        throw new Error(errorMessage);
      }

      // ¡ÉXITO DE REGISTRO!
      // En lugar de mostrar un mensaje, abrimos el modal.
      console.log('Registro exitoso, esperando verificación:', data);
      setShowVerificationModal(true); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el envío del código de verificación.
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationLoading(true);
    setVerificationError(null);

    try {
      const response = await fetch(`${API_GATEWAY_URL}/auth/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Usamos 'phone' del estado principal y 'verificationCode' del estado del modal
        body: JSON.stringify({
          phone_number: phone,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
         // Reutilizamos la lógica de manejo de errores
         let errorMessage = 'Error al verificar.';
         if (Array.isArray(data.detail)) {
           errorMessage = data.detail[0].msg || 'Error de validación.';
         } else if (typeof data.detail === 'string') {
           errorMessage = data.detail;
         }
         throw new Error(errorMessage);
      }

      // ¡VERIFICACIÓN EXITOSA!
      console.log('Verificación exitosa:', data);
      setShowVerificationModal(false);
      setFinalSuccessMessage('¡Cuenta verificada! Redirigiendo al login...');
      
      // Limpiamos todo el formulario
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setTelegramChatId('');
      setVerificationCode('');
      setError(null);

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login'); 
      }, 2000);

    } catch (err: any) {
      setVerificationError(err.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  /**
   * Maneja el reenvío del código.
   */
  const handleResendCode = async () => {
    setResendMessage('Reenviando código...');
    setVerificationError(null);

    try {
      const response = await fetch(`${API_GATEWAY_URL}/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phone }),
      });

      if (!response.ok) {
        // Asumimos que resend-code también devuelve un 'detail' en JSON
        const data = await response.json();
        throw new Error(data.detail || 'Error al reenviar');
      }

      // Éxito (Respuesta 204 No Content)
      setResendMessage('¡Código reenviado! Revisa tu Telegram.');

    } catch (err: any) {
      setResendMessage(err.message);
    } finally {
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setResendMessage(null), 3000);
    }
  };


  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center text-indigo-400">
            Crear Cuenta
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Correo Electrónico
              </label>
              <input
                id="email"
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                Número de Celular
              </label>
              <input
                id="phone"
                type="tel" 
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="987654321"
              />
            </div>
            
            {/* --- NUEVO CAMPO PARA TELEGRAM CHAT ID --- */}
            <div>
              <label htmlFor="telegramChatId" className="block text-sm font-medium text-gray-300">
                Telegram Chat ID
              </label>
              <input
                id="telegramChatId"
                type="text"
                required
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: 123456789"
              />
              <p className="mt-2 text-xs text-gray-400">
                Habla con <code className="bg-gray-900 px-1 py-0.5 rounded">@userinfobot</code> en Telegram para obtener tu ID. 
                Asegúrate de haber iniciado tu bot <code className="bg-gray-900 px-1 py-0.5 rounded">@TuBot</code>.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <input
                id="password"
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

            {/* Mensajes de Error o Éxito (AHORA ES FINAL SUCCESS) */}
            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}
            {finalSuccessMessage && (
              <p className="text-center text-sm text-green-400">{finalSuccessMessage}</p>
            )}

            <div className="text-center">
              <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* --- NUEVO: MODAL DE VERIFICACIÓN --- */}
      {showVerificationModal && (
        <>
          {/* Fondo oscuro (backdrop) */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-40"
            onClick={() => setShowVerificationModal(false)} // Opcional: cerrar al hacer clic fuera
          ></div>

          {/* Contenido del Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-sm z-50">
            <h2 className="text-2xl font-bold text-center text-indigo-400 mb-4">
              Verifica tu Teléfono
            </h2>
            <p className="text-center text-gray-300 text-sm mb-6">
              Te hemos enviado un código de 6 dígitos a tu chat de Telegram.
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-300">
                  Código de Verificación
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-center tracking-widest text-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="------"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={verificationLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500"
                >
                  {verificationLoading ? 'Verificando...' : 'Verificar Cuenta'}
                </button>
              </div>

              {/* Mensajes de error o reenvío del modal */}
              {verificationError && (
                <p className="text-center text-sm text-red-400">{verificationError}</p>
              )}
              {resendMessage && (
                <p className="text-center text-sm text-green-400">{resendMessage}</p>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={!!resendMessage && !resendMessage.includes('Error')} // Deshabilitar mientras se reenvía
                  className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-gray-500"
                >
                  ¿No recibiste el código? Reenviar
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}