import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import './styles/pages/Dashboard.css';
import TokenBalance from './components/TokenBalance';

const Level3Dashboard = () => {
  const { currentUser, companyId } = useAuth();
  const [stats, setStats] = useState({
    availableJobbyBenefits: 0,
    availableCompanyBenefits: 0,
    pendingRequests: 0,
    activeTokens: 0,
    currentMonthTokens: 0,
    previousMonthTokens: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentTokens, setRecentTokens] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.uid || !companyId) {
        console.error('No hay ID de usuario o empresa disponible');
        setLoading(false);
        return;
      }

      try {
        // Obtener datos de la empresa
        const companyRef = ref(database, `companies/${companyId}`);
        onValue(companyRef, (snapshot) => {
          if (snapshot.exists()) {
            setCompanyData(snapshot.val());
          }
        });
        
        // Estadísticas de beneficios Jobby disponibles
        const jobbyBenefitsRef = ref(database, 'jobby_benefits');
        onValue(jobbyBenefitsRef, (snapshot) => {
          let benefitsCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const benefitData = childSnapshot.val();
              
              if (benefitData.status === 'active') {
                benefitsCount++;
              }
            });
          }
          
          setStats(prevStats => ({
            ...prevStats,
            availableJobbyBenefits: benefitsCount
          }));
        });
        
        // Estadísticas de beneficios internos de la empresa
        const companyBenefitsRef = ref(database, `company_benefits/${companyId}`);
        onValue(companyBenefitsRef, (snapshot) => {
          let benefitsCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const benefitData = childSnapshot.val();
              
              if (benefitData.status === 'active') {
                benefitsCount++;
              }
            });
          }
          
          setStats(prevStats => ({
            ...prevStats,
            availableCompanyBenefits: benefitsCount
          }));
        });
        
        // Solicitudes del usuario
        const requestsQuery = query(
          ref(database, 'benefit_requests'), 
          orderByChild('userId'), 
          equalTo(currentUser.uid)
        );
        
        onValue(requestsQuery, (snapshot) => {
          const requests = [];
          let pendingCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const requestData = childSnapshot.val();
              
              if (requestData.status === 'pending') {
                pendingCount++;
              }
              
              requests.push({
                id: childSnapshot.key,
                ...requestData
              });
            });
          }
          
          // Ordenar por fecha, más recientes primero
          requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
          
          setRecentRequests(requests.slice(0, 5));
          setStats(prevStats => ({
            ...prevStats,
            pendingRequests: pendingCount
          }));
        });
        
        // Tokens activos del usuario y cálculo de tokens disponibles
        const tokensQuery = query(ref(database, 'benefit_tokens'), orderByChild('status'), equalTo('active'));
        onValue(tokensQuery, (snapshot) => {
          const tokens = [];
          let tokensCount = 0;
          let currentMonth = 0;
          let previousMonth = 0;
          
          const now = new Date();
          const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const tokenData = childSnapshot.val();
              
              // Verificar si el token pertenece al usuario actual
              const requestRef = ref(database, `benefit_requests/${tokenData.requestId}`);
              
              onValue(requestRef, (requestSnapshot) => {
                if (requestSnapshot.exists()) {
                  const requestData = requestSnapshot.val();
                  
                  if (requestData.userId === currentUser.uid) {
                    tokensCount++;
                    
                    // Calcular tokens por mes (economía de tokens)
                    const tokenDate = new Date(tokenData.createdAt);
                    
                    if (tokenDate >= currentMonthStart) {
                      currentMonth++;
                    } else if (tokenDate >= previousMonthStart && tokenDate < currentMonthStart) {
                      previousMonth++;
                    }
                    
                    tokens.push({
                      id: childSnapshot.key,
                      ...tokenData,
                      requestData
                    });
                  }
                }
              });
            });
          }
          
          // Ordenar por fecha, más recientes primero
          tokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setRecentTokens(tokens.slice(0, 3));
          setStats(prevStats => ({
            ...prevStats,
            activeTokens: tokensCount,
            currentMonthTokens: currentMonth,
            previousMonthTokens: previousMonth
          }));
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };
    
    if (currentUser?.uid && companyId) {
      fetchDashboardData();
    }
  }, [currentUser, companyId]);

  // Mostrar modal de bienvenida para nuevos usuarios
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('jobby_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('jobby_welcome_seen', 'true');
  };

  const totalAvailableTokens = stats.currentMonthTokens + stats.previousMonthTokens;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }
  
  if (!companyId || !companyData) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <div className="error-icon">🏢</div>
          <h2>Empresa no asignada</h2>
          <p>No se ha asignado una empresa a este usuario. Por favor, contacta con tu departamento de Recursos Humanos.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="modern-dashboard">
      {/* Información de tokens en la parte superior */}
      <div className="dashboard-tokens-info">
        <div className="tokens-info-content">
          <div className="welcome-message">
            <h1>¡Hola, {currentUser?.displayName?.split(' ')[0] || 'Usuario'}! 👋</h1>
            <p className="company-info">
              <span className="company-icon">🏢</span>
              {companyData.name}
            </p>
          </div>
          
          <div className="tokens-summary">
            <div className="token-card">
              <div className="token-amount">
                <span className="token-number">{totalAvailableTokens}</span>
                <span className="token-label">Disponibles</span>
              </div>
              <div className="token-breakdown">
                <span className="token-detail">
                  Este mes: {stats.currentMonthTokens} • Anterior: {stats.previousMonthTokens}
                </span>
              </div>
            </div>
            
            <div className="active-token-card">
              <div className="active-amount">
                <span className="active-number">{stats.activeTokens}</span>
                <span className="active-label">Activos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Board - Pantalla principal */}
      <div className="welcome-board">
        <div className="hero-section">
          <div className="hero-content">
            <h2>Explora tu mundo de beneficios</h2>
            <p>Descubre descuentos exclusivos, experiencias únicas y servicios premium diseñados especialmente para ti.</p>
            
            <Link to="/level3/benefits" className="cta-button">
              <span className="cta-icon">✨</span>
              Explorar Beneficios
              <span className="cta-arrow">→</span>
            </Link>
          </div>
          
          <div className="hero-visual">
            <div className="floating-card card-1">🎁</div>
            <div className="floating-card card-2">🍔</div>
            <div className="floating-card card-3">🎬</div>
            <div className="floating-card card-4">💪</div>
          </div>
        </div>

        {/* Grid de 3 columnas explicando el sistema de tokens */}
        <div className="token-explanation">
          <h3>¿Cómo funcionan los tokens?</h3>
          <div className="explanation-grid">
            <div className="explanation-card">
              <div className="explanation-icon">📈</div>
              <h4>Gana Tokens</h4>
              <p>Recibe tokens cada mes automáticamente. Los tokens del mes anterior se acumulan con los actuales.</p>
            </div>
            
            <div className="explanation-card">
              <div className="explanation-icon">🛒</div>
              <h4>Canjea Beneficios</h4>
              <p>Usa tus tokens para solicitar beneficios Jobby o beneficios exclusivos de tu empresa.</p>
            </div>
            
            <div className="explanation-card">
              <div className="explanation-icon">🎉</div>
              <h4>Disfruta</h4>
              <p>Una vez aprobado, recibirás un código único para redimir tu beneficio con nuestros proveedores.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección dividida: Logros recientes + Beneficios populares */}
      <div className="dashboard-content">
        {/* Logros recientes (izquierda) */}
        <div className="achievements-section">
          <div className="section-header">
            <h3>🏆 Mis Logros Recientes</h3>
            <Link to="/level3/requests" className="see-all-link">Ver todos</Link>
          </div>
          
          <div className="achievements-list">
            {recentRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No has realizado solicitudes aún</p>
                <Link to="/level3/benefits" className="empty-action">¡Comienza ahora!</Link>
              </div>
            ) : (
              recentRequests.map((request) => (
                <div key={request.id} className="achievement-item">
                  <div className="achievement-icon">
                    {request.status === 'approved' ? '✅' : 
                     request.status === 'rejected' ? '❌' : '⏳'}
                  </div>
                  <div className="achievement-content">
                    <h5>{request.benefitName || 'Beneficio'}</h5>
                    <p>{new Date(request.requestDate).toLocaleDateString()}</p>
                    <span className={`status-badge status-${request.status}`}>
                      {request.status === 'approved' ? 'Aprobado' : 
                       request.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Beneficios populares (derecha) */}
        <div className="popular-benefits">
          <div className="section-header">
            <h3>🔥 Tokens Activos</h3>
            <Link to="/level3/tokens" className="see-all-link">Ver todos</Link>
          </div>
          
          <div className="benefits-preview">
            {recentTokens.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎫</div>
                <p>No tienes tokens activos</p>
                <Link to="/level3/benefits" className="empty-action">Solicitar beneficios</Link>
              </div>
            ) : (
              recentTokens.map((token) => (
                <div key={token.id} className="token-preview-card">
                  <div className="token-header">
                    <span className="token-status">🟢 Activo</span>
                    <span className="token-expiry">
                      Expira: {new Date(token.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="token-code-display">{token.tokenCode}</div>
                  <div className="token-info">
                    <p className="token-benefit">{token.requestData.benefitName || 'Beneficio'}</p>
                    <span className="token-type">
                      {token.requestData.isBenefitJobby ? 'Jobby' : 'Empresa'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Navegación rápida */}
      <div className="quick-navigation">
        <div className="nav-grid">
          <Link to="/level3/benefits" className="nav-card benefits">
            <div className="nav-icon">🎁</div>
            <div className="nav-content">
              <h4>Beneficios</h4>
              <p>{stats.availableJobbyBenefits + stats.availableCompanyBenefits} disponibles</p>
            </div>
          </Link>
          
          <Link to="/level3/requests" className="nav-card requests">
            <div className="nav-icon">📋</div>
            <div className="nav-content">
              <h4>Mis Solicitudes</h4>
              <p>{stats.pendingRequests} pendientes</p>
            </div>
          </Link>
          
          <Link to="/level3/tokens" className="nav-card tokens">
            <div className="nav-icon">🎫</div>
            <div className="nav-content">
              <h4>Mis Tokens</h4>
              <p>{stats.activeTokens} activos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Modal de bienvenida */}
      {showWelcomeModal && (
        <div className="welcome-modal-overlay">
          <div className="welcome-modal">
            <div className="welcome-header">
              <h2>¡Bienvenido a Jobby! 🎉</h2>
              <button className="close-modal" onClick={handleWelcomeClose}>×</button>
            </div>
            <div className="welcome-content">
              <p>Estamos emocionados de tenerte aquí. Con Jobby puedes acceder a beneficios exclusivos usando tu sistema de tokens.</p>
              
              <div className="welcome-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div>
                    <h4>Explora Beneficios</h4>
                    <p>Descubre todos los beneficios disponibles</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div>
                    <h4>Solicita con Tokens</h4>
                    <p>Usa tus tokens para solicitar beneficios</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div>
                    <h4>Disfruta</h4>
                    <p>Recibe tu código y disfruta del beneficio</p>
                  </div>
                </div>
              </div>
              
              <button onClick={handleWelcomeClose} className="welcome-cta">
                ¡Comenzar ahora!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Level3Dashboard;