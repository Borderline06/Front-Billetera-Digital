// src/app/(protected)/groups/[id]/LeaderWithdrawalModal.tsx
'use client';
import { useState } from 'react';

interface LeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawalSuccess: () => void;
  group: { id: number; name: string };
}

export default function LeaderWithdrawalModal({
  isOpen,
  onClose,
  onWithdrawalSuccess,
  group
}: LeaderModalProps) {
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
      // --- ¡ENDPOINT CAMBIADO! ---
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}/leader-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          reason: `Retiro de líder: ${reason}`
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        // ¡Capturará "Insufficient funds" si el GRUPO no tiene dinero!
        throw new Error(data.detail || 'Error al procesar el retiro');
      }

      onWithdrawalSuccess(); // Refresca la página de detalles
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
        <h2 className="text-xl font-bold mb-4">Retiro de Líder (a BDI)</h2>
        <p className="text-lg text-gray-500 mb-4">Desde: {group.name}</p>
        <form onSubmit={handleSubmit}>
          {/* Monto */}
          <div>
            <label htmlFor="amount_lead" className="block text-sm font-medium text-gray-700">
              Monto a Retirar (S/)
            </label>
            <input
              id="amount_lead" type="number" step="0.01" required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ej: 50.00"
            />
          </div>
          {/* Razón */}
          <div className="mt-4">
            <label htmlFor="reason_lead" className="block text-sm font-medium text-gray-700">
              Razón (Opcional)
            </label>
            <input
              id="reason_lead" type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ej: Pago de servicios"
            />
          </div>
          {/* Botones */}
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
              {loading ? 'Transfiriendo...' : 'Confirmar Retiro'}
            </button>
          </div>
          {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}