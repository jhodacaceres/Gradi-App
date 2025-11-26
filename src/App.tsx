import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Feed from './components/Feed';
import Tasks from './components/Tasks';
import Groups from './components/Groups';
import LoginModal from './components/LoginModal';
import { useAuth } from './hooks/useAuth';

type View = 'inicio' | 'tareas' | 'grupos';

function App() {
  const [activeView, setActiveView] = useState<View>('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { session, user, loading, signInWithGoogle, signOut } = useAuth();

  const handleAuthAction = () => {
    setIsLoginModalOpen(true);
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full"><p>Cargando...</p></div>;
    }
    switch (activeView) {
      case 'inicio':
        return <Feed user={user} onAuthAction={handleAuthAction} />;
      case 'tareas':
        return <Tasks user={user} />;
      case 'grupos':
        return <Groups />;
      default:
        return <Feed user={user} onAuthAction={handleAuthAction} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-light font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogoutClick={signOut}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={signInWithGoogle}
        />
      )}
    </div>
  );
}

export default App;
