'use client';

import { useEffect, useState } from 'react';
import CreateGroupModal from './CreateGroupModal';

interface Group {
  id: number;
  name: string;
  created_at: string;
}

const API_GATEWAY_URL = 'http://localhost:8080';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              className="bg-white shadow p-4 rounded-md border hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-lg">{group.name}</h2>
              <p className="text-sm text-gray-500">
                Creado el {new Date(group.created_at).toLocaleDateString()}
              </p>
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
    </div>
  );
}
