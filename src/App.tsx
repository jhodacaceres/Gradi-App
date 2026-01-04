import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Componentes
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';

// Páginas / Vistas
import Feed from './components/Feed';
import Tasks from './components/Tasks';
import Groups from './components/Groups'; // Asegúrate de importar Groups
import TaskDetail from './pages/TaskDetail';
import UserProfilePage from './pages/UserProfilePage';
import UserSettingsPage from './pages/SettingsPage';

const App = () => {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth(); 
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Estado para controlar el menú móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    // Spinner de carga inicial centrado
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1b26]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  const handleAuthAction = () => setShowAuthModal(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* HEADER: Le pasamos la función para abrir el menú */}
      <Header 
        user={user} 
        profile={profile} 
        onAuthAction={handleAuthAction} 
        signOut={signOut} 
        onMenuToggle={() => setIsSidebarOpen(true)}
      />
      
      <div className="flex flex-1 pt-16"> {/* pt-16 para compensar el Header fixed */}
        
        {/* SIDEBAR: Recibe el estado y la función para cerrarse */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          // Si tu Sidebar usa activeTab, puedes manejarlo aquí o dentro del Sidebar con Routing
          activeTab={window.location.pathname.substring(1) || 'dashboard'}
          setActiveTab={() => {}} // Opcional si usas Routing directo
        />

        {/* CONTENIDO PRINCIPAL */}
        {/* Aquí forzamos bg-gray-50 para que el contenido (feed, inputs) se vea limpio en modo claro */}
        <main className="flex-1 w-full bg-gray-50 text-gray-900 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Feed user={user} onAuthAction={handleAuthAction} />} />
            
            {/* Rutas de Grupos */}
            <Route path="/groups" element={<Groups user={user} />} />
            
            {/* Rutas de Tareas */}
            <Route path="/tareas" element={<Tasks user={user} onAuthAction={handleAuthAction} />} />
            <Route path="/task/:taskId" element={<TaskDetail user={user} onAuthAction={handleAuthAction} />} />
            
            {/* Rutas de Usuario */}
            <Route path="/perfil/:userId" element={<UserProfilePage currentUser={user} onAuthAction={handleAuthAction} />} />
            <Route path="/configuracion" element={<UserSettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* MODAL DE LOGIN */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onGoogleSignIn={signInWithGoogle}
      />
    </div>
  );
};

export default App;