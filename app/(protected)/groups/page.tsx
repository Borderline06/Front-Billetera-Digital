'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CreateGroupModal from './CreateGroupModal';
import ContributeModal from './ContributeModal';
import InviteModal from './InviteModal';
import { FaUsers, FaUserPlus, FaPlus, FaClock, FaCheck, FaTimes, FaGift, FaShare } from 'react-icons/fa';

interface GroupMember {
  user_id: number;
  role: 'leader' | 'member';
  group_id: number;
  status: 'pending' | 'active';
}

interface Group {
  id: number;
  name: string;
  leader_user_id: number;
  created_at: string;
  members: GroupMember[];
}

const API_GATEWAY_URL = 'https://pixel-money.koyeb.app';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('pixel-token');
      if (!token) {
        setError('No estás autenticado.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_GATEWAY_URL}/groups/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al obtener los grupos');
      }

      setGroups(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('pixel-user-id');
    if (storedUserId) {
      setMyUserId(parseInt(storedUserId, 10));
    }
    fetchGroups();
  }, []);

  const handleAcceptInvite = async (groupId: number) => {
    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado.');
      return;
    }

    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/me/accept/${groupId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al aceptar la invitación');
      }

      fetchGroups();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRejectInvite = async (groupId: number) => {
    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado.');
      return;
    }

    if (!window.confirm("¿Estás seguro de que quieres rechazar esta invitación?")) {
      return;
    }

    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/me/reject/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        let detail = "Error al rechazar la invitación";
        try {
          detail = JSON.parse(text).detail;
        } catch (e) {}
        throw new Error(detail);
      }

      fetchGroups();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Mejorado */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaUsers className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100 tracking-tight">
                  Mis Grupos
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Gestiona tus grupos y colaboraciones financieras
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover-lift flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <FaPlus className="text-sm" />
              Crear Grupo
            </button>
          </div>
        </div>

        {/* Estados de Carga y Error */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Cargando grupos...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-rose-500 text-xl" />
            </div>
            <p className="text-rose-600 dark:text-rose-400 text-lg">{error}</p>
          </div>
        )}

        {/* Lista de Grupos */}
        {!loading && !error && groups.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FaUsers className="text-slate-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
              No tienes grupos aún
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Crea tu primer grupo para empezar a colaborar financieramente con amigos, familia o compañeros.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 hover-lift flex items-center gap-2 mx-auto"
            >
              <FaPlus className="text-sm" />
              Crear mi primer grupo
            </button>
          </div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groups.map((group) => {
              const activeMembers = group.members.filter(m => m.status === 'active');
              const myMembership = group.members.find(m => m.user_id === myUserId);
              const myStatus = myMembership?.status || null;
              const isLeader = myMembership?.role === 'leader';
              const pendingMembers = group.members.filter(m => m.status === 'pending');

              return (
                <div key={group.id} className="group">
                  <Link href={`/groups/${group.id}`}>
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300 h-full flex flex-col cursor-pointer">
                      {/* Header de la Tarjeta */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                            {group.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                              isLeader 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                            }`}>
                              {isLeader ? 'Líder' : 'Miembro'}
                            </div>
                            {myStatus === 'pending' && (
                              <div className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                <FaClock className="text-xs" />
                                Pendiente
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaUsers className="text-white text-sm" />
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {activeMembers.length}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Activos
                          </div>
                        </div>
                        {pendingMembers.length > 0 && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                              {pendingMembers.length}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Pendientes
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fecha de creación */}
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Creado el {new Date(group.created_at).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>

                      {/* Botones de Acción */}
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex flex-wrap gap-2">
                          {/* Invitaciones Pendientes */}
                          {myStatus === 'pending' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAcceptInvite(group.id);
                                }}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                              >
                                <FaCheck className="text-xs" />
                                Aceptar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRejectInvite(group.id);
                                }}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                              >
                                <FaTimes className="text-xs" />
                                Rechazar
                              </button>
                            </>
                          )}

                          {/* Acciones para Miembros Activos */}
                          {myStatus === 'active' && (
                            <>
                              {isLeader && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedGroup(group);
                                    setIsInviteModalOpen(true);
                                  }}
                                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                  <FaShare className="text-xs" />
                                  Invitar
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedGroup(group);
                                  setIsContributeModalOpen(true);
                                }}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                              >
                                <FaGift className="text-xs" />
                                Aportar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={fetchGroups}
      />

      {selectedGroup && (
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          group={selectedGroup}
          onContributeSuccess={() => {
            fetchGroups();
          }}
        />
      )}

      {selectedGroup && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          group={selectedGroup}
          onInviteSuccess={() => {
            fetchGroups();
          }}
        />
      )}
    </div>
  );
}