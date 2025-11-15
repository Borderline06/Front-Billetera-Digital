// src/app/dashboard/DepositModal.tsx
'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // ¡Para la idempotencia!

// Definimos las "props" que este componente recibirá
interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void; // Función para cerrarse
  onLoanSuccess: () => void; // Función para refrescar el saldo
}

export default function LoanModal({ isOpen, onClose, onLoanSuccess }: LoanModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleLoanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
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

    // 1. Crear llave de idempotencia
    const idempotencyKey = uuidv4();

    try {
      const response = await fetch(`${API_GATEWAY_URL}/request-loan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey, // ¡Header clave!
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al procesar el préstamo');
      }

      // ¡ÉXITO!
      console.log('Préstamo exitoso:', data);
      onLoanSuccess(); // Llama a la función para refrescar el saldo
      onClose(); // Cierra el modal
      setAmount(''); // Limpia el input

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null; // No mostrar nada si no está abierto
  }

  // Este es el HTML del "pop-up"
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Solicitar Préstamo</h2>
        <form onSubmit={handleLoanRequest}>
          {/* Campo de Monto */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300"
            >
              Monto a Solicitar (S/)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01" // Permite decimales
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 100.00 (Máx. 500)"
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
              className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500"
            >
              {loading ? 'Procesando...' : 'Confirmar Préstamo'}
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