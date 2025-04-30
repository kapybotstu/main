import React, { useState } from 'react';
import { DashboardProvider } from '../../context/DashboardContext';
import Dashboard from '../Dashboard';
import { Gift, Package, Ticket, Award, Calendar, CreditCard, Compass } from 'lucide-react';

// Dashboard para "Beneficios Propios"
const PersonalBenefitsDashboard: React.FC = () => {
  const [showAddWidget, setShowAddWidget] = useState(false);
  
  const handleAddWidget = () => {
    setShowAddWidget(true);
  };
  
  // Datos específicos para este dashboard
  const benefitsData = {
    availableBalance: 5200,
    usedBalance: 2800,
    categories: [
      { name: 'Salud', used: 1200, total: 2000, icon: <Gift size={18} /> },
      { name: 'Alimentación', used: 800, total: 1500, icon: <Package size={18} /> },
      { name: 'Entretenimiento', used: 500, total: 1000, icon: <Ticket size={18} /> },
      { name: 'Educación', used: 300, total: 1000, icon: <Award size={18} /> },
    ],
    upcomingEvents: [
      { id: 'e1', title: 'Día de wellbeing - Yoga', date: '2025-07-25T10:00:00', type: 'wellbeing' },
      { id: 'e2', title: 'Webinar: Finanzas personales', date: '2025-07-28T16:00:00', type: 'education' },
    ],
    recentTransactions: [
      { id: 't1', title: 'Suscripción Premium', amount: -250, date: '2025-07-15', category: 'Entretenimiento' },
      { id: 't2', title: 'Reembolso médico', amount: -180, date: '2025-07-12', category: 'Salud' },
      { id: 't3', title: 'Tarjeta regalo restaurante', amount: -350, date: '2025-07-08', category: 'Alimentación' },
    ]
  };

  // Widget para mostrar el resumen de beneficios
  const BenefitsSummaryWidget = () => (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <h3 className="text-lg font-semibold text-jobby-gray-800 mb-4">Mis Beneficios</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-jobby-gray-600">Balance Disponible</span>
          <span className="text-lg font-semibold text-jobby-purple">
            ${benefitsData.availableBalance.toLocaleString()}
          </span>
        </div>
        
        <div className="w-full h-2 bg-jobby-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-jobby-purple"
            style={{ width: `${(benefitsData.availableBalance / (benefitsData.availableBalance + benefitsData.usedBalance)) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2">
          <span className="text-xs text-jobby-gray-500">Utilizado: ${benefitsData.usedBalance.toLocaleString()}</span>
          <span className="text-xs text-jobby-gray-500">
            Total: ${(benefitsData.availableBalance + benefitsData.usedBalance).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {benefitsData.categories.map((category, index) => (
          <div key={index} className="p-3 border border-jobby-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-2">
                  {category.icon}
                </div>
                <span className="font-medium text-jobby-gray-800">{category.name}</span>
              </div>
              <span className="text-sm">
                ${category.used.toLocaleString()} / ${category.total.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-jobby-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-jobby-purple"
                style={{ width: `${(category.used / category.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Widget para mostrar próximos eventos
  const UpcomingEventsWidget = () => (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-gold/10 text-jobby-gold mr-3">
          <Calendar size={20} />
        </div>
        <h3 className="text-lg font-semibold text-jobby-gray-800">Próximos Eventos</h3>
      </div>
      
      {benefitsData.upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {benefitsData.upcomingEvents.map((event) => (
            <div 
              key={event.id} 
              className="p-3 rounded-lg border border-jobby-gray-200 hover:border-jobby-purple/50 transition-all"
            >
              <h4 className="font-medium text-jobby-gray-800">{event.title}</h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-jobby-gray-600">
                  {new Date(event.date).toLocaleDateString()} - {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  event.type === 'wellbeing' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {event.type === 'wellbeing' ? 'Bienestar' : 'Educación'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-jobby-gray-500">
          No hay eventos próximos
        </div>
      )}
      
      <button className="w-full mt-4 py-2 text-center text-sm font-medium text-jobby-purple hover:text-jobby-purple-dark">
        Ver todos los eventos
      </button>
    </div>
  );

  // Widget para mostrar transacciones recientes
  const RecentTransactionsWidget = () => (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-3">
          <CreditCard size={20} />
        </div>
        <h3 className="text-lg font-semibold text-jobby-gray-800">Transacciones Recientes</h3>
      </div>
      
      {benefitsData.recentTransactions.length > 0 ? (
        <div className="space-y-3">
          {benefitsData.recentTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="p-3 rounded-lg border border-jobby-gray-200 flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium text-jobby-gray-800">{transaction.title}</h4>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-jobby-gray-500 mr-2">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-jobby-gray-100 text-jobby-gray-700">
                    {transaction.category}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-jobby-purple">${Math.abs(transaction.amount).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-jobby-gray-500">
          No hay transacciones recientes
        </div>
      )}
      
      <button className="w-full mt-4 py-2 text-center text-sm font-medium text-jobby-purple hover:text-jobby-purple-dark">
        Ver historial completo
      </button>
    </div>
  );

  // Widget de exploración de beneficios
  const ExploreBenefitsWidget = () => (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-gold/10 text-jobby-gold mr-3">
          <Compass size={20} />
        </div>
        <h3 className="text-lg font-semibold text-jobby-gray-800">Explorar Beneficios</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-lg border-2 border-jobby-gray-200 hover:border-jobby-purple text-center cursor-pointer">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-jobby-purple/10 text-jobby-purple">
              <Gift size={20} />
            </div>
          </div>
          <span className="block text-sm font-medium text-jobby-gray-800">Salud y Bienestar</span>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-jobby-gray-200 hover:border-jobby-purple text-center cursor-pointer">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-jobby-purple/10 text-jobby-purple">
              <Package size={20} />
            </div>
          </div>
          <span className="block text-sm font-medium text-jobby-gray-800">Alimentación</span>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-jobby-gray-200 hover:border-jobby-purple text-center cursor-pointer">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-jobby-purple/10 text-jobby-purple">
              <Ticket size={20} />
            </div>
          </div>
          <span className="block text-sm font-medium text-jobby-gray-800">Entretenimiento</span>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-jobby-gray-200 hover:border-jobby-purple text-center cursor-pointer">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-jobby-purple/10 text-jobby-purple">
              <Award size={20} />
            </div>
          </div>
          <span className="block text-sm font-medium text-jobby-gray-800">Educación</span>
        </div>
      </div>
      
      <button className="w-full mt-4 py-2 text-center text-sm font-medium text-jobby-purple hover:text-jobby-purple-dark">
        Ver todos los beneficios
      </button>
    </div>
  );

  return (
    <DashboardProvider>
      <div className="p-4 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <BenefitsSummaryWidget />
          </div>
          <div>
            <UpcomingEventsWidget />
          </div>
          <div>
            <RecentTransactionsWidget />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <ExploreBenefitsWidget />
          </div>
          <div className="md:col-span-2">
            <Dashboard onAddWidget={handleAddWidget} />
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default PersonalBenefitsDashboard;