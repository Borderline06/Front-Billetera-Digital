// src/app/(protected)/groups/[id]/page.tsx (Corregido)
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Hook para leer la URL
import Link from 'next/link';

// --- Definimos las plantillas de datos ---
interface GroupMember {
  user_id: number;
  name: string;
  role: 'leader' | 'member';
  status: 'pending' | 'active';
}

interface GroupDetails {
  id: number;
  name: string;
  leader_user_id: number;
  created_at: string;
  members: GroupMember[];
}

interface GroupBalance {
  group_id: number;
  balance: number;
  version: number;
}

interface Transaction {
  id: string; 
  type: string;
  amount: number;
  created_at: string;
  status: string;
  user_id: number; // ¡Lo necesitamos para saber QUIÉN aportó!
}

const API_GATEWAY_URL = 'http://localhost:8080';

export default function GroupDetailPage() {
  const params = useParams(); // Hook para leer el [id] de la URL
  const groupId = params.id; // ej. "1"

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [balance, setBalance] = useState<GroupBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;
  const myUserId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('pixel-user-id') || '0') : 0;

  useEffect(() => {
    if (!groupId || !token) return; // No hacer nada si no tenemos el ID o el token

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- ¡¡CORRECCIÓN #1!! ---
        // Ahora declaramos las 3 variables (groupRes, balanceRes, transactionsRes)
        const [groupRes, balanceRes, transactionsRes] = await Promise.all([
          // 1. Obtener detalles del grupo (nombre, miembros)
          fetch(`${API_GATEWAY_URL}/groups/${groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          // 2. Obtener saldo del grupo
          fetch(`${API_GATEWAY_URL}/group_balance/${groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          // 3. Obtener historial del grupo
          fetch(`${API_GATEWAY_URL}/ledger/transactions/group/${groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (!groupRes.ok) throw new Error(await groupRes.json().then(d => d.detail || 'Error al obtener detalles'));
        if (!balanceRes.ok) throw new Error(await balanceRes.json().then(d => d.detail || 'Error al obtener saldo'));
        if (!transactionsRes.ok) throw new Error(await transactionsRes.json().then(d => d.detail || 'Error al obtener historial'));

        const groupData = await groupRes.json();
        const balanceData = await balanceRes.json();
        const transactionsData = await transactionsRes.json(); // ¡Ahora 'transactionsRes' SÍ existe!

        setGroup(groupData);
        setBalance(balanceData);
        setTransactions(transactionsData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, token]); // Se ejecuta si el ID del grupo o el token cambian

  // --- Verificamos si el usuario actual es el líder ---
  const isLeader = group?.leader_user_id === myUserId;

  if (loading) return <p className="text-gray-500">Cargando detalles del grupo...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!group || !balance) return <p className="text-gray-500">No se encontraron datos del grupo.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b">
        <Link href="/groups" className="text-sm text-indigo-600 hover:underline">&larr; Volver a Mis Grupos</Link>
        <h1 className="text-3xl font-bold mt-2">{group.name}</h1>
        {/* Lógica mejorada para encontrar el nombre del líder */}
        <p className="text-lg text-gray-600">Líder: {group.members.find(m => m.role === 'leader')?.name || `Usuario ID ${group.leader_user_id}`} {isLeader && "(Tú)"}</p>
      </div>

      {/* Saldo del Grupo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-sm font-medium text-gray-500">SALDO TOTAL DEL GRUPO</h2>
        <p className="text-4xl font-bold text-indigo-700 mt-2">
          S/ {balance.balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </p>
        {/* Aquí irán los botones de "Aportar" y "Solicitar Retiro" */}
      </div>

      {/* Lista de Miembros */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Miembros ({group.members.length})</h2>
        <ul className="divide-y divide-gray-200">
          {group.members.map((member) => (
            <li key={member.user_id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {member.name}
                  {member.user_id === myUserId && " (Tú)"}
                </p>
                <p className={`text-sm ${member.role === 'leader' ? 'text-indigo-500' : 'text-gray-500'}`}>
                  {member.role}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {member.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* (Próximamente) Historial de Aportes del Grupo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Historial de Aportes</h2>

        {/* --- ¡NUEVA LISTA DE HISTORIAL! --- */}
        {transactions.length === 0 ? (
          <p className="text-gray-500">Aún no hay aportes en este grupo.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((tx) => {
              // Buscamos el nombre del miembro que aportó
              const memberName = group?.members.find(m => m.user_id === tx.user_id)?.name || `Usuario ID ${tx.user_id}`;
              const isContribution = tx.type === 'CONTRIBUTION_RECEIVED';

              return (
                <li key={tx.id} className="py-3">
                  <p className={`font-medium ${isContribution ? 'text-green-600' : 'text-red-600'}`}>
                    {isContribution ? '+' : '-'}
                    S/ {tx.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-700">
                    {isContribution ? 'Aporte de' : 'Retiro de'} <strong>{memberName}</strong>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleString('es-PE')}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {/* --- FIN DE LA LISTA --- */}

      </div>
      
      {/* --- ¡¡CORRECCIÓN #2!! ---
      // Se eliminó el ');' extra que estaba aquí
      */}
    </div>
  );
}