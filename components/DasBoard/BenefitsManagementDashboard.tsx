import React, { useState } from 'react';
import { DashboardProvider } from '../../context/DashboardContext';
import Dashboard from '../Dashboard';
import { PieChart, BarChart3, Users, Package, Settings, ClipboardList, TrendingUp, Briefcase } from 'lucide-react';

// Dashboard para "Gestión de Beneficios"
const BenefitsManagementDashboard: React.FC = () => {
  const [showAddWidget, setShowAddWidget] = useState(false);
  
  const handleAddWidget = () => {
    setShowAddWidget(true);
  };
  
  // Datos específicos para este dashboard
  const managementData = {
    totalBudget: 120000,
    usedBudget: 75000,
    employeeCount: 124,
    activeUsers: 98,
    categoriesDistribution: [
      { name: 'Salud', percentage: 40, color: '#6366F1' },
      { name: 'Alimentación', percentage: 25, color: '#F59E0B' },
      { name: 'Entretenimiento', percentage: 15, color: '#EC4899' },
      { name: 'Educación', percentage: 12, color: '#10B981' },
      { name: 'Otros', percentage: 8, color: '#6B7280' },
    ],
    monthlyUsage: [
      { month: 'Ene', value: 8500 },
      { month: 'Feb', value: 9200 },
      { month: 'Mar', value: 9800 },
      { month: 'Abr', value: 10500 },
      { month: 'May', value: 11200 },
      { month: 'Jun', value: 12500 },
      { month: 'Jul', value: 13300 },
    ],
    pendingRequests: [
      { id: 'r1', user: 'María González', type: 'Reembolso', category: 'Salud', amount: 850, date: '2025-07-18' },
      { id: 'r2', user: 'Carlos López', type: 'Solicitud', category: 'Educación', amount: 1200, date: '2025-07-17' },
      { id: 'r3', user: 'Laura Martínez', type: 'Reembolso', category: 'Alimentación', amount: 320, date: '2025-07-16' },
    ],
    popularBenefits: [
      { id: 'b1', name: 'Seguro médico premium', users: 87, total: 124, trend: '+12%' },
      { id: 'b2', name: 'Vales de comida', users: 96, total: 124, trend: '+8%' },
      { id: 'b3', name: 'Plataforma de cursos online', users: 72, total: 124, trend: '+15%' },
      { id: 'b4', name: 'Gimnasio', users: 64, total: 124, trend: '+5%' },
    ]
  };

  // Widget para mostrar el resumen de presupuesto
  const BudgetSummaryWidget = () => (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <h3 className="text-lg font-semibold text-jobby-gray-800 mb-4">Presupuesto de Beneficios</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-jobby-gray-200 rounded-lg">
          <p className="text-sm text-jobby-gray-600 mb-1">Presupuesto Total</p>
          <p className="text-xl font-bold text-jobby-gray-800">${managementData.totalBudget.toLocaleString()}</p>
        </div>
        
        <div className="p-4 border border-jobby-gray-200 rounded-lg">
          <p className="text-sm text-jobby-gray-600 mb-1">Utilizado</p>
          <p className="text-xl font-bold text-jobby-purple">${managementData.usedBudget.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-jobby-gray-600">Progreso anual</span>
          <span className="text-sm font-medium text-jobby-gray-800">
            {Math.round((managementData.usedBudget / managementData.totalBudget) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-jobby-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-jobby-purple"
            style={{ width: `${(managementData.usedBudget / managementData.totalBudget) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-jobby-gray-200 rounded-lg">
          <p className="text-sm text-jobby-gray-600 mb-1">Empleados</p>
          <p className="text-xl font-bold text-jobby-gray-800">{managementData.employeeCount}</p>
        </div>
        
        <div className="p-4 border border-jobby-gray-200 rounded-lg">
          <p className="text-sm text-jobby-gray-600 mb-1">Usuarios Activos</p>
          <div className="flex items-end">
            <p className="text-xl font-bold text-jobby-purple">{managementData.activeUsers}</p>
            <p className="text-sm text-jobby-gray-600 ml-1 mb-0.5">
              ({Math.round((managementData.activeUsers / managementData.employeeCount) * 100)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Widget para mostrar la distribución de categorías
  const CategoriesDistributionWidget = () => {
    // Calcular las posiciones para el gráfico circular
    let cumulativePercentage = 0;
    const pieChartSegments = managementData.categoriesDistribution.map((category, index) => {
      const startAngle = cumulativePercentage;
      cumulativePercentage += category.percentage;
      
      return {
        ...category,
        startAngle,
        endAngle: cumulativePercentage
      };
    });
    
    return (
      <div className="bg-white rounded-xl shadow-md p-5 h-full">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-3">
            <PieChart size={20} />
          </div>
          <h3 className="text-lg font-semibold text-jobby-gray-800">Distribución por Categoría</h3>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {pieChartSegments.map((item, index) => {
                // Convertir porcentajes a ángulos para SVG
                const percentage = item.percentage;
                const startAngle = item.startAngle;
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={`${percentage} ${100 - percentage}`}
                    strokeDashoffset={`${-startAngle}`}
                    className="transition-all duration-500 ease-in-out"
                  />
                );
              })}
              <circle cx="50" cy="50" r="30" fill="white" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-2">
          {managementData.categoriesDistribution.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-jobby-gray-700">{category.name}</span>
              </div>
              <span className="text-sm font-medium">{category.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Widget para mostrar solicitudes pendientes
  const PendingRequestsWidget = () => (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-gold/10 text-jobby-gold mr-3">
          <ClipboardList size={20} />
        </div>
        <h3 className="text-lg font-semibold text-jobby-gray-800">Solicitudes Pendientes</h3>
      </div>
      
      {managementData.pendingRequests.length > 0 ? (
        <div className="space-y-3">
          {managementData.pendingRequests.map((request) => (
            <div 
              key={request.id} 
              className="p-3 rounded-lg border border-jobby-gray-200 hover:border-jobby-purple/50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-jobby-gray-800">{request.user}</h4>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      request.type === 'Reembolso' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    } mr-2`}>
                      {request.type}
                    </span>
                    <span className="text-xs text-jobby-gray-500">
                      {request.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-jobby-purple">${request.amount.toLocaleString()}</span>
                  <p className="text-xs text-jobby-gray-500 mt-1">
                    {new Date(request.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-3">
                <button className="flex-1 py-1 text-xs font-medium text-white bg-jobby-purple rounded-md hover:bg-jobby-purple-dark">
                  Aprobar
                </button>
                <button className="flex-1 py-1 text-xs font-medium text-jobby-gray-700 bg-jobby-gray-100 rounded-md hover:bg-jobby-gray-200">
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-jobby-gray-500">
          No hay solicitudes pendientes
        </div>
      )}
      
      <button className="w-full mt-4 py-2 text-center text-sm font-medium text-jobby-purple hover:text-jobby-purple-dark">
        Ver todas las solicitudes
      </button>
    </div>
  );

  // Widget para mostrar los beneficios más populares
  const PopularBenefitsWidget = () => (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-3">
          <TrendingUp size={20} />
        </div>
        <h3 className="text-lg font-semibold text-jobby-gray-800">Beneficios Populares</h3>
      </div>
      
      <div className="space-y-4">
        {managementData.popularBenefits.map((benefit) => (
          <div key={benefit.id} className="p-3 border border-jobby-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-jobby-gray-800">{benefit.name}</h4>
              <span className="text-xs font-medium text-green-600">{benefit.trend}</span>
            </div>
            
            <div className="flex justify-between mt-2 items-center">
              <span className="text-sm text-jobby-gray-600">
                {benefit.users} de {benefit.total} empleados
              </span>
              <span className="text-sm font-medium text-jobby-gray-800">
                {Math.round((benefit.users / benefit.total) * 100)}%
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-jobby-gray-200 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-jobby-purple"
                style={{ width: `${(benefit.users / benefit.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Widget para el uso mensual
  const MonthlyUsageWidget = () => (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-gold/10 text-jobby-gold mr-3">
          <BarChart3 size={20} />
        </div>
        <h3 className="text-lg font-semibold text-jobby-gray-800">Uso Mensual</h3>
      </div>
      
      <div className="h-64 flex items-end space-x-1 mb-4">
        {managementData.monthlyUsage.map((month, index) => {
          const maxValue = Math.max(...managementData.monthlyUsage.map(m => m.value));
          const height = (month.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full h-40 flex items-end">
                <div 
                  className="w-full bg-jobby-purple hover:bg-jobby-purple-dark transition-all rounded-t"
                  style={{ height: `${height}%` }}
                >
                </div>
              </div>
              <div className="text-xs text-jobby-gray-600 mt-2">{month.month}</div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-jobby-gray-500">Promedio mensual</p>
          <p className="text-sm font-medium text-jobby-gray-800">
            ${Math.round(managementData.monthlyUsage.reduce((a, b) => a + b.value, 0) / managementData.monthlyUsage.length).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-jobby-gray-500">Tendencia</p>
          <p className="text-sm font-medium text-green-600">+12% mensual</p>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardProvider>
      <div className="p-4 h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <BudgetSummaryWidget />
          </div>
          <div>
            <CategoriesDistributionWidget />
          </div>
          <div>
            <PendingRequestsWidget />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <PopularBenefitsWidget />
          </div>
          <div>
            <MonthlyUsageWidget />
          </div>
          <div>
            <Dashboard onAddWidget={handleAddWidget} />
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default BenefitsManagementDashboard;