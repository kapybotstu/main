import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredLevel }) => {
  const { currentUser, userLevel, loading, error, surveyCompleted } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("ProtectedRoute rendered:", {
      currentUser: currentUser ? "Logged in" : "Not logged in",
      userLevel,
      requiredLevel,
      loading,
      error,
      surveyCompleted,
      currentPath: location.pathname
    });
  }, [currentUser, userLevel, requiredLevel, loading, error, surveyCompleted, location]);
  
  // Si está cargando, muestra un spinner o nada
  if (loading) {
    console.log("ProtectedRoute: Loading...");
    return <div>Cargando...</div>;
  }
  
  // Si no hay usuario autenticado, redirige al login
  if (!currentUser) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // SOLUCIÓN TEMPORAL: Si es un problema de nivel 1
  if (requiredLevel === 1 && userLevel !== 1 && 
      currentUser.email && currentUser.email.endsWith('@jobby.cl')) {
    console.log("OVERRIDE: Email termina en @jobby.cl pero userLevel no es 1. Permitiendo acceso a nivel 1.");
    return <Outlet />;
  }
  
  // Verificar si es nivel 3 y no ha completado la encuesta
  if (userLevel === 3 && surveyCompleted === false && location.pathname !== '/level3/survey') {
    console.log("Level 3 user hasn't completed survey, redirecting to survey");
    return <Navigate to="/level3/survey" replace />;
  }
  
  // Si se especifica un nivel requerido, verificar
  if (requiredLevel && userLevel !== requiredLevel) {
    console.log(`ProtectedRoute: User level (${userLevel}) doesn't match required level (${requiredLevel})`);
    
    // Redirigir al usuario a su dashboard correspondiente según su nivel
    switch (userLevel) {
      case 1:
        console.log("Redirecting to level 1 dashboard");
        return <Navigate to="/level1/dashboard" replace />;
      case 2:
        console.log("Redirecting to level 2 dashboard");
        return <Navigate to="/level2/dashboard" replace />;
      case 3:
        console.log("Redirecting to level 3 dashboard");
        return <Navigate to="/level3/dashboard" replace />;
      case 4:
        console.log("Redirecting to level 4 dashboard");
        return <Navigate to="/level4/dashboard" replace />;
      default:
        console.log("Unknown user level, redirecting to login");
        return <Navigate to="/login" replace />;
    }
  }
  
  console.log("ProtectedRoute: Access granted");
  // Si todo está bien, mostrar la ruta protegida
  return <Outlet />;
};

export default ProtectedRoute;