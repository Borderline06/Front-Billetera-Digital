// src/app/(protected)/groups/[id]/page.tsx (Versión Completa y Corregida)
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Hook para leer la URL y redirigir
import Link from 'next/link';
import RequestWithdrawalModal from './RequestWithdrawalModal'; // Importamos el modal de solicitud

// --- Definimos las plantillas de datos ---
interface GroupMember {
  user_id: number;
  name: string;
  role: 'leader' | 'member';
  status: 'pending' | 'active';
  internal_balance: number; 
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
  user_id: number; 
}

interface WithdrawalRequest {
  id: number;
  member_user_id: number;
  amount: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
}

const API_GATEWAY_URL = 'http://localhost:8080';

export default function GroupDetailPage() {
  const params = useParams(); 
  const router = useRouter(); 
  const groupId = params.id; 

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [balance, setBalance] = useState<GroupBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ¡CORRECCIÓN! Solo UNA definición de 'isLeader' ---
  const [isLeader, setIsLeader] = useState(false); 
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;
  const myUserId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('pixel-user-id') || '0') : 0;

  // --- 1. FUNCIÓN DE CARGA ---
  const fetchGroupData = async () => {
    if (!groupId || !token) return; 
    
    setLoading(true);
    setError(null); 
    try {
      const [groupRes, balanceRes, transactionsRes] = await Promise.all([
        fetch(`${API_GATEWAY_URL}/groups/${groupId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_GATEWAY_URL}/group_balance/${groupId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_GATEWAY_URL}/ledger/transactions/group/${groupId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
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

      // --- ¡CORRECCIÓN! Seteamos el estado 'isLeader' aquí ---
      const leaderCheck = groupData.leader_user_id === myUserId;
      setIsLeader(leaderCheck); 

      // --- PASO 4: Si somos el líder, buscamos las solicitudes pendientes ---
      if (leaderCheck) {
        const requestsRes = await fetch(`${API_GATEWAY_URL}/groups/${groupId}/withdrawal-requests`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!requestsRes.ok) throw new Error(await requestsRes.json().then(d => d.detail || 'Error al cargar solicitudes'));
        const requestsData = await requestsRes.json();
        setRequests(requestsData);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. USEEFFECT (Llama a la función de carga) ---
  useEffect(() => {
    fetchGroupData();
  }, [groupId, token]); // Se ejecuta si el ID del grupo o el token cambian

  
  // --- 3. LÓGICA DE ACCIONES ---
  const handleLeaveGroup = async () => {
    if (!group) return;
    if (!window.confirm("¿Estás seguro de que quieres salir de este grupo? Esta acción no se puede deshacer.")) return;
    
    setLoading(true); 
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/me/leave/${group.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.json().then(d => d.detail || 'Error al salir'));
      alert("Has salido del grupo.");
      router.push('/groups'); 
    } catch (err: any) {
      setError(err.message); 
      setLoading(false);
    }
  };

  const handleKickMember = async (memberToKick: GroupMember) => {
    if (!group) return;
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${memberToKick.name} del grupo?`)) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}/kick/${memberToKick.user_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.json().then(d => d.detail || 'Error al eliminar'));
      alert(`${memberToKick.name} ha sido eliminado.`);
      fetchGroupData(); // Refresca
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    if (!window.confirm("¿Estás seguro de que quieres BORRAR este grupo? Esta acción es PERMANENTE.")) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.json().then(d => d.detail || 'Error al borrar'));
      alert("El grupo ha sido eliminado exitosamente.");
      router.push('/groups'); 
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    if (!group) return;
    if (!window.confirm("¿Seguro que quieres APROBAR este retiro? El dinero se moverá inmediatamente.")) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}/approve-withdrawal/${requestId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.json().then(d => d.detail || 'Error al aprobar'));
      alert("¡Retiro Aprobado! El dinero ha sido transferido.");
      fetchGroupData(); // Refresca toda la página
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!group) return;
    if (!window.confirm("¿Seguro que quieres RECHAZAR este retiro?")) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}/reject-withdrawal/${requestId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.json().then(d => d.detail || 'Error al rechazar'));
      alert("Solicitud Rechazada.");
      fetchGroupData(); // Refresca toda la página
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 6. RENDERIZADO ---
  if (loading && !group) return <p className="text-gray-500">Cargando detalles del grupo...</p>;
  if (error && !group) return <p className="text-red-500">{error}</p>;
  if (!group || !balance) return <p className="text-gray-500">No se encontraron datos del grupo.</p>;

  // ¡YA NO SE NECESITA! 'isLeader' ahora es un estado
  // const isLeader = group?.leader_user_id === myUserId; 

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b">
        <div className="flex justify-between items-center">
          <Link href="/groups" className="text-sm text-indigo-600 hover:underline">&larr; Volver a Mis Grupos</Link>
          
          {!isLeader && (
            <button
              onClick={handleLeaveGroup}
              disabled={loading} 
              className="bg-red-100 text-red-700 text-sm font-medium py-1 px-3 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              Salir del Grupo
            </button>
          )}
          {isLeader && (
            <button
              onClick={handleDeleteGroup}
              disabled={loading}
              className="bg-red-600 text-white text-sm font-medium py-1 px-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Borrar Grupo
            </button>
          )}
        </div>

        <h1 className="text-3xl font-bold mt-2">{group.name}</h1>
        <p className="text-lg text-gray-600">Líder: {group.members.find(m => m.role === 'leader')?.name || `Usuario ID ${group.leader_user_id}`} {isLeader && "(Tú)"}</p>
      </div>

      {/* Mostrar error de 'kick', 'leave', 'approve', 'reject' aquí */}
      {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">¡Error! </strong>
            <span className="block sm:inline">{error}</span>
         </div>
      )}

      {/* Saldo del Grupo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-500">SALDO TOTAL DEL GRUPO</h2>
          {!isLeader && (
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="text-sm bg-indigo-100 text-indigo-700 font-medium py-1 px-3 rounded-lg hover:bg-indigo-200"
            >
              Solicitar Retiro
            </button>
          )}
        </div>
        <p className="text-4xl font-bold text-indigo-700 mt-2">
          S/ {balance.balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Panel de Aprobación del Líder */}
      {isLeader && (
        <div className="bg-white p-6 rounded-lg shadow border border-yellow-300">
          <h2 className="text-xl font-semibold mb-4">Solicitudes Pendientes (Líder)</h2>
          {requests.filter(r => r.status === 'pending').length === 0 ? (
            <p className="text-gray-500">No hay solicitudes pendientes.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {requests.filter(r => r.status === 'pending').map((req) => {
                const memberName = group.members.find(m => m.user_id === req.member_user_id)?.name || `ID ${req.member_user_id}`;
                return (
                  <li key={req.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-indigo-700">
                          {memberName} solicita S/ {req.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600 italic">
                          Razón: "{req.reason || 'N/A'}"
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(req.created_at).toLocaleString('es-PE')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleRejectRequest(req.id)}
                          disabled={loading}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded"
                        >
                          Rechazar
                        </button>
                        <button 
                          onClick={() => handleApproveRequest(req.id)}
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded"
                        >
                          Aprobar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

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
                <p className={`text-sm font-mono ${member.internal_balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                  Saldo Interno: S/ {member.internal_balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {member.status}
                </span>
                {isLeader && member.user_id !== myUserId && (
                  <button
                    onClick={() => handleKickMember(member)}
                    disabled={loading}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Historial de Aportes del Grupo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Historial de Movimientos del Grupo</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Aún no hay movimientos en este grupo.</p>
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
                    {isContribution ? 'Aporte de' : 'Retiro aprobado para'} <strong>{memberName}</strong>
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
      
      {/* Modal de Solicitud de Retiro */}
      <RequestWithdrawalModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        group={{ id: group.id, name: group.name }}
        onRequestSuccess={() => {
          fetchGroupData(); // Refresca todo
        }}
      />
    </div>
  );
}