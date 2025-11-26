import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Group } from '../types';

const GroupCard = ({ group }: { group: Group }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-shadow hover:shadow-lg">
    <img src={group.image_url || ''} alt={group.name} className="w-full h-32 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-brand-text-primary">{group.name}</h3>
      <div className="flex items-center text-sm text-brand-text-secondary mt-2">
        <Users size={16} className="mr-2" />
        <span>25 miembros</span> {/* Placeholder */}
      </div>
      <button className="mt-4 w-full px-4 py-2 font-semibold text-brand-purple bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
        Unirse al Grupo
      </button>
    </div>
  </div>
);

function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*');

      if (error) {
        console.error('Error fetching groups:', error);
        setError('No se pudieron cargar los grupos.');
      } else {
        setGroups(data);
      }
      setLoading(false);
    };

    fetchGroups();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-text-primary">Grupos de Estudio</h1>
        <p className="text-brand-text-secondary mt-1">Conéctate con estudiantes que comparten tus intereses.</p>
      </header>
      
      {loading && <p>Cargando grupos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groups.map(group => <GroupCard key={group.id} group={group} />)}
        </div>
      )}
    </div>
  );
}

export default Groups;
