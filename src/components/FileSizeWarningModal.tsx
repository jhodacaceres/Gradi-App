import React from 'react';
import { Dialog } from '@headlessui/react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileSizeWarningModal({ isOpen, onClose }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-red-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <Dialog.Title className="text-lg font-bold text-gray-900">Archivo demasiado grande</Dialog.Title>
            <p className="mt-2 text-gray-600 text-sm">
              El archivo supera el límite permitido de <span className="font-bold text-gray-900">5 MB</span>. 
              Por favor, intenta con un archivo más ligero.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}