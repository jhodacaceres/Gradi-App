import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { View } from '../App';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onMenuClick: () => void;
  onNavigate: (view: View) => void;
}

function Header({ user, onLoginClick, onLogoutClick, onMenuClick, onNavigate }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (view: View) => {
    onNavigate(view);
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden mr-4 text-gray-600">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-brand-text-primary">Gradi</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => alert('Función de notificaciones en desarrollo.')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <Bell size={22} />
        </button>
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <img 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata.full_name} 
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-40">
                <a onClick={() => handleNavigate('perfil')} className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</a>
                <a onClick={() => handleNavigate('perfil')} className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Configuración</a>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={() => { onLogoutClick(); setIsDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="px-5 py-2 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
