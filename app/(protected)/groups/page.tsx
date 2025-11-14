'use client';

import { useEffect, useState } from 'react';
import CreateGroupModal from './CreateGroupModal';
import ContributeModal from './ContributeModal';

interface GroupMember {
  user_id: number;
  role: 'leader' | 'member';
  group_id: number;
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
    fetchGroups();
  }, []);

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
          {groups.map((group) => (
            <li
              key={group.id}
              className="bg-white shadow p-4 rounded-md border hover:shadow-lg transition flex flex-col justify-between"
            >
              {/* Sección de Info */}
              <div>
                <h2 className="font-semibold text-lg text-indigo-700">{group.name}</h2>
                <p className="text-sm text-gray-500">
                  {group.members.length} miembro(s)
                </p>
              </div>

              {/* Sección de Fecha (abajo) */}
              <p className="text-xs text-gray-400 mt-4">
                Creado el {new Date(group.created_at).toLocaleDateString('es-PE')}
              </p>

              {/* --- ¡BOTÓN NUEVO! --- */}
            <button 
              onClick={() => {
                setSelectedGroup(group);
                setIsContributeModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded"
            >
              Aportar
            </button>
            {/* --- FIN BOTÓN NUEVO --- */}

              {/* (Aquí pondremos los botones de Aportar/Invitar/Ver) */}
            </li>
          ))}
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
    </div>
  );
}
