import React, { useEffect } from 'react';
import { DashboardProvider, useDashboard } from '../../context/DashboardContext';
import Dashboard from '../Dashboard';
import { 
  Gift, Package, Ticket, Award, Calendar, 
  CreditCard, Compass, FileText, ListTodo
} from 'lucide-react';
import { Widget } from '../../types';

// Dashboard for "Beneficios Propios"
const PersonalBenefitsDashboard: React.FC = () => {
  // Wrap the entire component with DashboardProvider
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
    // Create predefined widgets for Personal Benefits dashboard
    // These should match the widget types in your widgets folder
    const widgets: Widget[] = [
      // Benefits Summary Widget (stats type)
      {
        id: 'benefits-summary',
        type: 'stats',
        title: 'Mis Beneficios',
        customizable: true,
        content: {
          icon: Gift,
          stats: [
            { label: 'Balance Disponible', value: 5200, color: 'bg-purple-500' },
            { label: 'Utilizado', value: 2800, color: 'bg-yellow-500' },
            { label: 'Total', value: 8000, color: 'bg-green-500' },
          ]
        }
      },
      
      // Categories Chart (chart type)
      {
        id: 'benefits-categories',
        type: 'chart',
        title: 'Distribución de Beneficios',
        customizable: true,
        content: {
          type: 'pie',
          icon: Award,
          data: [
            { label: 'Salud', value: 1200, color: '#6366F1' },
            { label: 'Alimentación', value: 800, color: '#F59E0B' },
            { label: 'Entretenimiento', value: 500, color: '#EC4899' },
            { label: 'Educación', value: 300, color: '#10B981' },
          ]
        }
      },
      
      // Upcoming Events Widget (calendar type)
      {
        id: 'upcoming-events',
        type: 'calendar',
        title: 'Próximos Eventos',
        customizable: true,
        content: {
          icon: Calendar,
          events: [
            { id: 'e1', title: 'Día de wellbeing - Yoga', date: '2025-07-25T10:00:00', type: 'wellbeing' },
            { id: 'e2', title: 'Webinar: Finanzas personales', date: '2025-07-28T16:00:00', type: 'education' },
          ]
        }
      },
      
      // Recent Transactions Widget (messages type)
      {
        id: 'recent-transactions',
        type: 'messages',
        title: 'Transacciones Recientes',
        customizable: true,
        content: {
          icon: CreditCard,
          messages: [
            { 
              id: 't1', 
              sender: 'Suscripción Premium', 
              role: 'Entretenimiento', 
              content: 'Pago procesado', 
              time: '2025-07-15', 
              unread: false 
            },
            { 
              id: 't2', 
              sender: 'Reembolso médico', 
              role: 'Salud', 
              content: 'Reembolso aprobado', 
              time: '2025-07-12', 
              unread: false 
            },
            { 
              id: 't3', 
              sender: 'Tarjeta regalo restaurante', 
              role: 'Alimentación', 
              content: 'Compra aprobada', 
              time: '2025-07-08', 
              unread: false 
            },
          ]
        }
      },
      
      // Tasks Widget (tasks type)
      {
        id: 'benefits-tasks',
        type: 'tasks',
        title: 'Tareas Pendientes',
        customizable: true,
        content: {
          icon: ListTodo,
          tasks: [
            { id: 'task1', text: 'Solicitar reembolso médico', completed: false, dueDate: '2025-07-30' },
            { id: 'task2', text: 'Registrarse para el programa de bienestar', completed: true, dueDate: '2025-07-15' },
            { id: 'task3', text: 'Programar chequeo anual', completed: false, dueDate: '2025-08-10' },
          ]
        }
      },
      
      // Notes Widget (notes type)
      {
        id: 'benefits-notes',
        type: 'notes',
        title: 'Mis Notas',
        customizable: true,
        content: {
          icon: FileText,
          notes: [
            { id: 'n1', text: 'Recordar solicitar reembolso de la consulta dental antes del 30 de julio', date: '2025-07-10' },
            { id: 'n2', text: 'Revisar nuevos cursos disponibles en la plataforma de educación', date: '2025-07-08' },
            { id: 'n3', text: 'Consultar sobre descuentos para gimnasio', date: '2025-07-05' },
          ]
        }
      },
      
      // Explore Benefits Widget (connections type)
      {
        id: 'explore-benefits',
        type: 'connections',
        title: 'Explorar Beneficios',
        customizable: true,
        content: {
          icon: Compass,
          connections: [
            { id: 'b1', name: 'Salud y Bienestar', company: 'Seguros, gimnasio, mindfulness', role: 'Disponible', date: '2025-07-01' },
            { id: 'b2', name: 'Alimentación', company: 'Tarjetas, restaurantes, delivery', role: 'Disponible', date: '2025-07-01' },
            { id: 'b3', name: 'Entretenimiento', company: 'Streaming, eventos, cine', role: 'Disponible', date: '2025-07-01' },
            { id: 'b4', name: 'Educación', company: 'Cursos, libros, conferencias', role: 'Disponible', date: '2025-07-01' },
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

export default PersonalBenefitsDashboard;