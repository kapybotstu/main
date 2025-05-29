import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Nivel 1: Administración Jobby
import Level1Dashboard from '../pages/level1/Level1Dashboard';
import CompanyManagement from '../pages/level1/CompanyManagement';
import JobbyBenefitsManagement from '../pages/level1/JobbyBenefitsManagement';
import BenefitRequestsManagement from '../pages/level1/BenefitRequestsManagement';
import ProviderManagement from '../pages/level1/ProviderManagement';
import TokenManagement from '../pages/level1/TokenManagement';
import ObtenerUsers from '../pages/level1/ObtenerUsers';
import AsignarNiveles from '../pages/level1/AsignarNiveles';

// Nivel 2: Recursos Humanos de empresa
import Level2Dashboard from '../pages/level2/Level2Dashboard';
import CompanyBenefitsManagement from '../pages/level2/CompanyBenefitsManagement';
import CompanyUsersManagement from '../pages/level2/CompanyUsersManagement';
import CompanyRequestsManagement from '../pages/level2/CompanyRequestsManagement';

// Nivel 3: Usuario final de empresa
import Level3Dashboard from '../pages/level3/Level3Dashboard';
import AvailableBenefits from '../pages/level3/AvailableBenefits';
import CompanyBenefits from '../pages/level3/CompanyBenefits';
import MyRequests from '../pages/level3/MyRequests';
import MyTokens from '../pages/level3/MyTokens';
import ProfileSurvey from '../pages/level3/ProfileSurvey';

// Nivel 4: Proveedores
import Level4Dashboard from '../pages/level4/Level4Dashboard';
import TokenVerification from '../pages/level4/TokenVerification';

const AppRoutes = () => {
  console.log("AppRoutes component rendered");
  
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rutas protegidas por nivel */}
      
      {/* Nivel 1: Administración Jobby */}
      <Route element={<ProtectedRoute requiredLevel={1} />}>
        <Route path="/level1" element={<MainLayout />}>
          <Route path="dashboard" element={
            <React.Suspense fallback={<div>Cargando dashboard...</div>}>
              <Level1Dashboard />
            </React.Suspense>
          } />
          <Route path="companies" element={<CompanyManagement />} />
          <Route path="benefits" element={<JobbyBenefitsManagement />} />
          <Route path="requests" element={<BenefitRequestsManagement />} />
          <Route path="providers" element={<ProviderManagement />} />
          <Route path="tokens" element={<TokenManagement />} />
          <Route path="diagnostico-usuarios" element={<ObtenerUsers />} />
          <Route path="asignar-niveles" element={<AsignarNiveles />} />
          <Route path="" element={<Navigate to="/level1/dashboard" replace />} />
        </Route>
      </Route>
      
      {/* Nivel 2: Recursos Humanos de empresa */}
      <Route element={<ProtectedRoute requiredLevel={2} />}>
        <Route path="/level2" element={<MainLayout />}>
          <Route path="dashboard" element={<Level2Dashboard />} />
          <Route path="benefits" element={<CompanyBenefitsManagement />} />
          <Route path="users" element={<CompanyUsersManagement />} />
          <Route path="requests" element={<CompanyRequestsManagement />} />
          <Route path="" element={<Navigate to="/level2/dashboard" replace />} />
        </Route>
      </Route>
      
      {/* Nivel 3: Usuario final de empresa */}
      <Route element={<ProtectedRoute requiredLevel={3} />}>
        <Route path="/level3" element={<MainLayout />}>
          <Route path="dashboard" element={<Level3Dashboard />} />
          <Route path="benefits" element={<AvailableBenefits />} />
          <Route path="company-benefits" element={<CompanyBenefits />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="tokens" element={<MyTokens />} />
          <Route path="" element={<Navigate to="/level3/dashboard" replace />} />
        </Route>
      </Route>
      
      {/* Ruta especial para la encuesta de nivel 3 (sin MainLayout) */}
      <Route element={<ProtectedRoute requiredLevel={3} />}>
        <Route path="/level3/survey" element={<ProfileSurvey />} />
      </Route>
      
      {/* Nivel 4: Proveedores */}
      <Route element={<ProtectedRoute requiredLevel={4} />}>
        <Route path="/level4" element={<MainLayout />}>
          <Route path="dashboard" element={<Level4Dashboard />} />
          <Route path="verify" element={<TokenVerification />} />
          <Route path="" element={<Navigate to="/level4/dashboard" replace />} />
        </Route>
      </Route>
      
      {/* Ruta para cualquier otra URL no definida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;