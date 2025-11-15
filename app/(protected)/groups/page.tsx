'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'
import CreateGroupModal from './CreateGroupModal';
import ContributeModal from './ContributeModal';
import InviteModal from './InviteModal';

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
  created_at: string; // ¡Esto ahora existirá gracias al Paso 1!
  members: GroupMember[]; // ¡Ahora recibimos la lista de miembros!
}

const API_GATEWAY_URL = 'http://localhost:8080';

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
    // --- ¡AÑADE ESTO! ---
    // Lee el ID del usuario logueado desde localStorage
    const storedUserId = localStorage.getItem('pixel-user-id');
    if (storedUserId) {
      setMyUserId(parseInt(storedUserId, 10));
    }
    // --- FIN DEL BLOQUE ---
    fetchGroups();
  }, []);

      // --- ¡AÑADE ESTA NUEVA FUNCIÓN! ---
    const handleAcceptInvite = async (groupId: number) => {
      const token = localStorage.getItem('pixel-token');
      if (!token) {
        setError('No estás autenticado.');
        return;
      }
      // No seteamos 'loading' para no bloquear toda la UI,
      // podríamos setear un estado de "aceptando" para ese grupo

      try {
        const response = await fetch(`${API_GATEWAY_URL}/groups/me/accept/${groupId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // No se necesita Content-Type, no hay body
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Error al aceptar la invitación');
        }

        // ¡Éxito! Refrescamos la lista de grupos
        fetchGroups(); 

      } catch (err: any) {
        setError(err.message); // Muestra el error en la parte superior
      }
    };
    // --- FIN DE LA NUEVA FUNCIÓN ---


        // --- ¡AÑADE ESTA NUEVA FUNCIÓN! ---
    const handleRejectInvite = async (groupId: number) => {
      const token = localStorage.getItem('pixel-token');
      if (!token) {
        setError('No estás autenticado.');
        return;
      }

      // Preguntar al usuario si está seguro
      if (!window.confirm("¿Estás seguro de que quieres rechazar esta invitación?")) {
        return;
      }

      try {
        const response = await fetch(`${API_GATEWAY_URL}/groups/me/reject/${groupId}`, {
          method: 'DELETE', // <-- ¡Método DELETE!
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // response.json() falla en un 204, así que leemos texto
          const text = await response.text();
          let detail = "Error al rechazar la invitación";
          try {
            detail = JSON.parse(text).detail;
          } catch (e) {}
          throw new Error(detail);
        }

        // ¡Éxito! (El 204 no tiene body) Refrescamos la lista de grupos
        fetchGroups(); 

      } catch (err: any) {
        setError(err.message);
      }
    };
    // --- FIN DE LA NUEVA FUNCIÓN ---

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Mis Grupos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Crear grupo
        </button>
      </div>

      {/* Lista de grupos */}
      {loading ? (
        <p className="text-gray-500">Cargando grupos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-600">Aún no tienes grupos creados.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          

                {/* REEMPLAZA TU BLOQUE .map() CON ESTO: */}

        {/* REEMPLAZA TU BLOQUE .map() CON ESTO: */}

{groups.map((group) => {
  // --- Lógica para esta tarjeta ---
  const activeMembers = group.members.filter(m => m.status === 'active');
  const myMembership = group.members.find(m => m.user_id === myUserId);
  const myStatus = myMembership?.status || null; 
  const isLeader = myMembership?.role === 'leader';

  return (
    // --- ¡EL <Link> QUE FALTABA! ---
    // Envuelve toda la tarjeta 'li' para que sea un enlace
    <Link href={`/groups/${group.id}`} key={group.id}>
      <li
        className="bg-white shadow p-4 rounded-md border hover:shadow-lg hover:border-indigo-400 transition flex flex-col justify-between h-full cursor-pointer"
      >
        {/* Sección de Info */}
        <div>
          <h2 className="font-semibold text-lg text-indigo-700">{group.name}</h2>
          <p className="text-sm text-gray-500">
            {activeMembers.length} miembro(s) activo(s)
          </p>
        </div>

        {/* Sección de Fecha y Botones (abajo) */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-gray-400">
            Creado el {new Date(group.created_at).toLocaleDateString('es-PE')}
          </p>

          {/* Contenedor de Botones */}
          <div className="flex space-x-2">

            {/* Si mi estado es PENDIENTE */}
            {myStatus === 'pending' && (
              <> {/* Usamos un fragmento para agrupar los botones */}
            <button 
              onClick={(e) => {
                e.preventDefault(); 
                handleAcceptInvite(group.id);
              }}
              className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded z-10"
            >
              Aceptar
            </button>

            {/* --- ¡BOTÓN RECHAZAR NUEVO! --- */}
            <button 
              onClick={(e) => {
                e.preventDefault(); 
                handleRejectInvite(group.id);
              }}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded z-10"
            >
              Rechazar
            </button>
            {/* --- FIN BOTÓN NUEVO --- */}
          </>
            )}

            {/* Si soy LÍDER y estoy ACTIVO */}
            {isLeader && myStatus === 'active' && (
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Previene que el Link se active
                  setSelectedGroup(group);
                  setIsInviteModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1 px-3 rounded z-10"
              >
                Invitar
              </button>
            )}

            {/* Si estoy ACTIVO (todos pueden aportar) */}
            {myStatus === 'active' && (
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Previene que el Link se active
                  setSelectedGroup(group);
                  setIsContributeModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded z-10"
              >
                Aportar
              </button>
            )}
          </div>

        </div>
      </li>
    </Link>
  );
})}
        </ul>
      )}

      {/* Modal */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={fetchGroups} // refresca al crear
      />

          {/* --- ¡AÑADE ESTE BLOQUE! --- */}
      {selectedGroup && (
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          group={selectedGroup}
          onContributeSuccess={() => {
            fetchGroups(); // Refresca la lista de grupos
            // Idealmente, también refrescaría el dashboard,
            // pero por ahora esto es suficiente.
          }}
        />
      )}
      {/* --- FIN DEL BLOQUE --- */}

      {/* --- ¡AÑADE ESTE BLOQUE! --- */}
      {selectedGroup && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          group={selectedGroup}
          onInviteSuccess={() => {
            fetchGroups(); // Refresca la lista de grupos
          }}
        />
      )}
      {/* --- FIN DEL BLOQUE --- */}
    </div>
  );
}
