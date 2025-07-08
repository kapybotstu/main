import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import BenefitCard from './BenefitCard';
import './Masonry.css';

const Masonry = ({
  items = [],
  onItemRedeem,
  ease = "cubic-bezier(0.23, 1, 0.32, 1)",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  loading = false
}) => {
  const [columns, setColumns] = useState(3);
  const [animatedItems, setAnimatedItems] = useState(new Set());
  const containerRef = useRef(null);
  const itemsRef = useRef(new Map());

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else if (width < 1440) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Simplified: Show all items immediately without stagger animation
  useEffect(() => {
    if (items.length > 0 && !loading) {
      // Show all items immediately for performance
      setAnimatedItems(new Set(items.map(item => item.id)));
    }
  }, [items, loading]);

  // Generar variaciones de grid para cada item - memoizado
  const getItemGridSize = useCallback((item, index) => {
    const seed = parseInt(item.id) || Math.abs(item.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
    const random = ((seed + index) * 9301 + 49297) % 233280;
    const normalized = random / 233280;
    
    // Solo en desktop permitir spans múltiples
    if (columns <= 2) {
      return { colSpan: 1, rowSpan: 1 };
    }
    
    // Probabilidades para diferentes tamaños
    if (normalized < 0.1) {
      // 10% - Cards grandes (2x2)
      return { colSpan: 2, rowSpan: 2 };
    } else if (normalized < 0.25) {
      // 15% - Cards horizontales (2x1)  
      return { colSpan: 2, rowSpan: 1 };
    } else if (normalized < 0.4) {
      // 15% - Cards verticales (1x2)
      return { colSpan: 1, rowSpan: 2 };
    } else {
      // 60% - Cards normales (1x1)
      return { colSpan: 1, rowSpan: 1 };
    }
  }, [columns]);

  // Simplificar: usar distribución por columnas como flexbox masonry - memoizado
  const distributeItems = useCallback((items) => {
    const itemsWithSizes = items.map((item, index) => ({
      ...item,
      gridSize: getItemGridSize(item, index),
      originalIndex: index // Mantener índice original para el lazy loading
    }));

    // Crear columnas como arrays
    const columnArrays = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);
    
    // Distribución balanceada: colocar cada item en la columna más corta
    itemsWithSizes.forEach((item) => {
      const { colSpan, rowSpan } = item.gridSize;
      
      // Encontrar la columna más corta
      let shortestColumn = 0;
      let minHeight = columnHeights[0];
      
      for (let i = 1; i < columns; i++) {
        if (columnHeights[i] < minHeight) {
          minHeight = columnHeights[i];
          shortestColumn = i;
        }
      }
      
      // Agregar item a la columna más corta
      columnArrays[shortestColumn].push(item);
      // Para flexbox, el peso depende del rowSpan
      columnHeights[shortestColumn] += rowSpan || 1; 
    });

    return columnArrays;
  }, [columns, getItemGridSize]);

  const handleItemRedeem = useCallback((item) => {
    if (onItemRedeem) {
      onItemRedeem(item);
    }
  }, [onItemRedeem]);

  // Memoizar la distribución de columnas
  const columnArrays = useMemo(() => {
    return distributeItems(items);
  }, [items, distributeItems]);

  if (loading) {
    return (
      <div className="masonry-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p>Cargando beneficios...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="masonry-empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            <path d="M20.5 7.5L16 12l4.5 4.5M3.5 7.5L8 12l-4.5 4.5"/>
          </svg>
        </div>
        <h3>No hay beneficios disponibles</h3>
        <p>Pronto tendremos nuevos beneficios para ti</p>
      </div>
    );
  }

  return (
    <div 
      className="masonry-enhanced" 
      ref={containerRef}
      style={{
        '--ease': ease,
        '--duration': `${duration}s`,
        '--hover-scale': hoverScale,
        '--columns': columns,
      }}
    >
      <div className="masonry-grid-enhanced">
        {columnArrays.map((columnItems, columnIndex) => (
          <div key={columnIndex} className="masonry-column-enhanced">
            {columnItems.map((item, itemIndex) => {
              const isAnimated = animatedItems.has(item.id);
              const { colSpan, rowSpan } = item.gridSize;
              
              return (
                <div
                  key={item.id}
                  ref={el => itemsRef.current.set(item.id, el)}
                  className={`
                    masonry-item 
                    ${isAnimated ? 'masonry-item--animated' : ''}
                    ${animateFrom === 'bottom' ? 'masonry-item--from-bottom' : ''}
                    ${scaleOnHover ? 'masonry-item--hoverable' : ''}
                    ${blurToFocus ? 'masonry-item--blur-focus' : ''}
                    ${colorShiftOnHover ? 'masonry-item--color-shift' : ''}
                    ${colSpan > 1 || rowSpan > 1 ? 'masonry-item--spanned' : ''}
                  `}
                >
                  <BenefitCard
                    benefit={item}
                    onRedeem={handleItemRedeem}
                    isSpanned={colSpan > 1 || rowSpan > 1}
                    gridSize={item.gridSize}
                    cardIndex={item.originalIndex}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Masonry, (prevProps, nextProps) => {
  // Comparación personalizada para optimizar re-renders
  return (
    prevProps.items === nextProps.items &&
    prevProps.onItemRedeem === nextProps.onItemRedeem &&
    prevProps.ease === nextProps.ease &&
    prevProps.duration === nextProps.duration &&
    prevProps.stagger === nextProps.stagger &&
    prevProps.animateFrom === nextProps.animateFrom &&
    prevProps.scaleOnHover === nextProps.scaleOnHover &&
    prevProps.hoverScale === nextProps.hoverScale &&
    prevProps.blurToFocus === nextProps.blurToFocus &&
    prevProps.colorShiftOnHover === nextProps.colorShiftOnHover &&
    prevProps.loading === nextProps.loading
  );
});