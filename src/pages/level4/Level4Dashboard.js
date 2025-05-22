import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, onValue, query, orderByChild, equalTo, get } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { verifyAndUseToken } from '../../services/firebase/database/databaseService';
import './Level4Dashboard.css';

const Level4Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    processedTokens: 0,
    todayTokens: 0
  });
  const [recentTokens, setRecentTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickToken, setQuickToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.uid) {
        console.error('No hay ID de usuario disponible');
        setLoading(false);
        return;
      }

      try {
        // Tokens procesados por este proveedor
        const tokensQuery = query(
          ref(database, 'benefit_tokens'),
          orderByChild('usedBy'),
          equalTo(currentUser.uid)
        );
        
        onValue(tokensQuery, (snapshot) => {
          const tokens = [];
          let tokenCount = 0;
          let todayCount = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const tokenData = childSnapshot.val();
              tokenCount++;
              
              // Verificar si el token fue procesado hoy
              const usedDate = new Date(tokenData.usedAt);
              if (usedDate >= today) {
                todayCount++;
              }
              
              tokens.push({
                id: childSnapshot.key,
                ...tokenData
              });
            });
          }
          
          // Ordenar por fecha de uso, más recientes primero
          tokens.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
          
          // Obtener información adicional de los 10 tokens más recientes
          Promise.all(tokens.slice(0, 10).map(async (token) => {
            // Obtener datos de la solicitud relacionada
            try {
              const requestRef = ref(database, `benefit_requests/${token.requestId}`);
              const requestSnapshot = await get(requestRef);
              
              if (!requestSnapshot.exists()) {
                return {
                  ...token,
                  benefitName: "Desconocido",
                  isBenefitJobby: false,
                  userName: "Usuario desconocido"
                };
              }
              
              const requestData = requestSnapshot.val();
              let benefitName = "Desconocido";
              
              // Obtener nombre del beneficio
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
              
              // Obtener nombre del usuario
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
              console.error("Error al obtener datos adicionales del token:", err);
              return token;
            }
          })).then((enrichedTokens) => {
            setRecentTokens(enrichedTokens);
            setStats({
              processedTokens: tokenCount,
              todayTokens: todayCount
            });
          });
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };
    
    if (currentUser?.uid) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const handleQuickVerify = async (e) => {
    e.preventDefault();
    
    if (!quickToken.trim()) {
      setError('Por favor, ingresa un código de token');
      return;
    }
    
    try {
      setVerifying(true);
      setError('');
      setVerification(null);
      
      // Intentar verificar y usar el token
      await verifyAndUseToken(quickToken, currentUser.uid);
      
      // Si llega aquí, el token es válido
      setVerification({
        valid: true,
        message: 'Token verificado y procesado correctamente'
      });
      
      // Limpiar el campo después de una verificación exitosa
      setQuickToken('');
    } catch (error) {
      setVerification({
        valid: false,
        message: error.message || 'Token inválido o ya utilizado'
      });
    } finally {
      setVerifying(false);
    }
  };
  
  const handleNavigateToVerification = () => {
    navigate('/level4/verify');
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

  if (loading) {
    return <div className="loading">Cargando datos del dashboard...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <h1>Dashboard Proveedor</h1>
      <p className="welcome-message">
        Bienvenido, {currentUser?.displayName || 'Proveedor'}
      </p>
      
      <div className="dashboard-grid">
        <div className="stats-card">
          <div className="stats-card-title">Tokens Procesados</div>
          <div className="stats-card-value">{stats.processedTokens}</div>
          <div className="stats-card-description">Total histórico</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-title">Hoy</div>
          <div className="stats-card-value">{stats.todayTokens}</div>
          <div className="stats-card-description">Procesados hoy</div>
        </div>
      </div>
      
      <div className="dashboard-actions mt-5">
        <h2>Acciones Rápidas</h2>
        <div className="action-buttons">
          <button onClick={handleNavigateToVerification} className="action-button">
            Verificar Token
          </button>
        </div>
      </div>
      
      <div className="verify-token mt-5">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Verificación Rápida de Token</h2>
          </div>
          
          <div className="token-verify-form">
            <form onSubmit={handleQuickVerify}>
              <div className="form-group">
                <label htmlFor="tokenCode">Código de Token</label>
                <div className="token-input-container">
                  <input 
                    type="text" 
                    id="tokenCode" 
                    placeholder="Ingresa el código del token"
                    value={quickToken}
                    onChange={(e) => setQuickToken(e.target.value.toUpperCase())}
                    disabled={verifying}
                    autoComplete="off"
                  />
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={verifying || !quickToken.trim()}
                  >
                    {verifying ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
              </div>
              
              {error && <div className="error-alert">{error}</div>}
              
              {verification && (
                <div className={`verification-alert ${verification.valid ? 'success-alert' : 'error-alert'}`}>
                  {verification.valid ? (
                    <>
                      <div className="verification-icon">✓</div>
                      <div className="verification-content">
                        <strong>Token Válido</strong>
                        <p>{verification.message}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="verification-icon">✗</div>
                      <div className="verification-content">
                        <strong>Token Inválido</strong>
                        <p>{verification.message}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      
      <div className="recent-tokens mt-5">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tokens Procesados Recientemente</h2>
          </div>
          
          {recentTokens.length === 0 ? (
            <p className="no-tokens">No hay tokens procesados aún.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Beneficio</th>
                    <th>Usuario</th>
                    <th>Fecha de Uso</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTokens.map((token) => (
                    <tr key={token.id}>
                      <td>{token.tokenCode}</td>
                      <td>
                        {token.benefitName}
                        {token.isBenefitJobby !== undefined && (
                          <span className={`token-type ${token.isBenefitJobby ? 'token-jobby' : 'token-company'}`}>
                            {token.isBenefitJobby ? ' (Jobby)' : ' (Empresa)'}
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
      </div>
    </div>
  );
};

export default Level4Dashboard;