import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Nivel 1: Administración Jobby
import Level1Dashboard from '../pages/level1/Level1Dashboard';
import CompanyManagement from '../pages/level1/companies/CompanyManagement';
import JobbyBenefitsManagement from '../pages/level1/benefits/JobbyBenefitsManagement';
import BenefitRequestsManagement from '../pages/level1/benefits/BenefitRequestsManagement';
import ProviderManagement from '../pages/level1/providers/ProviderManagement';
import TokenManagement from '../pages/level1/tokens/TokenManagement';
import ObtenerUsers from '../pages/level1/users/ObtenerUsers';
import AsignarNiveles from '../pages/level1/users/AsignarNiveles';
import AchievementsManagement from '../pages/level1/achievements/AchievementsManagement';
import SurveyManagement from '../pages/level1/surveys/SurveyManagement';
import BotManagement from '../pages/level1/bot/BotManagement';

// Nivel 2: Recursos Humanos de empresa
import Level2Dashboard from '../pages/level2/Level2Dashboard';
import CompanyBenefitsManagement from '../pages/level2/CompanyBenefitsManagement';
import CompanyTokensManagement from '../pages/level2/CompanyTokensManagement';
import CompanyUsersManagement from '../pages/level2/CompanyUsersManagement';
import CompanyRequestsManagement from '../pages/level2/CompanyRequestsManagement';
import BotMessaging from '../pages/level2/BotMessaging';

// Nivel 3: Usuario final de empresa
import Level3Dashboard from '../pages/level3/Level3Dashboard';
import AvailableBenefits from '../pages/level3/AvailableBenefits';
import CompanyBenefits from '../pages/level3/CompanyBenefits';
import MyRequests from '../pages/level3/MyRequests';
import ProfileSurvey from '../pages/level3/ProfileSurvey';
import ProfileSurveyB from '../pages/level3/ProfileSurveyB';
import DiagnosticPage from '../pages/level3/DiagnosticPage';
import Cascade from '../pages/level3/cascade';

// Nivel 4: Proveedores
import ProviderPortal from '../pages/level4/ProviderPortal';

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
          <Route path="benefits">
            <Route path="jobby" element={<JobbyBenefitsManagement />} />
            <Route path="requests" element={<BenefitRequestsManagement />} />
          </Route>
          <Route path="users">
            <Route path="list" element={<ObtenerUsers />} />
            <Route path="assign-levels" element={<AsignarNiveles />} />
          </Route>
          <Route path="providers" element={<ProviderManagement />} />
          <Route path="tokens" element={<TokenManagement />} />
          <Route path="achievements" element={<AchievementsManagement />} />
          <Route path="surveys" element={<SurveyManagement />} />
          <Route path="bot-management" element={<BotManagement />} />
          <Route path="" element={<Navigate to="/level1/dashboard" replace />} />
        </Route>
      </Route>
      
      {/* Nivel 2: Recursos Humanos de empresa */}
      <Route element={<ProtectedRoute requiredLevel={2} />}>
        <Route path="/level2" element={<MainLayout />}>
          <Route path="dashboard" element={<Level2Dashboard />} />
          <Route path="benefits" element={<CompanyBenefitsManagement />} />
          <Route path="tokens" element={<CompanyTokensManagement />} />
          <Route path="users" element={<CompanyUsersManagement />} />
          <Route path="requests" element={<CompanyRequestsManagement />} />
          <Route path="bot-messaging" element={<BotMessaging />} />
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
          <Route path="diagnostic" element={<DiagnosticPage />} />
          <Route path="cascade" element={<Cascade />} />
          <Route path="" element={<Navigate to="/level3/cascade" replace />} />
        </Route>
      </Route>
      
      {/* Rutas especiales para encuestas de nivel 3 (sin MainLayout) */}
      <Route element={<ProtectedRoute requiredLevel={3} />}>
        <Route path="/level3/survey" element={<ProfileSurvey />} />
        <Route path="/level3/survey-b" element={<ProfileSurveyB />} />
      </Route>
      
      {/* Nivel 4: Proveedores - Sin sidebar */}
      <Route element={<ProtectedRoute requiredLevel={4} />}>
        <Route path="/level4" element={<ProviderPortal />} />
      </Route>
      
      {/* Ruta para cualquier otra URL no definida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;