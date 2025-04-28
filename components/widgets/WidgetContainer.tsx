import React from 'react';
import { motion } from 'framer-motion';
import { X, Minimize, Maximize, Settings, GripHorizontal } from 'lucide-react';
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
  
  const renderWidgetContent = () => {
    if (widget.minimized) {
      return null;
    }

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
      className="bg-white rounded-lg shadow-widget hover:shadow-widget-hover transition-shadow h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <div className="px-4 py-3 flex items-center justify-between border-b border-jobby-gray-200 drag-handle cursor-move">
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-jobby-gray-400" />
          <h3 className="font-semibold text-jobby-gray-800 truncate">{widget.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          {widget.customizable && (
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
          <button 
            onClick={() => removeWidget(widget.id)}
            className="p-1.5 rounded-md hover:bg-jobby-gray-100 text-jobby-gray-500 hover:text-jobby-gray-700"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className={`flex-grow p-4 ${widget.minimized ? 'hidden' : ''} overflow-auto`}>
        {renderWidgetContent()}
      </div>
    </motion.div>
  );
};

export default WidgetContainer;