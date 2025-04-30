import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage'; // Path fixed
import MainLayout from './components/layout/MainLayout'; // Fixed casing issue: Layout → layout
import PersonalBenefitsDashboard from './components/DashBoard/PersonalBenefitsDashboard'; // Full component name
import BenefitsManagementDashboard from './components/DashBoard/BenefitsManagementDashboard'; // Full component name
import OnboardingDashboard from './components/DashBoard/OnboardingDashboard'; // Full component name

// Componente interno con acceso al contexto de autenticación
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeDashboard, setActiveDashboard] = useState<string>('personal-benefits');
  
  // Determinar el dashboard predeterminado basado en el rol del usuario
  useEffect(() => {
    if (user) {
      if (user.role.employee) {
        setActiveDashboard('personal-benefits');
      } else if (user.role.employer) {
        setActiveDashboard('benefits-management');
      }
    }
  }, [user]);
  
  // Renderizar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-jobby-gray-100">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-jobby-purple border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-jobby-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  // Renderizar el dashboard activo
  const renderDashboard = () => {
    switch (activeDashboard) {
      case 'personal-benefits':
        return <PersonalBenefitsDashboard />;
      case 'benefits-management':
        return <BenefitsManagementDashboard />;
      case 'onboarding':
        return <OnboardingDashboard />;
      default:
        return <PersonalBenefitsDashboard />;
    }
  };
  
  // Mostrar el layout principal con el dashboard seleccionado
  return (
    <MainLayout 
      activeDashboard={activeDashboard}
      setActiveDashboard={setActiveDashboard}
    >
      {renderDashboard()}
    </MainLayout>
  );
};

// Componente App principal que proporciona el contexto de autenticación
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;