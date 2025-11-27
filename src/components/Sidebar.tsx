import React from 'react';
import { Home, CheckSquare, Users, User, Settings, LogOut } from 'lucide-react';

type View = 'inicio' | 'tareas' | 'grupos' | 'perfil';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem = ({ icon: Icon, text, active, onClick }: { icon: React.ElementType, text: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-brand-purple to-brand-indigo text-white shadow-lg' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-brand-text-primary'
    }`}
  >
    <Icon size={22} className="mr-4" />
    <span className="font-semibold">{text}</span>
  </button>
);

function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-10">
          <div className="bg-gradient-to-r from-brand-purple to-brand-indigo p-2 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-text-primary">Gradi</h1>
        </div>
        <nav className="space-y-3">
          <NavItem icon={Home} text="Inicio" active={activeView === 'inicio'} onClick={() => setActiveView('inicio')} />
          <NavItem icon={CheckSquare} text="Tareas" active={activeView === 'tareas'} onClick={() => setActiveView('tareas')} />
          <NavItem icon={Users} text="Grupos" active={activeView === 'grupos'} onClick={() => setActiveView('grupos')} />
          <NavItem icon={User} text="Mi Perfil" active={activeView === 'perfil'} onClick={() => setActiveView('perfil')} />
        </nav>
      </div>
      <div className="space-y-3">
        <NavItem icon={Settings} text="Configuración" active={false} onClick={() => {}} />
        <NavItem icon={LogOut} text="Cerrar Sesión" active={false} onClick={() => {}} />
      </div>
    </aside>
  );
}

export default Sidebar;
