import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Mail, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onGoogleSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError(null);
    setMessage(null);
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // --- REGISTRO ---
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, has_password: true },
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          setMessage('Registro exitoso. ¡Bienvenido!');
          setTimeout(() => {
             onClose();
             resetForm();
          }, 1500);
        } else {
          setMessage('Revisa tu correo para confirmar tu cuenta.');
        }
      } else {
        // --- INICIO DE SESIÓN ---
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        setMessage('Inicio de sesión exitoso.');
        onClose();
        resetForm();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Ocurrió un error de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Fondo oscuro detrás del modal */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* --- CAJA DEL MODAL (Fondo Blanco) --- */}
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
                
                {/* Título y Botón Cerrar */}
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 flex justify-between items-center mb-6">
                  {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </Dialog.Title>
                
                {/* Botón Google */}
                <div className="mb-6">
                    <button 
                        onClick={onGoogleSignIn} 
                        className="w-full flex items-center justify-center py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all hover:shadow-md group"
                    >
                        <img 
                          src="https://www.svgrepo.com/show/475656/google-color.svg" 
                          alt="Google" 
                          className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" 
                        />
                        {isSignUp ? 'Registrarse con Google' : 'Iniciar Sesión con Google'}
                    </button>
                    
                    <div className="relative flex justify-center items-center my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative bg-white px-4 text-sm text-gray-400 font-medium">
                            O usa tu correo
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleAuth} className="space-y-4">
                  {/* Input Nombre (Solo registro) */}
                  {isSignUp && (
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Nombre Completo" 
                        value={fullName} 
                        onChange={e => setFullName(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400" 
                        required={isSignUp} 
                      />
                    </div>
                  )}

                  {/* Input Email */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="email" 
                      placeholder="Correo Electrónico" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400" 
                      required 
                    />
                  </div>

                  {/* Input Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="password" 
                      placeholder="Contraseña" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400" 
                      required 
                    />
                  </div>

                  {/* Mensajes de Error / Éxito */}
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}
                  {message && (
                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg text-center font-medium">
                      {message}
                    </div>
                  )}

                  {/* Botón Submit */}
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
                  </button>
                </form>

                {/* Switch Login/Registro */}
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => { setIsSignUp(!isSignUp); resetForm(); }} 
                    className="text-sm font-medium text-[#8b5cf6] hover:text-[#7c3aed] hover:underline transition-all"
                  >
                    {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuthModal;