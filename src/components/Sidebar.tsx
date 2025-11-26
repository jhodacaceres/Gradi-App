import React from 'react';
import { GraduationCap, Home, ClipboardCheck, Users, X } from 'lucide-react';

type View = 'inicio' | 'tareas' | 'grupos';

interface NavItemProps {
  icon: React.ElementType;
  text: string;
  view: View;
  activeView: View;
  onNavigate: (view: View) => void;
}

const NavItem = ({ icon: Icon, text, view, activeView, onNavigate }: NavItemProps) => (
  <li className="w-full">
    <button
      onClick={() => onNavigate(view)}
      className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-300 w-full text-left ${
        activeView === view
          ? 'bg-gradient-to-r from-brand-purple to-brand-indigo text-white shadow-lg'
          : 'text-brand-text-secondary hover:bg-gray-200'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{text}</span>
    </button>
  </li>
);

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function Sidebar({ activeView, setActiveView, isOpen, setIsOpen }: SidebarProps) {
  const handleNavigate = (view: View) => {
    setActiveView(view);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/40 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed lg:relative inset-y-0 left-0 w-64 bg-brand-white p-6 flex flex-col border-r border-gray-200 flex-shrink-0 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg">
              <GraduationCap size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-brand-text-primary">Gradi</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-brand-purple">
            <X size={24} />
          </button>
        </div>
        <nav>
          <ul className="space-y-2">
            <NavItem icon={Home} text="Inicio" view="inicio" activeView={activeView} onNavigate={handleNavigate} />
            <NavItem icon={ClipboardCheck} text="Tareas" view="tareas" activeView={activeView} onNavigate={handleNavigate} />
            <NavItem icon={Users} text="Grupos" view="grupos" activeView={activeView} onNavigate={handleNavigate} />
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
