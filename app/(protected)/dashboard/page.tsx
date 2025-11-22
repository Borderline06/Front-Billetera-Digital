'use client';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FaCreditCard, FaArrowUp, FaArrowDown, FaPiggyBank, FaChartLine, FaArrowRightArrowLeft, FaMoneyBillWave, FaWallet, FaArrowTrendUp } from 'react-icons/fa6';
import { TbSend, TbPigMoney } from 'react-icons/tb';
import { useNotification } from '../../contexts/NotificationContext';
import LoanModal from './depositmodal';

interface DailyBalance {
  date: string;
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  status: string;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [dailyBalance, setDailyBalance] = useState<DailyBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const { showNotification } = useNotification();

  const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;

  const typeLabels: Record<string, string> = {
    DEPOSIT: 'Depósito',
    P2P_SENT: 'Transferencia enviada',
    P2P_RECEIVED: 'Transferencia recibida',
    CONTRIBUTION_SENT: 'Aporte a grupo',
    WITHDRAWAL: 'Retiro',
    TRANSFER: 'Transferencia',
  };

  const categoryData = [
    { name: 'Compras', value: 45, color: '#ef4444' },
    { name: 'Alimentación', value: 25, color: '#10b981' },
    { name: 'Transporte', value: 15, color: '#0ea5e9' },
    { name: 'Entretenimiento', value: 10, color: '#8b5cf6' },
    { name: 'Otros', value: 5, color: '#f59e0b' },
  ];

  const refreshData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [balanceRes, dailyRes, txRes] = await Promise.all([
        fetch('https://pixel-money.koyeb.app/balance/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('https://pixel-money.koyeb.app/ledger/analytics/daily_balance/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://pixel-money.koyeb.app/ledger/transactions/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      if (!balanceRes.ok) throw new Error('Error al cargar el saldo');
      if (!dailyRes.ok) throw new Error('Error al cargar el gráfico');
      if (!txRes.ok) throw new Error('Error al cargar transacciones');

      const balanceData = await balanceRes.json();
      const dailyData = await dailyRes.json();
      const txData = await txRes.json();

      setBalance(balanceData.balance ?? 0);
      const parsedDaily = Array.isArray(dailyData) ? dailyData : dailyData?.daily_balance || [];
      setDailyBalance(parsedDaily);
      setTransactions(Array.isArray(txData) ? txData : []);

    } catch (err) {
      console.error('Error fetching dashboard data', err);
      showNotification('Error al cargar los datos del dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLoanSuccess = () => {
    refreshData();
    showNotification('¡Préstamo solicitado exitosamente!', 'success');
  };

  const ingresos = transactions
    .filter(tx => tx.status === 'COMPLETED' && (tx.type.includes('DEPOSIT') || tx.type.includes('RECEIVED')))
    .reduce((acc, tx) => acc + tx.amount, 0);
  
  const egresos = transactions
    .filter(tx => tx.status === 'COMPLETED' && (tx.type.includes('SENT') || tx.type.includes('WITHDRAWAL') || tx.type === 'TRANSFER'))
    .reduce((acc, tx) => acc + tx.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 p-6">
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onLoanSuccess={handleLoanSuccess}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-slate-800 dark:text-slate-100 tracking-tight mb-3">
            Dashboard Financiero
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Resumen completo de tu actividad financiera en tiempo real
          </p>
        </div>

        {/* Tarjeta de Saldo Principal */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/25 hover-lift transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaWallet className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-light opacity-90">Saldo Total</h2>
                  <p className="text-3xl lg:text-4xl font-bold mt-2">
                    S/ {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <p className="text-blue-100 text-sm">Saldo disponible en tu cuenta Pixel Money</p>
            </div>
            <div className="mt-6 lg:mt-0 lg:text-right">
              <div className="bg-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm inline-block">
                <p className="text-blue-100 text-sm font-mono">●●●● ●●●● ●●●● 3702</p>
                <p className="text-blue-200 text-xs mt-1">VISA • Pixel Money</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ingresos */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <FaArrowTrendUp className="text-emerald-600 dark:text-emerald-400 text-xl" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Ingresos Totales</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  +S/ {ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Egresos */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                <FaArrowTrendUp className="text-rose-600 dark:text-rose-400 text-xl rotate-180" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Egresos Totales</p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  -S/ {egresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Balance Neto */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-sky-600 dark:text-sky-400 text-xl" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Balance Neto</p>
                <p className={`text-2xl font-bold ${
                  (ingresos - egresos) >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  S/ {(ingresos - egresos).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción Rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                <TbPigMoney className="text-emerald-600 dark:text-emerald-400 text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Solicitar Préstamo</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Disponible</p>
              </div>
            </div>
          </button>

          <button className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300 group opacity-60 cursor-not-allowed">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center">
                <FaArrowDown className="text-sky-600 dark:text-sky-400 text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Retirar Fondos</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Próximamente</p>
              </div>
            </div>
          </button>

          <button className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300 group">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                <TbSend className="text-purple-600 dark:text-purple-400 text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Transferir</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Enviar P2P</p>
              </div>
            </div>
          </button>

          <button className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300 group">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
                <FaPiggyBank className="text-amber-600 dark:text-amber-400 text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Metas de Ahorro</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Ver objetivos</p>
              </div>
            </div>
          </button>
        </div>

        {/* Sección de Gráficos y Análisis */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Gráfico de Evolución de Saldo */}
          <div className="xl:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
                  <FaChartLine className="text-sky-600 dark:text-sky-400 text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Evolución de Saldo</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Historial de los últimos días</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-sky-500 text-white rounded-full font-medium">7D</button>
                <button className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">1M</button>
                <button className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">1A</button>
              </div>
            </div>

            {dailyBalance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyBalance}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `S/${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    }}
                    formatter={(value: number) => [`S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 'Saldo']}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#0ea5e9" 
                    fill="url(#colorBalance)" 
                    strokeWidth={3}
                    dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="text-slate-400 text-xl" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">Aún no hay datos suficientes para el gráfico.</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                  Realiza algunas transacciones para ver tu evolución
                </p>
              </div>
            )}
          </div>

          {/* Distribución de Gastos */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-purple-600 dark:text-purple-400 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Distribución de Gastos</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Por categorías</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${category.value}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-8 text-right">
                      {category.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Total gastado este mes</span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  S/ {egresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transacciones Recientes */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
                <FaArrowRightArrowLeft className="text-sky-600 dark:text-sky-400 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Transacciones Recientes</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Tu actividad más reciente</p>
              </div>
            </div>
            <span className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm px-3 py-1 rounded-full font-medium">
              {transactions.length} movimientos
            </span>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((tx) => {
                const isNegative = tx.type.includes('SENT') || tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER';
                const status = tx.status === 'COMPLETED' ? 'Completada' : 
                              tx.status.includes('PENDING') ? 'Pendiente' : 'Fallida';

                return (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                        isNegative ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                      }`}>
                        {isNegative ? 
                          <FaArrowUp className="text-rose-600 dark:text-rose-400 text-lg" /> : 
                          <FaArrowDown className="text-emerald-600 dark:text-emerald-400 text-lg" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {typeLabels[tx.type] || tx.type.toLowerCase().replace('_', ' ')}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {new Date(tx.created_at).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isNegative ? '-' : '+'}S/ {tx.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        status === 'Completada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        status === 'Pendiente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaArrowRightArrowLeft className="text-slate-400 text-xl" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No hay transacciones recientes</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Realiza tu primera transacción para verla aquí
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}