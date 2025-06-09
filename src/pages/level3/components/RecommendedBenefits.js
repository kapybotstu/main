import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import { useAuth } from '../../../context/AuthContext';
import { getUserSurveyPreferences } from '../../../services/firebase/database/databaseService';
import { Link } from 'react-router-dom';
import './RecommendedBenefits.css';

const RecommendedBenefits = () => {
  const { currentUser } = useAuth();
  const [recommendedBenefits, setRecommendedBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState(null);

  // Mapping de categorías de la encuesta a categorías de beneficios
  const categoryMapping = {
    'comidas': ['Alimentación', 'Restaurantes', 'Delivery'],
    'experiencias': ['Entretenimiento', 'Eventos', 'Cultura', 'Viajes'],
    'regalos': ['Retail', 'Tecnología', 'Hogar'],
    'mascotas': ['Mascotas', 'Veterinaria'],
    'suscripciones': ['Suscripciones', 'Streaming', 'Software'],
    'transporte': ['Transporte', 'Movilidad'],
    'bienestar': ['Salud', 'Bienestar', 'Deporte', 'Fitness']
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        // 1. Obtener preferencias del usuario
        const preferences = await getUserSurveyPreferences(currentUser.uid);
        setUserPreferences(preferences);

        // 2. Obtener todos los beneficios Jobby activos
        const benefitsRef = ref(database, 'jobby_benefits');
        onValue(benefitsRef, (snapshot) => {
          const allBenefits = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const benefit = childSnapshot.val();
              
              if (benefit.status === 'active') {
                allBenefits.push({
                  id: childSnapshot.key,
                  ...benefit,
                  name: benefit.name || benefit.title || 'Beneficio',
                  image: benefit.image || generatePlaceholder(benefit.name || 'Beneficio'),
                });
              }
            });
          }

          // 3. Filtrar y recomendar beneficios basados en preferencias
          const recommended = getRecommendedBenefits(allBenefits, preferences);
          setRecommendedBenefits(recommended);
          setLoading(false);
        });

      } catch (error) {
        console.error('Error loading recommendations:', error);
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [currentUser]);

  const getRecommendedBenefits = (allBenefits, preferences) => {
    if (!preferences.surveyCompleted || preferences.benefitPreferences.length === 0) {
      // Si no hay encuesta, mostrar beneficios populares por defecto
      return allBenefits
        .sort(() => Math.random() - 0.5) // Orden aleatorio
        .slice(0, 3);
    }

    // Obtener categorías relevantes basadas en las preferencias
    const relevantCategories = [];
    preferences.benefitPreferences.forEach(pref => {
      if (categoryMapping[pref]) {
        relevantCategories.push(...categoryMapping[pref]);
      }
    });

    // Filtrar beneficios que coincidan con las categorías preferidas
    const matchingBenefits = allBenefits.filter(benefit => {
      const benefitCategory = benefit.category || '';
      return relevantCategories.some(cat => 
        benefitCategory.toLowerCase().includes(cat.toLowerCase())
      );
    });

    // Si hay suficientes coincidencias, usar esas; si no, mezclar con otros
    if (matchingBenefits.length >= 3) {
      return matchingBenefits.slice(0, 3);
    } else {
      // Completar con otros beneficios
      const remainingBenefits = allBenefits.filter(benefit => 
        !matchingBenefits.find(match => match.id === benefit.id)
      );
      const combined = [...matchingBenefits, ...remainingBenefits];
      return combined.slice(0, 3);
    }
  };

  const generatePlaceholder = (text) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'>
        <defs>
          <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' style='stop-color:${color};stop-opacity:1' />
            <stop offset='100%' style='stop-color:${color}dd;stop-opacity:1' />
          </linearGradient>
        </defs>
        <rect width='300' height='200' fill='url(#grad)'/>
        <text x='50%' y='45%' font-family='Arial, sans-serif' font-size='14' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'>${text}</text>
        <text x='50%' y='55%' font-family='Arial, sans-serif' font-size='10' fill='white' text-anchor='middle' dominant-baseline='middle' opacity='0.8'>Beneficio Jobby</text>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Alimentación': '🍕',
      'Restaurantes': '🍽️',
      'Delivery': '🛵',
      'Entretenimiento': '🎭',
      'Eventos': '🎟️',
      'Cultura': '🎨',
      'Viajes': '✈️',
      'Retail': '🛍️',
      'Tecnología': '💻',
      'Hogar': '🏠',
      'Mascotas': '🐕',
      'Veterinaria': '🏥',
      'Suscripciones': '📱',
      'Streaming': '📺',
      'Software': '💿',
      'Transporte': '🚗',
      'Movilidad': '🚲',
      'Salud': '⚕️',
      'Bienestar': '🧘',
      'Deporte': '⚽',
      'Fitness': '💪'
    };
    
    return iconMap[category] || '🎁';
  };

  if (loading) {
    return (
      <div className="recommended-benefits">
        <div className="benefits-header">
          <h2>🎯 Beneficios Recomendados</h2>
          <p>Basados en tus preferencias</p>
        </div>
        <div className="benefits-loading">
          <div className="loading-pulse"></div>
          <div className="loading-pulse"></div>
          <div className="loading-pulse"></div>
        </div>
      </div>
    );
  }

  if (recommendedBenefits.length === 0) {
    return (
      <div className="recommended-benefits">
        <div className="benefits-header">
          <h2>🎯 Beneficios Disponibles</h2>
          <p>Explora nuestros beneficios</p>
        </div>
        <div className="no-benefits">
          <div className="no-benefits-icon">🎁</div>
          <p>No hay beneficios disponibles en este momento</p>
          <Link to="/level3/benefits" className="explore-button">
            Explorar todos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recommended-benefits">
      <div className="benefits-header">
        <h2>🎯 Beneficios Recomendados</h2>
        <p>
          {userPreferences?.surveyCompleted 
            ? 'Basados en tus preferencias' 
            : 'Beneficios populares para ti'
          }
        </p>
        <Link to="/level3/benefits" className="see-all-link">
          Ver todos →
        </Link>
      </div>
      
      <div className="benefits-grid">
        {recommendedBenefits.map((benefit, index) => (
          <div key={benefit.id} className="benefit-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="benefit-image">
              <img 
                src={benefit.image} 
                alt={benefit.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = generatePlaceholder(benefit.name);
                }}
              />
              <div className="benefit-category-badge">
                <span className="category-icon">{getCategoryIcon(benefit.category)}</span>
                <span className="category-text">{benefit.category || 'General'}</span>
              </div>
            </div>
            
            <div className="benefit-content">
              <h3>{benefit.name}</h3>
              <p>{benefit.description}</p>
              
              <div className="benefit-footer">
                <div className="benefit-cost">
                  <span className="cost-icon">🎟️</span>
                  <span className="cost-amount">{benefit.tokenCost || 1}</span>
                  <span className="cost-label">token{(benefit.tokenCost || 1) > 1 ? 's' : ''}</span>
                </div>
                
                <Link 
                  to="/level3/benefits" 
                  className="benefit-cta"
                  title="Ver más detalles"
                >
                  <span>Canjear</span>
                  <span className="cta-arrow">→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {userPreferences?.surveyCompleted && (
        <div className="personalization-note">
          <span className="note-icon">✨</span>
          <span>
            Recomendaciones basadas en tus preferencias: {' '}
            {userPreferences.benefitPreferences.map((pref, index) => (
              <span key={pref} className="preference-tag">
                {pref}
                {index < userPreferences.benefitPreferences.length - 1 && ', '}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
};

export default RecommendedBenefits;