import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void; // Added Google sign-in handler
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onGoogleSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
        // Sign up via email/password
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, has_password: true }, // Set has_password true for email signups
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          setMessage('Registro exitoso. ¡Bienvenido!');
          onClose();
        } else {
          setMessage('Revisa tu correo para confirmar tu cuenta.');
        }
      } else {
        // Sign in via email/password
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        setMessage('Inicio de sesión exitoso.');
        onClose();
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface p-8 text-left align-middle shadow-2xl transition-all text-white">
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white flex justify-between items-center">
                  {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-background transition-colors">
                    <X size={24} className="text-textSecondary" />
                  </button>
                </Dialog.Title>
                
                {/* Google Sign-in */}
                <div className="mt-6">
                    <button 
                        onClick={onGoogleSignIn} 
                        className="w-full flex items-center justify-center py-3 font-semibold text-gray-900 bg-white border border-border rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5 mr-3" />
                        {isSignUp ? 'Registrarse con Google' : 'Iniciar Sesión con Google'}
                    </button>
                    <div className="relative flex justify-center items-center my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative bg-surface px-4 text-sm text-textSecondary">
                            O usa tu correo
                        </div>
                    </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                  {isSignUp && (
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
                      <input type="text" placeholder="Nombre Completo" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition text-white" required={isSignUp} />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
                    <input type="email" placeholder="Correo Electrónico" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition text-white" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
                    <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition text-white" required />
                  </div>

                  {error && <p className="text-error text-sm text-center">{error}</p>}
                  {message && <p className="text-success text-sm text-center">{message}</p>}

                  <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-secondary rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-wait">
                    {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button onClick={() => { setIsSignUp(!isSignUp); resetForm(); }} className="text-sm text-brand-purple hover:text-brand-secondary transition">
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
