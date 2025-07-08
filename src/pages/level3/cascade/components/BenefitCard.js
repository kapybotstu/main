import React, { useMemo, useState, useEffect, useRef } from 'react';
import './BenefitCard.css';
import ImageLazyLoader from '../utils/ImageLazyLoader';

const BenefitCard = ({ 
  benefit, 
  onRedeem, 
  isSpanned = false, // Para cards que ocupan múltiples columnas
  gridSize = { colSpan: 1, rowSpan: 1 }, // Información del grid span
  cardIndex = 0 // Índice del card para determinar si está en viewport inicial
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

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  const cardRef = useRef();
  
  // CSS Tilt animation state
  const [tiltStyle, setTiltStyle] = useState({});
  
  // Determinar si este card está en el viewport inicial (primeros 6-8 cards)
  const isInitialViewport = cardIndex < 8;
  
  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;
    
    // Si está en viewport inicial, cargar inmediatamente
    if (isInitialViewport) {
      setIsInView(true);
      return;
    }
    
    // Si no está en viewport inicial, usar lazy loading
    const handleIntersect = (entry) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        ImageLazyLoader.unobserve(element);
      }
    };
    
    ImageLazyLoader.observe(element, handleIntersect);
    
    return () => {
      ImageLazyLoader.unobserve(element);
    };
  }, [isInitialViewport]);

  const handleRedeem = () => {
    if (onRedeem) {
      onRedeem(benefit);
    }
  };
  
  // CSS Tilt animation handlers
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    
    const rotationX = (offsetY / (rect.height / 2)) * -8;
    const rotationY = (offsetX / (rect.width / 2)) * 8;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(1.03)`,
      transition: 'transform 0.1s ease-out'
    });
  };
  
  const handleMouseEnter = () => {
    // Initial hover state
  };
  
  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.3s ease-out'
    });
  };

  return (
    <div 
      ref={cardRef}
      className={`benefit-card ${isSpanned ? 'benefit-card--spanned' : ''}`}
      style={{ 
        borderRadius: `${cardStyles.borderRadius}px`,
        ...tiltStyle
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Imagen de fondo con overlay */}
      <div className="benefit-card__background" ref={imgRef}>
        {/* Skeleton placeholder - visible hasta que la imagen cargue */}
        {!isLoaded && (
          <div className="benefit-card__skeleton"></div>
        )}
        
        {/* Imagen real - carga condicional según posición */}
        {isInView && (
          <img 
            src={image || '/api/placeholder/400/300'} 
            alt={name}
            className="benefit-card__image"
            onLoad={() => {
              setIsLoaded(true);
              ImageLazyLoader.markAsLoaded(image);
            }}
            style={{ 
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease-in-out'
            }}
          />
        )}
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

export default React.memo(BenefitCard, (prevProps, nextProps) => {
  // Comparación más agresiva para evitar re-renders
  return (
    prevProps.benefit.id === nextProps.benefit.id &&
    prevProps.benefit.image === nextProps.benefit.image &&
    prevProps.benefit.name === nextProps.benefit.name &&
    prevProps.isSpanned === nextProps.isSpanned &&
    prevProps.gridSize.colSpan === nextProps.gridSize.colSpan &&
    prevProps.gridSize.rowSpan === nextProps.gridSize.rowSpan &&
    prevProps.cardIndex === nextProps.cardIndex &&
    prevProps.onRedeem === nextProps.onRedeem
  );
});