'use client';

import { useState, useEffect } from 'react';
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

      // Verificar el token primero para obtener el user_id
      const verifyResponse = await fetch('http://localhost:8000/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!verifyResponse.ok) {
        throw new Error('Token inválido o expirado');
      }

      const payload = await verifyResponse.json();
      const userId = payload.sub;

      // Ahora obtener los datos del usuario
      const userResponse = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      
      // Si hay error de autenticación, redirigir al login
      if (error instanceof Error && error.message.includes('Token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: '👤' },
    { id: 'seguridad', label: 'Seguridad', icon: '🔒' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '🔔' },
    { id: 'privacidad', label: 'Privacidad', icon: '👁️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración</h1>
          <p className="text-gray-600">Gestiona tu cuenta y preferencias</p>
          
          {userData && (
            <div className="mt-4 inline-block bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <p className="text-blue-700 font-medium">
                {userData.name} - {userData.email}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 inline-block bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <p className="text-red-700 font-medium">
                ⚠️ {error}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-slide-up">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fade-in">
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