import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import MainLayout from './components/layout/MainLayout';
import PersonalBenefitsDashboard from './components/DasBoard/PersonalBenefitsDashboard';
import BenefitsManagementDashboard from './components/DasBoard/BenefitsManagementDashboard';
import ReportsDashboard from './components/DasBoard/ReportsDashboard';

// Internal component with authentication context access
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeDashboard, setActiveDashboard] = useState<string>('personal-benefits');
  
  // Determine default dashboard based on user role
  useEffect(() => {
    if (user) {
      if (user.role.employee) {
        setActiveDashboard('personal-benefits');
      } else if (user.role.employer) {
        setActiveDashboard('benefits-management');
      }
    }
  }, [user]);
  
  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-jobby-gray-100">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-jobby-purple border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-jobby-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  // Render the appropriate dashboard
  const renderDashboard = () => {
    switch (activeDashboard) {
      case 'personal-benefits':
        return <PersonalBenefitsDashboard />;
      case 'benefits-management':
        return <BenefitsManagementDashboard />;
      case 'reports': // Mantiene el ID igual, solo cambia la etiqueta en Sidebar
        return <ReportsDashboard />;
      default:
        return <PersonalBenefitsDashboard />;
    }
  };
  
  // Show main layout with selected dashboard
  return (
    <MainLayout 
      activeDashboard={activeDashboard}
      setActiveDashboard={setActiveDashboard}
    >
      {renderDashboard()}
    </MainLayout>
  );
};

// Main App component providing authentication context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;