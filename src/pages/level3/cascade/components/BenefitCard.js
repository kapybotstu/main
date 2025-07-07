import React, { useMemo } from 'react';
import './BenefitCard.css';

const BenefitCard = ({ 
  benefit, 
  onRedeem, 
  isSpanned = false, // Para cards que ocupan múltiples columnas
  gridSize = { colSpan: 1, rowSpan: 1 } // Información del grid span
}) => {
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

  // Calcular estilos basados en el grid span
  const cardStyles = useMemo(() => {
    const { colSpan, rowSpan } = gridSize;
    
    // Para cards spanned, ajustar algunos valores
    const borderRadius = colSpan > 1 || rowSpan > 1 ? 28 : 24;
    const padding = colSpan > 1 || rowSpan > 1 ? 24 : 20;
    
    return {
      borderRadius,
      padding
    };
  }, [gridSize]);

  const handleRedeem = () => {
    if (onRedeem) {
      onRedeem(benefit);
    }
  };

  return (
    <div 
      className={`benefit-card ${isSpanned ? 'benefit-card--spanned' : ''}`}
      style={{ 
        borderRadius: `${cardStyles.borderRadius}px`
      }}
    >
      {/* Imagen de fondo con overlay */}
      <div className="benefit-card__background">
        <img 
          src={image || '/api/placeholder/400/300'} 
          alt={name}
          className="benefit-card__image"
        />
        <div className="benefit-card__overlay"></div>
      </div>

      {/* Contenido del card */}
      <div 
        className="benefit-card__content"
        style={{ padding: `${cardStyles.padding}px` }}
      >
        {/* Badge de categoría */}
        <div className="benefit-card__category">
          {category || 'General'}
        </div>

        {/* Título y descripción */}
        <div className="benefit-card__info">
          <h3 className="benefit-card__title">{name}</h3>
          <p className="benefit-card__description">{description}</p>
          {provider && (
            <p className="benefit-card__provider">Por {provider}</p>
          )}
        </div>

        {/* Footer con tokens y botón */}
        <div className="benefit-card__footer">
          <div className="benefit-card__tokens">
            <div className="token-counter">
              <span className="token-icon">🪙</span>
              <span className="token-count">{tokensRequired}</span>
            </div>
          </div>
          
          <button 
            className="benefit-card__redeem-btn"
            onClick={handleRedeem}
          >
            Canjear
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;