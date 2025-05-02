import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, LogOut, ChevronLeft, ChevronRight, Home, Gift, Settings, 
  Building, Users, CreditCard, FileText, HelpCircle, ChevronDown,
  BarChart3, Workflow
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  expanded: boolean;
  toggleSidebar: () => void;
  activeDashboard: string;
  setActiveDashboard: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  expanded, 
  toggleSidebar, 
  activeDashboard,
  setActiveDashboard
}) => {
  const { user, logout } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  // Tipos de dashboard disponibles
  const dashboardTypes: DashboardType[] = [
    { id: 'personal-benefits', name: 'Beneficios Propios', icon: <Gift size={20} /> },
    { id: 'benefits-management', name: 'Gestión de Beneficios', icon: <Settings size={20} /> },
    { id: 'reports', name: 'Prueba Jobby', icon: <FileText size={20} /> }, // Actualizado a "Prueba Jobby"
  ];
  
  // Determinar qué dashboard está disponible para cada rol
  const getAvailableDashboards = () => {
    if (!user) return [];
    
    // Admin puede ver todos los dashboards
    if (user.role.admin) {
      return dashboardTypes;
    }
    
    // Empleador puede ver gestión y reportes
    if (user.role.employer) {
      return dashboardTypes.filter(d => ['benefits-management', 'reports'].includes(d.id));
    }
    
    // Empleado ve beneficios propios y reportes básicos
    return dashboardTypes.filter(d => ['personal-benefits', 'reports'].includes(d.id));
  };

  const availableDashboards = getAvailableDashboards();
  
  // Toggle para los submenús
  const toggleMenu = (menuId: string) => {
    if (expandedMenu === menuId) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(menuId);
    }
  };
  
  const handleDashboardChange = (dashboardId: string) => {
    setActiveDashboard(dashboardId);
  };
  
  const sidebarVariants = {
    expanded: { width: 250 },
    collapsed: { width: 70 }
  };
  
  return (
    <motion.div
      className="h-screen bg-jobby-purple-dark text-white flex flex-col border-r border-jobby-purple-dark shadow-lg z-20"
      initial={expanded ? "expanded" : "collapsed"}
      animate={expanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-jobby-purple/20 flex justify-between items-center">
        {expanded && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-bold text-lg"
          >
            Jobby
          </motion.div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-jobby-purple/20"
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <nav className="p-2">
          <div className="mb-4 space-y-1">
            {availableDashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                onClick={() => handleDashboardChange(dashboard.id)}
                className={`w-full flex items-center p-2 rounded-md transition-colors ${
                  activeDashboard === dashboard.id 
                    ? 'bg-jobby-purple text-white' 
                    : 'text-jobby-gray-100 hover:bg-jobby-purple/20'
                }`}
              >
                <span className="flex-shrink-0">{dashboard.icon}</span>
                {expanded && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="ml-3 text-sm font-medium"
                  >
                    {dashboard.name}
                  </motion.span>
                )}
              </button>
            ))}
          </div>
          
          <div className="mb-2">
            <div className={`${expanded ? 'px-3' : 'px-1'} text-xs font-semibold text-jobby-gray-400 uppercase tracking-wider`}>
              {expanded ? 'Menú' : ''}
            </div>
          </div>
          
          <div className="space-y-1">
            {/* User Management (for admin and employer) */}
            {(user?.role.admin || user?.role.employer) && (
              <div>
                <button
                  onClick={() => toggleMenu('users')}
                  className="w-full flex items-center justify-between p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20"
                >
                  <div className="flex items-center">
                    <Users size={20} />
                    {expanded && (
                      <motion.span 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="ml-3 text-sm"
                      >
                        Usuarios
                      </motion.span>
                    )}
                  </div>
                  {expanded && (
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${expandedMenu === 'users' ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
                
                {expanded && expandedMenu === 'users' && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      <button className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20 text-sm">
                        Gestionar Usuarios
                      </button>
                      <button className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20 text-sm">
                        Permisos
                      </button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )}
            
            {/* Organization (for admin and employer) */}
            {(user?.role.admin || user?.role.employer) && (
              <div>
                <button
                  onClick={() => toggleMenu('organization')}
                  className="w-full flex items-center justify-between p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20"
                >
                  <div className="flex items-center">
                    <Building size={20} />
                    {expanded && (
                      <motion.span 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="ml-3 text-sm"
                      >
                        Organización
                      </motion.span>
                    )}
                  </div>
                  {expanded && (
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${expandedMenu === 'organization' ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
                
                {expanded && expandedMenu === 'organization' && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      <button className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20 text-sm">
                        Perfil de Empresa
                      </button>
                      <button className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20 text-sm">
                        Departamentos
                      </button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )}
            
            {/* Benefits Menu */}
            <div>
              <button
                onClick={() => toggleMenu('benefits')}
                className="w-full flex items-center justify-between p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20"
              >
                <div className="flex items-center">
                  <Gift size={20} />
                  {expanded && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="ml-3 text-sm"
                    >
                      Beneficios
                    </motion.span>
                  )}
                </div>
                {expanded && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${expandedMenu === 'benefits' ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
              
              {expanded && expandedMenu === 'benefits' && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-1 space-y-1"
                  >
                    <button className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20 text-sm">
                      Catálogo
                    </button>
                    <button className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20 text-sm">
                      Solicitudes
                    </button>
                    {(user?.role.admin || user?.role.employer) && (
                      <button className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20 text-sm">
                        Configuración
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
            
            {/* Analytics (for admin and employer) */}
            {(user?.role.admin || user?.role.employer) && (
              <button
                className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20"
              >
                <BarChart3 size={20} />
                {expanded && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="ml-3 text-sm"
                  >
                    Analítica
                  </motion.span>
                )}
              </button>
            )}
            
            {/* Help and Support */}
            <button
              className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20"
            >
              <HelpCircle size={20} />
              {expanded && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="ml-3 text-sm"
                >
                  Ayuda
                </motion.span>
              )}
            </button>
            
            {/* Workflows (for admin only) */}
            {user?.role.admin && (
              <button
                className="w-full flex items-center p-2 rounded-md text-jobby-gray-100 hover:bg-jobby-purple/20"
              >
                <Workflow size={20} />
                {expanded && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="ml-3 text-sm"
                  >
                    Flujos de trabajo
                  </motion.span>
                )}
              </button>
            )}
          </div>
        </nav>
      </div>
      
      {/* User info and logout */}
      <div className="p-3 border-t border-jobby-purple/20">
        {expanded ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-jobby-gold flex items-center justify-center text-white font-medium text-sm">
                {user?.avatar || user?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-jobby-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-jobby-purple/20 text-jobby-gray-300 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="h-8 w-8 rounded-full bg-jobby-gold flex items-center justify-center text-white font-medium text-sm">
              {user?.avatar || user?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-jobby-purple/20 text-jobby-gray-300 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;