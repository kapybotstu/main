import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { requestBenefitWithTokens, getJobbyTokenBalance } from '../../services/firebase/database/databaseService';
import './styles/index.css'; // Import Level 3 styles
import './styles/pages/AvailableBenefits.css';
import BenefitCard from './components/BenefitCard';
import { MapView } from './map';
import MapViewTest from './components/MapViewTest';
import SimpleGoogleMap from './components/SimpleGoogleMap';

const AvailableBenefits = () => {
  const { currentUser, companyId } = useAuth();
  const [jobbyBenefits, setJobbyBenefits] = useState([]);
  const [filteredBenefits, setFilteredBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [userRedemptions, setUserRedemptions] = useState([]);
  const [redeemingExperience, setRedeemingExperience] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(null);
  const [redemptionError, setRedemptionError] = useState(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [redemptionFormData, setRedemptionFormData] = useState({
    comments: ''
  });

  // Estados para carrusel inmersivo
  const [currentBenefitIndex, setCurrentBenefitIndex] = useState(0);
  const [showGridView, setShowGridView] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [separation, setSeparation] = useState(120);
  const [showInfoContent, setShowInfoContent] = useState(true);
  const [showMapMenu, setShowMapMenu] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState('todos');
  
  const carouselRef = useRef(null);
  const touchStartRef = useRef(0);
  const mapMenuRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  // Filtros rápidos disponibles
  const quickFilters = [
    { id: 'todos', label: 'Todos', icon: '🎁' },
    { id: 'comida', label: 'Comida', icon: '🍽️' },
    { id: 'entretenimiento', label: 'Diversión', icon: '🎮' },
    { id: 'salud', label: 'Salud', icon: '🏥' },
    { id: 'deporte', label: 'Deporte', icon: '⚽' },
    { id: 'educacion', label: 'Educación', icon: '📚' },
    { id: 'tecnologia', label: 'Tech', icon: '💻' },
    { id: 'viajes', label: 'Viajes', icon: '✈️' }
  ];


  // Función para aplicar filtros rápidos
  const applyQuickFilter = useCallback((filterId) => {
    setActiveQuickFilter(filterId);
    setCurrentBenefitIndex(0); // Resetear al primer beneficio
    
    let filtered = [...jobbyBenefits];
    
    if (filterId !== 'todos') {
      filtered = jobbyBenefits.filter(benefit => {
        const category = benefit.category?.toLowerCase() || '';
        const name = benefit.name?.toLowerCase() || '';
        const description = benefit.description?.toLowerCase() || '';
        
        switch (filterId) {
          case 'comida':
            return category.includes('comida') || category.includes('gastronomia') || 
                   name.includes('restaurante') || name.includes('comida') || 
                   description.includes('comida') || description.includes('restaurante');
          case 'entretenimiento':
            return category.includes('entretenimiento') || category.includes('diversión') ||
                   name.includes('cine') || name.includes('teatro') || name.includes('concierto') ||
                   description.includes('entretenimiento') || description.includes('diversión');
          case 'salud':
            return category.includes('salud') || category.includes('medicina') ||
                   name.includes('medico') || name.includes('salud') || name.includes('clinica') ||
                   description.includes('salud') || description.includes('medicina');
          case 'deporte':
            return category.includes('deporte') || category.includes('fitness') ||
                   name.includes('gym') || name.includes('deporte') || name.includes('fitness') ||
                   description.includes('deporte') || description.includes('ejercicio');
          case 'educacion':
            return category.includes('educacion') || category.includes('curso') ||
                   name.includes('curso') || name.includes('educacion') || name.includes('aprendizaje') ||
                   description.includes('educacion') || description.includes('curso');
          case 'tecnologia':
            return category.includes('tecnologia') || category.includes('tech') ||
                   name.includes('tech') || name.includes('software') || name.includes('app') ||
                   description.includes('tecnologia') || description.includes('digital');
          case 'viajes':
            return category.includes('viajes') || category.includes('turismo') ||
                   name.includes('viaje') || name.includes('hotel') || name.includes('vuelo') ||
                   description.includes('viaje') || description.includes('turismo');
          default:
            return true;
        }
      });
    }
    
    setFilteredBenefits(filtered);
  }, [jobbyBenefits]);

  // Función para mostrar temporalmente el info-content
  const showInfoTemporarily = useCallback(() => {
    setShowInfoContent(true);
    // Ocultar después de 2 segundos
    setTimeout(() => {
      setShowInfoContent(false);
    }, 2000);
  }, []);

  // Touch navigation handlers for mobile
  const handleTouchStart = useCallback((e) => {
    if (!isImmersiveMode) return;
    
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  }, [isImmersiveMode]);

  const handleTouchEnd = useCallback((e) => {
    if (!isImmersiveMode || !touchStartX) return;

    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;
    
    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentBenefitIndex < filteredBenefits.length - 1) {
        // Swipe left - next benefit
        setCurrentBenefitIndex(currentBenefitIndex + 1);
        showInfoTemporarily();
      } else if (deltaX < 0 && currentBenefitIndex > 0) {
        // Swipe right - previous benefit
        setCurrentBenefitIndex(currentBenefitIndex - 1);
        showInfoTemporarily();
      }
    }
    
    setTouchStartX(0);
    setTouchStartY(0);
  }, [isImmersiveMode, touchStartX, touchStartY, currentBenefitIndex, filteredBenefits.length, showInfoTemporarily]);

  // Función para abrir modal de canje (definida PRIMERO)
  const openRedemptionModal = useCallback((experience) => {
    setSelectedExperience(experience);
    setRedemptionFormData({
      comments: ''
    });
    setShowRedemptionModal(true);
  }, []);

  // Manejar separación responsive y modo inmersivo
  useEffect(() => {
    const updateSeparation = () => {
      const width = window.innerWidth;
      const isMobile = width <= 768;
      
      // Activar modo inmersivo en móviles automáticamente
      if (isMobile && !isImmersiveMode) {
        setIsImmersiveMode(true);
      } else if (!isMobile && isImmersiveMode) {
        setIsImmersiveMode(false);
      }
      
      if (width <= 768) {
        setSeparation(80);
      } else if (width <= 1024) {
        setSeparation(100);
      } else {
        setSeparation(120);
      }
    };

    updateSeparation();
    window.addEventListener('resize', updateSeparation);
    
    return () => window.removeEventListener('resize', updateSeparation);
  }, [isImmersiveMode]);

  // Ocultar info-content automáticamente después de 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfoContent(false);
    }, 4000); // 4 segundos

    return () => clearTimeout(timer);
  }, []);

  // Manejar clase CSS en el body para ocultar header en móviles
  useEffect(() => {
    if (isImmersiveMode && window.innerWidth <= 768) {
      document.body.classList.add('immersive-carousel-active');
      // Prevent scroll on body when in immersive mode
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('immersive-carousel-active');
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.classList.remove('immersive-carousel-active');
      document.body.style.overflow = 'unset';
    };
  }, [isImmersiveMode]);

  // Listen for exit immersive mode event from header
  useEffect(() => {
    const handleExitImmersiveMode = () => {
      setIsImmersiveMode(false);
    };

    window.addEventListener('exitImmersiveMode', handleExitImmersiveMode);
    
    return () => {
      window.removeEventListener('exitImmersiveMode', handleExitImmersiveMode);
    };
  }, []);

  // Aplicar filtro inicial cuando se cargan los beneficios
  useEffect(() => {
    if (jobbyBenefits.length > 0) {
      applyQuickFilter(activeQuickFilter);
    }
  }, [jobbyBenefits, applyQuickFilter, activeQuickFilter]);

  useEffect(() => {
    const fetchBenefits = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        // Obtener balance de tokens Jobby del usuario
        const loadJobbyTokenBalance = async () => {
          try {
            const balance = await getJobbyTokenBalance(currentUser.uid);
            setUserTokenBalance(balance);
          } catch (error) {
            console.error('Error loading Jobby token balance:', error);
            setUserTokenBalance(0);
          }
        };
        
        loadJobbyTokenBalance();

        // Obtener canjes del usuario para comprobar experiencias ya canjeadas
        const userRedemptionsRef = ref(database, 'experience_redemptions');
        onValue(userRedemptionsRef, (snapshot) => {
          const redemptions = [];
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const redemption = childSnapshot.val();
              if (redemption.userId === currentUser.uid) {
                redemptions.push({
                  id: childSnapshot.key,
                  ...redemption
                });
              }
            });
          }
          setUserRedemptions(redemptions);
        });
        
        // Obtener beneficios Jobby
        const jobbyBenefitsRef = ref(database, 'jobby_benefits');
        onValue(jobbyBenefitsRef, (snapshot) => {
          const benefits = [];
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const benefit = childSnapshot.val();
              
              if (benefit.status === 'active') {
                const benefitName = benefit.name || benefit.title || 'Beneficio sin nombre';
                console.log('Benefit data:', { id: childSnapshot.key, originalName: benefit.name, originalTitle: benefit.title, finalName: benefitName });
                
                benefits.push({
                  id: childSnapshot.key,
                  ...benefit,
                  name: benefitName, // Normalizar nombre
                  isJobbyBenefit: true,
                  image: benefit.image || generatePlaceholder(benefitName, '#667eea'),
                  gradient: getRandomGradient(),
                  tokenCost: benefit.tokenCost || 1 // Costo por defecto: 1 token
                });
              }
            });
          }
          setJobbyBenefits(benefits);
        });
        
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los beneficios: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchBenefits();
  }, [currentUser, companyId]);

  // Establecer beneficios Jobby como filtrados
  useEffect(() => {
    setFilteredBenefits(jobbyBenefits);
  }, [jobbyBenefits]);

  // Función para obtener gradiente aleatorio
  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #e0c3fc 0%, #9bb5ff 100%)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Función para generar placeholder SVG
  const generatePlaceholder = (text, color = '#667eea') => {
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'>
        <defs>
          <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' style='stop-color:${color};stop-opacity:1' />
            <stop offset='100%' style='stop-color:${color}dd;stop-opacity:1' />
          </linearGradient>
        </defs>
        <rect width='600' height='400' fill='url(#grad)'/>
        <text x='50%' y='45%' font-family='Arial, sans-serif' font-size='28' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'>${text || 'Beneficio'}</text>
        <text x='50%' y='55%' font-family='Arial, sans-serif' font-size='16' fill='white' text-anchor='middle' dominant-baseline='middle' opacity='0.8'>Sin imagen disponible</text>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };


  // Navegación por teclado optimizada
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showRedemptionModal || showGridView) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setCurrentBenefitIndex(prevIndex => 
            prevIndex === 0 ? filteredBenefits.length - 1 : prevIndex - 1
          );
          showInfoTemporarily();
          break;
        case 'ArrowRight':
          event.preventDefault();
          setCurrentBenefitIndex(prevIndex => 
            (prevIndex + 1) % filteredBenefits.length
          );
          showInfoTemporarily();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          const currentExperience = filteredBenefits[currentBenefitIndex];
          if (currentExperience) {
            openRedemptionModal(currentExperience);
          }
          break;
        case 'g':
        case 'G':
          event.preventDefault();
          setShowGridView(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredBenefits.length, showRedemptionModal, showGridView, currentBenefitIndex, openRedemptionModal, showInfoTemporarily]);

  // Auto-avance del carrusel cada 5 segundos
  useEffect(() => {
    if (showRedemptionModal || showGridView || filteredBenefits.length <= 1) return;
    
    const autoAdvance = setInterval(() => {
      setCurrentBenefitIndex(prevIndex => 
        (prevIndex + 1) % filteredBenefits.length
      );
    }, 5000);
    
    return () => clearInterval(autoAdvance);
  }, [filteredBenefits.length, showRedemptionModal, showGridView]);

  // Gestos de arrastre optimizados
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    requestAnimationFrame(() => {
      const currentX = e.clientX;
      const diff = currentX - dragStart;
      setDragOffset(diff);
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        setCurrentBenefitIndex(prevIndex => 
          prevIndex === 0 ? filteredBenefits.length - 1 : prevIndex - 1
        );
      } else {
        setCurrentBenefitIndex(prevIndex => 
          (prevIndex + 1) % filteredBenefits.length
        );
      }
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, filteredBenefits.length]);

  // DESHABILITADO: Cerrar menú de mapa al hacer clic fuera
  // Este useEffect estaba causando que el mapa se cerrara con cualquier clic
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (mapMenuRef.current && !mapMenuRef.current.contains(event.target)) {
  //       setShowMapMenu(false);
  //     }
  //   };

  //   if (showMapMenu) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => document.removeEventListener('mousedown', handleClickOutside);
  //   }
  // }, [showMapMenu]);

  // Touch gestures optimizados for carousel navigation
  const handleCarouselTouchStart = useCallback((e) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleCarouselTouchEnd = useCallback((e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentBenefitIndex(prevIndex => 
          (prevIndex + 1) % filteredBenefits.length
        );
      } else {
        setCurrentBenefitIndex(prevIndex => 
          prevIndex === 0 ? filteredBenefits.length - 1 : prevIndex - 1
        );
      }
    }
  }, [filteredBenefits.length]);

  const handleFormInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setRedemptionFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const handleRedemptionSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedExperience) return;
    
    setRedeemingExperience(true);
    setRedemptionSuccess(null);
    setRedemptionError(null);
    
    try {
      // Preparar datos adicionales para el canje
      const additionalData = {};
      
      if (redemptionFormData.comments) {
        additionalData.comments = redemptionFormData.comments;
      }
      
      // Solicitar beneficio pagando con tokens
      const result = await requestBenefitWithTokens(
        currentUser.uid, 
        selectedExperience.id, 
        selectedExperience.isJobbyBenefit, 
        companyId,
        selectedExperience.tokenCost,
        additionalData
      );
      
      setRedemptionSuccess({
        message: `¡Beneficio solicitado exitosamente!`,
        experienceName: selectedExperience.name,
        tokenCost: selectedExperience.tokenCost,
        redemptionCode: result.tokenCode,
        remainingTokens: result.remainingTokens
      });
      
      // Actualizar balance localmente
      setUserTokenBalance(prev => prev - selectedExperience.tokenCost);
      
      // Cerrar modal
      setShowRedemptionModal(false);
    } catch (err) {
      setRedemptionError(err.message);
    } finally {
      setRedeemingExperience(false);
    }
  };
  
  const isAlreadyRedeemed = (experienceId) => {
    return userRedemptions.some(
      redemption => redemption.benefitId === experienceId && redemption.status === 'redeemed'
    );
  };
  
  const getAvailableTokens = () => {
    return typeof userTokenBalance === 'number' && userTokenBalance >= 0 
      ? userTokenBalance 
      : 25; // Mismo valor por defecto que otros componentes
  };

  const canAffordExperience = (tokenCost) => {
    return userTokenBalance >= tokenCost;
  };
  
  if (loading) {
    return (
      <div className="immersive-loading">
        <div className="loading-animation">
          <div className="pulse-ring"></div>
          <div className="pulse-ring delay-1"></div>
          <div className="pulse-ring delay-2"></div>
        </div>
        <p>Cargando beneficios flexibles Jobby...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h2>Oops, algo salió mal</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  if (!companyId) {
    return (
      <div className="error-state">
        <div className="error-icon">🏢</div>
        <h2>Empresa no asignada</h2>
        <p>No se ha asignado una empresa a este usuario. Por favor, contacta con tu departamento de Recursos Humanos.</p>
      </div>
    );
  }

  if (filteredBenefits.length === 0) {
    return (
      <div className="empty-benefits-state">
        <div className="empty-icon">🎁</div>
        <h2>No hay beneficios flexibles Jobby disponibles</h2>
        <p>No se encontraron beneficios Jobby para el filtro seleccionado.</p>
        <button onClick={() => window.location.reload()} className="reset-filter-button">
          Recargar página
        </button>
      </div>
    );
  }

  const currentBenefit = filteredBenefits[currentBenefitIndex];

  return (
    <div className="immersive-benefits">
      {/* Mobile navigation hints */}
      {isImmersiveMode && (
        <div className={`mobile-nav-hints ${!showInfoContent ? 'hidden' : ''}`}>
          Desliza para navegar • Toca para seleccionar
        </div>
      )}
      
      {/* Exit immersive mode button for mobile */}
      {isImmersiveMode && window.innerWidth <= 768 && (
        <button 
          className="mobile-exit-btn"
          onClick={() => {
            setIsImmersiveMode(false);
            document.body.classList.remove('immersive-carousel-active');
            document.body.style.overflow = 'unset';
          }}
          title="Salir del carrusel"
        >
          ×
        </button>
      )}
      
      {/* Vista inmersiva a pantalla completa */}
      <div 
        className="benefits-carousel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          background: 'transparent',
          filter: isDragging ? 'brightness(0.8)' : 'none'
        }}
      >
        {/* Efecto de blur en el fondo */}
        <div className="background-blur">
          {currentBenefit && (
            <img 
              src={currentBenefit.image} 
              alt={currentBenefit.name}
              className="blur-background"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = generatePlaceholder(currentBenefit.name, currentBenefit.isJobbyBenefit ? '#667eea' : '#4facfe');
              }}
            />
          )}
        </div>

        {/* Vista de cuadrícula toggle y mapa */}
        <div className="view-controls-simple">
          <button 
            className="view-toggle"
            onClick={() => setShowGridView(!showGridView)}
            title="Vista de cuadrícula (G)"
          >
            {showGridView ? '🎡' : '⊞'}
          </button>
          
          <div className="map-menu-container" ref={mapMenuRef} style={{ display: 'none' }}>
            <button 
              className="view-toggle map-toggle"
              onClick={() => setShowMapMenu(!showMapMenu)}
              title="Ver mapa"
              disabled
            >
              📍
            </button>
            
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="quick-filters">
          <div className="filters-container">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                className={`quick-filter-btn ${activeQuickFilter === filter.id ? 'active' : ''}`}
                onClick={() => applyQuickFilter(filter.id)}
                title={filter.label}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navegación del carrusel */}
        <div className="carousel-navigation">
          <button 
            className="nav-arrow prev" 
            onClick={() => setCurrentBenefitIndex(prevIndex => 
              prevIndex === 0 ? filteredBenefits.length - 1 : prevIndex - 1
            )}
            title="Anterior (←)"
          >
            ‹
          </button>
          
          <button 
            className="nav-arrow next" 
            onClick={() => setCurrentBenefitIndex(prevIndex => 
              (prevIndex + 1) % filteredBenefits.length
            )}
            title="Siguiente (→)"
          >
            ›
          </button>
        </div>

        {/* Tarjetas de beneficio con navegación por drag */}
        <div 
          className="benefits-container"
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleCarouselTouchStart}
          onTouchEnd={handleCarouselTouchEnd}
          style={{
            transform: `translateX(${dragOffset}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {filteredBenefits.map((benefit, index) => {
            const isActive = index === currentBenefitIndex;
            const totalCards = filteredBenefits.length;
            
            // Calcular distancia considerando el wrap-around
            const forwardDistance = (index - currentBenefitIndex + totalCards) % totalCards;
            const backwardDistance = (currentBenefitIndex - index + totalCards) % totalCards;
            const minDistance = Math.min(forwardDistance, backwardDistance);
            
            // Solo mostrar las 5 cartas más cercanas (centro + 2 a cada lado)
            if (minDistance > 2) {
              return null;
            }
            
            let cardClass = 'benefit-card-immersive';
            let opacity = 1;
            let scale = 1;
            let zIndex = 1;
            let translateX = 0;
            let translateZ = 0;
            
            if (isActive) {
              cardClass += ' active';
              opacity = 1;
              scale = 1;
              zIndex = 5;
              translateX = 0;
              translateZ = 0;
            } else {
              // Determinar posición relativa
              let position = 0;
              if (forwardDistance <= backwardDistance) {
                position = forwardDistance; // Hacia la derecha
              } else {
                position = -backwardDistance; // Hacia la izquierda
              }
              
              cardClass += position > 0 ? ' next' : ' prev';
              
              // Escala y opacidad basada en distancia
              const absPosition = Math.abs(position);
              scale = 1 - (absPosition * 0.1); // 0.9, 0.8, etc.
              opacity = 1 - (absPosition * 0.2); // 0.8, 0.6, etc.
              zIndex = 5 - absPosition;
              
              translateX = position * separation; // Separación horizontal
              translateZ = -absPosition * 50; // Profundidad
            }

            console.log('Rendering benefit:', benefit.name, benefit.title, benefit);
            
            return (
              <div
                key={benefit.id}
                className={cardClass}
                style={{
                  opacity,
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
                  zIndex
                }}
                onClick={() => {
                  if (isActive) {
                    openRedemptionModal(benefit);
                  } else {
                    setCurrentBenefitIndex(index);
                  }
                }}
              >
                <div className="card-image">
                  <img 
                    src={benefit.image} 
                    alt={benefit.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = generatePlaceholder(benefit.name, benefit.isJobbyBenefit ? '#667eea' : '#4facfe');
                    }}
                  />
                  <div className="card-overlay"></div>
                </div>
                
                <div className="card-content">
                  <div className="card-top">
                    <div className="card-header">
                      <h3>{benefit.name || benefit.title || 'Sin nombre'}</h3>
                      <span className={`benefit-type ${benefit.isJobbyBenefit ? 'jobby' : 'company'}`}>
                        {benefit.isJobbyBenefit ? 'Jobby' : 'Empresa'}
                      </span>
                    </div>
                    
                    <div className="card-description">
                      <p>{benefit.description}</p>
                    </div>
                  </div>
                  
                  <div className="card-bottom">
                    <div className="card-metadata">
                      <span className="category">{benefit.category || 'General'}</span>
                      <div className="token-cost">
                        <span className="token-icon">🎟️</span>
                        <span className="cost-amount">{benefit.tokenCost}</span>
                        <span className="cost-label">token{benefit.tokenCost > 1 ? 's' : ''}</span>
                      </div>
                      <span className="popularity">⭐ Popular</span>
                    </div>
                    
                    <div className="card-actions">
                      {isAlreadyRedeemed(benefit.id) ? (
                        <div className="status-indicator">
                          <span className="redeemed">✅ Ya canjeado</span>
                        </div>
                      ) : !canAffordExperience(benefit.tokenCost) ? (
                        <div className="insufficient-tokens">
                          <span className="insufficient-text">🎟️ Tokens insuficientes</span>
                          <small>Necesitas {benefit.tokenCost}, tienes {getAvailableTokens()}</small>
                        </div>
                      ) : (
                        <button 
                          className="redeem-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRedemptionModal(benefit);
                          }}
                        >
                          <span className="button-icon">🎟️</span>
                          Canjear por {benefit.tokenCost} token{benefit.tokenCost > 1 ? 's' : ''}
                          <span className="button-arrow">→</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicadores de progreso */}
        <div className="progress-indicators">
          {filteredBenefits.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentBenefitIndex ? 'active' : ''}`}
              onClick={() => setCurrentBenefitIndex(index)}
            />
          ))}
        </div>

        {/* Información del beneficio actual */}
        {showInfoContent && (
          <div className="current-benefit-info">
            <div className="info-content">
              <span className="benefit-counter">
                {currentBenefitIndex + 1} de {filteredBenefits.length}
              </span>
              <p className="navigation-hint">
                Usa las flechas del teclado para navegar • Presiona Enter para canjear • G para vista de cuadrícula
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Vista Grid Alternativa con modal overlay */}
      {showGridView && (
        <div className="grid-modal-overlay">
          <div className="grid-modal">
            <div className="grid-header">
              <h2>Beneficios Flexibles Jobby</h2>
              <button 
                className="close-grid"
                onClick={() => setShowGridView(false)}
              >
                ×
              </button>
            </div>
            
            <div className="benefits-grid">
              {filteredBenefits.map((benefit, index) => (
                <div
                  key={benefit.id}
                  className="grid-benefit-card"
                  onClick={() => {
                    setCurrentBenefitIndex(index);
                    setShowGridView(false);
                  }}
                >
                  <div className="grid-card-image">
                    <img 
                      src={benefit.image} 
                      alt={benefit.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = generatePlaceholder(benefit.name, benefit.isJobbyBenefit ? '#667eea' : '#4facfe');
                      }}
                    />
                    <div className="grid-overlay">
                      <div className="overlay-content">
                        <h4>{benefit.name}</h4>
                        <p>{benefit.category}</p>
                        <span className={`type-badge ${benefit.isJobbyBenefit ? 'jobby' : 'company'}`}>
                          {benefit.isJobbyBenefit ? 'Jobby' : 'Empresa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal para canjear experiencias */}
      {showRedemptionModal && selectedExperience && (
        <div className="request-modal-overlay">
          <div className="request-modal">
            <div className="request-modal-header">
              <h3>Canjear Beneficio Flexible Jobby</h3>
              <button 
                className="close-button"
                onClick={() => setShowRedemptionModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="request-modal-body">
              <div className="selected-benefit-info">
                <div className="benefit-preview">
                  <img 
                    src={selectedExperience.image} 
                    alt={selectedExperience.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = generatePlaceholder(selectedExperience.name, selectedExperience.isJobbyBenefit ? '#667eea' : '#4facfe');
                    }}
                  />
                </div>
                <div className="benefit-details">
                  <h4>{selectedExperience.name}</h4>
                  <p>{selectedExperience.description}</p>
                  <div className="experience-cost">
                    <span className="cost-badge">
                      🎟️ {selectedExperience.tokenCost} token{selectedExperience.tokenCost > 1 ? 's' : ''}
                    </span>
                    <span className="experience-type jobby">
                      Beneficio Flexible Jobby
                    </span>
                  </div>
                </div>
              </div>

              <div className="token-summary">
                <div className="token-info">
                  <span className="available-tokens">Tokens disponibles: {getAvailableTokens()}</span>
                  <span className="after-redemption">Después del canje: {getAvailableTokens() - selectedExperience.tokenCost}</span>
                </div>
              </div>
              
              <form onSubmit={handleRedemptionSubmit}>
                
                <div className="form-group">
                  <label htmlFor="comments">
                    Comentarios adicionales (opcional)
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={redemptionFormData.comments}
                    onChange={handleFormInputChange}
                    rows="3"
                    placeholder="Cuéntanos más detalles sobre esta experiencia..."
                  />
                </div>
                
                {redemptionError && (
                  <div className="error-alert">
                    {redemptionError}
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowRedemptionModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={redeemingExperience || !canAffordExperience(selectedExperience.tokenCost)}
                  >
                    {redeemingExperience ? (
                      <span className="loading-text">
                        <span className="spinner-small"></span>
                        Canjeando...
                      </span>
                    ) : (
                      <>
                        <span>🎟️</span>
                        Canjear por {selectedExperience.tokenCost} token{selectedExperience.tokenCost > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de éxito del canje */}
      {redemptionSuccess && (
        <div className="success-notification">
          <div className="notification-content">
            <span className="success-icon">🎉</span>
            <div className="success-details">
              <h4>¡Beneficio Jobby canjeado!</h4>
              <p><strong>{redemptionSuccess.experienceName}</strong></p>
              <p>Código de canje: <strong>{redemptionSuccess.redemptionCode}</strong></p>
              <p>Tokens restantes: <strong>{redemptionSuccess.remainingTokens}</strong></p>
            </div>
            <button onClick={() => setRedemptionSuccess(null)}>×</button>
          </div>
        </div>
      )}
      
      {/* Vista de Mapa en Pantalla Completa */}
      <SimpleGoogleMap 
        isOpen={showMapMenu} 
        onClose={() => setShowMapMenu(false)} 
      />
    </div>
  );
};

export default React.memo(AvailableBenefits);