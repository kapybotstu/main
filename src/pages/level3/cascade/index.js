import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Masonry from './components/Masonry';
import { loadBenefits } from './mockData';
import '../styles/index.css';
import './styles/index.css';

const Cascade = () => {
  const { currentUser, companyId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [benefits, setBenefits] = useState([]);
  const [benefitsLoading, setBenefitsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.uid && companyId) {
      setLoading(false);
      // Cargar beneficios
      loadBenefits().then((data) => {
        setBenefits(data);
        setBenefitsLoading(false);
      });
    }
  }, [currentUser, companyId]);

  const handleBenefitRedeem = (benefit) => {
    console.log('Canjeando beneficio:', benefit);
    // Aquí iría la lógica de canje
    alert(`¡Canjeando ${benefit.name}!`);
  };

  if (loading) {
    return (
      <div className="cascade-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p>Cargando Cascade...</p>
      </div>
    );
  }

  return (
    <div className="cascade-container">
      <div className="cascade-content">
        <Masonry
          items={benefits}
          onItemRedeem={handleBenefitRedeem}
          ease="cubic-bezier(0.23, 1, 0.32, 1)"
          duration={0.6}
          stagger={0.05}
          animateFrom="bottom"
          scaleOnHover={true}
          hoverScale={0.95}
          blurToFocus={true}
          colorShiftOnHover={true}
          loading={benefitsLoading}
        />
      </div>
    </div>
  );
};

export default Cascade;