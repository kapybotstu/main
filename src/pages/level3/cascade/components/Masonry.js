import React, { useState, useEffect, useRef } from 'react';
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

  // Stagger animation on mount
  useEffect(() => {
    if (items.length > 0 && !loading) {
      const animateItems = () => {
        items.forEach((item, index) => {
          setTimeout(() => {
            setAnimatedItems(prev => new Set(prev).add(item.id));
          }, index * (stagger * 1000));
        });
      };

      // Reset animations
      setAnimatedItems(new Set());
      animateItems();
    }
  }, [items, stagger, loading]);

  // Distribute items into columns
  const distributeItems = (items) => {
    const cols = Array.from({ length: columns }, () => []);
    
    items.forEach((item, index) => {
      const columnIndex = index % columns;
      cols[columnIndex].push(item);
    });
    
    return cols;
  };

  const handleItemRedeem = (item) => {
    if (onItemRedeem) {
      onItemRedeem(item);
    }
  };

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
        <div className="empty-icon">🎁</div>
        <h3>No hay beneficios disponibles</h3>
        <p>Pronto tendremos nuevos beneficios para ti</p>
      </div>
    );
  }

  const columnItems = distributeItems(items);

  return (
    <div 
      className="masonry-enhanced" 
      ref={containerRef}
      style={{
        '--ease': ease,
        '--duration': `${duration}s`,
        '--hover-scale': hoverScale,
      }}
    >
      <div className="masonry-grid-enhanced" style={{ '--columns': columns }}>
        {columnItems.map((columnData, columnIndex) => (
          <div key={columnIndex} className="masonry-column-enhanced">
            {columnData.map((item, itemIndex) => {
              const isAnimated = animatedItems.has(item.id);
              const isSpanned = columns > 2 && itemIndex % 7 === 0;
              
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
                  `}
                  style={{
                    '--animation-delay': `${itemIndex * stagger}s`,
                  }}
                >
                  <BenefitCard
                    benefit={item}
                    onRedeem={handleItemRedeem}
                    isSpanned={isSpanned}
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

export default Masonry;