'use client'; 

import { useState } from 'react';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 
import { Mail, Lock, User, Phone, Eye, EyeOff, Shield, Smartphone, MessageCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [finalSuccessMessage, setFinalSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const API_GATEWAY_URL = 'http://localhost:8080';

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
      telegram_chat_id: telegramChatId,
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

      console.log('Registro exitoso, esperando verificación:', data);
      setShowVerificationModal(true); 

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

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
        body: JSON.stringify({
          phone_number: phone,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
         let errorMessage = 'Error al verificar.';
         if (Array.isArray(data.detail)) {
           errorMessage = data.detail[0].msg || 'Error de validación.';
         } else if (typeof data.detail === 'string') {
           errorMessage = data.detail;
         }
         throw new Error(errorMessage);
      }

      console.log('Verificación exitosa:', data);
      setShowVerificationModal(false);
      setFinalSuccessMessage('¡Cuenta verificada! Redirigiendo al login...');
      
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setTelegramChatId('');
      setVerificationCode('');
      setError(null);

      setTimeout(() => {
        router.push('/login'); 
      }, 2000);

    } catch (err: any) {
      setVerificationError(err.message);
    } finally {
      setVerificationLoading(false);
    }
  };

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
        const data = await response.json();
        throw new Error(data.detail || 'Error al reenviar');
      }

      setResendMessage('¡Código reenviado! Revisa tu Telegram.');

    } catch (err: any) {
      setResendMessage(err.message);
    } finally {
      setTimeout(() => setResendMessage(null), 3000);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 flex items-center justify-center p-4">
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
              Comienza tu journey financiero
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
              
              {/* Campo de Telegram */}
              <div>
                <label htmlFor="telegramChatId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Telegram Chat ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageCircle className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="telegramChatId"
                    type="text"
                    required
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="123456789"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Habla con <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">@userinfobot</code> en Telegram para obtener tu ID.
                </p>
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

              {/* Información de Seguridad */}
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl">
                <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <span>Tus datos están protegidos y solo se usarán para verificar tu identidad.</span>
              </div>

              {/* Mensajes de Estado */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                  <p className="text-rose-700 dark:text-rose-400 text-sm text-center">{error}</p>
                </div>
              )}

              {finalSuccessMessage && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                  <p className="text-emerald-700 dark:text-emerald-400 text-sm text-center">{finalSuccessMessage}</p>
                </div>
              )}

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <Link href="/login" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Pixel Money • Billetera Digital Segura
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Versión 1.0.0 • Todos los derechos reservados
            </p>
          </div>
        </div>
      </main>

      {/* Modal de Verificación */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-sm border border-sky-100 dark:border-slate-700 overflow-hidden animate-fade-in-up">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Verifica tu Teléfono</h2>
                    <p className="text-emerald-100 text-sm">Último paso para activar tu cuenta</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6">
              <p className="text-center text-slate-600 dark:text-slate-400 text-sm mb-6">
                Te hemos enviado un código de 6 dígitos a tu chat de Telegram.
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Código de Verificación
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="block w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-center tracking-widest text-lg font-mono"
                    placeholder="------"
                  />
                </div>

                {/* Mensajes del Modal */}
                {verificationError && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                    <p className="text-rose-700 dark:text-rose-400 text-sm text-center">{verificationError}</p>
                  </div>
                )}

                {resendMessage && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <p className="text-emerald-700 dark:text-emerald-400 text-sm text-center">{resendMessage}</p>
                  </div>
                )}

                {/* Botones del Modal */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!!resendMessage}
                    className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    Reenviar Código
                  </button>
                  <button
                    type="submit"
                    disabled={verificationLoading}
                    className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl font-medium shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {verificationLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Verificar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}