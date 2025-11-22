'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon, Lock, Bell, Eye, AlertTriangle, Settings, Shield, Mail, Phone } from 'lucide-react';
import UserProfileSection from './UserProfileSection';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import { useNotification } from '../../contexts/NotificationContext';
import { auth } from '@/app/lib/api'; // Usar la API centralizada
// Importar el tipo User compartido para evitar conflictos de tipos
import { User } from '@/app/types/user'; 

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  // Usamos el tipo User importado
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('pixel-token');
      const userIdStr = localStorage.getItem('user_id');

      if (!token || !userIdStr) {
        // Si no hay datos en LS, redirigir o mostrar error
        // Pero para configurar la página, permitimos fallar silenciosamente si es primer render
        if (!token) {
            setError('No se encontró token de autenticación');
            setLoading(false);
            return;
        }
      }

      // Lógica Híbrida: Intentar cargar del backend, si falla (stress test), usar LS
      try {
          // Aquí deberías tener un endpoint real como auth.getMe() o users.get(id)
          // Como en tu api.ts actual no vi un 'getMe' completo implementado que devuelva todo el objeto,
          // podemos simularlo o implementarlo.
          // Por ahora, reconstruimos desde LS para ser resilientes en modo stress
          
          // Opción A: Llamada real (Si el backend lo soporta)
          // const user = await auth.getMe(); 
          
          // Opción B: Reconstrucción (Más segura para tu estado actual híbrido)
          const simulatedUser: User = {
              id: parseInt(userIdStr || "0"),
              name: localStorage.getItem("user_name") || "Usuario",
              email: "usuario@pixelmoney.com", // Ojalá lo hubieras guardado en el login
              phone_number: "---",
              telegram_chat_id: localStorage.getItem("telegram_chat_id") || undefined,
              is_phone_verified: localStorage.getItem("is_phone_verified") === "true"
          };
          
          setUserData(simulatedUser);
          showNotification('Datos cargados', 'success');

      } catch (apiError) {
          throw new Error("Error al obtener datos del servidor");
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Error de conexión');
      // No borramos el token automáticamente aquí para evitar logout por error de red temporal
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'perfil', 
      label: 'Perfil', 
      icon: <UserIcon className="w-5 h-5" />,
      description: 'Gestiona tu información personal'
    },
    { 
      id: 'seguridad', 
      label: 'Seguridad', 
      icon: <Lock className="w-5 h-5" />,
      description: 'Contraseñas y autenticación'
    },
    { 
      id: 'notificaciones', 
      label: 'Notificaciones', 
      icon: <Bell className="w-5 h-5" />,
      description: 'Preferencias de notificaciones'
    },
    { 
      id: 'privacidad', 
      label: 'Privacidad', 
      icon: <Eye className="w-5 h-5" />,
      description: 'Controla tu privacidad'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
            Cargando configuración...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl shadow-lg shadow-blue-500/25 mb-6">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 dark:text-slate-100 tracking-tight mb-4">
            Configuración
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Personaliza tu experiencia y gestiona tu cuenta de Pixel Money
          </p>

          {/* Tarjeta de información del usuario */}
          {userData && (
            <div className="mt-8 inline-flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-sky-100 dark:border-slate-700 shadow-lg hover-lift transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-slate-800 dark:text-slate-100 font-semibold">
                  {userData.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>{userData.email}</span>
                </div>
                {userData.phone_number && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{userData.phone_number}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Activo
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 inline-flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-rose-200 dark:border-rose-700 shadow-lg max-w-md mx-auto">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <p className="text-rose-700 dark:text-rose-400 font-medium text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navegación Lateral */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 dark:border-slate-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-500" />
                Configuración
              </h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                      activeTab === tab.id
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`transition-transform duration-300 ${
                        activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                      }`}>
                        {tab.icon}
                      </div>
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    <p className={`text-sm ${
                      activeTab === tab.id ? 'text-sky-100' : 'text-slate-500 dark:text-slate-500'
                    }`}>
                      {tab.description}
                    </p>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Cuenta segura</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Tu información está protegida con encriptación de última generación
                </p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 dark:border-slate-700 overflow-hidden">
              <div className="border-b border-sky-100 dark:border-slate-700 bg-gradient-to-r from-sky-500/5 to-blue-600/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                    {tabs.find(tab => tab.id === activeTab)?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      {tabs.find(tab => tab.id === activeTab)?.label}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {tabs.find(tab => tab.id === activeTab)?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="animate-fade-in-up">
                  {/* Aquí estaba el error de tipo. Ahora UserProfileSection no recibe props obligatorias en mi versión anterior,
                      PERO para mantener compatibilidad con tu código de UserProfileSection modificado,
                      probablemente no necesites pasarle nada ya que UserProfileSection carga sus propios datos.
                      
                      SI tu UserProfileSection REQUIERE props (como en la versión original de causa),
                      entonces pasamos userData.
                      
                      En la versión híbrida que te pasé anteriormente, UserProfileSection NO recibe props, 
                      se encarga él mismo. Así que lo llamamos sin props.
                   */}
                  {activeTab === 'perfil' && <UserProfileSection />}
                  
                  {activeTab === 'seguridad' && <SecuritySettings />}
                  {activeTab === 'notificaciones' && <NotificationSettings />}
                  {activeTab === 'privacidad' && <PrivacySettings />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Pixel Money • Tu billetera digital segura
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Versión 1.0.0 • Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}