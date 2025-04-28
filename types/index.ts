export type WidgetType = 
  | 'stats'
  | 'chart'
  | 'tasks'
  | 'calendar'
  | 'messages'
  | 'applications'
  | 'notes'
  | 'connections';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  content: any;
  customizable: boolean;
  minimized?: boolean;
}

export interface DashboardLayout {
  widgets: Widget[];
  layouts: {
    [key: string]: LayoutItem[];
  };
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}