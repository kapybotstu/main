import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/firebase/auth/authService';
import '../styles/level3-layout.css';

// Import Level 3 styles when needed
const loadLevel3Styles = () => {
  import('../pages/level3/styles/index.css');
};

const MainLayout = () => {
  const { currentUser, userLevel } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("MainLayout rendered");
    console.log("Current location:", location.pathname);
    console.log("User level:", userLevel);
    
    // Load Level 3 styles when needed
    if (userLevel === 3) {
      loadLevel3Styles();
    }
  }, [location, userLevel]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="app-container" data-level={userLevel}>
      <header className="header">
        <div className="logo">
          <h1>Jobby</h1>
        </div>
        <div className="user-info">
          {currentUser && (
            <>
              <span>{currentUser.displayName || currentUser.email}</span>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </>
          )}
        </div>
      </header>

      <div className="main-content">
        <nav className="sidebar">
          {/* Menú para Nivel 1: Administración Jobby */}
          {userLevel === 1 && (
            <>
              <div style={{padding: '10px', color: '#333', fontWeight: 'bold'}}>
                Panel Nivel 1 - Admin
              </div>
              <ul>
                <li>
                  <Link to="/level1/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/level1/companies">Gestión de Empresas</Link>
                </li>
                <li>
                  <Link to="/level1/benefits">Beneficios Jobby</Link>
                </li>
                <li>
                  <Link to="/level1/requests">Solicitudes</Link>
                </li>
                <li>
                  <Link to="/level1/providers">Gestión de Proveedores</Link>
                </li>
              </ul>
            </>
          )}

          {/* Menú para Nivel 2: Recursos Humanos de empresa */}
          {userLevel === 2 && (
            <>
              <div style={{padding: '10px', color: '#333', fontWeight: 'bold'}}>
                Panel Nivel 2 - RRHH
              </div>
              <ul>
                <li>
                  <Link to="/level2/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/level2/benefits">Beneficios Internos</Link>
                </li>
                <li>
                  <Link to="/level2/users">Gestión de Usuarios</Link>
                </li>
                <li>
                  <Link to="/level2/requests">Solicitudes</Link>
                </li>
              </ul>
            </>
          )}

          {/* Menú para Nivel 3: Usuario final de empresa */}
          {userLevel === 3 && (
            <>
              <div style={{padding: '10px', color: '#333', fontWeight: 'bold'}}>
                Panel Nivel 3 - Usuario
              </div>
              <ul>
                <li>
                  <Link to="/level3/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/level3/benefits">Beneficios Disponibles</Link>
                </li>
                <li>
                  <Link to="/level3/requests">Mis Solicitudes</Link>
                </li>
                <li>
                  <Link to="/level3/tokens">Mis Tokens</Link>
                </li>
              </ul>
            </>
          )}

          {/* Menú para Nivel 4: Proveedores */}
          {userLevel === 4 && (
            <>
              <div style={{padding: '10px', color: '#333', fontWeight: 'bold'}}>
                Panel Nivel 4 - Proveedor
              </div>
              <ul>
                <li>
                  <Link to="/level4/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/level4/verify">Verificar Token</Link>
                </li>
              </ul>
            </>
          )}
          
          {/* Solución alternativa para usuarios con email @jobby.cl pero sin nivel asignado correctamente */}
          {(!userLevel && currentUser && currentUser.email && currentUser.email.endsWith('@jobby.cl')) && (
            <>
              <div style={{padding: '10px', color: '#333', fontWeight: 'bold'}}>
                Panel Nivel 1 - Admin (Modo alternativo)
              </div>
              <ul>
                <li>
                  <Link to="/level1/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/level1/companies">Gestión de Empresas</Link>
                </li>
                <li>
                  <Link to="/level1/benefits">Beneficios Jobby</Link>
                </li>
                <li>
                  <Link to="/level1/requests">Solicitudes</Link>
                </li>
                <li>
                  <Link to="/level1/providers">Gestión de Proveedores</Link>
                </li>
              </ul>
            </>
          )}
        </nav>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Jobby - Gestión de Beneficios Laborales</p>
      </footer>
    </div>
  );
};

export default MainLayout;