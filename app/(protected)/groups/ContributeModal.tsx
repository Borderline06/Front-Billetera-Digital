// src/app/(protected)/groups/ContributeModal.tsx
'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Para la idempotencia

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess: ()=> void; // Para refrescar los datos
  group: { id: number; name: string }; // Recibe el grupo al que se va a aportar
}

export default function ContributeModal({
  isOpen,
  onClose,
  onContributeSuccess,
  group
}: ContributeModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const contributeAmount = parseFloat(amount);
    if (isNaN(contributeAmount) || contributeAmount <= 0) {
      setError('Por favor, ingresa un monto válido.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    const idempotencyKey = uuidv4();

    try {
      const response = await fetch(`${API_GATEWAY_URL}/ledger/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          amount: contributeAmount,
          group_id: group.id
          // El user_id (quien aporta) lo inyecta el Gateway
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ¡Aquí recibiremos "Fondos insuficientes"!
        throw new Error(data.detail || 'Error al procesar el aporte');
      }

      console.log('Aporte a grupo exitoso:', data);
      onContributeSuccess(); // Llama a la función para refrescar
      onClose(); // Cierra el modal
      setAmount('');

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
        <h2 className="text-xl font-bold mb-2">Aportar al Grupo</h2>
        <p className="text-lg text-indigo-600 mb-4">{group.name}</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="amount_contribute"
              className="block text-sm font-medium text-gray-700"
            >
              Monto a Aportar (S/)
            </label>
            <input
              id="amount_contribute"
              name="amount_contribute"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 20.00"
            />
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
              className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500"
            >
              {loading ? 'Aportando...' : 'Confirmar Aporte'}
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