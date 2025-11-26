import React from 'react';
import { X, GraduationCap, LogIn } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

function LoginModal({ onClose, onLogin }: LoginModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative transform transition-all duration-300 scale-95 animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-gradient-to-r from-brand-purple to-brand-indigo rounded-xl mb-4 shadow-lg">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-brand-text-primary">Únete a la conversación</h2>
          <p className="text-brand-text-secondary mt-2 max-w-xs">
            Crea una cuenta o inicia sesión para dar "me gusta", comentar y publicar.
          </p>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => { onLogin(); onClose(); }}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <LogIn size={20} />
            <span>Continuar con Google</span>
          </button>
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-6">
          Al continuar, aceptas nuestros Términos de Servicio.
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
