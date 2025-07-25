import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, query, orderByChild, equalTo, set } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { getJobbyTokenBalance, getCompanyTokenBalance } from '../../services/firebase/database/databaseService';
import './styles/index.css'; // Import Level 3 styles
import './styles/pages/Dashboard.css';
import TokenBalance from './components/TokenBalance';
import RecommendedBenefits from './components/RecommendedBenefits';

const Level3Dashboard = () => {
  const { currentUser, companyId } = useAuth();
  const [stats, setStats] = useState({
    availableJobbyBenefits: 0,
    availableCompanyBenefits: 0,
    pendingRequests: 0,
    activeTokens: 0,
    currentMonthTokens: 0,
    previousMonthTokens: 0,
    jobbyTokenBalance: 0, // Balance de tokens Jobby (beneficios flexibles)
    companyTokenBalance: 0 // Balance de tokens Empresa (beneficios internos)
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentTokens, setRecentTokens] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

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

        // Obtener balances reales de tokens Jobby y Empresa (sin mock data)
        const loadTokenBalances = async () => {
          try {
            const jobbyBalance = await getJobbyTokenBalance(currentUser.uid);
            const companyBalance = await getCompanyTokenBalance(currentUser.uid);
            
            console.log('Balances reales cargados - Jobby:', jobbyBalance, 'Empresa:', companyBalance);
            setStats(prevStats => ({
              ...prevStats,
              jobbyTokenBalance: jobbyBalance,
              companyTokenBalance: companyBalance
            }));
          } catch (error) {
            console.error('Error loading token balances:', error);
            // En caso de error, mostrar 0
            setStats(prevStats => ({
              ...prevStats,
              jobbyTokenBalance: 0,
              companyTokenBalance: 0
            }));
          }
        };
        
        loadTokenBalances();
        
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



  console.log('Dashboard stats:', stats);
  console.log('Jobby tokens:', stats.jobbyTokenBalance);
  console.log('Company tokens:', stats.companyTokenBalance);

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
          
        </div>
        
        {/* Componente de beneficios recomendados */}
        <RecommendedBenefits />
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
            <h3>🏆 Mi Historial Reciente</h3>
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
            <h3>🏆 Desafíos Activos</h3>
            <Link to="/level3/tokens" className="see-all-link">Ver todos</Link>
          </div>
          
          <div className="benefits-preview">
            {recentTokens.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <p>No tienes desafíos activos</p>
                <Link to="/level3/benefits" className="empty-action">Explorar desafíos</Link>
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


    </div>
  );
};

export default Level3Dashboard;