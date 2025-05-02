import React, { useEffect } from 'react';
import { DashboardProvider, useDashboard } from '../../context/DashboardContext';
import Dashboard from '../Dashboard';
import { 
  BarChart3, PieChart, FileText, Download,
  Calendar, TrendingUp, Table, Filter
} from 'lucide-react';
import { Widget } from '../../types';

// Dashboard component for Reports
const ReportsDashboard: React.FC = () => {
  // Wrap the entire component with the DashboardProvider
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
    // Create predefined widgets for Reports dashboard
    const widgets: Widget[] = [
      // Reports Summary Widget (stats type)
      {
        id: 'reports-summary',
        type: 'stats',
        title: 'Resumen de Reportes',
        customizable: true,
        content: {
          icon: FileText,
          stats: [
            { label: 'Reportes Generados', value: 28, color: 'bg-purple-500' },
            { label: 'Reportes Pendientes', value: 5, color: 'bg-yellow-500' },
            { label: 'Total de Descargas', value: 142, color: 'bg-green-500' },
          ]
        }
      },
      
      // Benefits Usage Widget (chart type)
      {
        id: 'benefits-usage',
        type: 'chart',
        title: 'Uso de Beneficios',
        customizable: true,
        content: {
          type: 'pie',
          icon: PieChart,
          data: [
            { label: 'Salud', value: 45, color: '#6366F1' },
            { label: 'Alimentación', value: 32, color: '#F59E0B' },
            { label: 'Entretenimiento', value: 15, color: '#EC4899' },
            { label: 'Educación', value: 8, color: '#10B981' },
          ]
        }
      },
      
      // Monthly Expenses Widget (chart type)
      {
        id: 'monthly-expenses',
        type: 'chart',
        title: 'Gastos Mensuales',
        customizable: true,
        content: {
          type: 'bar',
          icon: BarChart3,
          data: [
            { label: 'Ene', value: 12500, color: '#6366F1' },
            { label: 'Feb', value: 13200, color: '#6366F1' },
            { label: 'Mar', value: 14300, color: '#6366F1' },
            { label: 'Abr', value: 15100, color: '#6366F1' },
            { label: 'May', value: 14800, color: '#6366F1' },
            { label: 'Jun', value: 16200, color: '#6366F1' },
            { label: 'Jul', value: 17500, color: '#6366F1' },
          ]
        }
      },
      
      // Recent Reports Widget (messages type)
      {
        id: 'recent-reports',
        type: 'messages',
        title: 'Reportes Recientes',
        customizable: true,
        content: {
          icon: FileText,
          messages: [
            { 
              id: 'r1', 
              sender: 'Reporte Trimestral', 
              role: 'Análisis', 
              content: 'Análisis trimestral de uso de beneficios', 
              time: '18/7/2025', 
              unread: true 
            },
            { 
              id: 'r2', 
              sender: 'Reporte de Satisfacción', 
              role: 'Encuesta', 
              content: 'Resultados de la encuesta de satisfacción', 
              time: '15/7/2025', 
              unread: false 
            },
            { 
              id: 'r3', 
              sender: 'Análisis de Tendencias', 
              role: 'Estadísticas', 
              content: 'Tendencias de uso por departamento', 
              time: '10/7/2025', 
              unread: false 
            },
          ]
        }
      },
      
      // Scheduled Reports Widget (calendar type)
      {
        id: 'scheduled-reports',
        type: 'calendar',
        title: 'Reportes Programados',
        customizable: true,
        content: {
          icon: Calendar,
          events: [
            { id: 'e1', title: 'Reporte Mensual de Beneficios', date: '2025-08-01T09:00:00', type: 'monthly' },
            { id: 'e2', title: 'Análisis de Gastos por Departamento', date: '2025-07-25T14:00:00', type: 'analysis' },
            { id: 'e3', title: 'Reporte para Directivos', date: '2025-08-15T10:00:00', type: 'executive' },
          ]
        }
      },
      
      // KPI Tracking Widget (connections type)
      {
        id: 'kpi-tracking',
        type: 'connections',
        title: 'Seguimiento de KPIs',
        customizable: true,
        content: {
          icon: TrendingUp,
          connections: [
            { id: 'k1', name: 'Adopción de Beneficios', company: '87% (+5%)', role: 'Creciente', date: '2025-07-01' },
            { id: 'k2', name: 'Satisfacción del Usuario', company: '92% (+2%)', role: 'Estable', date: '2025-07-01' },
            { id: 'k3', name: 'ROI de Programa', company: '128% (+8%)', role: 'Creciente', date: '2025-07-01' },
            { id: 'k4', name: 'Eficiencia en Procesos', company: '76% (+3%)', role: 'Creciente', date: '2025-07-01' },
          ]
        }
      },
      
      // Report Tasks Widget (tasks type)
      {
        id: 'report-tasks',
        type: 'tasks',
        title: 'Tareas de Reportes',
        customizable: true,
        content: {
          icon: Table,
          tasks: [
            { id: 't1', text: 'Finalizar reporte trimestral', completed: false, dueDate: '2025-07-28' },
            { id: 't2', text: 'Recopilar datos de encuesta', completed: true, dueDate: '2025-07-15' },
            { id: 't3', text: 'Presentar análisis a directivos', completed: false, dueDate: '2025-08-10' },
            { id: 't4', text: 'Actualizar KPIs de departamento', completed: false, dueDate: '2025-07-22' },
          ]
        }
      },
      
      // Report Filters Widget (notes type)
      {
        id: 'report-filters',
        type: 'notes',
        title: 'Filtros Guardados',
        customizable: true,
        content: {
          icon: Filter,
          notes: [
            { id: 'n1', text: 'Departamento de Marketing: Uso de beneficios educativos Q2 2025', date: '2025-07-12' },
            { id: 'n2', text: 'Comparativa anual: Gastos en salud por nivel jerárquico', date: '2025-07-08' },
            { id: 'n3', text: 'Análisis demográfico: Preferencias por generación', date: '2025-07-05' },
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

export default ReportsDashboard;