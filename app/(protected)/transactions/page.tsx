'use client';
// TransactionsPage.tsx

import { useState, useEffect } from 'react';
import P2PTransferModal from './P2PTransferModal';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Importamos iconos

// --- ¡INTERFAZ AÑADIDA! ---
// La plantilla de datos que esperamos del backend
interface Transaction {
  id: string; // Cassandra usa UUIDs (string)
  type: string;
  amount: number;
  created_at: string;
  status: string;
  source_wallet_id: string;
  destination_wallet_id: string;
}
// --- FIN DE INTERFAZ ---

// Diccionarios para "traducir" tipos
const typeLabels: Record<string, string> = {
  DEPOSIT: 'Recarga (Simulada)',
  P2P_SENT: 'Transferencia Enviada',
  P2P_RECEIVED: 'Transferencia Recibida',
  CONTRIBUTION_SENT: 'Aporte a Grupo',
  TRANSFER: 'Retiro (a banco)',
};

const statusLabels: Record<string, string> = {
  COMPLETED: 'Completada',
  PENDING: 'Pendiente',
  FAILED_FUNDS: 'Fondos Insuficientes',
  FAILED_RECIPIENT: 'Destinatario Falló',
};

export default function TransactionsPage() {
  // --- ESTADO CORREGIDO ---
  const [transactions, setTransactions] = useState<Transaction[]>([]); // <-- Ahora usa la interfaz
  const [loading, setLoading] = useState(true); // Estado de carga

  const fetchTransactions = async () => {
    setLoading(true); // Empezar a cargar
    const token = localStorage.getItem('pixel-token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/ledger/transactions/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar transacciones');
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // Terminar de cargar
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

return (
  <main className="p-6 text-gray-900 space-y-10">

    {/* Título principal */}
    <div>
      <h1 className="text-3xl font-bold">Transferencias</h1>
      <p className="text-gray-600">Envía dinero por celular y revisa tus movimientos recientes.</p>
    </div>

    {/* TITULO DEL FORMULARIO (SIN CARD) */}
    <div className="flex items-center gap-2">
      <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
      <h2 className="text-xl font-semibold">Nueva Transferencia P2P</h2>
    </div>

    {/* MODAL TAL CUAL, SIN ENVOLVERLO */}
    <P2PTransferModal onTransferSuccess={fetchTransactions} />

    {/* Título del historial */}
    <div className="flex items-center gap-2">
      <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
      <h2 className="text-xl font-semibold">Historial de Transacciones</h2>
    </div>

    {/* Tabla */}
    <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-indigo-50 border-b border-indigo-100">
          <tr>
            <th className="p-3 font-semibold text-indigo-700">Fecha</th>
            <th className="p-3 font-semibold text-indigo-700">Tipo</th>
            <th className="p-3 font-semibold text-indigo-700">Monto</th>
            <th className="p-3 font-semibold text-indigo-700">Origen/Destino</th>
            <th className="p-3 font-semibold text-indigo-700">Estado</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {loading ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                Cargando...
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No hay transacciones.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => {
              const isNegative = tx.type.includes("SENT") || tx.type.includes("TRANSFER");

              let description = "—";
              if (tx.type === "P2P_SENT") {
                description = `A BDI (ID: ${tx.destination_wallet_id})`;
              } else if (tx.type === "DEPOSIT") {
                description = "Recarga Externa";
              } else if (tx.type === "P2P_RECEIVED") {
                description = `De BDI (ID: ${tx.source_wallet_id})`;
              }

              const statusText = statusLabels[tx.status] || tx.status;

              return (
                <tr key={tx.id} className="hover:bg-indigo-50/40">
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(tx.created_at).toLocaleString("es-PE")}
                  </td>

                  <td className="p-3 font-medium">
                    {typeLabels[tx.type] || tx.type}
                  </td>

                  <td
                    className={`p-3 font-semibold ${
                      isNegative ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isNegative ? "-" : "+"}
                    S/{" "}
                    {tx.amount.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </td>

                  <td className="p-3 text-gray-700">{description}</td>

                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        statusText === "Completada"
                          ? "bg-green-100 text-green-700"
                          : statusText === "Pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {statusText}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </main>
);
}