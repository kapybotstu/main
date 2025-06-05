import React from 'react';

const BenefitCard = ({ benefit, onSelect, isCompact = false }) => {
  const cardClass = isCompact ? 'benefit-card benefit-card-compact' : 'benefit-card card-glass';

  return (
    <div className={cardClass} onClick={() => onSelect(benefit)}>
      {benefit.imageUrl && (
        <img 
          src={benefit.imageUrl} 
          alt={benefit.name}
          className="benefit-card-image"
        />
      )}
      <div className="benefit-card-content">
        <div className="benefit-card-icon">
          {benefit.icon || '🎁'}
        </div>
        <h3 className="card-title">{benefit.name || benefit.title || 'Beneficio sin nombre'}</h3>
        <p className="card-subtitle">{benefit.category}</p>
        {!isCompact && (
          <>
            <p className="benefit-description">{benefit.description}</p>
            <div className="benefit-footer">
              <span className="tokens-info">
                <span className="token-icon">🪙</span>
                {benefit.tokenCost} tokens
              </span>
              <span className="provider-name">{benefit.providerName}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BenefitCard;