'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface P2PTransferModalProps {
  onTransferSuccess: () => void;
}

export default function P2PTransferModal({ onTransferSuccess }: P2PTransferModalProps) {
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

    const idempotencyKey = uuidv4();

    try {
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
        throw new Error(data.detail || 'Error al procesar la transferencia');
      }

      onTransferSuccess();
      setAmount('');
      setPhone('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">

    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Celular del Destinatario</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-gray-50 shadow-inner focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
          placeholder="987654321"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monto (S/)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-gray-50 shadow-inner focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
          placeholder="Ej: 50.00"
          required
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium bg-red-50 border border-red-200 p-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-900 text-white py-2.5 rounded-xl font-semibold tracking-wide 
                   hover:bg-indigo-800 transition disabled:opacity-60"
      >
        {loading ? "Procesando..." : "Enviar Transferencia"}
      </button>
    </form>
  </div>
);
}
