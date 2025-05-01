import React, { useEffect } from 'react';
import { DashboardProvider, useDashboard } from '../../context/DashboardContext';
import Dashboard from '../Dashboard';
import { 
  PieChart, BarChart3, Users, Package, 
  Calendar, MessageSquare, ListTodo, Briefcase, FileText
} from 'lucide-react';
import { Widget } from '../../types';

// Dashboard component for Benefits Management
const BenefitsManagementDashboard: React.FC = () => {
  // Wrap the entire component with just the Dashboard component
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

// Separate component to use the dashboard context
const DashboardContent: React.FC = () => {
  const { saveWidget, layout } = useDashboard();
  
  // Initialize widgets on first load if needed
  useEffect(() => {
    if (layout.widgets.length === 0) {
      // Add widgets from the widgets directory
      initializeDashboardWidgets();
    }
  }, []);
  
  const initializeDashboardWidgets = () => {
    // Create predefined widgets for Benefits Management dashboard
    // These should match the widget types in your widgets folder
    const widgets: Widget[] = [
      // Budget Summary Widget (stats type)
      {
        id: 'budget-summary',
        type: 'stats',
        title: 'Presupuesto de Beneficios',
        customizable: true,
        content: {
          icon: Briefcase,
          stats: [
            { label: 'Presupuesto Total', value: 120000, color: 'bg-purple-500' },
            { label: 'Utilizado', value: 75000, color: 'bg-yellow-500' },
            { label: 'Empleados', value: 124, color: 'bg-green-500' },
          ]
        }
      },
      
      // Categories Distribution Widget (chart type)
      {
        id: 'categories-distribution',
        type: 'chart',
        title: 'Distribución por Categoría',
        customizable: true,
        content: {
          type: 'pie',
          icon: PieChart,
          data: [
            { label: 'Salud', value: 40, color: '#6366F1' },
            { label: 'Alimentación', value: 25, color: '#F59E0B' },
            { label: 'Entretenimiento', value: 15, color: '#EC4899' },
            { label: 'Educación', value: 12, color: '#10B981' },
            { label: 'Otros', value: 8, color: '#6B7280' },
          ]
        }
      },
      
      // Pending Requests Widget (messages type)
      {
        id: 'pending-requests',
        type: 'messages',
        title: 'Solicitudes Pendientes',
        customizable: true,
        content: {
          icon: MessageSquare,
          messages: [
            { 
              id: 'r1', 
              sender: 'María González', 
              role: 'Reembolso - Salud', 
              content: 'Solicitud de reembolso médico', 
              time: '17/7/2025', 
              unread: true 
            },
            { 
              id: 'r2', 
              sender: 'Carlos López', 
              role: 'Solicitud - Educación', 
              content: 'Solicitud para curso online', 
              time: '16/7/2025', 
              unread: true 
            },
            { 
              id: 'r3', 
              sender: 'Laura Martínez', 
              role: 'Reembolso - Alimentación', 
              content: 'Reembolso de vales de comida', 
              time: '15/7/2025', 
              unread: false 
            },
          ]
        }
      },
      
      // Popular Benefits Widget (connections type)
      {
        id: 'popular-benefits',
        type: 'connections',
        title: 'Beneficios Populares',
        customizable: true,
        content: {
          icon: Users,
          connections: [
            { id: 'b1', name: 'Seguro médico premium', company: '87/124 usuarios', role: '+12%', date: '2025-07-01' },
            { id: 'b2', name: 'Vales de comida', company: '96/124 usuarios', role: '+8%', date: '2025-07-01' },
            { id: 'b3', name: 'Plataforma de cursos', company: '72/124 usuarios', role: '+15%', date: '2025-07-01' },
            { id: 'b4', name: 'Gimnasio', company: '64/124 usuarios', role: '+5%', date: '2025-07-01' },
          ]
        }
      },
      
      // Monthly Usage Widget (chart type)
      {
        id: 'monthly-usage',
        type: 'chart',
        title: 'Uso Mensual',
        customizable: true,
        content: {
          type: 'bar',
          icon: BarChart3,
          data: [
            { label: 'Ene', value: 8500, color: '#6366F1' },
            { label: 'Feb', value: 9200, color: '#6366F1' },
            { label: 'Mar', value: 9800, color: '#6366F1' },
            { label: 'Abr', value: 10500, color: '#6366F1' },
            { label: 'May', value: 11200, color: '#6366F1' },
            { label: 'Jun', value: 12500, color: '#6366F1' },
            { label: 'Jul', value: 13300, color: '#6366F1' },
          ]
        }
      },
      
      // Tasks Widget
      {
        id: 'tasks-widget',
        type: 'tasks',
        title: 'Tareas Pendientes',
        customizable: true,
        content: {
          icon: ListTodo,
          tasks: [
            { id: 't1', text: 'Revisar solicitudes de reembolso', completed: false, dueDate: '2025-07-20' },
            { id: 't2', text: 'Actualizar catálogo de beneficios', completed: true, dueDate: '2025-07-15' },
            { id: 't3', text: 'Reunión con proveedores', completed: false, dueDate: '2025-07-22' },
            { id: 't4', text: 'Análisis de uso trimestral', completed: false, dueDate: '2025-07-30' },
          ]
        }
      },
      
      // Calendar Widget
      {
        id: 'calendar-widget',
        type: 'calendar',
        title: 'Eventos Próximos',
        customizable: true,
        content: {
          icon: Calendar,
          events: [
            { id: 'e1', title: 'Presentación de nuevos beneficios', date: '2025-07-25T10:00:00', type: 'meeting' },
            { id: 'e2', title: 'Webinar: Gestión de beneficios', date: '2025-07-28T16:00:00', type: 'webinar' },
            { id: 'e3', title: 'Entrenamiento para HR', date: '2025-08-05T09:00:00', type: 'training' },
          ]
        }
      },
    ];
    
    // Add each widget to the dashboard
    widgets.forEach(widget => {
      saveWidget(widget);
    });
  };
  
  return (
    <div className="p-4 h-full">
      {/* Use ONLY the Dashboard component */}
      <Dashboard />
    </div>
  );
};

export default BenefitsManagementDashboard;