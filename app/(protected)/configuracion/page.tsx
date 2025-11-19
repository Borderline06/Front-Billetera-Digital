'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Bell, Eye, AlertTriangle, Settings, Shield, Mail, Phone } from 'lucide-react';
import UserProfileSection from './UserProfileSection';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import { useNotification } from '../../contexts/NotificationContext';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró token de autenticación');
        setLoading(false);
        return;
      }
      const verifyResponse = await fetch('http://localhost:8000/verify', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!verifyResponse.ok) throw new Error('Token inválido o expirado');

      const payload = await verifyResponse.json();
      const userId = payload.sub;

      const userResponse = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.ok) {
        const user = await userResponse.json();
        setUserData(user);
        showNotification('Datos de usuario cargados correctamente', 'success');
      } else {
        throw new Error('Error al obtener datos del usuario');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Error de conexión');
      showNotification('Error al cargar los datos del usuario', 'error');
      if (error instanceof Error && error.message.includes('Token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'perfil', 
      label: 'Perfil', 
      icon: <User className="w-5 h-5" />,
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
        {/* Header elegante */}
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
                <User className="w-5 h-5 text-white" />
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

          {/* Estado de error */}
          {error && (
            <div className="mt-6 inline-flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-rose-200 dark:border-rose-700 shadow-lg max-w-md mx-auto">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <p className="text-rose-700 dark:text-rose-400 font-medium text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Contenedor principal con diseño de pestañas lateral */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel lateral de navegación */}
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

              {/* Información de seguridad */}
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

          {/* Contenido principal */}
          <div className="flex-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 dark:border-slate-700 overflow-hidden">
              {/* Header del contenido */}
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

              {/* Contenido de la pestaña */}
              <div className="p-6">
                <div className="animate-fade-in-up">
                  {activeTab === 'perfil' && userData && (
                    <UserProfileSection userData={userData} onUpdate={fetchUserData} />
                  )}
                  {activeTab === 'seguridad' && <SecuritySettings />}
                  {activeTab === 'notificaciones' && <NotificationSettings />}
                  {activeTab === 'privacidad' && <PrivacySettings />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer informativo */}
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