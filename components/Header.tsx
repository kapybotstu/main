import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Bell, Settings, Search, PlusCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
// Importar el logo como un módulo
import logoImage from '../assets/logotipo-jobby-3.png';

interface HeaderProps {
  onAddWidget: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddWidget }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resetLayout } = useDashboard();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-jobby-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-6">
            <img 
              src={logoImage} 
              alt="Jobby Logo" 
              className="h-10"
            />
          </div>
          
          <div className="hidden md:flex items-center">
            <div className="relative mr-2">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-jobby-gray-300 focus:outline-none focus:ring-2 focus:ring-jobby-purple text-sm w-64"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-jobby-gray-500" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddWidget}
            className="hidden md:flex items-center gap-2 bg-jobby-purple text-white py-2 px-4 rounded-lg text-sm font-medium"
          >
            <PlusCircle size={16} />
            <span>Add Widget</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetLayout}
            className="hidden md:block text-jobby-gray-700 hover:text-jobby-purple py-2 px-3 rounded-lg text-sm font-medium"
          >
            Reset Layout
          </motion.button>
          
          <button className="p-2 rounded-full hover:bg-jobby-gray-100">
            <Bell className="h-5 w-5 text-jobby-gray-700" />
          </button>
          
          <button className="p-2 rounded-full hover:bg-jobby-gray-100">
            <Settings className="h-5 w-5 text-jobby-gray-700" />
          </button>
          
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-jobby-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-jobby-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-jobby-gray-700" />
              )}
            </button>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-jobby-gold flex items-center justify-center text-white font-medium">
                JS
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-jobby-gray-200 py-4 px-4"
        >
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-jobby-gray-300 focus:outline-none focus:ring-2 focus:ring-jobby-purple"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-jobby-gray-500" />
            </div>
            
            <button
              onClick={onAddWidget}
              className="flex items-center justify-center gap-2 bg-jobby-purple text-white py-2 px-4 rounded-lg font-medium"
            >
              <PlusCircle size={16} />
              <span>Add Widget</span>
            </button>
            
            <button
              onClick={resetLayout}
              className="text-jobby-gray-700 py-2 px-4 rounded-lg font-medium"
            >
              Reset Layout
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;