import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Settings, X, FolderOpen } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActive 
        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20 font-medium' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* 1. OVERLAY (Fondo oscuro) - Solo visible en móvil cuando está abierto */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 2. SIDEBAR DRAWER */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 
          w-72 bg-[#1a1b26] border-r border-gray-800 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          
          /* CLAVE AQUÍ: md:hidden hace que desaparezca en PC */
          md:hidden
          
          /* Lógica de apertura/cierre en móvil */
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* Cabecera del Sidebar con Botón Cerrar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <span className="text-xl font-bold text-white flex items-center gap-2">
               Menu
            </span>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenido de Navegación */}
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            <div className="mb-2 px-4">
               <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">
                 Navegación
               </h2>
            </div>

            <nav className="space-y-2">
              <NavLink to="/" className={getNavLinkClass} onClick={onClose}>
                <LayoutDashboard className="h-5 w-5" />
                <span>Inicio</span>
              </NavLink>

              <NavLink to="/tareas" className={getNavLinkClass} onClick={onClose}>
                <CheckSquare className="h-5 w-5" />
                <span>Mis Tareas</span>
              </NavLink>

              <NavLink to="/groups" className={getNavLinkClass} onClick={onClose}>
                <Users className="h-5 w-5" />
                <span>Grupos de Estudio</span>
              </NavLink>
            </nav>

            <div className="mt-8 mb-4 px-4">
               <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                 Cuenta
               </h2>
            </div>

            <nav className="space-y-2">
              <NavLink to="/configuracion" className={getNavLinkClass} onClick={onClose}>
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;