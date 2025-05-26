import React from 'react';

const TokenBalance = ({ availableTokens, usedTokens, showActions = false }) => {
  const totalTokens = availableTokens + usedTokens;
  const usagePercentage = totalTokens > 0 ? (usedTokens / totalTokens) * 100 : 0;

  return (
    <div className="token-balance-widget">
      <div className="balance-cards">
        <div className="balance-card">
          <span className="balance-icon">💰</span>
          <div className="balance-amount">{availableTokens}</div>
          <div className="balance-label">Tokens Disponibles</div>
        </div>
        
        <div className="balance-card">
          <span className="balance-icon">📊</span>
          <div className="balance-amount">{usedTokens}</div>
          <div className="balance-label">Tokens Usados</div>
        </div>
        
        <div className="balance-card">
          <span className="balance-icon">📈</span>
          <div className="balance-amount">{usagePercentage.toFixed(0)}%</div>
          <div className="balance-label">Uso Total</div>
        </div>
      </div>
      
      {showActions && (
        <div className="token-actions-inline">
          <button className="btn btn-primary">
            <span>🎯</span>
            Ver Beneficios
          </button>
          <button className="btn btn-secondary">
            <span>📜</span>
            Historial
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenBalance;