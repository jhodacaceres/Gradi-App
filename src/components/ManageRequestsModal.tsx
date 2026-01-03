import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Check, User as UserIcon, MessageSquare, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Group } from '../types';

interface ManageRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onUpdate: () => void;
}

export default function ManageRequestsModal({ isOpen, onClose, group, onUpdate }: ManageRequestsModalProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && group) {
      fetchRequests();
    }
  }, [isOpen, group]);

  const fetchRequests = async () => {
    if (!group) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles:user_id (full_name, avatar_url, username)
      `)
      .eq('group_id', group.id)
      .eq('status', 'pending');

    if (error) console.error('Error fetching requests:', error);
    else setRequests(data || []);
    
    setLoading(false);
  };

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    if (!group) return;
    setActionLoading(userId); // Bloquear botón mientras carga

    try {
      if (action === 'approve') {
        const { error } = await supabase
          .from('group_members')
          .update({ status: 'approved' })
          .eq('group_id', group.id)
          .eq('user_id', userId); // IMPORTANTE: El RLS debe permitir esto

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', group.id)
          .eq('user_id', userId);

        if (error) throw error;
      }

      // Actualizar UI localmente
      setRequests(prev => prev.filter(r => r.user_id !== userId));
      onUpdate(); // Recargar contadores en el componente padre

    } catch (err: any) {
      console.error('Error in action:', err);
      alert(`Error: ${err.message || 'No se pudo realizar la acción. Verifica los permisos RLS en Supabase.'}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="text-brand-purple" size={20}/>
                  Gestionar Solicitudes
                </Dialog.Title>
                <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando solicitudes...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p>No hay solicitudes pendientes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.user_id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        {req.profiles?.avatar_url ? (
                          <img src={req.profiles.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <UserIcon size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{req.profiles?.full_name || 'Usuario'}</p>
                          <p className="text-xs text-gray-500">@{req.profiles?.username || 'user'}</p>
                        </div>
                      </div>

                      {req.join_message && (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-3 flex gap-2 items-start italic">
                          <MessageSquare size={14} className="mt-1 text-gray-400 shrink-0" />
                          "{req.join_message}"
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleAction(req.user_id, 'reject')}
                          disabled={actionLoading === req.user_id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <X size={16} /> Rechazar
                        </button>
                        <button 
                          onClick={() => handleAction(req.user_id, 'approve')}
                          disabled={actionLoading === req.user_id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <Check size={16} /> {actionLoading === req.user_id ? 'Procesando...' : 'Aprobar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}