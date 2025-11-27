import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Users, Settings, X, Menu } from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full px-4 py-3 rounded-lg transition-colors text-base ${
      isActive
        ? 'bg-purple-100 text-brand-purple font-bold'
        : 'text-brand-text-secondary hover:bg-gray-100'
    }`;

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`fixed lg:relative flex flex-col w-64 bg-white border-r border-gray-100 h-full z-40 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 h-20">
          <h1 className="text-2xl font-bold text-brand-purple">Gradi</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/" className={navLinkClass} end>
            <Home size={22} />
            <span className="ml-4">Inicio</span>
          </NavLink>
          <NavLink to="/tareas" className={navLinkClass}>
            <CheckSquare size={22} />
            <span className="ml-4">Tareas</span>
          </NavLink>
          <NavLink to="/grupos" className={navLinkClass}>
            <Users size={22} />
            <span className="ml-4">Grupos</span>
          </NavLink>
          <NavLink to="/configuracion" className={navLinkClass}>
            <Settings size={22} />
            <span className="ml-4">Configuración</span>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">&copy; 2025 Gradi. Todos los derechos reservados.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
