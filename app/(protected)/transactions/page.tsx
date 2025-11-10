
'use client';
// TransactionsPage.tsx

import { useState, useEffect } from 'react';
import P2PTransferModal from './P2PTransferModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTransactions = async () => {
    const token = localStorage.getItem('pixel-token');
    if (!token) return;
    const res = await fetch('http://localhost:8080/ledger/transactions/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => { fetchTransactions(); }, []);

  return (
    <main className="p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Transferencias</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-6"
      >
        + Nueva Transferencia
      </button>

      <P2PTransferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onTransferSuccess={fetchTransactions} // refresca historial
      />

      <h2 className="text-xl font-semibold mb-3">Historial</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Fecha</th>
              <th className="p-3 border">Tipo</th>
              <th className="p-3 border">Monto</th>
              <th className="p-3 border">Destino</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="p-3 border">{new Date(tx.created_at).toLocaleString()}</td>
                <td className="p-3 border">{tx.type}</td>
                <td className="p-3 border">
                  {tx.type.includes('SENT') ? '-' : '+'}S/ {tx.amount.toFixed(2)}
                </td>
                <td className="p-3 border">{tx.recipient || tx.destination_phone_number || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
