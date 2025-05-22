import React, { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './MyTokens.css';

const MyTokens = () => {
  const { currentUser } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active');
  const [selectedToken, setSelectedToken] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  
  useEffect(() => {
    const fetchTokens = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        // Obtener solicitudes del usuario
        const requestsRef = ref(database, 'benefit_requests');
        onValue(requestsRef, (snapshot) => {
          const userRequests = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const request = childSnapshot.val();
              
              if (request.userId === currentUser.uid && request.tokenId) {
                userRequests.push({
                  id: childSnapshot.key,
                  ...request
                });
              }
            });
          }
          
          // Primero obtener todos los tokens para asegurar que se reflejen los cambios de estado
          const tokensRef = ref(database, 'benefit_tokens');
          get(tokensRef).then((tokensSnapshot) => {
            const tokensMap = {};
            
            // Crear un mapa de tokens para consulta rápida
            if (tokensSnapshot.exists()) {
              tokensSnapshot.forEach((tokenChild) => {
                tokensMap[tokenChild.key] = tokenChild.val();
              });
            }
            
            // Para cada solicitud con token, obtener la información del token
            Promise.all(userRequests.map(async (request) => {
              // Obtener token del mapa
              const tokenData = tokensMap[request.tokenId];
              
              if (!tokenData) {
                return null; // Token no encontrado
              }
              
              const expiresAt = new Date(tokenData.expiresAt);
              const isExpired = expiresAt < new Date();
              
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
              
              // Crear objeto token con toda la información
              return {
                id: request.tokenId,
                requestId: request.id,
                userId: request.userId,
                benefitId: request.benefitId,
                isBenefitJobby: request.isBenefitJobby,
                companyId: request.companyId,
                status: isExpired ? 'expired' : tokenData.status,
                tokenCode: tokenData.tokenCode,
                createdAt: new Date(tokenData.createdAt),
                expiresAt,
                usedAt: tokenData.usedAt ? new Date(tokenData.usedAt) : null,
                usedBy: tokenData.usedBy,
                benefitName: benefitData.name || request.benefitName || 'Beneficio',
                benefitDescription: benefitData.description || '',
                benefitCategory: benefitData.category || 'General',
                benefitValue: benefitData.value || ''
              };
            }))
            .then((tokensArray) => {
              // Filtrar tokens nulos y ordenar por fecha (más recientes primero)
              const validTokens = tokensArray.filter(token => token !== null);
              validTokens.sort((a, b) => b.createdAt - a.createdAt);
              setTokens(validTokens);
              setLoading(false);
            });
          });
        });
      } catch (err) {
        setError('Error al cargar los tokens: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchTokens();
  }, [currentUser]);
  
  const handleChangeFilter = (newFilter) => {
    setFilter(newFilter);
  };
  
  const handleViewToken = (token) => {
    // Antes de mostrar el modal, verificar si el token todavía está activo
    // Esto es un doble chequeo para prevenir mostrar tokens usados
    if (token.status !== 'active') {
      return;
    }
    setSelectedToken(token);
    setShowTokenModal(true);
  };
  
  const handleCloseModal = () => {
    setShowTokenModal(false);
    setSelectedToken(null);
  };
  
  const filteredTokens = () => {
    if (filter === 'all') {
      return tokens;
    }
    
    return tokens.filter(token => token.status === filter);
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return <div className="loading">Cargando tus tokens...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="tokens-container">
      <h1>Mis Tokens</h1>
      
      <div className="tokens-header">
        <div className="tokens-filter">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleChangeFilter('all')}
          >
            Todos
          </button>
          <button 
            className={`filter-button ${filter === 'active' ? 'active' : ''}`}
            onClick={() => handleChangeFilter('active')}
          >
            Activos
          </button>
          <button 
            className={`filter-button ${filter === 'used' ? 'active' : ''}`}
            onClick={() => handleChangeFilter('used')}
          >
            Utilizados
          </button>
          <button 
            className={`filter-button ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => handleChangeFilter('expired')}
          >
            Expirados
          </button>
        </div>
      </div>
      
      {filteredTokens().length === 0 ? (
        <div className="no-tokens">
          <p>No tienes tokens {filter !== 'all' ? `con estado "${filter}"` : ''}</p>
          <Link to="/level3/benefits">
            <button>Ver Beneficios Disponibles</button>
          </Link>
        </div>
      ) : (
        <div className="tokens-grid">
          {filteredTokens().map((token) => (
            <div key={token.id} className="token-card">
              <div className="token-header">
                <span className={`token-badge token-${token.status}`}>
                  {token.status === 'active' 
                    ? 'Activo' 
                    : token.status === 'used'
                      ? 'Utilizado'
                      : 'Expirado'
                  }
                </span>
                <span className="token-expiry">
                  {token.status === 'active' 
                    ? `Expira: ${formatDate(token.expiresAt)}`
                    : token.status === 'used'
                      ? `Usado: ${formatDate(token.usedAt)}`
                      : `Expiró: ${formatDate(token.expiresAt)}`
                  }
                </span>
              </div>
              
              <div className="token-body">
                <div className="token-display">
                  <div className="token-code">{token.tokenCode}</div>
                  <div className="token-benefit">{token.benefitName}</div>
                  <div className={`token-type ${token.isBenefitJobby ? 'token-jobby' : 'token-company'}`}>
                    {token.isBenefitJobby ? 'Beneficio Jobby' : 'Beneficio de Empresa'}
                  </div>
                </div>
                
                <button 
                  className="token-action"
                  onClick={() => handleViewToken(token)}
                  disabled={token.status !== 'active'}
                >
                  {token.status === 'active' 
                    ? 'Ver detalles' 
                    : token.status === 'used' 
                      ? 'Token utilizado' 
                      : 'Token expirado'
                  }
                </button>
              </div>
              
              <div className="token-footer">
                {token.status === 'active' 
                  ? 'Presenta este código al proveedor para redimir tu beneficio'
                  : token.status === 'used'
                    ? 'Este token ya ha sido utilizado'
                    : 'Este token ha expirado'
                }
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showTokenModal && selectedToken && (
        <div className="token-modal">
          <div className="token-modal-content">
            <div className="token-modal-header">
              <h2>Detalles del Token</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="token-display">
              <div className="token-code">{selectedToken.tokenCode}</div>
              <div className="token-expiry">
                Válido hasta: {formatDate(selectedToken.expiresAt)}
              </div>
            </div>
            
            <div className="token-details">
              <div className="token-details-item">
                <div className="token-details-label">Beneficio:</div>
                <div className="token-details-value">{selectedToken.benefitName}</div>
              </div>
              <div className="token-details-item">
                <div className="token-details-label">Tipo:</div>
                <div className="token-details-value">
                  {selectedToken.isBenefitJobby ? 'Jobby' : 'Empresa'}
                </div>
              </div>
              {selectedToken.benefitCategory && (
                <div className="token-details-item">
                  <div className="token-details-label">Categoría:</div>
                  <div className="token-details-value">{selectedToken.benefitCategory}</div>
                </div>
              )}
              {selectedToken.benefitValue && (
                <div className="token-details-item">
                  <div className="token-details-label">Valor:</div>
                  <div className="token-details-value">{selectedToken.benefitValue}</div>
                </div>
              )}
              <div className="token-details-item">
                <div className="token-details-label">Creado el:</div>
                <div className="token-details-value">{formatDate(selectedToken.createdAt)}</div>
              </div>
            </div>
            
            <div className="token-instructions">
              <h3>Cómo usar este token:</h3>
              <ol>
                <li>Muestra este código al proveedor del beneficio</li>
                <li>El proveedor lo verificará en el sistema</li>
                <li>Una vez validado, podrás disfrutar de tu beneficio</li>
              </ol>
              <p>
                <strong>Nota:</strong> Este token es de un solo uso y expirará en la fecha indicada.
              </p>
            </div>
            
            <div className="token-modal-actions">
              <button 
                className="action-button primary-action"
                onClick={handleCloseModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTokens;