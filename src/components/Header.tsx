import React, { useState, useRef, useEffect } from 'react';
import { User as UserType } from '@supabase/supabase-js';
import { LogIn, LogOut, User as UserIcon, Settings, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: UserType | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onMenuClick: () => void;
}

const Header = ({ user, onLoginClick, onLogoutClick, onMenuClick }: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-100 h-20 flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden text-gray-600 hover:text-brand-purple">
        <Menu size={24} />
      </button>
      <div className="hidden lg:block">
        {/* Could be a search bar or breadcrumbs in the future */}
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
              <img 
                src={user.user_metadata.avatar_url} 
                alt={user.user_metadata.full_name} 
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="hidden sm:inline font-semibold text-brand-text-primary">{user.user_metadata.full_name}</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                <button onClick={() => handleNavigation(`/perfil/${user.id}`)} className="flex items-center w-full text-left px-4 py-2 text-sm text-brand-text-secondary hover:bg-gray-100">
                  <UserIcon size={16} className="mr-2" />
                  Mi Perfil
                </button>
                <button onClick={() => handleNavigation('/configuracion')} className="flex items-center w-full text-left px-4 py-2 text-sm text-brand-text-secondary hover:bg-gray-100">
                  <Settings size={16} className="mr-2" />
                  Configuración
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={onLogoutClick} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut size={16} className="mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onLoginClick} className="flex items-center px-4 py-2 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <LogIn size={18} className="mr-2" />
            Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
