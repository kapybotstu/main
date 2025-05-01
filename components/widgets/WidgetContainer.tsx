import React from 'react';
import { motion } from 'framer-motion';
import { X, Minimize, Maximize, Settings, GripHorizontal, Lock } from 'lucide-react';
import { Widget } from '../../types';
import { useDashboard } from '../../context/DashboardContext';
import StatsWidget from './StatsWidget';
import ChartWidget from './ChartWidget';
import TasksWidget from './TasksWidget';
import CalendarWidget from './CalendarWidget';
import MessagesWidget from './MessagesWidget';
import ApplicationsWidget from './ApplicationsWidget';
import NotesWidget from './NotesWidget';
import ConnectionsWidget from './ConnectionsWidget';

interface WidgetContainerProps {
  widget: Widget;
  onEdit?: () => void;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ widget, onEdit }) => {
  const { removeWidget, toggleMinimize } = useDashboard();
  
  // Determinar si el widget está bloqueado (para Onboarding Dashboard)
  const isBlocked = widget.title?.includes('(Bloqueado)') || false;
  
  const renderWidgetContent = () => {
    if (widget.minimized) {
      return null;
    }

    // Si el widget está bloqueado, mostramos un contenido alternativo o vacío
    if (isBlocked) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Lock className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-center text-sm">
            Esta función estará disponible al completar el onboarding
          </p>
        </div>
      );
    }

    // Renderiza el widget normal según su tipo
    switch (widget.type) {
      case 'stats':
        return <StatsWidget data={widget.content} />;
      case 'chart':
        return <ChartWidget data={widget.content} />;
      case 'tasks':
        return <TasksWidget data={widget.content} />;
      case 'calendar':
        return <CalendarWidget data={widget.content} />;
      case 'messages':
        return <MessagesWidget data={widget.content} />;
      case 'applications':
        return <ApplicationsWidget />;
      case 'notes':
        return <NotesWidget data={widget.content} />;
      case 'connections':
        return <ConnectionsWidget data={widget.content} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <motion.div 
      className={`bg-white rounded-lg shadow-widget hover:shadow-widget-hover transition-shadow h-full flex flex-col overflow-hidden ${
        isBlocked ? 'opacity-75' : ''
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <div className="px-4 py-3 flex items-center justify-between border-b border-jobby-gray-200 drag-handle cursor-move">
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-jobby-gray-400" />
          <h3 className="font-semibold text-jobby-gray-800 truncate">
            {widget.title}
            {isBlocked && (
              <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                Bloqueado
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          {widget.customizable && !isBlocked && (
            <button 
              onClick={onEdit}
              className="p-1.5 rounded-md hover:bg-jobby-gray-100 text-jobby-gray-500 hover:text-jobby-gray-700"
            >
              <Settings size={14} />
            </button>
          )}
          <button 
            onClick={() => toggleMinimize(widget.id)}
            className="p-1.5 rounded-md hover:bg-jobby-gray-100 text-jobby-gray-500 hover:text-jobby-gray-700"
          >
            {widget.minimized ? <Maximize size={14} /> : <Minimize size={14} />}
          </button>
          
          {/* Solo permitir eliminar si no está bloqueado */}
          {!isBlocked && (
            <button 
              onClick={() => removeWidget(widget.id)}
              className="p-1.5 rounded-md hover:bg-jobby-gray-100 text-jobby-gray-500 hover:text-jobby-gray-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className={`flex-grow p-4 ${widget.minimized ? 'hidden' : ''} overflow-auto relative`}>
        {renderWidgetContent()}
        
        {/* Overlay para widgets bloqueados (visual alternativa) */}
        {isBlocked && !widget.minimized && (
          <div className="absolute inset-0 bg-gray-100/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white/90 p-4 rounded-lg shadow-md text-center max-w-[80%]">
              <Lock className="h-8 w-8 mx-auto text-jobby-purple/60 mb-2" />
              <h4 className="font-medium text-gray-700 mb-1">Función bloqueada</h4>
              <p className="text-sm text-gray-600">
                Complete el proceso de onboarding para desbloquear esta funcionalidad
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WidgetContainer;