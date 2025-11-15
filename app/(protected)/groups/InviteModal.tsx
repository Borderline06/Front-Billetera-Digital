// src/app/(protected)/groups/InviteModal.tsx
'use client';

import { useState } from 'react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void; // Para refrescar la lista de miembros
  group: { id: number; name: string }; 
}

export default function InviteModal({
  isOpen,
  onClose,
  onInviteSuccess,
  group
}: InviteModalProps) {

  const [phoneToInvite, setPhoneToInvite] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    
    if (!phoneToInvite) { // <-- AÑADE ESTA LÍNEA
      setError('Por favor, ingresa un número de celular.'); // <-- AÑADE ESTA LÍNEA
      setLoading(false); // <-- AÑADE ESTA LÍNEA
      return; // <-- AÑADE ESTA LÍNEA
    } // <-- AÑADE ESTA LÍNEA

    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    try {
      // 1. Llamar al endpoint de invitación
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number_to_invite: phoneToInvite
          
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Recibirá 403 si no eres líder, 404 si el grupo no existe,
        // o 409 si el usuario ya es miembro.
        throw new Error(data.detail || 'Error al invitar al miembro');
      }

      console.log('Invitación exitosa:', data);
      onInviteSuccess(); // Llama a la función para refrescar
      onClose(); // Cierra el modal
      setPhoneToInvite('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Fondo oscuro semi-transparente
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Invitar Miembro a</h2>
        <p className="text-lg text-indigo-600 mb-4">{group.name}</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="phone_invite"
              className="block text-sm font-medium text-gray-700"
            >
              Celular del Usuario a Invitar
            </label>
            <input
              id="phone_invite" // <-- Cambiado
              name="phone_invite" // <-- Cambiado
              type="tel" // <-- ¡CAMBIADO!
              step="1"
              required
              value={phoneToInvite}
              onChange={(e) => setPhoneToInvite(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 987654321"
            />
            <p className="text-xs text-gray-500 mt-1">
              El usuario debe estar registrado en Pixel Money.
            </p>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500"
            >
              {loading ? 'Invitando...' : 'Invitar Usuario'}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}