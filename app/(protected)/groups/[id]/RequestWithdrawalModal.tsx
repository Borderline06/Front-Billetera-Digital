// src/app/(protected)/groups/[id]/RequestWithdrawalModal.tsx
'use client';
import { useState } from 'react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSuccess: () => void;
  group: { id: number; name: string };
}

export default function RequestWithdrawalModal({
  isOpen,
  onClose,
  onRequestSuccess,
  group
}: RequestModalProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}/request-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          reason: reason
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Error al crear la solicitud');
      }

      onRequestSuccess(); // Refresca la página de detalles
      onClose();
      setAmount('');
      setReason('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Solicitar Retiro de {group.name}</h2>
        <form onSubmit={handleSubmit}>
          {/* Monto */}
          <div>
            <label htmlFor="amount_req" className="block text-sm font-medium text-gray-700">
              Monto a Retirar (S/)
            </label>
            <input
              id="amount_req" type="number" step="0.01" required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ej: 50.00"
            />
          </div>
          {/* Razón */}
          <div className="mt-4">
            <label htmlFor="reason_req" className="block text-sm font-medium text-gray-700">
              Razón (Opcional)
            </label>
            <input
              id="reason_req" type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ej: Para la cena"
            />
          </div>
          {/* Botones */}
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500">
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
          {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}