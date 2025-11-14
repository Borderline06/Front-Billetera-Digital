'use client';
import { useState, useEffect } from 'react';
import {ResponsiveContainer, AreaChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area} from "recharts";
import { FaPlusSquare, FaCreditCard, FaPlus, FaMinus, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { TbSend } from "react-icons/tb";

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

  
const typeLabels: Record<string, string> = {
  DEPOSIT: "Depósito",
  P2P_SENT: "Transferencia enviada",
  WITHDRAWAL: "Retiro",
};

const statusColors: Record<string, string> = {
  Completada: "bg-green-100 text-green-700",
  Pendiente: "bg-yellow-100 text-yellow-700",
  Fallida: "bg-red-100 text-red-700",
};


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

    {/* Tarjetas superiores (Saldo / Ingresos / Egresos) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-inner">
        <h3 className="text-gray-500 text-sm">Saldo Total</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          ${balance.toFixed(2)}
        </p>
      </div>


      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-inner">
        <h3 className="text-gray-500 text-sm">Ingresos (30 días)</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          +${ingresos.toFixed(2)}
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-inner">
        <h3 className="text-gray-500 text-sm">Egresos (30 días)</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          -${egresos.toFixed(2)}
        </p>
      </div>
    </div>

    {/* Botones: Depositar / Retirar / Enviar */}
<div className="flex gap-4 items-center">
  {/* Depositar */}
  <button
    onClick={() => setIsDepositOpen(true)}
    className="flex items-center gap-2 bg-indigo-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-800"
  >
    <FaCreditCard className="text-lg" />
    Depositar
  </button>

  {/* Retirar */}
  <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-100">
    Retirar
  </button>

  {/* Enviar a Happy Money */}
  <button className="flex items-center gap-2 text-indigo-900 font-medium hover:text-indigo-700">
    <TbSend className="text-xl" />
    Enviar a Happy Money
  </button>
</div>

    {/* Sección inferior: Actividad + Transacciones */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


{/* Actividad - Gráfico */}
<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-inner">
  <h3 className="text-gray-800 text-base font-semibold">Actividad</h3>

  {/* Monto y variación */}
  <div className="flex items-baseline gap-2 mt-2">
    <p className="text-3xl font-bold text-gray-900">${balance.toLocaleString()}</p>
  </div>
  <p className="text-gray-500 text-sm mb-4">Últimos 30 días</p>

  {dailyBalance.length > 0 ? (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={dailyBalance}>
        {/* Fondo degradado */}
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis hide />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
          formatter={(value: number) => `$${value.toFixed(2)}`}
        />

        {/* Área sombreada */}
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#1e3a8a"
          fill="url(#colorBalance)"
          fillOpacity={1}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-gray-500 text-center py-12">Aún no hay datos suficientes.</p>
  )}
</div>



      {/* Últimas transacciones */}

<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-inner">
  <h3 className="font-semibold text-lg mb-4 text-gray-800">Últimas Transacciones</h3>

  {transactions.length > 0 ? (
    <ul className="space-y-4">
      {transactions.slice(0, 8).map((tx) => {
        const isNegative = tx.type.includes("SENT") || tx.type === "WITHDRAWAL";
        const status =
          tx.type === "WITHDRAWAL"
            ? "Fallida"
            : tx.type.includes("PENDING")
            ? "Pendiente"
            : "Completada";

        const iconColor = isNegative
          ? "bg-red-100 text-red-600"
          : status === "Pendiente"
          ? "bg-yellow-100 text-yellow-600"
          : "bg-green-100 text-green-600";

        return (
          <li key={tx.id} className="flex items-center justify-between">
            {/* Ícono */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}>
              {isNegative ? <FaArrowDown className="text-lg" /> : <FaArrowUp className="text-lg" />}
            </div>

            {/* Detalles */}
            <div className="flex-1 ml-4">
              <p className="text-gray-800 font-medium">
                {typeLabels[tx.type] || tx.type}
              </p>
              <p className="text-gray-500 text-sm">
                {new Date(tx.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Monto y estado */}
            <div className="text-right">
              <p className={`text-lg font-semibold ${isNegative ? "text-red-600" : "text-green-600"}`}>
                {isNegative ? "-" : "+"}${tx.amount.toFixed(2)}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}>
                {status}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <p className="text-gray-500 text-center py-8">No hay transacciones.</p>
  )}
</div>

    </div>
  </div>
);
}