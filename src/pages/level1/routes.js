import React, { lazy } from 'react';

// Dashboard principal
const Level1Dashboard = lazy(() => import('./Level1Dashboard'));

// Componentes de empresas
const CompanyManagement = lazy(() => import('./companies/CompanyManagement'));

// Componentes de usuarios
const AsignarNiveles = lazy(() => import('./users/AsignarNiveles'));
const ObtenerUsers = lazy(() => import('./users/ObtenerUsers'));

// Componentes de beneficios
const JobbyBenefitsManagement = lazy(() => import('./benefits/JobbyBenefitsManagement'));
const BenefitRequestsManagement = lazy(() => import('./benefits/BenefitRequestsManagement'));

// Componentes de tokens
const TokenManagement = lazy(() => import('./tokens/TokenManagement'));

// Componentes de logros
const AchievementsManagement = lazy(() => import('./achievements/AchievementsManagement'));

// Componentes de proveedores
const ProviderManagement = lazy(() => import('./providers/ProviderManagement'));

export const level1Routes = [
  {
    path: '/level1',
    element: <Level1Dashboard />,
    children: [
      // Rutas de empresas
      {
        path: 'companies',
        element: <CompanyManagement />
      },
      // Rutas de usuarios
      {
        path: 'users',
        children: [
          {
            path: 'assign-levels',
            element: <AsignarNiveles />
          },
          {
            path: 'list',
            element: <ObtenerUsers />
          }
        ]
      },
      // Rutas de beneficios
      {
        path: 'benefits',
        children: [
          {
            path: 'jobby',
            element: <JobbyBenefitsManagement />
          },
          {
            path: 'requests',
            element: <BenefitRequestsManagement />
          }
        ]
      },
      // Rutas de tokens
      {
        path: 'tokens',
        element: <TokenManagement />
      },
      // Rutas de logros
      {
        path: 'achievements',
        element: <AchievementsManagement />
      },
      // Rutas de proveedores
      {
        path: 'providers',
        element: <ProviderManagement />
      }
    ]
  }
];

// Exportar componentes individuales para retrocompatibilidad
export {
  Level1Dashboard,
  CompanyManagement,
  AsignarNiveles,
  ObtenerUsers,
  JobbyBenefitsManagement,
  BenefitRequestsManagement,
  TokenManagement,
  AchievementsManagement,
  ProviderManagement
};