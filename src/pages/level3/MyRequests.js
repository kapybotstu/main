import React, { useState, useEffect } from 'react';
import { ref, onValue, get, update } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './styles/pages/MyRequests.css';
import './components/TokenModal.css'; // CSS independiente para el modal de token
import RequestCard from './components/RequestCard';

const MyRequests = () => {
  const { currentUser, companyId } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isActivatingToken, setIsActivatingToken] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  
  // Estados para gestión de tokens
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [showTokenHistory, setShowTokenHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        // Obtener balance de tokens del usuario
        const balanceRef = ref(database, `user_blank_tokens/${currentUser.uid}/balance`);
        onValue(balanceRef, (snapshot) => {
          setTokenBalance(snapshot.exists() ? snapshot.val() : 0);
        });
        
        // Obtener historial de tokens
        const historyRef = ref(database, `user_blank_tokens/${currentUser.uid}/history`);
        onValue(historyRef, (snapshot) => {
          const historyList = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              historyList.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
                createdAt: new Date(childSnapshot.val().createdAt)
              });
            });
            
            // Ordenar por fecha (más recientes primero)
            historyList.sort((a, b) => b.createdAt - a.createdAt);
          }
          
          setTokenHistory(historyList);
        });
        
        // Obtener todas las solicitudes del usuario
        const requestsRef = ref(database, 'benefit_requests');
        onValue(requestsRef, (snapshot) => {
          const userRequests = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const request = childSnapshot.val();
              
              if (request.userId === currentUser.uid) {
                // Construir objeto de solicitud con información completa
                userRequests.push({
                  id: childSnapshot.key,
                  ...request,
                  requestDate: new Date(request.requestDate),
                  processedDate: request.processedDate ? new Date(request.processedDate) : null
                });
              }
            });
          }
          
          // Agregar información adicional a cada solicitud
          Promise.all(userRequests.map(async (request) => {
            // Obtener información del beneficio
            let benefitData = {};
            const benefitRef = ref(
              database, 
              request.isBenefitJobby 
                ? `jobby_benefits/${request.benefitId}`
                : `company_benefits/${request.companyId}/${request.benefitId}`
            );
            
            const benefitSnapshot = await get(benefitRef);
            if (benefitSnapshot.exists()) {
              benefitData = benefitSnapshot.val();
            }
            
            // Obtener información del token si existe
            let tokenData = null;
            if (request.tokenId) {
              const tokenRef = ref(database, `benefit_tokens/${request.tokenId}`);
              const tokenSnapshot = await get(tokenRef);
              
              if (tokenSnapshot.exists()) {
                tokenData = {
                  ...tokenSnapshot.val(),
                  id: request.tokenId,
                  expiresAt: new Date(tokenSnapshot.val().expiresAt),
                  createdAt: new Date(tokenSnapshot.val().createdAt),
                  usedAt: tokenSnapshot.val().usedAt ? new Date(tokenSnapshot.val().usedAt) : null
                };
              }
            }
            
            return {
              ...request,
              benefitName: benefitData.name || request.benefitName || 'Beneficio',
              benefitDescription: benefitData.description || '',
              benefitCategory: benefitData.category || 'General',
              benefitValue: benefitData.value || '',
              benefitImage: benefitData.image || '/api/placeholder/300/200',
              token: tokenData
            };
          })).then((enrichedRequests) => {
            // Ordenar por fecha de solicitud (más recientes primero)
            enrichedRequests.sort((a, b) => b.requestDate - a.requestDate);
            setRequests(enrichedRequests);
            setLoading(false);
          });
        });
      } catch (err) {
        setError('Error al cargar las solicitudes: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [currentUser]);
  
  const handleActivateToken = async (requestId, benefitName) => {
    setIsActivatingToken(true);
    setErrorMessage('');
    
    try {
      // Buscar si ya existe un token para esta solicitud
      const requestRef = ref(database, `benefit_requests/${requestId}`);
      const requestSnapshot = await get(requestRef);
      
      if (!requestSnapshot.exists()) {
        throw new Error('No se encontró la solicitud');
      }
      
      const requestData = requestSnapshot.val();
      
      if (requestData.tokenId) {
        // Si ya existe un token, mostrarlo
        const tokenRef = ref(database, `benefit_tokens/${requestData.tokenId}`);
        const tokenSnapshot = await get(tokenRef);
        
        if (tokenSnapshot.exists()) {
          const tokenData = tokenSnapshot.val();
          setSelectedToken({
            ...tokenData,
            id: requestData.tokenId,
            benefitName,
            expiresAt: new Date(tokenData.expiresAt),
            paidWithTokens: requestData.paidWithTokens,
            tokenCost: requestData.tokenCost,
            adminInstructions: tokenData.adminInstructions || ''
          });
          setShowTokenModal(true);
        } else {
          throw new Error('No se encontró información del token');
        }
      } else {
        throw new Error('Esta solicitud aún no tiene un token asociado');
      }
    } catch (err) {
      setErrorMessage('Error al activar el token: ' + err.message);
    } finally {
      setIsActivatingToken(false);
    }
  };
  
  const handleCloseTokenModal = () => {
    setShowTokenModal(false);
    setSelectedToken(null);
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const filteredRequests = () => {
    if (activeTab === 'all') {
      return requests;
    }
    
    if (activeTab === 'pending') {
      // Incluir todos los tipos de pendientes
      return requests.filter(request => 
        request.status === 'pending' || 
        request.status === 'pending_provider_approval' || 
        request.status === 'pending_admin_approval'
      );
    }
    
    return requests.filter(request => request.status === activeTab);
  };
  
  // Funciones para historial de tokens
  const filteredTokenHistory = () => {
    if (historyFilter === 'all') {
      return tokenHistory;
    }
    
    return tokenHistory.filter(item => item.type === historyFilter);
  };
  
  const getTypeText = (type) => {
    switch (type) {
      case 'add': return 'Añadido';
      case 'remove': return 'Quitado';
      case 'used': return 'Canjeado';
      default: return type;
    }
  };
  
  const getTypeClass = (type) => {
    switch (type) {
      case 'add': return 'type-add';
      case 'remove': return 'type-remove';
      case 'used': return 'type-used';
      default: return '';
    }
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending':
      case 'pending_provider_approval':
      case 'pending_admin_approval':
        return '⏳';
      default: return '📋';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'pending':
      case 'pending_provider_approval':
      case 'pending_admin_approval':
        return 'Pendiente';
      default: return 'Desconocido';
    }
  };
  
  
  if (loading) {
    return (
      <div className="modern-requests">
        <div className="loading-state">
          <div className="loading-animation">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
          </div>
          <p>Cargando tus solicitudes...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="modern-requests">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Error al cargar solicitudes</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-requests">
      {/* Header */}
      <div className="requests-header">
        <div className="header-content">
          <div className="header-info">
            <h1>📋 Mis Solicitudes</h1>
            <p>Gestiona y revisa el estado de tus solicitudes de beneficios</p>
          </div>
          <div className="header-actions">
            <div className="token-balance-display">
              <span className="balance-label">Balance:</span>
              <span className="balance-amount">🎟️ {tokenBalance}</span>
              <button 
                className="history-toggle-btn"
                onClick={() => setShowTokenHistory(!showTokenHistory)}
                title="Ver historial de tokens"
              >
                📊
              </button>
            </div>
            <Link to="/level3/benefits" className="new-request-button">
              <span className="button-icon">✨</span>
              Nueva Solicitud
            </Link>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      {successMessage && (
        <div className="success-notification">
          <span className="success-icon">✅</span>
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}
      
      {errorMessage && (
        <div className="error-notification">
          <span className="error-icon">⚠️</span>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}

      {/* Historial de tokens (mostrar/ocultar) */}
      {showTokenHistory && (
        <div className="token-history-section">
          <div className="history-header">
            <h2>📊 Historial de Tokens</h2>
            <button 
              className="close-history-btn"
              onClick={() => setShowTokenHistory(false)}
            >
              ×
            </button>
          </div>
          
          {/* Filtros del historial */}
          <div className="history-filter-tabs">
            <button
              className={`filter-tab ${historyFilter === 'all' ? 'active' : ''}`}
              onClick={() => setHistoryFilter('all')}
            >
              Todas
            </button>
            <button
              className={`filter-tab ${historyFilter === 'add' ? 'active' : ''}`}
              onClick={() => setHistoryFilter('add')}
            >
              Recibidos
            </button>
            <button
              className={`filter-tab ${historyFilter === 'used' ? 'active' : ''}`}
              onClick={() => setHistoryFilter('used')}
            >
              Canjeados
            </button>
          </div>
          
          {/* Lista del historial */}
          <div className="history-list">
            {filteredTokenHistory().length === 0 ? (
              <div className="empty-history">
                <p>No hay transacciones para mostrar</p>
              </div>
            ) : (
              filteredTokenHistory().map((item) => (
                <div key={item.id} className={`history-item ${getTypeClass(item.type)}`}>
                  <div className="history-item-content">
                    <div className="history-main">
                      <span className={`transaction-type ${getTypeClass(item.type)}`}>
                        {getTypeText(item.type)}
                      </span>
                      <span className="transaction-amount">
                        {item.type === 'add' ? '+' : '-'}{item.amount} tokens
                      </span>
                    </div>
                    <div className="history-details">
                      <p className="reason">{item.reason}</p>
                      <p className="date">{formatDate(item.createdAt)}</p>
                    </div>
                    <div className="history-balance">
                      <span className="balance-before">Antes: {item.balanceBefore}</span>
                      <span className="balance-arrow">→</span>
                      <span className="balance-after">Después: {item.balanceAfter}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filter-tabs">
        <div className="tabs-container">
          {[
            { key: 'all', label: 'Todas', icon: '📋' },
            { key: 'pending', label: 'Pendientes', icon: '⏳' },
            { key: 'approved', label: 'Aprobadas', icon: '✅' },
            { key: 'rejected', label: 'Rechazadas', icon: '❌' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
              <span className="tab-count">
                {tab.key === 'all' 
                  ? requests.length 
                  : tab.key === 'pending'
                    ? requests.filter(r => 
                        r.status === 'pending' || 
                        r.status === 'pending_provider_approval' || 
                        r.status === 'pending_admin_approval'
                      ).length
                    : requests.filter(r => r.status === tab.key).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="requests-content">
        {filteredRequests().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay solicitudes</h3>
            <p>
              {activeTab === 'all' 
                ? 'No has realizado ninguna solicitud aún.'
                : `No tienes solicitudes con estado "${getStatusText(activeTab)}".`
              }
            </p>
            <Link to="/level3/benefits" className="empty-action">
              <span className="button-icon">🎁</span>
              Explorar Beneficios
            </Link>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests().map((request) => (
              <div key={request.id} className="request-card">
                <div className="card-image">
                  <img src={request.benefitImage} alt={request.benefitName} />
                  <div className="card-overlay">
                    <span className={`status-badge status-${request.status}`}>
                      <span className="status-icon">{getStatusIcon(request.status)}</span>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="card-header">
                    <h3>{request.benefitName}</h3>
                    <div className="card-badges">
                      <span className={`benefit-type ${request.isBenefitJobby ? 'jobby' : 'company'}`}>
                        {request.isBenefitJobby ? 'Jobby' : 'Empresa'}
                      </span>
                      {request.paidWithTokens && (
                        <span className="token-paid-badge" title="Pagado con tokens">
                          🎟️ {request.tokenCost}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="card-description">
                    <p>{request.benefitDescription}</p>
                  </div>

                  <div className="card-metadata">
                    <div className="metadata-item">
                      <span className="metadata-label">📅 Solicitado:</span>
                      <span className="metadata-value">{formatDate(request.requestDate)}</span>
                    </div>
                    {request.processedDate && (
                      <div className="metadata-item">
                        <span className="metadata-label">⚡ Procesado:</span>
                        <span className="metadata-value">{formatDate(request.processedDate)}</span>
                      </div>
                    )}
                    <div className="metadata-item">
                      <span className="metadata-label">🏷️ Categoría:</span>
                      <span className="metadata-value">{request.benefitCategory}</span>
                    </div>
                    {request.benefitValue && (
                      <div className="metadata-item">
                        <span className="metadata-label">💰 Valor:</span>
                        <span className="metadata-value">{request.benefitValue}</span>
                      </div>
                    )}
                    {request.paidWithTokens && (
                      <div className="metadata-item tokens-paid">
                        <span className="metadata-label">🎟️ Pagado con tokens:</span>
                        <span className="metadata-value">{request.tokenCost} tokens</span>
                      </div>
                    )}
                  </div>

                  {request.token && (
                    <div className="token-info">
                      <div className="token-status">
                        🎫 Token: <span className={`token-status-text token-${request.token.status}`}>
                          {request.token.status === 'active' ? 'Activo' : 'Utilizado'}
                        </span>
                      </div>
                      {request.token.expiresAt && (
                        <div className="token-expiry">
                          ⏰ Expira: {formatDate(request.token.expiresAt)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="card-actions">
                    {request.status === 'approved' ? (
                      <button 
                        className="action-button primary"
                        onClick={() => handleActivateToken(request.id, request.benefitName)}
                        disabled={isActivatingToken}
                      >
                        <span className="button-icon">🎫</span>
                        {request.token ? 'Ver Token' : 'Generar Token'}
                      </button>
                    ) : (request.status === 'pending' || request.status === 'pending_provider_approval' || request.status === 'pending_admin_approval') ? (
                      <div className="pending-message">
                        <span className="pending-icon">⏳</span>
                        En proceso
                      </div>
                    ) : request.status === 'rejected' ? (
                      <div className="rejected-message">
                        <span className="rejected-icon">❌</span>
                        Solicitud rechazada
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Token */}
      {showTokenModal && selectedToken && (
        <div className="token-modal-overlay">
          <div className="token-modal">
            <div className="modal-header">
              <h2>🎫 Tu Token de Beneficio</h2>
              <button className="close-button" onClick={handleCloseTokenModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="token-display">
                <div className="token-code">{selectedToken.tokenCode}</div>
                <div className="token-expiry">
                  Válido hasta: {formatDate(selectedToken.expiresAt)}
                </div>
              </div>

              <div className="benefit-info">
                <h3>{selectedToken.benefitName}</h3>
                {selectedToken.paidWithTokens && (
                  <div className="paid-with-tokens-notice">
                    <span className="token-icon">🎟️</span>
                    <span>Pagado con {selectedToken.tokenCost} tokens</span>
                  </div>
                )}
              </div>
              
              <div className="token-instructions">
                <h4>📋 Instrucciones de uso:</h4>
                
                {/* Mostrar instrucciones específicas del admin para beneficios de terceros */}
                {selectedToken.adminInstructions && (
                  <div className="admin-instructions">
                    <div className="admin-instructions-header">
                      <span className="admin-icon">👨‍💼</span>
                      <strong>Instrucciones especiales del administrador:</strong>
                    </div>
                    <div className="admin-instructions-content">
                      {selectedToken.adminInstructions}
                    </div>
                  </div>
                )}
                
                <div className="instructions-list">
                  <div className="instruction-step">
                    <span className="step-number">1</span>
                    <span className="step-text">
                      {selectedToken.adminInstructions 
                        ? "Sigue las instrucciones específicas del administrador arriba"
                        : "Presenta este código al proveedor del beneficio"
                      }
                    </span>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">2</span>
                    <span className="step-text">El proveedor verificará el código en nuestro sistema</span>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">3</span>
                    <span className="step-text">¡Disfruta de tu beneficio una vez validado!</span>
                  </div>
                </div>
                
                <div className="important-note">
                  <span className="note-icon">⚠️</span>
                  <strong>Importante:</strong> Este token es de un solo uso y expirará automáticamente en la fecha indicada.
                  {selectedToken.paidWithTokens && (
                    <p><strong>✅ Beneficio pagado con tokens:</strong> Tu solicitud fue procesada automáticamente.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="close-modal-button"
                onClick={handleCloseTokenModal}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;