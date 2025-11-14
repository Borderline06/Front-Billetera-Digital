// src/app/dashboard/CreateGroupModal.tsx
'use client';

import { useState } from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void; // Para refrescar la lista de grupos (en el futuro)
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!groupName) {
      setError('El nombre del grupo no puede estar vacío.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    try {
      // 1. Llamar al endpoint de crear grupo
      const response = await fetch(`${API_GATEWAY_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          // No necesitamos idempotencia aquí (generalmente)
        },
        body: JSON.stringify({ 
          name: groupName 
          // ¡El user_id (líder) lo inyecta el Gateway!
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al crear el grupo');
      }

      // ¡ÉXITO!
      console.log('Grupo creado:', data);
      onGroupCreated(); // Avisa al dashboard que refresque
      onClose(); // Cierra el modal
      setGroupName(''); // Limpia el input

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Crear Nuevo Grupo</h2>
        <form onSubmit={handleSubmit}>
          {/* Campo de Nombre del Grupo */}
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-300"
            >
              Nombre del Grupo
            </label>
            <input
              id="groupName"
              name="groupName"
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Junta Fin de Semana"
            />
          </div>

          {/* Botones */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500"
            >
              {loading ? 'Creando...' : 'Crear Grupo'}
            </button>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <p className="mt-4 text-center text-sm text-red-400">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}