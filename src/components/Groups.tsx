import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Users, Lock, Globe, Clock, Check, Plus, Settings, LogIn } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';
import JoinRequestModal from './JoinRequestModal';
import ManageRequestsModal from './ManageRequestsModal';
// IMPORTANTE: Asegúrate de importar el nuevo componente
import GroupFeed from './GroupFeed'; 
import { Group as GroupType } from '../types';

interface GroupWithMembership extends GroupType {
  group_members: { user_id: string; status: string }[]; 
  memberCount: number; 
  pendingCount: number;
  myStatus: 'approved' | 'pending' | 'rejected' | null;
}

interface GroupsProps {
  user: User | null;
}

const Groups = ({ user }: GroupsProps) => {
  // --- ESTADOS ---
  const [groups, setGroups] = useState<GroupWithMembership[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembership | null>(null);

  // NUEVO ESTADO: Controla si estamos viendo el chat de un grupo
  const [activeGroupFeed, setActiveGroupFeed] = useState<GroupWithMembership | null>(null);

  // --- EFECTOS ---
  useEffect(() => {
    fetchGroups();
  }, [user]);

  // --- FUNCIONES ---
  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('groups')
      .select(`*, group_members (user_id, status)`)
      .order('created_at', { ascending: false });

    if (data) {
      const formattedGroups: GroupWithMembership[] = data.map((group: any) => {
        const myMembership = group.group_members.find((m: any) => m.user_id === user?.id);
        return {
          ...group,
          group_members: group.group_members,
          memberCount: group.group_members.filter((m: any) => m.status === 'approved').length,
          pendingCount: group.group_members.filter((m: any) => m.status === 'pending').length,
          myStatus: myMembership ? myMembership.status : null
        };
      });
      setGroups(formattedGroups);
    }
    setLoading(false);
  };

  const handleJoinClick = async (group: GroupWithMembership) => {
    if (!user) { alert("Inicia sesión para unirte."); return; }
    if (group.is_private) {
      setSelectedGroup(group);
      setIsJoinModalOpen(true);
    } else {
      await executeJoin(group.id, 'approved', null);
    }
  };

  const executeJoin = async (groupId: string, status: string, message: string | null) => {
    if (!user) return;
    const { error } = await supabase.from('group_members').insert({
      group_id: groupId, user_id: user.id, status, join_message: message
    });
    if (!error) {
      await fetchGroups();
      setIsJoinModalOpen(false);
    }
  };

  const handleManageClick = (group: GroupWithMembership) => {
    setSelectedGroup(group);
    setIsManageModalOpen(true);
  };

  // Función para entrar al modo Chat
  const handleEnterGroup = (group: GroupWithMembership) => {
    setActiveGroupFeed(group);
  };

  // ---------------------------------------------------------
  // AQUÍ ES DONDE VA EL BLOQUE QUE PREGUNTASTE
  // ---------------------------------------------------------
  // Si hay un grupo activo, mostramos el componente GroupFeed y NO la lista de grupos.
  if (activeGroupFeed && user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8"> {/* max-w-3xl para igualar el estilo del Feed Home */}
        <GroupFeed 
          user={user} 
          group={activeGroupFeed} 
          onBack={() => setActiveGroupFeed(null)} // Esto permite volver a la lista poniendo el estado en null
        />
      </div>
    );
  }

  // ---------------------------------------------------------
  // RENDERIZADO PRINCIPAL (LISTA DE GRUPOS)
  // ---------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grupos de Estudio</h1>
          <p className="mt-2 text-gray-600">Conéctate, comparte archivos y colabora.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-indigo transition-colors shadow-sm font-medium">
          <Plus size={20} /> Crear Grupo
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div></div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay grupos disponibles</h3>
            <p className="text-gray-500">Sé el primero en crear uno.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const isCreator = user && group.created_by === user.id;
            const canEnter = isCreator || group.myStatus === 'approved';

            return (
              <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
                <div 
                  className={`h-48 overflow-hidden relative bg-gray-100 ${canEnter ? 'cursor-pointer' : ''}`}
                  onClick={() => canEnter && handleEnterGroup(group)} // Click en imagen entra al grupo
                >
                  <img src={group.image_url || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80"} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-4 right-4 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    {group.is_private ? <><Lock size={12} className="text-orange-500" /> Privado</> : <><Globe size={12} className="text-green-500" /> Público</>}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 
                    className={`font-bold text-xl text-gray-900 mb-2 truncate ${canEnter ? 'cursor-pointer hover:text-brand-purple' : ''}`}
                    onClick={() => canEnter && handleEnterGroup(group)}
                  >
                    {group.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{group.description}</p>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Users size={16} /> <span>{group.memberCount} miembros</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCreator && (
                        <button onClick={() => handleManageClick(group)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative" title="Gestionar Miembros">
                          <Settings size={20} />
                          {group.pendingCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                        </button>
                      )}

                      {/* Lógica de botones de acción */}
                      {canEnter ? (
                        <button 
                          onClick={() => handleEnterGroup(group)}
                          className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors border border-green-200"
                        >
                          <LogIn size={16} /> Entrar
                        </button>
                      ) : group.myStatus === 'pending' ? (
                        <div className="px-4 py-2 bg-orange-50 text-orange-700 text-sm font-semibold rounded-lg flex items-center gap-2 border border-orange-100">
                          <Clock size={16} /> Pendiente
                        </div>
                      ) : (
                        <button onClick={() => handleJoinClick(group)} className="px-4 py-2 bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white text-sm font-semibold rounded-lg transition-all">
                          {group.is_private ? 'Solicitar' : 'Unirse'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} user={user} onGroupCreated={() => fetchGroups()} />
      {selectedGroup && <JoinRequestModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} groupName={selectedGroup.name} onConfirm={(msg) => executeJoin(selectedGroup.id, 'pending', msg)} />}
      <ManageRequestsModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} group={selectedGroup} onUpdate={() => fetchGroups()} />
    </div>
  );
};

export default Groups;