import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../SideBar';
import Header from '../Header';
import { useAuth } from '../../context/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  activeDashboard: string;
  setActiveDashboard: (id: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeDashboard, setActiveDashboard }) => {
  const { user } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="flex h-screen bg-jobby-gray-100">
      <Sidebar 
        expanded={sidebarExpanded} 
        toggleSidebar={toggleSidebar} 
        activeDashboard={activeDashboard}
        setActiveDashboard={setActiveDashboard}
      />
      
      <div className="flex flex-col flex-grow">
        <Header 
          sidebarExpanded={sidebarExpanded} 
          userName={user?.name || ''}
          showAddWidget={activeDashboard !== 'onboarding'}
        />
        
        <main className="flex-grow overflow-hidden">
          <motion.div
            key={activeDashboard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;