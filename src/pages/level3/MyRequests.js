import React, { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { getJobbyTokenBalance, getCompanyTokenBalance } from '../../services/firebase/database/databaseService';
import { Link } from 'react-router-dom';
import './styles/pages/MyRequests.css';
import './components/TokenModal.css'; // CSS independiente para el modal de token

const MyRequests = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para gestión de tokens separados
  const [jobbyTokenBalance, setJobbyTokenBalance] = useState(0);
  const [companyTokenBalance, setCompanyTokenBalance] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        // Obtener balances separados de tokens
        const loadTokenData = async () => {
          try {
            const jobbyBalance = await getJobbyTokenBalance(currentUser.uid);
            const companyBalance = await getCompanyTokenBalance(currentUser.uid);
            
            setJobbyTokenBalance(jobbyBalance);
            setCompanyTokenBalance(companyBalance);
          } catch (error) {
            console.error('Error loading token data:', error);
          }
        };
        
        loadTokenData();
        
        // Obtener todas las solicitudes del usuario
        const requestsRef = ref(database, 'benefit_requests');
        const unsubscribe = onValue(requestsRef, (snapshot) => {
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
        
        // Return cleanup function
        return () => {
          unsubscribe();
        };
      } catch (err) {
        setError('Error al cargar las solicitudes: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [currentUser]);
  
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filteredRequests = () => {
    if (activeTab === 'all') {
      return requests;
    }
    
    if (activeTab === 'pending') {
      // Solo mostrar solicitudes pendientes
      return requests.filter(request => 
        request.status === 'pending' || 
        request.status === 'pending_provider_approval' || 
        request.status === 'pending_admin_approval'
      );
    }
    
    return requests.filter(request => request.status === activeTab);
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
      case 'approved': return '';
      case 'rejected': return '';
      case 'pending':
      case 'pending_provider_approval':
      case 'pending_admin_approval':
        return '';
      default: return '';
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

  const onViewDetails = (request) => {
    // Simple alert for now - could be enhanced with a proper modal
    alert(`Detalles de la solicitud:\n\nBeneficio: ${request.benefitName}\nEstado: ${getStatusText(request.status)}\nFecha: ${formatDate(request.requestDate)}\nTokens: ${request.tokenCost || 1}`);
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
          <div className="error-icon">!</div>
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
            <h1>Historial de Solicitudes</h1>
            <p>Revisa el estado de todas tus solicitudes de beneficios</p>
          </div>
          <div className="header-actions">
            <div className="token-balances-display">
              <div className="token-balance-item">
                <span className="balance-label">Flexibles:</span>
                <span className="balance-amount">{jobbyTokenBalance} Tokens</span>
              </div>
              <div className="token-balance-item">
                <span className="balance-label">Empresa:</span>
                <span className="balance-amount">{companyTokenBalance} Tokens</span>
              </div>
            </div>
            <Link to="/level3/benefits" className="new-request-button">
              Nueva Solicitud
            </Link>
          </div>
        </div>
      </div>



      {/* Filtros */}
      <div className="filter-tabs">
        <div className="tabs-container">
          {[
            { key: 'all', label: 'Todas', icon: '' },
            { key: 'pending', label: 'Pendientes', icon: '' }
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
                  : requests.filter(r => 
                      r.status === 'pending' || 
                      r.status === 'pending_provider_approval' || 
                      r.status === 'pending_admin_approval'
                    ).length
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
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <h3>No hay solicitudes</h3>
            <p>
              {activeTab === 'all' 
                ? 'No has realizado ninguna solicitud aún.'
                : 'No tienes solicitudes pendientes en este momento.'
              }
            </p>
            <Link to="/level3/benefits" className="empty-action">
              Explorar Beneficios
            </Link>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests().map((request) => (
              <div key={request.id} className="modern-request-card">
                {/* Background Image with Overlay */}
                <div className="card-background">
                  <img 
                    src={request.benefitImage || '/api/placeholder/400/300'} 
                    alt={request.benefitName}
                    className="card-image"
                  />
                  <div className="card-overlay"></div>
                </div>

                {/* Category Badge */}
                <div className="category-badge">
                  {request.benefitCategory || 'General'}
                </div>

                {/* Content */}
                <div className="card-content">
                  <h3 className="card-title">{request.benefitName}</h3>
                  <p className="card-description">{request.benefitDescription}</p>
                  
                  {/* Status Indicator */}
                  <div className={`status-indicator status-${request.status}`}>
                    {getStatusText(request.status)}
                  </div>
                  
                  {/* Footer with tokens and actions */}
                  <div className="card-footer">
                    <div className="token-cost">
                      <span className="token-amount">{request.tokenCost || 1}</span>
                    </div>
                    
                    <button 
                      className="action-button"
                      onClick={() => onViewDetails(request)}
                    >
                      Ver Detalles
                      <span className="btn-arrow">></span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MyRequests;