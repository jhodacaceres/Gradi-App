import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Feed from './components/Feed';
import Tasks from './components/Tasks';
import Groups from './components/Groups';
import ProfilePage from './components/ProfilePage';
import { useAuth } from './hooks/useAuth';

export type View = 'inicio' | 'tareas' | 'grupos' | 'perfil';

function App() {
  const [activeView, setActiveView] = useState<View>('inicio');
  const { session, user, loading, signInWithGoogle, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAuthAction = () => {
    if (!user) {
      signInWithGoogle();
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-purple"></div></div>;
    }
    switch (activeView) {
      case 'inicio':
        return <Feed user={user} onAuthAction={handleAuthAction} />;
      case 'tareas':
        return <Tasks user={user} onAuthAction={handleAuthAction} />;
      case 'grupos':
        return <Groups />;
      case 'perfil':
        return <ProfilePage user={user} />;
      default:
        return <Feed user={user} onAuthAction={handleAuthAction} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-light font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          onLoginClick={signInWithGoogle}
          onLogoutClick={signOut}
          onNavigate={(view) => setActiveView(view)}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
