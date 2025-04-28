import { DashboardLayout, Widget } from '../types';
import { BarChart, PieChart, Calendar, MessageSquare, ListTodo, Briefcase, FileText, Users } from 'lucide-react';

// Mock data for demonstration purposes
export const MOCK_WIDGETS: Widget[] = [
  {
    id: 'w1',
    type: 'stats',
    title: 'Job Applications',
    content: {
      icon: Briefcase,
      stats: [
        { label: 'Applied', value: 42, color: 'bg-purple-500' },
        { label: 'Interviews', value: 8, color: 'bg-yellow-500' },
        { label: 'Offers', value: 2, color: 'bg-green-500' },
      ]
    },
    customizable: true
  },
  {
    id: 'w2',
    type: 'chart',
    title: 'Application Status',
    content: {
      type: 'pie',
      icon: PieChart,
      data: [
        { label: 'Pending', value: 12, color: '#E5D68A' },
        { label: 'Rejected', value: 18, color: '#D1495B' },
        { label: 'In Progress', value: 10, color: '#6A2C70' },
        { label: 'Offer', value: 2, color: '#30C5AB' }
      ]
    },
    customizable: true
  },
  {
    id: 'w3',
    type: 'tasks',
    title: 'Upcoming Tasks',
    content: {
      icon: ListTodo,
      tasks: [
        { id: 't1', text: 'Update resume with new skills', completed: false, dueDate: '2025-07-15' },
        { id: 't2', text: 'Follow up with Acme Corp', completed: false, dueDate: '2025-07-14' },
        { id: 't3', text: 'Prepare for Google interview', completed: true, dueDate: '2025-07-10' },
        { id: 't4', text: 'Research salary ranges', completed: false, dueDate: '2025-07-18' }
      ]
    },
    customizable: true
  },
  {
    id: 'w4',
    type: 'calendar',
    title: 'Upcoming Interviews',
    content: {
      icon: Calendar,
      events: [
        { id: 'e1', title: 'Technical Interview - Amazon', date: '2025-07-15T14:00:00', type: 'interview' },
        { id: 'e2', title: 'Coffee Chat with IBM Recruiter', date: '2025-07-17T10:30:00', type: 'networking' },
        { id: 'e3', title: 'Final Round - Microsoft', date: '2025-07-22T13:00:00', type: 'interview' }
      ]
    },
    customizable: true
  },
  {
    id: 'w5',
    type: 'messages',
    title: 'Recent Messages',
    content: {
      icon: MessageSquare,
      messages: [
        { id: 'm1', sender: 'Jessica Liu', role: 'Recruiter at Google', content: 'Thanks for your application! Would you be available...', time: '2h ago', unread: true },
        { id: 'm2', sender: 'Mark Johnson', role: 'HR Director', content: 'We\'d like to schedule a second interview...', time: '1d ago', unread: false },
        { id: 'm3', sender: 'Sarah Williams', role: 'Tech Lead at Amazon', content: 'Great talking to you yesterday! Here\'s some info...', time: '2d ago', unread: false }
      ]
    },
    customizable: true
  },
  {
    id: 'w6',
    type: 'applications',
    title: 'Recent Applications',
    content: {
      icon: Briefcase,
      applications: [
        { id: 'a1', company: 'Google', position: 'Senior Developer', date: '2025-07-10', status: 'In Progress' },
        { id: 'a2', company: 'Microsoft', position: 'Product Manager', date: '2025-07-08', status: 'Interview' },
        { id: 'a3', company: 'Amazon', position: 'UX Designer', date: '2025-07-05', status: 'Applied' },
        { id: 'a4', company: 'Apple', position: 'Software Engineer', date: '2025-07-01', status: 'Rejected' }
      ]
    },
    customizable: true
  },
  {
    id: 'w7',
    type: 'notes',
    title: 'Quick Notes',
    content: {
      icon: FileText,
      notes: [
        { id: 'n1', text: 'Research salary ranges for Senior Developer roles in SF', date: '2025-07-09' },
        { id: 'n2', text: 'Ask about remote work options at next interview', date: '2025-07-06' },
        { id: 'n3', text: 'Prepare 3 examples of leadership experience', date: '2025-07-04' }
      ]
    },
    customizable: true
  },
  {
    id: 'w8',
    type: 'connections',
    title: 'Network Connections',
    content: {
      icon: Users,
      connections: [
        { id: 'c1', name: 'Michael Chen', company: 'Facebook', role: 'Engineering Manager', date: '2025-07-12' },
        { id: 'c2', name: 'Lisa Garcia', company: 'Twitter', role: 'Technical Recruiter', date: '2025-07-10' },
        { id: 'c3', name: 'James Wilson', company: 'Netflix', role: 'Senior Developer', date: '2025-07-07' }
      ]
    },
    customizable: true
  }
];

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  widgets: MOCK_WIDGETS,
  layouts: {
    lg: [
      { i: 'w1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'w2', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'w3', x: 6, y: 0, w: 6, h: 2, minW: 2, minH: 2 },
      { i: 'w4', x: 0, y: 2, w: 4, h: 3, minW: 2, minH: 2 },
      { i: 'w5', x: 4, y: 2, w: 4, h: 3, minW: 2, minH: 2 },
      { i: 'w6', x: 8, y: 2, w: 4, h: 3, minW: 2, minH: 2 },
      { i: 'w7', x: 0, y: 5, w: 6, h: 2, minW: 2, minH: 2 },
      { i: 'w8', x: 6, y: 5, w: 6, h: 2, minW: 2, minH: 2 }
    ],
    md: [
      { i: 'w1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'w2', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'w3', x: 6, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'w4', x: 0, y: 2, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'w5', x: 3, y: 2, w: 3, h: 3, minW: 2, minH: 2 },
      { i: 'w6', x: 6, y: 2, w: 2, h: 3, minW: 2, minH: 2 },
      { i: 'w7', x: 0, y: 5, w: 4, h: 2, minW: 2, minH: 2 },
      { i: 'w8', x: 4, y: 5, w: 4, h: 2, minW: 2, minH: 2 }
    ],
    sm: [
      { i: 'w1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'w2', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'w3', x: 0, y: 2, w: 6, h: 2, minW: 2, minH: 2 },
      { i: 'w4', x: 0, y: 4, w: 6, h: 3, minW: 2, minH: 2 },
      { i: 'w5', x: 0, y: 7, w: 6, h: 3, minW: 2, minH: 2 },
      { i: 'w6', x: 0, y: 10, w: 6, h: 3, minW: 2, minH: 2 },
      { i: 'w7', x: 0, y: 13, w: 6, h: 2, minW: 2, minH: 2 },
      { i: 'w8', x: 0, y: 15, w: 6, h: 2, minW: 2, minH: 2 }
    ],
    xs: [
      { i: 'w1', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'w2', x: 0, y: 2, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'w3', x: 0, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'w4', x: 0, y: 6, w: 2, h: 3, minW: 2, minH: 2 },
      { i: 'w5', x: 0, y: 9, w: 2, h: 3, minW: 2, minH: 2 },
      { i: 'w6', x: 0, y: 12, w: 2, h: 3, minW: 2, minH: 2 },
      { i: 'w7', x: 0, y: 15, w: 2, h: 2, minW: 2, minH: 2 },
      { i: 'w8', x: 0, y: 17, w: 2, h: 2, minW: 2, minH: 2 }
    ]
  }
};