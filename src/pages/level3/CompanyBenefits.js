import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { redeemExperience } from '../../services/firebase/database/databaseService';
import './styles/pages/CompanyBenefits.css';

const CompanyBenefits = () => {
  const { currentUser, companyId } = useAuth();
  const [companyBenefits, setCompanyBenefits] = useState([]);
  const [filteredBenefits, setFilteredBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTokens, setUserTokens] = useState({ currentMonthTokens: 0, previousMonthTokens: 0 });
  const [userRedemptions, setUserRedemptions] = useState([]);
  const [redeemingExperience, setRedeemingExperience] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(null);
  const [redemptionError, setRedemptionError] = useState(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [redemptionFormData, setRedemptionFormData] = useState({
    comments: ''
  });

  useEffect(() => {
    const fetchBenefits = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        // Obtener tokens del usuario
        const userTokensRef = ref(database, `user_tokens/${currentUser.uid}`);
        onValue(userTokensRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserTokens(snapshot.val());
          } else {
            setUserTokens({ currentMonthTokens: 0, previousMonthTokens: 0 });
          }
        });

        // Obtener canjes del usuario
        const userRedemptionsRef = ref(database, 'experience_redemptions');
        onValue(userRedemptionsRef, (snapshot) => {
          const redemptions = [];
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const redemption = childSnapshot.val();
              if (redemption.userId === currentUser.uid) {
                redemptions.push({
                  id: childSnapshot.key,
                  ...redemption
                });
              }
            });
          }
          setUserRedemptions(redemptions);
        });
        
        // Obtener beneficios de la empresa
        if (companyId) {
          const companyBenefitsRef = ref(database, `company_benefits/${companyId}`);
          onValue(companyBenefitsRef, (snapshot) => {
            const benefits = [];
            if (snapshot.exists()) {
              snapshot.forEach((childSnapshot) => {
                const benefit = childSnapshot.val();
                
                if (benefit.status === 'active') {
                  benefits.push({
                    id: childSnapshot.key,
                    ...benefit,
                    isJobbyBenefit: false,
                    image: benefit.image || generatePlaceholder(benefit.name, '#4facfe'),
                    tokenCost: benefit.tokenCost || 1
                  });
                }
              });
            }
            
            setCompanyBenefits(benefits);
            setFilteredBenefits(benefits);
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los beneficios: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchBenefits();
  }, [currentUser, companyId]);

  const generatePlaceholder = (text, color = '#4facfe') => {
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'>
        <defs>
          <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' style='stop-color:${color};stop-opacity:1' />
            <stop offset='100%' style='stop-color:${color}dd;stop-opacity:1' />
          </linearGradient>
        </defs>
        <rect width='600' height='400' fill='url(#grad)'/>
        <text x='50%' y='45%' font-family='Arial, sans-serif' font-size='28' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'>${text || 'Beneficio'}</text>
        <text x='50%' y='55%' font-family='Arial, sans-serif' font-size='16' fill='white' text-anchor='middle' dominant-baseline='middle' opacity='0.8'>Sin imagen disponible</text>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };


  const openRedemptionModal = (experience) => {
    setSelectedExperience(experience);
    setRedemptionFormData({
      comments: ''
    });
    setShowRedemptionModal(true);
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setRedemptionFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRedemptionSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedExperience) return;
    
    setRedeemingExperience(true);
    setRedemptionSuccess(null);
    setRedemptionError(null);
    
    try {
      const additionalData = {};
      
      if (redemptionFormData.comments) {
        additionalData.comments = redemptionFormData.comments;
      }
      
      const result = await redeemExperience(
        currentUser.uid, 
        selectedExperience.id, 
        selectedExperience.isJobbyBenefit, 
        companyId,
        selectedExperience.tokenCost,
        additionalData
      );
      
      setRedemptionSuccess({
        message: `¡Beneficio interno canjeado exitosamente!`,
        experienceName: selectedExperience.name,
        tokenCost: selectedExperience.tokenCost,
        redemptionCode: result.redemptionCode,
        remainingTokens: result.remainingTokens
      });
      
      setUserTokens(prev => {
        const totalTokens = prev.currentMonthTokens + prev.previousMonthTokens;
        const remaining = totalTokens - selectedExperience.tokenCost;
        
        if (remaining <= prev.previousMonthTokens) {
          return {
            ...prev,
            previousMonthTokens: remaining,
            currentMonthTokens: 0
          };
        } else {
          return {
            ...prev,
            previousMonthTokens: 0,
            currentMonthTokens: remaining - prev.previousMonthTokens
          };
        }
      });
      
      setShowRedemptionModal(false);
    } catch (err) {
      setRedemptionError(err.message);
    } finally {
      setRedeemingExperience(false);
    }
  };
  
  const isAlreadyRedeemed = (experienceId) => {
    return userRedemptions.some(
      redemption => redemption.benefitId === experienceId && redemption.status === 'redeemed'
    );
  };
  
  const getAvailableTokens = () => {
    return userTokens.currentMonthTokens + userTokens.previousMonthTokens;
  };

  const canAffordExperience = (tokenCost) => {
    return getAvailableTokens() >= tokenCost;
  };
  
  if (loading) {
    return (
      <div className="company-benefits-loading">
        <div className="loading-animation">
          <div className="pulse-ring"></div>
          <div className="pulse-ring delay-1"></div>
          <div className="pulse-ring delay-2"></div>
        </div>
        <p>Cargando beneficios internos...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h2>Oops, algo salió mal</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  if (!companyId) {
    return (
      <div className="error-state">
        <div className="error-icon">🏢</div>
        <h2>Empresa no asignada</h2>
        <p>No se ha asignado una empresa a este usuario. Por favor, contacta con tu departamento de Recursos Humanos.</p>
      </div>
    );
  }

  if (filteredBenefits.length === 0) {
    return (
      <div className="empty-benefits-state">
        <div className="empty-icon">🏢</div>
        <h2>No hay beneficios internos disponibles</h2>
        <p>Tu empresa aún no ha configurado beneficios internos.</p>
        <button onClick={() => window.location.reload()} className="reset-filter-button">
          Recargar página
        </button>
      </div>
    );
  }

  return (
    <div className="company-benefits">
      <div className="benefits-header">
        <h1>Beneficios Internos de Empresa</h1>
        <p>Beneficios exclusivos proporcionados por tu empresa</p>
        
        <div className="tokens-summary">
          <div className="token-card">
            <span className="token-number">{getAvailableTokens()}</span>
            <span className="token-label">Tokens Disponibles</span>
          </div>
        </div>
      </div>


      <div className="benefits-grid">
        {filteredBenefits.map((benefit) => (
          <div key={benefit.id} className="company-benefit-card">
            <div className="card-image">
              <img 
                src={benefit.image} 
                alt={benefit.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = generatePlaceholder(benefit.name, '#4facfe');
                }}
              />
            </div>
            
            <div className="card-content">
              <div className="card-header">
                <h3>{benefit.name}</h3>
                <span className="benefit-type company">Empresa</span>
              </div>
              
              <div className="card-description">
                <p>{benefit.description}</p>
              </div>
              
              <div className="card-metadata">
                <span className="category">{benefit.category || 'General'}</span>
                <div className="token-cost">
                  <span className="token-icon">🎟️</span>
                  <span className="cost-amount">{benefit.tokenCost}</span>
                  <span className="cost-label">token{benefit.tokenCost > 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="card-actions">
                {isAlreadyRedeemed(benefit.id) ? (
                  <div className="status-indicator">
                    <span className="redeemed">✅ Ya canjeado</span>
                  </div>
                ) : !canAffordExperience(benefit.tokenCost) ? (
                  <div className="insufficient-tokens">
                    <span className="insufficient-text">🎟️ Tokens insuficientes</span>
                    <small>Necesitas {benefit.tokenCost}, tienes {getAvailableTokens()}</small>
                  </div>
                ) : (
                  <button 
                    className="redeem-button"
                    onClick={() => openRedemptionModal(benefit)}
                  >
                    <span className="button-icon">🎟️</span>
                    Canjear por {benefit.tokenCost} token{benefit.tokenCost > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para canjear beneficios */}
      {showRedemptionModal && selectedExperience && (
        <div className="request-modal-overlay">
          <div className="request-modal">
            <div className="request-modal-header">
              <h3>Canjear Beneficio Interno</h3>
              <button 
                className="close-button"
                onClick={() => setShowRedemptionModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="request-modal-body">
              <div className="selected-benefit-info">
                <div className="benefit-preview">
                  <img 
                    src={selectedExperience.image} 
                    alt={selectedExperience.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = generatePlaceholder(selectedExperience.name, '#4facfe');
                    }}
                  />
                </div>
                <div className="benefit-details">
                  <h4>{selectedExperience.name}</h4>
                  <p>{selectedExperience.description}</p>
                  <div className="experience-cost">
                    <span className="cost-badge">
                      🎟️ {selectedExperience.tokenCost} token{selectedExperience.tokenCost > 1 ? 's' : ''}
                    </span>
                    <span className="experience-type company">
                      Beneficio Interno de Empresa
                    </span>
                  </div>
                </div>
              </div>

              <div className="token-summary">
                <div className="token-info">
                  <span className="available-tokens">Tokens disponibles: {getAvailableTokens()}</span>
                  <span className="after-redemption">Después del canje: {getAvailableTokens() - selectedExperience.tokenCost}</span>
                </div>
              </div>
              
              <form onSubmit={handleRedemptionSubmit}>
                <div className="form-group">
                  <label htmlFor="comments">
                    Comentarios adicionales (opcional)
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={redemptionFormData.comments}
                    onChange={handleFormInputChange}
                    rows="3"
                    placeholder="Cuéntanos más detalles sobre este beneficio..."
                  />
                </div>
                
                {redemptionError && (
                  <div className="error-alert">
                    {redemptionError}
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowRedemptionModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={redeemingExperience || !canAffordExperience(selectedExperience.tokenCost)}
                  >
                    {redeemingExperience ? (
                      <span className="loading-text">
                        <span className="spinner-small"></span>
                        Canjeando...
                      </span>
                    ) : (
                      <>
                        <span>🎟️</span>
                        Canjear por {selectedExperience.tokenCost} token{selectedExperience.tokenCost > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de éxito del canje */}
      {redemptionSuccess && (
        <div className="success-notification">
          <div className="notification-content">
            <span className="success-icon">🎉</span>
            <div className="success-details">
              <h4>¡Beneficio canjeado!</h4>
              <p><strong>{redemptionSuccess.experienceName}</strong></p>
              <p>Código de canje: <strong>{redemptionSuccess.redemptionCode}</strong></p>
              <p>Tokens restantes: <strong>{redemptionSuccess.remainingTokens}</strong></p>
            </div>
            <button onClick={() => setRedemptionSuccess(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CompanyBenefits);