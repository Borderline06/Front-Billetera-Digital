'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DepositModal from './depositmodal';

interface DailyBalance {
  date: string;
  balance: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  created_at: string;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [dailyBalance, setDailyBalance] = useState<DailyBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;

  // Función para recargar datos luego de un depósito
  const refreshData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [balanceRes, dailyRes, txRes] = await Promise.all([
        fetch('http://localhost:8080/balance/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:8080/ledger/analytics/daily_balance/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:8080/ledger/transactions/me', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const balanceData = await balanceRes.json();
      const dailyData = await dailyRes.json();
      const txData = await txRes.json();

      setBalance(balanceData.balance ?? 0);

      // Si el backend no devuelve un array, adaptamos
      const parsedDaily = Array.isArray(dailyData)
        ? dailyData
        : dailyData?.daily_balance || [];

      setDailyBalance(parsedDaily);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [token]);

  if (loading) return <p className="text-center mt-20">Cargando datos...</p>;

  const ingresos = dailyBalance.length
    ? dailyBalance[dailyBalance.length - 1].balance - Math.min(...dailyBalance.map(d => d.balance))
    : 0;
  const egresos = ingresos > 0 ? ingresos * 0.4 : 0; // Ejemplo temporal

  return (
    <div className="space-y-8">
      {/* MODAL DE DEPÓSITO */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDepositSuccess={refreshData}
      />

      {/* Resumen superior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 text-sm">Saldo actual</h3>
          <p className="text-2xl font-semibold">${balance.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 text-sm">Ingresos (últimos 30 días)</h3>
          <p className="text-2xl font-semibold text-green-600">+${ingresos.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 text-sm">Egresos (últimos 30 días)</h3>
          <p className="text-2xl font-semibold text-red-600">-${egresos.toFixed(2)}</p>
        </div>
      </div>

      {/* Botón Depositar encima del gráfico */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Evolución del saldo (30 días)</h3>
        <button
          onClick={() => setIsDepositOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          + Depositar
        </button>
      </div>

      {/* Gráfico de saldo diario */}
      <div className="bg-white p-4 rounded-xl shadow">
        {dailyBalance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyBalance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-12">
            Aún no hay datos de saldo para mostrar.
          </p>
        )}
      </div>

      {/* Últimas transacciones */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Últimas transacciones</h3>
        {transactions.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600 border-b">
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td>{tx.type}</td>
                  <td
                    className={
                      tx.type.includes('SENT') || tx.type === 'WITHDRAWAL'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }
                  >
                    {tx.type.includes('SENT') || tx.type === 'WITHDRAWAL'
                      ? '-'
                      : '+'}
                    ${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No se encontraron transacciones recientes.
          </p>
        )}
      </div>
    </div>
  );
}
