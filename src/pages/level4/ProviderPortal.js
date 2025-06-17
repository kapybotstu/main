import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, query, orderByChild, equalTo, get } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { verifyAndUseToken } from '../../services/firebase/database/databaseService';
import './styles/ProviderPortal.css';
import jobbyLogo from '../../assets/logotipo-jobby-3.png';

const ProviderPortal = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tokenCode, setTokenCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    processedTokens: 0,
    todayTokens: 0,
    monthTokens: 0
  });
  const [recentTokens, setRecentTokens] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!currentUser?.uid) return;

      try {
        const tokensQuery = query(
          ref(database, 'benefit_tokens'),
          orderByChild('usedBy'),
          equalTo(currentUser.uid)
        );
        
        onValue(tokensQuery, async (snapshot) => {
          const tokens = [];
          let tokenCount = 0;
          let todayCount = 0;
          let monthCount = 0;
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const tokenData = childSnapshot.val();
              tokenCount++;
              
              const usedDate = new Date(tokenData.usedAt);
              if (usedDate >= today) {
                todayCount++;
              }
              if (usedDate >= firstDayOfMonth) {
                monthCount++;
              }
              
              tokens.push({
                id: childSnapshot.key,
                ...tokenData
              });
            });
          }
          
          tokens.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
          
          // Enriquecer los primeros 20 tokens con información adicional
          const enrichedTokens = await Promise.all(tokens.slice(0, 20).map(async (token) => {
            try {
              const requestRef = ref(database, `benefit_requests/${token.requestId}`);
              const requestSnapshot = await get(requestRef);
              
              if (!requestSnapshot.exists()) {
                return {
                  ...token,
                  benefitName: "Desconocido",
                  userName: "Usuario desconocido"
                };
              }
              
              const requestData = requestSnapshot.val();
              let benefitName = "Desconocido";
              
              if (requestData.benefitId) {
                const benefitRef = ref(
                  database, 
                  requestData.isBenefitJobby 
                    ? `jobby_benefits/${requestData.benefitId}`
                    : `company_benefits/${requestData.companyId}/${requestData.benefitId}`
                );
                
                const benefitSnapshot = await get(benefitRef);
                if (benefitSnapshot.exists()) {
                  benefitName = benefitSnapshot.val().name;
                }
              }
              
              let userName = "Usuario desconocido";
              if (requestData.userId) {
                const userRef = ref(database, `users/${requestData.userId}`);
                const userSnapshot = await get(userRef);
                
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.val();
                  userName = userData.displayName || userData.email || "Usuario " + requestData.userId;
                }
              }
              
              return {
                ...token,
                benefitName,
                isBenefitJobby: requestData.isBenefitJobby,
                userName
              };
            } catch (err) {
              console.error("Error al obtener datos del token:", err);
              return token;
            }
          }));
          
          setRecentTokens(enrichedTokens);
          setStats({
            processedTokens: tokenCount,
            todayTokens: todayCount,
            monthTokens: monthCount
          });
          setLoadingHistory(false);
        });
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoadingHistory(false);
      }
    };
    
    if (currentUser?.uid) {
      fetchProviderData();
    }
  }, [currentUser]);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!tokenCode.trim()) {
      setError('Por favor, ingresa un código de token');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setVerification(null);
      
      await verifyAndUseToken(tokenCode, currentUser.uid);
      
      setVerification({
        valid: true,
        message: 'Token verificado y procesado correctamente'
      });
      
      // Mostrar animación de éxito
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);
      
      setTokenCode('');
    } catch (error) {
      setVerification({
        valid: false,
        message: error.message || 'Token inválido o ya utilizado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Animación de entrada al cargar
  useEffect(() => {
    if (isFirstLoad && currentUser) {
      setTimeout(() => {
        setIsFirstLoad(false);
      }, 2000);
    }
  }, [currentUser]);

  return (
    <div className="provider-portal">
      {/* Animación de bienvenida */}
      {isFirstLoad && (
        <div className="welcome-animation">
          <div className="welcome-content">
            <img src={jobbyLogo} alt="Jobby" className="welcome-logo" />
            <div className="welcome-text">Bienvenido al Portal de Proveedores</div>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      
      {/* Animación de éxito al verificar token */}
      {showSuccessAnimation && (
        <div className="success-animation">
          <div className="success-content">
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none"/>
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2>¡Token Canjeado!</h2>
            <p>El beneficio ha sido procesado exitosamente</p>
          </div>
        </div>
      )}
      <header className="provider-header">
        <div className="header-content">
          <div className="header-left">
            <img src={jobbyLogo} alt="Jobby" className="header-logo" />
            <div className="header-text">
              <h1>Portal del Proveedor</h1>
              <p>Bienvenido, {currentUser?.displayName || 'Proveedor'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="provider-main">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-value">{stats.processedTokens}</div>
            <div className="stat-label">Total Histórico</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.monthTokens}</div>
            <div className="stat-label">Este Mes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.todayTokens}</div>
            <div className="stat-label">Hoy</div>
          </div>
        </div>

        <div className="verification-section">
          <h2>Verificar Token</h2>
          <form onSubmit={handleVerify} className="verification-form">
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Ingresa el código del token"
                value={tokenCode}
                onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                disabled={loading}
                autoComplete="off"
                className="token-input"
                autoFocus
              />
              <button 
                type="submit" 
                className="verify-btn"
                disabled={loading || !tokenCode.trim()}
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            {verification && (
              <div className={`alert ${verification.valid ? 'alert-success' : 'alert-error'}`}>
                <span className="alert-icon">
                  {verification.valid ? '✓' : '✗'}
                </span>
                <div>
                  <strong>{verification.valid ? 'Token Válido' : 'Token Inválido'}</strong>
                  <p>{verification.message}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="history-section">
          <h2>Historial de Tokens Procesados</h2>
          
          {loadingHistory ? (
            <div className="loading-message">Cargando historial...</div>
          ) : recentTokens.length === 0 ? (
            <div className="empty-message">No hay tokens procesados aún.</div>
          ) : (
            <div className="tokens-table">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Beneficio</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTokens.map((token) => (
                    <tr key={token.id}>
                      <td className="token-code">{token.tokenCode}</td>
                      <td>
                        {token.benefitName}
                        {token.isBenefitJobby !== undefined && (
                          <span className={`badge ${token.isBenefitJobby ? 'badge-jobby' : 'badge-company'}`}>
                            {token.isBenefitJobby ? 'Jobby' : 'Empresa'}
                          </span>
                        )}
                      </td>
                      <td>{token.userName}</td>
                      <td>{formatDate(token.usedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProviderPortal;