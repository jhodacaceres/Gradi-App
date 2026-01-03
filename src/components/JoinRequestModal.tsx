import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Lock, X } from 'lucide-react';

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
  groupName: string;
}

const JoinRequestModal: React.FC<JoinRequestModalProps> = ({ isOpen, onClose, onConfirm, groupName }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(message);
    setMessage('');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Lock size={20} className="text-brand-purple" />
                    Solicitar unirse a {groupName}
                  </Dialog.Title>
                  <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <p className="text-sm text-gray-500 mb-4">
                    Este grupo es privado. Cuéntale al administrador por qué te gustaría unirte.
                  </p>
                  
                  <textarea
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none mb-4 resize-none"
                    rows={4}
                    placeholder="Hola, me gustaría unirme para compartir ideas sobre..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-purple rounded-lg hover:bg-brand-indigo transition-colors shadow-sm">
                      Enviar Solicitud
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default JoinRequestModal;