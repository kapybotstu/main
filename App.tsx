import React, { useState } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

function App() {
  const [showAddWidget, setShowAddWidget] = useState(false);
  
  const handleAddWidget = () => {
    setShowAddWidget(true);
  };
  
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-jobby-gray-100 flex flex-col">
        <Header onAddWidget={handleAddWidget} />
        <main className="flex-grow overflow-hidden">
          <Dashboard />
        </main>
      </div>
    </DashboardProvider>
  );
}

export default App;