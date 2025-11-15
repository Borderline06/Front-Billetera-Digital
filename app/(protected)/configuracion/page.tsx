'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Bell, Eye, AlertTriangle } from 'lucide-react';
import UserProfileSection from './UserProfileSection';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';

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
      } else {
        throw new Error('Error al obtener datos del usuario');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Error de conexión');
      if (error instanceof Error && error.message.includes('Token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: <User className="w-5 h-5" /> },
    { id: 'seguridad', label: 'Seguridad', icon: <Lock className="w-5 h-5" /> },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-5 h-5" /> },
    { id: 'privacidad', label: 'Privacidad', icon: <Eye className="w-5 h-5" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-800 dark:text-gray-300 text-lg font-medium">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Configuración</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Gestiona tu cuenta y preferencias</p>

          {userData && (
            <div className="mt-4 inline-block bg-gray-200 dark:bg-gray-800 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
              <p className="text-blue-600 dark:text-blue-400 font-semibold">
                {userData.name} - {userData.email}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 inline-flex items-center gap-2 bg-red-100 dark:bg-red-900 px-6 py-3 rounded-xl border border-red-300 dark:border-red-700 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Contenedor Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm md:text-base font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-gray-100 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fade-in space-y-6">
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
  );
}
