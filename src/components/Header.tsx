import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { LogOut, User as UserIcon, Settings, Zap, Menu } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  profile: Profile | null;
  onAuthAction: () => void;
  signOut: () => void;
  onMenuToggle: () => void; // Prop para abrir sidebar
}

const Header: React.FC<HeaderProps> = ({ user, profile, onAuthAction, signOut, onMenuToggle }) => {
  const location = useLocation();
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=9E7FFF&color=fff`;

  // Función para detectar link activo (opcional, para estilo visual)
  const isActiveLink = (path: string) => location.pathname === path;

  return (
    // CLAVE: bg-white/80 (o tu bg-surface/90) + backdrop-blur-md crea el efecto vidrio
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm h-16 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* LADO IZQUIERDO: Menú Hamburguesa + Logo */}
        <div className="flex items-center gap-3">
          
          {/* 1. BOTÓN MENÚ (Solo móvil) - Lo ponemos a la izquierda junto al logo */}
          <button 
            onClick={onMenuToggle} 
            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100/50 rounded-lg transition"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center text-2xl font-bold text-brand-purple hover:text-brand-secondary transition duration-300">
            <Zap className="h-6 w-6 mr-2" />
            <span className="hidden sm:inline">Gradi</span> {/* Oculta texto 'Gradi' en pantallas muy muy pequeñas si quieres */}
          </Link>
        </div>

        {/* CENTRO: Navegación Desktop */}
        <nav className="hidden md:flex space-x-8">
          <Link 
            to="/" 
            className={`transition ${isActiveLink('/') ? 'text-brand-purple font-semibold' : 'text-gray-600 hover:text-brand-purple'}`}
          >
            Inicio
          </Link>
          <Link 
            to="/tareas" 
            className={`transition ${isActiveLink('/tareas') ? 'text-brand-purple font-semibold' : 'text-gray-600 hover:text-brand-purple'}`}
          >
            Tareas
          </Link>
          <Link 
            to="/groups" 
            className={`transition ${isActiveLink('/groups') ? 'text-brand-purple font-semibold' : 'text-gray-600 hover:text-brand-purple'}`}
          >
            Grupos
          </Link>
        </nav>

        {/* LADO DERECHO: Acciones de Usuario */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="relative group">
              <Link to={`/perfil/${user.id}`} className="block">
                <img 
                  src={avatarUrl} 
                  alt={profile?.full_name || 'Profile'} 
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 hover:border-brand-purple transition transform hover:scale-105"
                />
              </Link>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform scale-95 group-hover:scale-100 origin-top-right z-50">
                <div className="p-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                  <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || 'Usuario'}</p>
                </div>
                <div className="p-1">
                  <Link to={`/perfil/${user.id}`} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-brand-purple rounded-lg transition">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Ver Perfil
                  </Link>
                  <Link to="/configuracion" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-brand-purple rounded-lg transition">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </Link>
                  <button 
                    onClick={signOut} 
                    className="w-full flex items-center px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition mt-1"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthAction} 
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-purple hover:bg-opacity-90 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;