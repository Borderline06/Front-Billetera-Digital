"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "../lib/api";
import { useNotification } from "../contexts/NotificationContext";

export default function RegisterPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  
  // Estados híbridos
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    telegram_chat_id: "", // Opcional en Stress, Obligatorio en Prod
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LÓGICA DE REGISTRO ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      showNotification("Las contraseñas no coinciden", "error");
      setIsLoading(false);
      return;
    }

    try {
      // Enviamos datos. Si no se llena telegram_chat_id, se envía string vacío
      // El backend híbrido decidirá si lanzar error (Prod) o ignorarlo (Stress)
      const response = await auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        telegram_chat_id: formData.telegram_chat_id || undefined // Enviar undefined si está vacío
      });

      // === BIFURCACIÓN DE FLUJO ===
      
      // 1. MODO STRESS: El backend devolvió token o is_phone_verified=true
      if (response.access_token || response.is_phone_verified) {
        showNotification("¡Cuenta creada! (Modo Rápido)", "success");
        
        // Guardar sesión
        const tokenToSave = response.access_token;
        if (tokenToSave) {
            localStorage.setItem("token", tokenToSave);
            localStorage.setItem("user_id", (response.user_id || response.id).toString());
            localStorage.setItem("user_name", response.name);
            localStorage.setItem("is_phone_verified", "true");
            router.push("/dashboard");
        } else {
            // Si no devolvió token (raro en stress), hacemos login manual
            autoLogin();
        }
      } 
      // 2. MODO PRODUCCIÓN: El usuario se creó pero requiere OTP
      else {
        showNotification("Código enviado a Telegram.", "info");
        setStep('verify');
      }

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || "Error al registrarse";
      showNotification(Array.isArray(msg) ? msg[0].msg : msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE VERIFICACIÓN (OTP) ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await auth.verifyPhone({
        phone_number: formData.phone_number,
        code: verificationCode
      });

      showNotification("Teléfono verificado.", "success");
      await autoLogin();

    } catch (error: any) {
        const msg = error.response?.data?.detail || "Código incorrecto";
        showNotification(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const autoLogin = async () => {
    try {
        const loginRes = await auth.login({
            username: formData.email,
            password: formData.password
        });
        localStorage.setItem("token", loginRes.access_token);
        localStorage.setItem("user_id", loginRes.user_id.toString());
        localStorage.setItem("user_name", loginRes.name);
        router.push("/dashboard");
    } catch (e) {
        showNotification("Cuenta creada pero falló el inicio de sesión automático.", "warning");
        router.push("/login");
    }
  }

  const handleResend = async () => {
      try {
          await auth.resendCode({ phone_number: formData.phone_number });
          showNotification("Código reenviado", "info");
      } catch {
          showNotification("Error al reenviar", "error");
      }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4 bg-[url('/pixelmoney.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md bg-gray-800/90 p-8 rounded-2xl shadow-2xl border border-purple-500/30 backdrop-blur-md">
        
        <div className="flex justify-center mb-6">
          <Image src="/PixelMoneyLogoPng.png" alt="Pixel Money Logo" width={80} height={80} className="drop-shadow-lg" />
        </div>

        <h2 className="text-3xl font-bold text-center text-white mb-2 font-mono">
          {step === 'form' ? 'Crear Cuenta' : 'Verificar Identidad'}
        </h2>

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="space-y-4 mt-6">
            <div className="space-y-4">
                <input
                    name="name"
                    type="text"
                    required
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Nombre Completo"
                    onChange={handleChange}
                />
                <input
                    name="email"
                    type="email"
                    required
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    placeholder="correo@ejemplo.com"
                    onChange={handleChange}
                />
                
                <div className="grid grid-cols-2 gap-3">
                    <input
                        name="phone_number"
                        type="tel"
                        required
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="Celular"
                        onChange={handleChange}
                    />
                    <input
                        name="telegram_chat_id"
                        type="text"
                        // No es 'required' HTML para permitir el flujo stress-test si se desea
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="Telegram ID"
                        onChange={handleChange}
                    />
                </div>
                <p className="text-xs text-gray-500 px-1">*Telegram ID requerido para recibir código (salvo modo pruebas).</p>

                <input
                    name="password"
                    type="password"
                    required
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Contraseña"
                    onChange={handleChange}
                />
                <input
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Confirmar Contraseña"
                    onChange={handleChange}
                />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
            >
              {isLoading ? "Procesando..." : "Registrarse"}
            </button>
          </form>
        ) : (
            <form onSubmit={handleVerify} className="space-y-6 mt-6">
                <div className="text-center">
                    <p className="text-gray-300 mb-4">Ingresa el código enviado a tu Telegram</p>
                    <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-center text-3xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-purple-500 outline-none transition-all uppercase"
                        placeholder="000000"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-lg"
                >
                    {isLoading ? "Verificando..." : "Confirmar Código"}
                </button>

                <div className="flex justify-between text-sm mt-4 px-2">
                    <button type="button" onClick={handleResend} className="text-purple-400 hover:text-purple-300 hover:underline">
                        Reenviar código
                    </button>
                    <button type="button" onClick={() => setStep('form')} className="text-gray-400 hover:text-white">
                        Cambiar datos
                    </button>
                </div>
            </form>
        )}

        <p className="mt-6 text-center text-gray-400 text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}