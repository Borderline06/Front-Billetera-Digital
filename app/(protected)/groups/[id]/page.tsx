// src/app/(protected)/groups/[id]/page.tsx (Versión Completa y Corregida)
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Hook para leer la URL y redirigir
import Link from 'next/link';

// --- Definimos las plantillas de datos ---
interface GroupMember {
  user_id: number;
  name: string;
  role: 'leader' | 'member';
  status: 'pending' | 'active';
  internal_balance: number; // ¡Lo añadimos para la lógica de deuda!
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
  const params = useParams(); 
  const router = useRouter(); // <-- ¡Necesario para "Salir del Grupo"!
  const groupId = params.id; 

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [balance, setBalance] = useState<GroupBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;
  const myUserId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('pixel-user-id') || '0') : 0;

  // --- 1. FUNCIÓN DE CARGA (DEFINIDA FUERA DEL USEEFFECT) ---
  // (La movemos aquí para que 'handleKickMember' pueda llamarla)
  const fetchGroupData = async () => {
    if (!groupId || !token) return; 
    
    setLoading(true);
    // No reseteamos el error aquí para que los errores de 'kick' se sigan viendo
    // setError(null); 
    try {
      // Hacemos las 3 llamadas a la API al mismo tiempo
      const [groupRes, balanceRes, transactionsRes] = await Promise.all([
        fetch(`${API_GATEWAY_URL}/groups/${groupId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_GATEWAY_URL}/group_balance/${groupId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_GATEWAY_URL}/ledger/transactions/group/${groupId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (!groupRes.ok) throw new Error(await groupRes.json().then(d => d.detail || 'Error al obtener detalles'));
      if (!balanceRes.ok) throw new Error(await balanceRes.json().then(d => d.detail || 'Error al obtener saldo'));
      if (!transactionsRes.ok) throw new Error(await transactionsRes.json().then(d => d.detail || 'Error al obtener historial'));

      const groupData = await groupRes.json();
      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      setGroup(groupData);
      setBalance(balanceData);
      setTransactions(transactionsData);
      setError(null); // Limpiamos el error si todo salió bien

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. USEEFFECT (AHORA SOLO LLAMA A LA FUNCIÓN) ---
  useEffect(() => {
    fetchGroupData();
  }, [groupId, token]); // Se ejecuta si el ID del grupo o el token cambian

  
  // --- 3. LÓGICA PARA "SALIR DEL GRUPO" (DE PASO 166) ---
  const handleLeaveGroup = async () => {
    if (!group) return;
    if (!window.confirm("¿Estás seguro de que quieres salir de este grupo? Esta acción no se puede deshacer.")) {
      return;
    }
    
    setLoading(true); // Bloquea la página
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/me/leave/${group.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        // ¡Aquí mostramos la restricción de deuda!
        throw new Error(data.detail || 'Error al intentar salir del grupo');
      }
      
      alert("Has salido del grupo.");
      router.push('/groups'); // Redirige de vuelta a la lista de grupos
      
    } catch (err: any) {
      setError(err.message); // Muestra el error
      setLoading(false); // Desbloquea la página si hay error
    }
    // No ponemos 'finally' setLoading(false) porque la página va a redirigir
  };

  // --- 4. LÓGICA PARA "ELIMINAR MIEMBRO" (DE PASO 166) ---
  const handleKickMember = async (memberToKick: GroupMember) => {
    if (!group) return;
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${memberToKick.name} del grupo?`)) {
      return;
    }

    setLoading(true); // Mostramos un "cargando" general
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}/kick/${memberToKick.user_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
         // ¡Aquí mostramos la restricción de deuda!
        throw new Error(data.detail || 'Error al eliminar miembro');
      }
      
      alert(`${memberToKick.name} ha sido eliminado.`);
      // Refrescamos los datos para que la lista de miembros se actualice
      fetchGroupData(); // ¡Llama a la función que SÍ existe!
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false); // Desbloquea la página
    }
  };

  // --- 5. RENDERIZADO ---
  const isLeader = group?.leader_user_id === myUserId;

  if (loading && !group) return <p className="text-gray-500">Cargando detalles del grupo...</p>;
  // Muestra el error principal si falló la carga
  if (error && !group) return <p className="text-red-500">{error}</p>;
  if (!group || !balance) return <p className="text-gray-500">No se encontraron datos del grupo.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b">
        {/* --- CONTENEDOR DE BOTONES (DE PASO 166) --- */}
        <div className="flex justify-between items-center">
          <Link href="/groups" className="text-sm text-indigo-600 hover:underline">&larr; Volver a Mis Grupos</Link>
          
          {/* --- BOTÓN SALIR DEL GRUPO (DE PASO 166) --- */}
          {!isLeader && (
            <button
              onClick={handleLeaveGroup}
              disabled={loading} // Deshabilitar si algo está cargando
              className="bg-red-100 text-red-700 text-sm font-medium py-1 px-3 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              Salir del Grupo
            </button>
          )}
        </div>
        {/* --- FIN DEL CONTENEDOR --- */}

        <h1 className="text-3xl font-bold mt-2">{group.name}</h1>
        <p className="text-lg text-gray-600">Líder: {group.members.find(m => m.role === 'leader')?.name || `Usuario ID ${group.leader_user_id}`} {isLeader && "(Tú)"}</p>
      </div>

      {/* Mostrar error de 'kick' o 'leave' aquí */}
      {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">¡Error! </strong>
            <span className="block sm:inline">{error}</span>
         </div>
      )}

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
                {/* ¡Mostramos el saldo interno (deuda)! */}
                <p className={`text-sm font-mono ${member.internal_balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                  Saldo Interno: S/ {member.internal_balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* --- CONTENEDOR DE STATUS Y BOTÓN (DE PASO 166) --- */}
              <div className="flex items-center space-x-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {member.status}
                </span>

                {/* --- BOTÓN ELIMINAR (DE PASO 166) --- */}
                {isLeader && member.user_id !== myUserId && (
                  <button
                    onClick={() => handleKickMember(member)}
                    disabled={loading} // Deshabilitar si algo está cargando
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              {/* --- FIN DEL CONTENEDOR --- */}
            </li>
          ))}
        </ul>
      </div>

      {/* Historial de Aportes del Grupo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Historial de Aportes</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Aún no hay aportes en este grupo.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((tx) => {
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
      </div>
      
    </div>
  );
}