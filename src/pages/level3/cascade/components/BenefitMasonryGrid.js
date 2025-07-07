import React, { useState, useEffect } from 'react';
import BenefitCard from './BenefitCard';
import './BenefitMasonryGrid.css';

const BenefitMasonryGrid = ({ 
  benefits = [], 
  onBenefitRedeem, 
  loading = false 
}) => {
  const [columns, setColumns] = useState(3);

  // Ajustar número de columnas según el tamaño de pantalla
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

  // Distribuir beneficios en columnas para efecto masonry
  const distributeIntoColumns = (items) => {
    const cols = Array.from({ length: columns }, () => []);
    
    items.forEach((item, index) => {
      const columnIndex = index % columns;
      cols[columnIndex].push(item);
    });
    
    return cols;
  };

  const handleBenefitRedeem = (benefit) => {
    if (onBenefitRedeem) {
      onBenefitRedeem(benefit);
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

  if (benefits.length === 0) {
    return (
      <div className="masonry-empty">
        <div className="empty-icon">🎁</div>
        <h3>No hay beneficios disponibles</h3>
        <p>Pronto tendremos nuevos beneficios para ti</p>
      </div>
    );
  }

  const columnBenefits = distributeIntoColumns(benefits);

  return (
    <div className="masonry-container">
      <div className="masonry-grid" style={{ '--columns': columns }}>
        {columnBenefits.map((columnItems, columnIndex) => (
          <div key={columnIndex} className="masonry-column">
            {columnItems.map((benefit, itemIndex) => {
              // Hacer que algunos cards ocupen más espacio (spanned)
              const isSpanned = columns > 2 && itemIndex % 5 === 0;
              
              return (
                <BenefitCard
                  key={benefit.id}
                  benefit={benefit}
                  onRedeem={handleBenefitRedeem}
                  isSpanned={isSpanned}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitMasonryGrid;