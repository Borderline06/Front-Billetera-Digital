// src/app/dashboard/P2PTransferModal.tsx
'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Para la idempotencia

interface P2PTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferSuccess: () => void; // Para refrescar el saldo
}

export default function P2PTransferModal({ isOpen, onClose, onTransferSuccess }: P2PTransferModalProps) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
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
      // 2. Llamar al nuevo endpoint de P2P
      const response = await fetch(`${API_GATEWAY_URL}/ledger/transfer/p2p`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey, 
        },
        body: JSON.stringify({ 
          amount: transferAmount,
          destination_phone_number: phone 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ¡Aquí recibiremos "Fondos insuficientes" o "Usuario no encontrado"!
        throw new Error(data.detail || 'Error al procesar la transferencia');
      }

      // ¡ÉXITO!
      console.log('Transferencia P2P exitosa:', data);
      onTransferSuccess(); // Llama a la función para refrescar el saldo
      onClose(); // Cierra el modal
      setAmount('');
      setPhone('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null; // No mostrar nada si no está abierto
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Transferir a un Contacto</h2>
        <form onSubmit={handleSubmit}>
          {/* Campo de Celular */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300"
            >
              Celular del Destinatario
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="987654321"
            />
          </div>

          {/* Campo de Monto */}
          <div className="mt-4">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300"
            >
              Monto a Transferir (S/)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 50.00"
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
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500"
            >
              {loading ? 'Transfiriendo...' : 'Confirmar Transferencia'}
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