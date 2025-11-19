'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RequestWithdrawalModal from './RequestWithdrawalModal';
import LeaderWithdrawalModal from './LeaderWithdrawalModal';
import { FaUsers, FaUserShield, FaHistory, FaArrowLeft, FaSignOutAlt, FaTrash, FaMoneyBillWave, FaUserPlus, FaCog } from 'react-icons/fa';

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
  const [isLeader, setIsLeader] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLeaderWithdrawalModalOpen, setIsLeaderWithdrawalModalOpen] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;
  const myUserId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('pixel-user-id') || '0') : 0;

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

      const leaderCheck = groupData.leader_user_id === myUserId;
      setIsLeader(leaderCheck);

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

  useEffect(() => {
    fetchGroupData();
  }, [groupId, token]);

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
      fetchGroupData();
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
      fetchGroupData();
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
      fetchGroupData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !group) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Cargando detalles del grupo...</p>
      </div>
    </div>
  );

  if (error && !group) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaUsers className="text-rose-500 text-xl" />
        </div>
        <p className="text-rose-600 dark:text-rose-400 text-lg">{error}</p>
      </div>
    </div>
  );

  if (!group || !balance) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaUsers className="text-slate-400 text-xl" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">No se encontraron datos del grupo.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/groups"
                className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/50 transition-colors"
              >
                <FaArrowLeft className="text-sm" />
              </Link>
              <div>
                <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100 tracking-tight">
                  {group.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Líder: <span className="font-medium">{group.members.find(m => m.role === 'leader')?.name || `Usuario ID ${group.leader_user_id}`}</span>
                  {isLeader && <span className="ml-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs px-2 py-1 rounded-full">Tú</span>}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {!isLeader ? (
                <button
                  onClick={handleLeaveGroup}
                  disabled={loading}
                  className="flex items-center gap-2 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-sm font-medium py-2 px-4 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-800/50 disabled:opacity-50 transition-colors border border-rose-200 dark:border-rose-800"
                >
                  <FaSignOutAlt className="text-xs" />
                  Salir del Grupo
                </button>
              ) : (
                <button
                  onClick={handleDeleteGroup}
                  disabled={loading}
                  className="flex items-center gap-2 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-sm font-medium py-2 px-4 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-800/50 disabled:opacity-50 transition-colors border border-rose-200 dark:border-rose-800"
                >
                  <FaTrash className="text-xs" />
                  Borrar Grupo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Columna Izquierda - Saldo y Acciones Rápidas */}
          <div className="xl:col-span-1 space-y-6">
            {/* Saldo del Grupo */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <FaMoneyBillWave className="text-white text-sm" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Saldo del Grupo
                </h2>
              </div>
              
              <p className="text-3xl font-light text-emerald-600 dark:text-emerald-400 mb-6">
                S/ {balance.balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>

              <div className="flex flex-col gap-3">
                {!isLeader ? (
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <FaUserPlus className="text-sm" />
                    Solicitar Retiro
                  </button>
                ) : (
                  <button
                    onClick={() => setIsLeaderWithdrawalModalOpen(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <FaMoneyBillWave className="text-sm" />
                    Retiro de Líder
                  </button>
                )}
              </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Resumen del Grupo</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Miembros</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{group.members.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Activos</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {group.members.filter(m => m.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Solicitudes Pendientes</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Contenido Principal */}
          <div className="xl:col-span-2 space-y-6">
            {/* Panel de Aprobación del Líder */}
            {isLeader && requests.filter(r => r.status === 'pending').length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <FaUserShield className="text-white text-sm" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Solicitudes Pendientes
                  </h2>
                </div>

                <div className="space-y-4">
                  {requests.filter(r => r.status === 'pending').map((req) => {
                    const memberName = group.members.find(m => m.user_id === req.member_user_id)?.name || `ID ${req.member_user_id}`;
                    return (
                      <div key={req.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-100">{memberName}</span>
                              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                S/ {req.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              <span className="font-medium">Razón:</span> {req.reason || 'No especificada'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {new Date(req.created_at).toLocaleString('es-PE')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              disabled={loading}
                              className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              disabled={loading}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista de Miembros */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-white text-sm" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Miembros del Grupo
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {group.members.length} miembros en total
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {group.members.map((member) => (
                  <div key={member.user_id} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          member.role === 'leader' 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                            : 'bg-gradient-to-br from-slate-500 to-slate-700'
                        }`}>
                          <span className="text-white font-medium text-sm">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {member.name}
                              {member.user_id === myUserId && (
                                <span className="ml-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs px-2 py-1 rounded-full">
                                  Tú
                                </span>
                              )}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              member.role === 'leader' 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
                            }`}>
                              {member.role === 'leader' ? 'Líder' : 'Miembro'}
                            </span>
                          </div>
                          <p className={`text-sm font-mono mt-1 ${
                            member.internal_balance < 0 
                              ? 'text-rose-600 dark:text-rose-400' 
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            Saldo Interno: S/ {member.internal_balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                          member.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {member.status === 'active' ? 'Activo' : 'Pendiente'}
                        </span>
                        {isLeader && member.user_id !== myUserId && (
                          <button
                            onClick={() => handleKickMember(member)}
                            disabled={loading}
                            className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 text-sm font-medium disabled:opacity-50 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial de Movimientos */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FaHistory className="text-white text-sm" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Historial de Movimientos
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Actividad reciente del grupo
                  </p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaHistory className="text-slate-400 text-xl" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No hay movimientos</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                    Aún no hay actividad en este grupo
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => {
                    const memberName = group?.members.find(m => m.user_id === tx.user_id)?.name || `Usuario ID ${tx.user_id}`;
                    const isContribution = tx.type === 'CONTRIBUTION_RECEIVED';

                    return (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isContribution 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                          }`}>
                            {isContribution ? '+' : '-'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {isContribution ? 'Aporte de' : 'Retiro aprobado para'} <strong>{memberName}</strong>
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(tx.created_at).toLocaleString('es-PE')}
                            </p>
                          </div>
                        </div>
                        <div className={`text-lg font-semibold ${
                          isContribution 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isContribution ? '+' : '-'}S/ {tx.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <RequestWithdrawalModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        group={{ id: group.id, name: group.name }}
        onRequestSuccess={() => {
          fetchGroupData();
        }}
      />

      <LeaderWithdrawalModal
        isOpen={isLeaderWithdrawalModalOpen}
        onClose={() => setIsLeaderWithdrawalModalOpen(false)}
        group={{ id: group.id, name: group.name }}
        onWithdrawalSuccess={() => {
          fetchGroupData();
        }}
      />
    </div>
  );
}