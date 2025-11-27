import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Group } from '../types';
import { User } from '@supabase/supabase-js';
import CreateGroupModal from './CreateGroupModal';

interface GroupsProps {
  user: User | null;
  onAuthAction: () => void;
}

const GroupCard = ({ group, user, onAuthAction }: { group: Group, user: User | null, onAuthAction: () => void }) => {
  const handleJoin = () => {
    if (!user) {
      onAuthAction();
    } else {
      // Placeholder for join logic
      alert(`Te has unido al grupo: ${group.name}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <img src={group.image_url || ''} alt={group.name} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-brand-text-primary truncate">{group.name}</h3>
        <p className="text-sm text-brand-text-secondary mt-1 h-10 overflow-hidden text-ellipsis">{group.description}</p>
        <div className="flex items-center text-sm text-brand-text-secondary mt-2">
          <Users size={16} className="mr-2" />
          <span>25 miembros</span> {/* Placeholder */}
        </div>
        <button 
          onClick={handleJoin}
          className="mt-4 w-full px-4 py-2 font-semibold text-brand-purple bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
        >
          Unirse al Grupo
        </button>
      </div>
    </div>
  );
};

function Groups({ user, onAuthAction }: GroupsProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching groups:', error);
        setError('No se pudieron cargar los grupos.');
      } else {
        setGroups((data as Group[]) || []);
      }
      setLoading(false);
    };

    fetchGroups();
  }, []);

  const handleCreateGroupClick = () => {
    if (user) {
      setIsCreateModalOpen(true);
    } else {
      onAuthAction();
    }
  };

  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prevGroups => [newGroup, ...prevGroups]);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-text-primary">Grupos de Estudio</h1>
            <p className="text-brand-text-secondary mt-1">Conéctate con estudiantes que comparten tus intereses.</p>
          </div>
          <button 
            onClick={handleCreateGroupClick}
            className="flex items-center space-x-2 px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Crear Grupo</span>
          </button>
        </header>
        
        {loading && <p className="text-center py-10">Cargando grupos...</p>}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}

        {!loading && !error && groups.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <h3 className="text-xl font-semibold text-brand-text-primary">No hay grupos todavía</h3>
            <p className="text-brand-text-secondary mt-2">¡Sé el primero en crear uno y empieza a conectar!</p>
          </div>
        )}

        {!loading && groups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {groups.map(group => <GroupCard key={group.id} group={group} user={user} onAuthAction={onAuthAction} />)}
          </div>
        )}
      </div>
      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
        user={user}
      />
    </>
  );
}

export default Groups;
