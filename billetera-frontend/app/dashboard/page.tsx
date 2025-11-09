
'use client'; 

import Link from 'next/link';
import { useState, useEffect } from 'react';
import DepositModal from './depositmodal';
import P2PTransferModal from './P2PTransferModal';
import CreateGroupModal from './CreateGroupModal';

export default function DashboardPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isP2PModalOpen, setIsP2PModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // 1. Define la función para cargar TODOS los datos de la página
  const fetchPageData = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
  
      // Hacemos las 3 llamadas a la API al mismo tiempo
      const [balanceRes, transactionsRes, groupsRes] = await Promise.all([
        // 1. Saldo
        fetch('http://localhost:8080/balance/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        // 2. Movimientos
        fetch('http://localhost:8080/ledger/transactions/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        // 3. Mis Grupos 
        fetch('http://localhost:8080/groups/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      // Verificamos las 3 respuestas
      if (!balanceRes.ok) {
        const data = await balanceRes.json();
        throw new Error(data.detail || 'Error al obtener el saldo');
      }
      if (!transactionsRes.ok) {
        const data = await transactionsRes.json();
        throw new Error(data.detail || 'Error al obtener movimientos');
      }
     
      if (!groupsRes.ok) {
        const data = await groupsRes.json();
        
        throw new Error(data.detail[0]?.msg || data.detail || 'Error al obtener grupos'); 
      }

      // Extraemos los JSON
      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();
      const groupsData = await groupsRes.json(); 

      // ¡Éxito! Guardamos todo
      setBalance(balanceData.balance);
      setTransactions(transactionsData);
      setGroups(groupsData); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Usa useEffect para llamar a la función SÓLO al cargar la página
  useEffect(() => {
    fetchPageData();
  }, []); // El array vacío [] significa "ejecutar solo una vez"

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-indigo-400 mb-8">
        Mi Billetera Pixel
      </h1>

      {/* Grid Principal (max 2 columnas) */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* --- COLUMNA 1: BDI y BDG --- */}
        <div className="space-y-6">
        
          {/* Tarjeta de Saldo BDI */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              Mi Saldo (BDI)
            </h2>
            {loading && <p className="text-3xl text-gray-400">Cargando...</p>}
            {error && <p className="text-xl text-red-400">{error}</p>}
            {balance !== null && !loading && !error && (
              <p className="text-5xl font-bold text-green-400">
                S/ {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            )}
            <div className="mt-6 flex space-x-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Recargar Saldo (Sim)
              </button>
              <button 
                onClick={() => setIsP2PModalOpen(true)} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Transferir (P2P)
              </button>
            </div>
          </div>
          {/* --- Fin Tarjeta BDI --- */}

          {/* Tarjeta de Grupos (BDG) */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-300">
                Mis Grupos (BDG)
              </h2>
              <button 
                onClick={() => setIsCreateGroupModalOpen(true)}
                // ¡Botón REACTIVADO!
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Crear Grupo
              </button>
            </div>

            {/* Lista de Grupos */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {loading && <p className="text-gray-400">Cargando grupos...</p>}
              {!loading && groups.length === 0 && (
                <p className="text-gray-400">No eres miembro de ningún grupo.</p>
              )}
              {groups.map((group) => (
                <div key={group.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">{group.name}</p>
                    <p className="text-sm text-gray-400">{group.members.length} miembro(s)</p>
                  </div>
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-1 px-3 rounded">
                    Aportar
                  </button>
                </div>
              ))}
            </div>
            
          </div>
          {/* --- Fin Tarjeta BDG --- */}

        </div>
        {/* --- FIN COLUMNA 1 --- */}


        {/* --- COLUMNA 2: Historial de Movimientos --- */}
        <div className="w-full">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            Últimos Movimientos
          </h2>
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-h-[42rem] overflow-y-auto">
            {loading && <p className="text-gray-400">Cargando movimientos...</p>}
            {!loading && transactions.length === 0 && (
              <p className="text-gray-400">No tienes movimientos recientes.</p>
            )}
            <ul className="divide-y divide-gray-700">
              {transactions.map((tx) => (
                <li key={tx.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-white capitalize">
                      {tx.type.toLowerCase().replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.created_at).toLocaleString('es-PE')}
                    </p>
                  </div>
                  <p className={`text-xl font-semibold ${
                    tx.type === 'DEPOSIT' || (tx.type === 'P2P_RECEIVED') 
                    ? 'text-green-400' 
                    : 'text-red-400'
                  }`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'P2P_RECEIVED' ? '+' : '-'}
                    S/ {tx.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* --- FIN COLUMNA 2 --- */}

      </div>
      {/* --- Fin Grid Principal --- */}

      
      <div className="mt-12">
        <Link href="/" className="text-sm text-gray-400 hover:text-indigo-300">
          Cerrar Sesión
        </Link>
      </div>

      {/* --- MODALES (Van al final, fuera del 'main' visual) --- */}
      <DepositModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDepositSuccess={() => {
          fetchPageData(); 
        }}
      />
      
      <P2PTransferModal
        isOpen={isP2PModalOpen}
        onClose={() => setIsP2PModalOpen(false)}
        onTransferSuccess={() => {
          fetchPageData(); 
        }}
      />

      {/* Modal de Crear Grupo  */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onGroupCreated={() => {
          fetchPageData(); // Refresca todo (incluyendo la lista de grupos)
        }}
      />
      
    </main>
  );
}