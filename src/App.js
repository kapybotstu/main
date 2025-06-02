import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import achievementsService from './services/achievementsService';
import './styles/index.css';

function App() {
  useEffect(() => {
    // Inicializar el servicio de logros al cargar la app
    console.log('Inicializando sistema de logros automático...');
    // El servicio se inicializa automáticamente en su constructor
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;