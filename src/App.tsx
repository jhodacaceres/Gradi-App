import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Feed from './components/Feed';
import Tasks from './components/Tasks';
import Groups from './components/Groups';
import ProfilePage from './components/ProfilePage';
import { useAuth } from './hooks/useAuth';

type View = 'inicio' | 'tareas' | 'grupos' | 'perfil';

function App() {
  const [activeView, setActiveView] = useState<View>('inicio');
  const { session, user, loading, signInWithGoogle, signOut } = useAuth();

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-purple"></div></div>;
    }
    switch (activeView) {
      case 'inicio':
        return <Feed user={user} />;
      case 'tareas':
        return <Tasks user={user} />;
      case 'grupos':
        return <Groups />;
      case 'perfil':
        return <ProfilePage user={user} />;
      default:
        return <Feed user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-light font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          onLoginClick={signInWithGoogle}
          onLogoutClick={signOut}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
