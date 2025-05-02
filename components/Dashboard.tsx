import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import WidgetContainer from './widgets/WidgetContainer';
import { WidgetType, Widget } from '../types';
import { MOCK_WIDGETS } from '../data/mockData';

// Enhanced type definition to support different dashboard types
interface DashboardProps {
  onAddWidget?: () => void;
  dashboardType?: 'personal-benefits' | 'benefits-management' | 'onboarding' | 'reports';
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard: React.FC<DashboardProps> = ({ 
  onAddWidget,
  dashboardType = 'personal-benefits' 
}) => {
  const { layout, updateLayout, saveWidget } = useDashboard();
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
  
  // Initialize dashboard with widgets based on dashboard type
  useEffect(() => {
    // Only initialize if the layout is empty or dashboard type changes
    if (layout.widgets.length === 0) {
      initializeDashboard();
    }
  }, [dashboardType]);
  
  const initializeDashboard = () => {
    // Get widgets based on dashboard type
    let dashboardWidgets: Widget[] = [];
    
    switch(dashboardType) {
      case 'personal-benefits':
        dashboardWidgets = MOCK_WIDGETS.filter(w => 
          ['stats', 'chart', 'tasks', 'calendar', 'messages', 'notes'].includes(w.type)
        );
        break;
      case 'benefits-management':
        dashboardWidgets = MOCK_WIDGETS.filter(w => 
          ['stats', 'chart', 'applications', 'connections'].includes(w.type)
        );
        break;
      case 'reports':
        dashboardWidgets = MOCK_WIDGETS.filter(w => 
          ['stats', 'chart', 'tasks', 'messages', 'calendar'].includes(w.type)
        );
        break;
      default:
        dashboardWidgets = [];
    }
    
    // Save widgets to context
    dashboardWidgets.forEach(widget => {
      const newId = `${widget.id}-${dashboardType}`;
      const customizedWidget = {
        ...widget,
        id: newId,
        title: widget.title
      };
      saveWidget(customizedWidget);
    });
  };
  
  const handleLayoutChange = (currentLayout: any[], allLayouts: any) => {
    updateLayout(allLayouts);
    // Puedes usar currentLayout para algo aquí si es necesario
    // console.log('Current layout:', currentLayout);
  };

  const widgetTypes: { type: WidgetType; label: string }[] = [
    { type: 'stats', label: 'Statistics' },
    { type: 'chart', label: 'Charts' },
    { type: 'tasks', label: 'Tasks' },
    { type: 'calendar', label: 'Calendar' },
    { type: 'messages', label: 'Messages' },
    { type: 'applications', label: 'Applications' },
    { type: 'notes', label: 'Notes' },
    { type: 'connections', label: 'Connections' }
  ];

  const handleAddWidget = () => {
    setIsAddingWidget(true);
  };
  
  const closeAddWidget = () => {
    setIsAddingWidget(false);
    setSelectedWidgetType(null);
  };
  
  const selectWidgetTemplate = (type: WidgetType) => {
    setSelectedWidgetType(type);
  };
  
  const addWidgetToLayout = () => {
    if (!selectedWidgetType) return;
    
    const mockWidget = MOCK_WIDGETS.find(w => w.type === selectedWidgetType);
    if (mockWidget) {
      const newId = `w${Date.now()}`;
      const newWidget = {
        ...mockWidget,
        id: newId,
        title: `New ${mockWidget.title}`
      };
      
      saveWidget(newWidget);
      setIsAddingWidget(false);
      setSelectedWidgetType(null);
    }
  };

  return (
    <div className="p-4 h-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layout.layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 8, sm: 6, xs: 2, xxs: 1 }}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        isResizable={true}
        isDraggable={true}
        draggableHandle=".drag-handle"
      >
        {layout.widgets.map(widget => (
          <div key={widget.id}>
            <WidgetContainer widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>
      
      {/* Add Widget Modal */}
      {isAddingWidget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-jobby-gray-200">
              <h3 className="font-semibold text-lg text-jobby-gray-800">
                {selectedWidgetType ? 'Configure Widget' : 'Add Widget'}
              </h3>
              <button
                onClick={closeAddWidget}
                className="p-2 rounded-full hover:bg-jobby-gray-100"
              >
                <X className="h-5 w-5 text-jobby-gray-700" />
              </button>
            </div>
            
            <div className="p-4">
              {!selectedWidgetType ? (
                <div className="grid grid-cols-2 gap-3">
                  {widgetTypes.map(({ type, label }) => (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => selectWidgetTemplate(type)}
                      className="p-4 rounded-lg border-2 border-jobby-gray-200 hover:border-jobby-purple text-center"
                    >
                      <span className="block text-sm font-medium text-jobby-gray-800">{label}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-jobby-gray-600">
                    Add a new {selectedWidgetType} widget to your dashboard.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-jobby-gray-700 mb-1">
                        Widget Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-jobby-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jobby-purple"
                        placeholder={`New ${selectedWidgetType} widget`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeAddWidget}
                      className="px-4 py-2 rounded-md text-jobby-gray-700 hover:bg-jobby-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addWidgetToLayout}
                      className="px-4 py-2 rounded-md bg-jobby-purple text-white hover:bg-jobby-purple-light"
                    >
                      Add Widget
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Quick Add Button */}
      {onAddWidget ? (
        <div className="fixed bottom-6 right-6 md:hidden">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddWidget}
            className="h-12 w-12 rounded-full bg-jobby-purple text-white shadow-lg flex items-center justify-center"
          >
            <span className="text-xl">+</span>
          </motion.button>
        </div>
      ) : (
        <div className="fixed bottom-6 right-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddWidget}
            className="h-12 w-12 rounded-full bg-jobby-purple text-white shadow-lg flex items-center justify-center"
          >
            <span className="text-xl">+</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;