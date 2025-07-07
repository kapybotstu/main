import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/firebase/auth/authService';
import { getUserThemePreference, saveUserThemePreference, getJobbyTokenBalance, getCompanyTokenBalance } from '../services/firebase/database/databaseService';
import '../styles/level3-layout.css';
import '../styles/header.css';

// Import Level 3 styles when needed
const loadLevel3Styles = () => {
  if (window.location.pathname.includes('/level3')) {
    import('../pages/level3/styles/index.css');
  }
};

const MainLayout = () => {
  const { currentUser, userLevel } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState('light'); // Default to light until loaded from Firebase
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Example count
  const [themeLoading, setThemeLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [tokenData, setTokenData] = useState({
    jobbyTokenBalance: 0,
    companyTokenBalance: 0,
    activeTokens: 0
  });
  
  useEffect(() => {
    console.log("MainLayout rendered");
    console.log("Current location:", location.pathname);
    console.log("User level:", userLevel);
    
    // Load Level 3 styles only when in level 3 routes
    if (userLevel === 3 && location.pathname.includes('/level3')) {
      loadLevel3Styles();
    }
  }, [location, userLevel]);

  // Load user's theme preference from Firebase
  useEffect(() => {
    const loadThemePreference = async () => {
      if (currentUser?.uid) {
        try {
          const userTheme = await getUserThemePreference(currentUser.uid);
          setTheme(userTheme);
        } catch (error) {
          console.error('Error loading theme preference:', error);
        } finally {
          setThemeLoading(false);
        }
      } else {
        setThemeLoading(false);
      }
    };

    loadThemePreference();
  }, [currentUser]);

  // Apply theme to document
  useEffect(() => {
    if (!themeLoading) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, themeLoading]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Save to Firebase if user is logged in
    if (currentUser?.uid) {
      try {
        await saveUserThemePreference(currentUser.uid, newTheme);
      } catch (error) {
        console.error('Error saving theme preference:', error);
        // Revert on error
        setTheme(theme);
      }
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    } else if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  // Fetch token data for level 3 users
  const fetchTokenData = async () => {
    if (userLevel === 3 && currentUser?.uid) {
      try {
        // Usar los mismos servicios que el dashboard para obtener tokens reales
        const jobbyBalance = await getJobbyTokenBalance(currentUser.uid);
        const companyBalance = await getCompanyTokenBalance(currentUser.uid);
        
        console.log('Header - Balances cargados:', { jobbyBalance, companyBalance });
        
        setTokenData({
          jobbyTokenBalance: jobbyBalance,
          companyTokenBalance: companyBalance,
          activeTokens: 0 // Por ahora mantenemos en 0, se puede agregar lógica después
        });
      } catch (error) {
        console.error('Error fetching token data:', error);
        // En caso de error, mostrar 0
        setTokenData({
          jobbyTokenBalance: 0,
          companyTokenBalance: 0,
          activeTokens: 0
        });
      }
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, [currentUser, userLevel]);


  const handleLogout = async () => {
    try {
      await logoutUser();
      // Reset theme to default when logging out
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Don't render until theme is loaded to prevent flashing
  if (themeLoading && currentUser) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container" data-level={userLevel} data-theme={theme}>
      <header className="header">
        {/* Header structure for mobile/desktop */}
        <div className={userLevel === 3 ? "header-top-row" : "header-left"}>
          <div className="header-left">
            {/* Mobile menu button for level 3 */}
            {userLevel === 3 && (
              <button 
                className="mobile-menu-btn"
                onClick={() => {
                  setShowMobileMenu(!showMobileMenu);
                }}
                title="Menú"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <div className="logo">
              <h1>Jobby</h1>
            </div>
            
            {/* Token display for level 3 - desktop only */}
            {userLevel === 3 && (
              <div className="header-tokens">
                <div className="token-card jobby-tokens">
                  <div className="token-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                      <path d="M20.5 7.5L16 12l4.5 4.5M3.5 7.5L8 12l-4.5 4.5"/>
                    </svg>
                  </div>
                  <div className="token-info">
                    <div className="token-count">{tokenData.jobbyTokenBalance}</div>
                    <div className="token-label">Flexibles</div>
                  </div>
                </div>
                
                <div className="token-card company-tokens">
                  <div className="token-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M4 21V7l8-4v18M20 21V11l-8-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
                    </svg>
                  </div>
                  <div className="token-info">
                    <div className="token-count">{tokenData.companyTokenBalance}</div>
                    <div className="token-label">Empresa</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        
          <div className="user-info">
            {currentUser && (
              <div className="header-actions">
                {/* Notifications button */}
                <button className="header-btn" title="Notificaciones">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </button>

                {/* Theme toggle */}
                <button className="header-btn" onClick={toggleTheme} title="Cambiar tema">
                  {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>

                {/* User dropdown */}
                <div className={`user-dropdown ${showUserDropdown ? 'active' : ''}`}>
                  <div 
                    className="user-avatar"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                  >
                    {getUserInitials()}
                  </div>
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <span className="user-name">{currentUser.displayName || 'Usuario'}</span>
                      <span className="user-email">{currentUser.email}</span>
                    </div>
                    <Link to="/profile">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi Perfil
                    </Link>
                    {/* TODO: Implementar página de configuración 
                    <Link to="/settings">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuración
                    </Link>
                    */}
                    <button onClick={handleLogout}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile tokens row for level 3 */}
        {userLevel === 3 && (
          <div className="header-tokens mobile-tokens-row">
            <div className="token-card jobby-tokens">
              <div className="token-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                  <path d="M20.5 7.5L16 12l4.5 4.5M3.5 7.5L8 12l-4.5 4.5"/>
                </svg>
              </div>
              <div className="token-info">
                <div className="token-count">{tokenData.jobbyTokenBalance}</div>
                <div className="token-label">Flexibles</div>
              </div>
            </div>
            
            <div className="token-card company-tokens">
              <div className="token-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M4 21V7l8-4v18M20 21V11l-8-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
                </svg>
              </div>
              <div className="token-info">
                <div className="token-count">{tokenData.companyTokenBalance}</div>
                <div className="token-label">Empresa</div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="main-content">
        <nav className={`sidebar ${userLevel === 3 && showMobileMenu ? 'mobile-menu-open' : ''}`}>
          {/* Mobile menu overlay for level 3 */}
          {userLevel === 3 && showMobileMenu && (
            <div 
              className="mobile-menu-overlay"
              onClick={() => setShowMobileMenu(false)}
            />
          )}
          
          {/* Mobile menu close button for level 3 */}
          {userLevel === 3 && showMobileMenu && (
            <button 
              className="mobile-menu-close"
              onClick={() => setShowMobileMenu(false)}
              title="Cerrar menú"
            >
              ×
            </button>
          )}
          
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
                  <Link to="/level1/benefits/jobby">Beneficios Jobby</Link>
                </li>
                <li>
                  <Link to="/level1/benefits/requests">Solicitudes</Link>
                </li>
                <li>
                  <Link to="/level1/providers">Gestión de Proveedores</Link>
                </li>
                <li>
                  <Link to="/level1/tokens">Gestión de Tokens</Link>
                </li>
                <li>
                  <Link to="/level1/users/list">Diagnóstico Usuarios</Link>
                </li>
                <li>
                  <Link to="/level1/users/assign-levels">Asignar Niveles</Link>
                </li>
                <li>
                  <Link to="/level1/achievements">Sistema de Logros</Link>
                </li>
                <li>
                  <Link to="/level1/surveys">Encuestas de Perfilamiento</Link>
                </li>
                <li>
                  <Link to="/level1/bot-management">Gestión de Bot</Link>
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
                <li>
                  <Link to="/level2/bot-messaging">Mensajería Bot</Link>
                </li>
              </ul>
            </>
          )}

          {/* Menú para Nivel 3: Usuario final de empresa */}
          {userLevel === 3 && (
            <>
              <ul>
                <li>
                  <Link 
                    to="/level3/cascade" 
                    className={location.pathname === '/level3/cascade' ? 'active' : ''}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                      <path d="M20.5 7.5L16 12l4.5 4.5M3.5 7.5L8 12l-4.5 4.5"/>
                    </svg>
                    Beneficios Flexibles Jobby
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/level3/company-benefits" 
                    className={location.pathname === '/level3/company-benefits' ? 'active' : ''}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M4 21V7l8-4v18M20 21V11l-8-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
                    </svg>
                    Beneficios Internos
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/level3/requests" 
                    className={location.pathname === '/level3/requests' ? 'active' : ''}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                    Historial
                  </Link>
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
                  <Link to="/level1/benefits/jobby">Beneficios Jobby</Link>
                </li>
                <li>
                  <Link to="/level1/benefits/requests">Solicitudes</Link>
                </li>
                <li>
                  <Link to="/level1/providers">Gestión de Proveedores</Link>
                </li>
                <li>
                  <Link to="/level1/tokens">Gestión de Tokens</Link>
                </li>
                <li>
                  <Link to="/level1/users/list">Diagnóstico Usuarios</Link>
                </li>
                <li>
                  <Link to="/level1/users/assign-levels">Asignar Niveles</Link>
                </li>
                <li>
                  <Link to="/level1/achievements">Sistema de Logros</Link>
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