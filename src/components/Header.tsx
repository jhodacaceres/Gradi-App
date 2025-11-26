import React from 'react';
import { Bell, LogIn, LogOut, Menu } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onMenuClick: () => void;
}

function Header({ user, onLoginClick, onLogoutClick, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <button onClick={onMenuClick} className="lg:hidden text-gray-600 hover:text-brand-purple">
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-brand-text-primary lg:hidden">Gradi</h1>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-6">
        <button className="text-gray-500 hover:text-brand-purple transition-colors">
          <Bell size={22} />
        </button>
        {user ? (
          <div className="flex items-center space-x-3">
            <img 
              src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata.full_name}&background=random`} 
              alt={user.user_metadata.full_name || 'User Avatar'} 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <p className="font-semibold text-brand-text-primary truncate max-w-[120px]">{user.user_metadata.full_name}</p>
              <p className="text-xs text-brand-text-secondary">Estudiante</p>
            </div>
            <button onClick={onLogoutClick} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Cerrar Sesión">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="flex items-center space-x-2 px-4 py-2 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Iniciar Sesión</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
