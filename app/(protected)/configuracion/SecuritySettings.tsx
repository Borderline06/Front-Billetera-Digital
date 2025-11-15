'use client';

import { useState } from 'react';

export default function SecuritySettings() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Primero necesitamos obtener el user_id del token
      const verifyResponse = await fetch('http://localhost:8000/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!verifyResponse.ok) {
        throw new Error('Token inválido');
      }

      // Nota: En tu backend actual no existe el endpoint para cambiar contraseña
      // Esto es un placeholder para cuando lo implementes
      setSuccess('Funcionalidad de cambio de contraseña próximamente disponible');
      
      // Simular éxito
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setSuccess(null);
      }, 2000);

    } catch (error) {
      console.error('Error changing password:', error);
      setError(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePasswordForm = () => {
    setShowChangePassword(false);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Seguridad</h2>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
          <p className="text-green-700 font-medium">✅ {success}</p>
        </div>
      )}

      {/* Cambio de Contraseña */}
      <div className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">Contraseña</h3>
            <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente</p>
          </div>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Cambiar Contraseña
          </button>
        </div>

        {showChangePassword && (
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                required
                disabled={loading}
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                required
                disabled={loading}
                minLength={8}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                required
                disabled={loading}
                minLength={8}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </span>
                ) : (
                  'Actualizar Contraseña'
                )}
              </button>
              <button
                type="button"
                onClick={handleClosePasswordForm}
                disabled={loading}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Autenticación de Dos Factores */}
      <div className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">Autenticación de Dos Factores</h3>
            <p className="text-sm text-gray-600">Añade una capa extra de seguridad</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 bg-yellow-100 px-2 py-1 rounded">Próximamente</span>
            <button
              disabled={true}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Sesiones Activas */}
      <div className="bg-gray-50 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100">
        <h3 className="font-medium text-gray-800 mb-4">Sesión Actual</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <div>
              <p className="font-medium">Sesión Activa</p>
              <p className="text-sm text-gray-600">Dispositivo actual • Conectado ahora</p>
            </div>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors duration-300"
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}