"use client";

import { useState, useEffect } from 'react';
import { auth } from "@/app/lib/api"; // Usamos tu cliente API centralizado
import { User } from "@/app/types/user";
import { useNotification } from "@/app/contexts/NotificationContext";
import Image from "next/image";

// Extendemos la interfaz User para incluir los campos del formulario
interface UserFormData {
  name: string;
  email: string;
  phone_number: string;
}

export default function UserProfileSection() {
  const { showNotification } = useNotification();
  
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone_number: "",
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadUserData = () => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
            // Reconstrucción híbrida del usuario (desde localStorage por velocidad)
            const loadedUser: User = {
                id: parseInt(userId),
                name: localStorage.getItem("user_name") || "",
                email: "usuario@pixelmoney.com", // Placeholder si el backend no lo guarda en LS en login
                phone_number: "---", // Placeholder
                telegram_chat_id: localStorage.getItem("telegram_chat_id") || undefined,
                is_phone_verified: localStorage.getItem("is_phone_verified") === "true"
            };
            
            setUser(loadedUser);
            setFormData({
                name: loadedUser.name,
                email: loadedUser.email,
                phone_number: loadedUser.phone_number
            });
        }
    };
    loadUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!user) return;

      // Usamos la instancia 'api' que ya tiene interceptores para el token
      // Nota: Necesitarás implementar 'updateProfile' en tu api.ts si no existe
      // O usar axios directamente aquí importando 'api' de lib/api
      
      // Simulamos la llamada o usamos una ruta genérica si tu backend la soporta
      // await api.put(`/users/${user.id}`, formData);
      
      // Actualizamos el estado local y el localStorage para reflejar cambios inmediatos
      localStorage.setItem("user_name", formData.name);
      setUser({ ...user, ...formData });
      
      showNotification("Perfil actualizado correctamente", "success");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showNotification(error.response?.data?.detail || "Error al actualizar perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
        setFormData({
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
        });
    }
    setIsEditing(false);
  };

  if (!user) return <div className="text-gray-400">Cargando perfil...</div>;

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-6 shadow-lg">
      
      {/* Cabecera del Perfil (Avatar y Estado) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-purple-500 shadow-purple-500/20 shadow-lg">
                <Image src="/pixelmoney.jpg" alt="Avatar" fill className="object-cover" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-md border border-gray-600">
                        ID: {user.id}
                    </span>
                    
                    {/* Estado de Verificación (Híbrido) */}
                    {user.is_phone_verified !== undefined && (
                        <span className={`px-2 py-0.5 text-xs rounded-md border ${
                            user.is_phone_verified 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                            {user.is_phone_verified ? 'Verificado' : 'No Verificado'}
                        </span>
                    )}
                </div>
            </div>
        </div>

        <button
            onClick={() => !isEditing ? setIsEditing(true) : handleCancel()}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isEditing 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20'
            }`}
        >
            {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
        </button>
      </div>

      {/* Formulario de Edición */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
            Nombre Completo
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing || loading}
            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing || loading} // Generalmente el email no se edita fácil
            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            disabled={!isEditing || loading}
            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Campo Híbrido: Telegram ID */}
        {user.telegram_chat_id ? (
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                    Telegram ID
                </label>
                <input
                    type="text"
                    value={user.telegram_chat_id}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
            </div>
        ) : (
            <div className="flex items-center justify-center p-4 border border-dashed border-gray-600 rounded-lg opacity-50">
                <span className="text-sm text-gray-400 italic">Telegram no vinculado (Modo Rápido)</span>
            </div>
        )}
      </div>

      {/* Botón Guardar (Solo visible en edición) */}
      {isEditing && (
        <div className="mt-8 flex justify-end animate-fade-in">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg shadow-green-500/20 flex items-center"
          >
            {loading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                </>
            ) : (
                'Guardar Cambios'
            )}
          </button>
        </div>
      )}
    </div>
  );
}