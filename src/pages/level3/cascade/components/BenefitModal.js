import React from 'react';
import './BenefitModal.css';

const BenefitModal = ({ benefit, isOpen, onClose, onConfirmRedeem, userTokenBalance = 0 }) => {
  if (!isOpen || !benefit) return null;

  const {
    id,
    name,
    description,
    category,
    image,
    tokensRequired = 1,
    provider,
    isJobbyBenefit = true
  } = benefit;

  const handleConfirmRedeem = () => {
    if (onConfirmRedeem) {
      onConfirmRedeem(benefit);
    }
    // No cerramos el modal aquí, lo maneja el componente padre
  };

  const canAfford = userTokenBalance >= tokensRequired;
  const isTokenBalanceValid = userTokenBalance > 0;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="benefit-modal-backdrop" onClick={handleBackdropClick}>
      <div className="benefit-modal">
        {/* Header con imagen */}
        <div className="benefit-modal__header">
          <div className="benefit-modal__image-container">
            <img 
              src={image || '/api/placeholder/600/300'} 
              alt={name}
              className="benefit-modal__image"
            />
            <div className="benefit-modal__overlay"></div>
            <button 
              className="benefit-modal__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          
          {/* Badge de categoría */}
          <div className="benefit-modal__category">
            {category || 'General'}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="benefit-modal__content">
          <div className="benefit-modal__info">
            <h2 className="benefit-modal__title">{name}</h2>
            <p className="benefit-modal__description">{description}</p>
            
            {provider && (
              <div className="benefit-modal__provider">
                <span className="provider-label">Proporcionado por:</span>
                <span className="provider-name">{provider}</span>
              </div>
            )}

            {/* Información del producto */}
            <div className="product-info">
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">Categoría</div>
                  <div className="info-value">{category || 'Beneficio General'}</div>
                </div>
                
                <div className="info-card">
                  <div className="info-label">Vigencia</div>
                  <div className="info-value">90 días</div>
                </div>
                
                <div className="info-card">
                  <div className="info-label">Tipo</div>
                  <div className="info-value">{isJobbyBenefit ? 'Jobby' : 'Externo'}</div>
                </div>
                
                <div className="info-card">
                  <div className="info-label">Disponibilidad</div>
                  <div className="info-value">Inmediato</div>
                </div>
              </div>
              
              {/* Características destacadas */}
              <div className="features">
                <div className="feature-tag">Activación instantánea</div>
                <div className="feature-tag">Código digital</div>
                <div className="feature-tag">Sin fecha de caducidad</div>
              </div>
            </div>

            {/* Cómo funciona */}
            <div className="how-it-works">
              <h3>Cómo funciona</h3>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <div className="step-title">Confirma tu compra</div>
                    <div className="step-desc">Utiliza tus tokens para adquirir este beneficio</div>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <div className="step-title">Recibe tu código</div>
                    <div className="step-desc">Te enviaremos el código de canje a tu correo</div>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <div className="step-title">Disfruta tu beneficio</div>
                    <div className="step-desc">Presenta el código y aprovecha tu descuento</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Footer */}
        <div className="checkout-footer">
          <div className="price-summary">
            <div className="price-details">
              <div className="price-row">
                <span className="price-label">Precio del beneficio</span>
                <div className="price-value">
                  <div className="token-price">
                    <span className="token-amount">{tokensRequired}</span>
                    <span className="token-unit">Tokens</span>
                  </div>
                </div>
              </div>
              
              {isTokenBalanceValid && (
                <div className="balance-row">
                  <span className="balance-label">Balance disponible</span>
                  <span className={`balance-amount ${canAfford ? 'sufficient' : 'insufficient'}`}>
                    {userTokenBalance} Tokens
                  </span>
                </div>
              )}
              
              <div className="price-row total">
                <span className="price-label">Total a pagar</span>
                <div className="price-value">
                  <div className="token-price total-price">
                    <span className="token-amount">{tokensRequired}</span>
                    <span className="token-unit">Tokens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="checkout-actions">
            <button 
              className="btn-secondary"
              onClick={onClose}
            >
              Volver
            </button>
            
            <button 
              className={`btn-primary ${!canAfford ? 'btn-disabled' : ''}`}
              onClick={handleConfirmRedeem}
              disabled={!canAfford}
            >
              {canAfford ? 'Confirmar Compra' : 'Tokens Insuficientes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BenefitModal, (prevProps, nextProps) => {
  // Comparación personalizada para evitar re-renders innecesarios
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.benefit?.id === nextProps.benefit?.id &&
    prevProps.userTokenBalance === nextProps.userTokenBalance &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onConfirmRedeem === nextProps.onConfirmRedeem
  );
});