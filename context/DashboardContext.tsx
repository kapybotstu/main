import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardLayout, Widget } from '../types';
import { DEFAULT_DASHBOARD_LAYOUT } from '../data/mockData';
import { 
  BarChart, PieChart, Calendar, MessageSquare, 
  ListTodo, Briefcase, FileText, Users, LucideIcon
} from 'lucide-react';

// Definir un tipo para el mapa de iconos
type IconMapType = {
  [key: string]: LucideIcon;
};

// Mapa de nombres de iconos a componentes para serialización/deserialización
const ICON_MAP: IconMapType = {
  'Briefcase': Briefcase,
  'PieChart': PieChart,
  'ListTodo': ListTodo,
  'Calendar': Calendar,
  'MessageSquare': MessageSquare,
  'BarChart': BarChart,
  'FileText': FileText,
  'Users': Users
};

// Función de ayuda para obtener el nombre del icono a partir del componente
const getIconName = (iconComponent: any): string => {
  if (!iconComponent) return '';
  
  // Manejar el caso donde el iconComponent ya podría ser una cadena
  if (typeof iconComponent === 'string') return iconComponent;
  
  for (const [name, component] of Object.entries(ICON_MAP)) {
    if (component === iconComponent) {
      return name;
    }
  }
  return '';
};

// Prepara el layout para serialización reemplazando componentes de iconos con nombres de cadenas
const prepareForSerialization = (layout: DashboardLayout): any => {
  return {
    ...layout,
    widgets: layout.widgets.map(widget => ({
      ...widget,
      content: widget.content ? {
        ...widget.content,
        icon: widget.content.icon ? getIconName(widget.content.icon) : null
      } : null
    }))
  };
};

// Restaura los componentes de iconos después de la deserialización
const restoreFromSerialization = (serializedLayout: any): DashboardLayout => {
  if (!serializedLayout || !serializedLayout.widgets) {
    console.error('Datos de layout inválidos, usando predeterminado');
    return DEFAULT_DASHBOARD_LAYOUT;
  }
  
  try {
    return {
      ...serializedLayout,
      widgets: serializedLayout.widgets.map((widget: any) => {
        if (!widget || !widget.content) {
          return widget;
        }
        
        return {
          ...widget,
          content: {
            ...widget.content,
            icon: widget.content.icon && typeof widget.content.icon === 'string' && 
                 Object.prototype.hasOwnProperty.call(ICON_MAP, widget.content.icon) ? 
                 ICON_MAP[widget.content.icon as keyof typeof ICON_MAP] : null
          }
        };
      })
    };
  } catch (error) {
    console.error('Error al restaurar el layout:', error);
    return DEFAULT_DASHBOARD_LAYOUT;
  }
};

interface DashboardContextType {
  layout: DashboardLayout;
  updateLayout: (newLayouts: any) => void;
  saveWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  resetLayout: () => void;
  toggleMinimize: (widgetId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe usarse dentro de un DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_DASHBOARD_LAYOUT);

  // Verifica si hay un elemento de localStorage existente que podría estar corrupto
  useEffect(() => {
    try {
      // Primero, verifica si el elemento de localStorage existe y si podría estar corrupto
      const savedLayoutStr = localStorage.getItem('jobbyDashboardLayout');
      if (savedLayoutStr) {
        try {
          // Intenta analizarlo
          const parsedLayout = JSON.parse(savedLayoutStr);
          
          // Verifica si tiene una estructura válida
          if (!parsedLayout || !parsedLayout.widgets || !Array.isArray(parsedLayout.widgets)) {
            console.warn('Se encontró un layout de dashboard corrupto en localStorage, restableciendo al predeterminado');
            localStorage.removeItem('jobbyDashboardLayout');
          }
        } catch (parseError) {
          console.warn('Se encontró un layout de dashboard corrupto en localStorage, restableciendo al predeterminado');
          localStorage.removeItem('jobbyDashboardLayout');
        }
      }
    } catch (error) {
      console.error('Error al verificar localStorage:', error);
    }
  }, []);

  // Carga el layout guardado desde localStorage al montar
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem('jobbyDashboardLayout');
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout);
          // Restaura los componentes de iconos desde cadenas
          setLayout(restoreFromSerialization(parsedLayout));
        } catch (parseError) {
          console.error('Error al analizar el layout guardado:', parseError);
          setLayout(DEFAULT_DASHBOARD_LAYOUT);
        }
      }
    } catch (error) {
      console.error('Error al cargar el layout guardado:', error);
      // Si hay un error al cargar, restablece al predeterminado
      setLayout(DEFAULT_DASHBOARD_LAYOUT);
    }
  }, []);

  // Guarda el layout en localStorage cada vez que cambia
  useEffect(() => {
    try {
      // Convierte los componentes de iconos a cadenas antes de guardar
      const serializedLayout = prepareForSerialization(layout);
      localStorage.setItem('jobbyDashboardLayout', JSON.stringify(serializedLayout));
    } catch (error) {
      console.error('Error al guardar el layout:', error);
    }
  }, [layout]);

  const updateLayout = (newLayouts: any) => {
    setLayout(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        ...newLayouts
      }
    }));
  };

  const saveWidget = (widget: Widget) => {
    setLayout(prev => {
      const widgetIndex = prev.widgets.findIndex(w => w.id === widget.id);
      const updatedWidgets = [...prev.widgets];
      
      if (widgetIndex >= 0) {
        updatedWidgets[widgetIndex] = widget;
      } else {
        updatedWidgets.push(widget);
        
        // Agrega a layouts si es un nuevo widget
        Object.keys(prev.layouts).forEach(breakpoint => {
          const breakpointLayouts = [...(prev.layouts[breakpoint] || [])];
          if (!breakpointLayouts.some(item => item.i === widget.id)) {
            // Encuentra una buena posición para el nuevo widget
            breakpointLayouts.push({
              i: widget.id,
              x: 0,
              y: 0,
              w: 3,
              h: 2,
              minW: 2,
              minH: 2
            });
          }
          prev.layouts[breakpoint] = breakpointLayouts;
        });
      }
      
      return {
        ...prev,
        widgets: updatedWidgets
      };
    });
  };

  const removeWidget = (widgetId: string) => {
    setLayout(prev => {
      const updatedWidgets = prev.widgets.filter(w => w.id !== widgetId);
      const updatedLayouts = { ...prev.layouts };
      
      // Elimina el widget de todos los layouts
      Object.keys(updatedLayouts).forEach(breakpoint => {
        updatedLayouts[breakpoint] = updatedLayouts[breakpoint].filter(item => item.i !== widgetId);
      });
      
      return {
        widgets: updatedWidgets,
        layouts: updatedLayouts
      };
    });
  };

  const resetLayout = () => {
    setLayout(DEFAULT_DASHBOARD_LAYOUT);
    // Limpia localStorage para asegurar un inicio fresco
    localStorage.removeItem('jobbyDashboardLayout');
  };

  const toggleMinimize = (widgetId: string) => {
    setLayout(prev => {
      const updatedWidgets = prev.widgets.map(widget => {
        if (widget.id === widgetId) {
          return { ...widget, minimized: !widget.minimized };
        }
        return widget;
      });
      
      return {
        ...prev,
        widgets: updatedWidgets
      };
    });
  };

  return (
    <DashboardContext.Provider value={{ 
      layout, 
      updateLayout, 
      saveWidget, 
      removeWidget, 
      resetLayout,
      toggleMinimize
    }}>
      {children}
    </DashboardContext.Provider>
  );
};