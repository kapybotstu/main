import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveSurveyPreferences } from '../../services/firebase/database/databaseService';
import './ProfileSurvey.css';

// Inicializar animación GSAP cuando el componente se monte
const useGSAPEffect = (animationBgRef) => {
  useEffect(() => {
    let timeoutId;
    let isUnmounted = false;
    
    const loadAndInitAnimation = () => {
      if (isUnmounted) return;
      
      // Verificar que el contenedor existe
      if (!animationBgRef.current) {
        console.log('Animation container not ready, retrying...');
        timeoutId = setTimeout(loadAndInitAnimation, 100);
        return;
      }

      // Evitar múltiples inicializaciones
      if (window.gsapTimeline && !window.gsapTimeline.killed) {
        console.log('GSAP animation already running, skipping initialization');
        return;
      }

      // Verificar si GSAP ya está cargado
      if (window.gsap) {
        console.log('GSAP found, initializing animation...');
        // Delay para asegurar que el DOM esté listo
        timeoutId = setTimeout(() => {
          if (!isUnmounted) {
            initSpotifyAnimation();
          }
        }, 200);
        return;
      }

      // Evitar cargar GSAP múltiples veces
      if (document.querySelector('script[src*="gsap"]')) {
        console.log('GSAP script already loading, waiting...');
        timeoutId = setTimeout(loadAndInitAnimation, 100);
        return;
      }

      console.log('Loading GSAP...');
      // Cargar y ejecutar el script GSAP original
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/gsap@3/dist/gsap.min.js';
      script.setAttribute('data-gsap-loader', 'true');
      script.onload = () => {
        console.log('GSAP loaded, initializing animation...');
        // Delay para asegurar que GSAP esté completamente disponible
        timeoutId = setTimeout(() => {
          if (!isUnmounted) {
            initSpotifyAnimation();
          }
        }, 200);
      };
      script.onerror = () => {
        console.error('Failed to load GSAP');
      };
      document.head.appendChild(script);
    };

    // Esperar un tick para asegurar que React ha renderizado
    timeoutId = setTimeout(loadAndInitAnimation, 50);

    return () => {
      isUnmounted = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Cleanup GSAP timeline si existe
      if (window.gsapTimeline && !window.gsapTimeline.killed) {
        window.gsapTimeline.kill();
        window.gsapTimeline = null;
      }
    };
  }, [animationBgRef]);
};

// Función que replica el script original
const initSpotifyAnimation = () => {
  console.log('Initializing Spotify animation...');
  
  const panels = document.querySelectorAll(".panel1");
  
  console.log('Found panels:', panels.length);
  
  if (panels.length === 0) {
    console.error('No panels found! Animation cannot start.');
    return;
  }

  const numberOfPanels = 8;
  const rotationCoef = 5;
  
  // Usar dimensiones de viewport simples - scroll natural
  let elHeight = window.innerHeight / numberOfPanels;
  let elWidth = window.innerWidth / numberOfPanels;

  console.log('Creating GSAP timeline...');
  window.gsapTimeline = window.gsap.timeline({ 
    repeat: -1,
    timeScale: 0.7
  });
  var tl = window.gsapTimeline;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    window.gsapTimeline.pause();
    return;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.gsapTimeline.pause();
    } else {
      window.gsapTimeline.resume();
    }
  });

  // Manejar resize solo cuando sea necesario
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newHeight = window.innerHeight;
      const newWidth = window.innerWidth;
      // Solo reiniciar si el cambio es significativo
      if (Math.abs(newHeight - elHeight * numberOfPanels) > 50 || 
          Math.abs(newWidth - elWidth * numberOfPanels) > 50) {
        elHeight = newHeight / numberOfPanels;
        elWidth = newWidth / numberOfPanels;
        tl.clear();
        addItemsToTimeline();
        tl.progress(0);
      }
    }, 200);
  });

  addItemsToTimeline();

  function addItemsToTimeline() {
    console.log('Adding items to timeline...');
    
    // Configurar estado inicial para todos los paneles inmediatamente
    window.gsap.set(panels, {
      width: 0,
      height: 0,
      x: elWidth * 5.5,
      y: elHeight * 5.5,
      rotation: -360,
      opacity: 1,
      transformOrigin: "center center"
    });
    
    // PRIMERO: Animar todos los panel1
    panels.forEach((panel, i) => {
      const stopPosition = 100 - i * 1;
      const wi = window.innerWidth - elWidth * (8 - i) + elWidth;
      const he = window.innerHeight - elHeight * (8 - i) + elHeight;
      
      // Rotación inicial
      tl.fromTo(
        panel,
        {
          y: elHeight * 5.5,
          x: elWidth * 5.5,
          width: 0,
          height: 0,
          rotation: -360,
          background: `linear-gradient(105deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black ${stopPosition}%)`
        },
        {
          width: wi,
          height: he,
          y: -elHeight / 1.33 + ((8 - i) * elHeight) / 1.33,
          x: 0,
          duration: 1 + 0.1 * (8 - i),
          ease: "sine.inOut",
          rotation: 0,
          background: `linear-gradient(105deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black ${stopPosition}%)`
        },
        0
      );

      // Rotación lineal
      tl.to(
        panel,
        {
          rotation: 8 * rotationCoef - (i + 1) * rotationCoef,
          duration: 3,
          background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black ${stopPosition}%)`,
          ease: "linear"
        },
        ">"
      );

      // Reordenamiento
      tl.to(
        panel,
        {
          rotation: 360,
          y: -elHeight / 6 + ((8 - i) * elHeight) / 6,
          x: -elWidth / 1.2 + ((8 - i) * elWidth) / 1.2,
          background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black 100%)`,
          ease: "sine.inOut",
          duration: 1
        },
        ">"
      );

      // Rotación lineal adicional
      tl.to(
        panel,
        {
          rotation: 8 * rotationCoef - (i + 1) * rotationCoef + 360,
          duration: 4,
          background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black 100%)`,
          ease: "linear"
        },
        ">"
      );

      // IMPORTANTE: Agrega el label splitStart solo cuando i == 0
      if (i == 0) {
        tl.addLabel("splitStart", "-=0.8");
      }

      // Animaciones finales para panel1
      if (i == 0) {
        tl.to(
          panel,
          {
            rotation: 720 + 90,
            y: window.innerHeight - ((8 - i) * elHeight) / 4,
            x: -elWidth / 2 + ((8 - i) * elWidth) / 2,
            width: 0,
            height: 0,
            opacity: 0,
            background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black 100%)`,
            ease: "sine.inOut",
            duration: 1
          },
          "splitStart" + "+=" + String(0.05 * i)
        );
      } else {
        tl.to(
          panel,
          {
            rotation: 720 + 90,
            y: window.innerHeight - ((8 - i) * elHeight) / 4,
            x: -elWidth / 2 + ((8 - i) * elWidth) / 2,
            width: wi,
            height: wi,
            background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black 100%)`,
            ease: "sine.inOut",
            duration: 1
          },
          "splitStart" + "+=" + String(0.05 * i)
        );

        tl.to(
          panel,
          {
            rotation: (8 * rotationCoef - (i + 1) * rotationCoef) / 1.2 + 810,
            duration: 5,
            background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black 100%)`,
            ease: "linear"
          },
          ">"
        );

        tl.to(
          panel,
          {
            y: window.innerHeight - ((8 - i) * elHeight) / 2,
            x: 0 - elWidth * 1.2,
            rotation: (8 * rotationCoef - (i + 1) * rotationCoef) / 1.2 + 1180,
            ease: "sine.inOut",
            duration: 1,
            background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black 100%)`,
            ease: "sine.inOut"
          },
          ">"
        );

        tl.to(
          panel,
          {
            rotation: (8 * rotationCoef - (i + 1) * rotationCoef) / 1.2 + 1200,
            duration: 5,
            background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black 100%)`,
            ease: "linear"
          },
          ">"
        );

        tl.to(
          panel,
          {
            y: "+=" + String(elHeight*4),
            x: "-=" + String(elWidth*4),
            rotation: (8 * rotationCoef - (i + 1) * rotationCoef) / 1.2 + 1500,
            ease: "sine.inOut",
            duration: 1,
            background: `linear-gradient(90deg, var(--jobby-mint) 0%, #4fd1c7 6%, var(--jobby-blue-dark) 19%, #1a202c 72%, black 100%)`,
            ease: "sine.inOut"
          },
          ">"
        );
      }
    });

  }
};

const ProfileSurvey = () => {
  const navigate = useNavigate();
  const { currentUser, updateSurveyStatus } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [selectedSatisfaction, setSelectedSatisfaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showIntroAnimation, setShowIntroAnimation] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const introRef = useRef(null);
  const finalRef = useRef(null);
  const animationBgRef = useRef(null);

  // Hook para manejar las animaciones GSAP
  useGSAPEffect(animationBgRef);

  // Bloquear scroll del body cuando este componente está montado
  useEffect(() => {
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      // Restaurar scroll al desmontar
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);


  // Categorías de beneficios reales
  const benefitCategories = [
    {
      id: 'comidas',
      name: 'Comidas',
      icon: '🍕',
      color: '#FF6B6B',
      description: 'Almuerzos, descuentos en restaurantes y delivery'
    },
    {
      id: 'experiencias',
      name: 'Experiencias',
      icon: '🎟️',
      color: '#4ECDC4',
      description: 'Eventos, actividades recreativas y espectáculos'
    },
    {
      id: 'regalos',
      name: 'Regalos',
      icon: '🎁',
      color: '#FFE66D',
      description: 'Productos, vouchers y artículos personalizados'
    },
    {
      id: 'mascotas',
      name: 'Mascotas',
      icon: '🐕',
      color: '#A8E6CF',
      description: 'Veterinaria, alimentos y accesorios para pets'
    },
    {
      id: 'suscripciones',
      name: 'Suscripciones',
      icon: '📱',
      color: '#C8A8E8',
      description: 'Netflix, Spotify, apps y servicios digitales'
    },
    {
      id: 'descuentos',
      name: 'Descuentos',
      icon: '💸',
      color: '#7FCDCD',
      description: 'Cupones, ofertas especiales y cashback'
    }
  ];

  // Recuerdos generacionales chilenos para identificar edad/generación
  const generationalMemories = [
    {
      id: 'sabados_gigantes',
      name: 'Sábados Gigantes con Don Francisco',
      icon: '📺',
      description: 'Los sábados familiares viendo el programa más emblemático',
      era: 'Baby Boomers / Gen X'
    },
    {
      id: 'pokemon_yugioh',
      name: 'Pokémon y Yu-Gi-Oh!',
      icon: '⚡',
      description: 'Las cartas que intercambiabas en el recreo',
      era: 'Millennials'
    },
    {
      id: 'tiktok_reggaeton',
      name: 'TikTok y el Reggaetón chileno',
      icon: '🎵',
      description: 'Pailita, Polimá Westcoast y los challenges virales',
      era: 'Gen Z'
    },
    {
      id: 'juegos_plazuela',
      name: 'Los juegos en la plazuela del barrio',
      icon: '🏃',
      description: 'Pillarse, escondida y fútbol hasta que oscureciera',
      era: 'Gen X / Millennials'
    },
    {
      id: 'streaming_netflix',
      name: 'Maratones de series en Netflix',
      icon: '🍿',
      description: 'Casa de Papel, Stranger Things y quedarse despierto hasta tarde',
      era: 'Millennials / Gen Z'
    },
    {
      id: 'festival_vina',
      name: 'Festival de Viña en familia',
      icon: '🎤',
      description: 'Ver el Festival por TV en febrero con toda la familia',
      era: 'Todas las generaciones'
    }
  ];

  const questions = [
    {
      title: '¡Bienvenido a tu perfil personalizado!',
      type: 'intro',
      buttonText: 'Comenzar'
    },
    {
      title: '¿Cuál de estos recuerdos te trae más nostalgia?',
      type: 'generational',
      maxSelections: 1
    },
    {
      title: '¿Cuáles son tus tipos de beneficios favoritos?',
      type: 'ranking',
      maxSelections: 3
    },
    {
      title: '¿Cómo calificarías tu satisfacción actual con los beneficios laborales?',
      type: 'satisfaction',
      maxSelections: 1
    }
  ];

  // Control de velocidad de animación según la pregunta
  useEffect(() => {
    if (currentQuestion > 0 && currentQuestion < questions.length) {
      if (window.gsapTimeline) {
        window.gsapTimeline.timeScale(0.3);
      }
    } else {
      if (window.gsapTimeline) {
        window.gsapTimeline.timeScale(0.7);
      }
    }
  }, [currentQuestion, questions.length]);

  const handleCategorySelect = (categoryId) => {
    if (selectedPreferences.includes(categoryId)) {
      setSelectedPreferences(selectedPreferences.filter(id => id !== categoryId));
    } else if (selectedPreferences.length < 3) {
      setSelectedPreferences([...selectedPreferences, categoryId]);
    }
  };

  const handleGenerationalSelect = (memoryId) => {
    setSelectedGeneration(memoryId);
  };

  const handleSatisfactionSelect = (satisfactionId) => {
    setSelectedSatisfaction(satisfactionId);
  };

  // Animación de introducción 3D
  useEffect(() => {
    // Mostrar animación por 4 segundos, luego mostrar encuesta
    const timer = setTimeout(() => {
      setShowIntroAnimation(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Mouse tracking para efectos 3D
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientWidth, clientHeight } = document.documentElement;
      const sxPos = ((e.pageX / clientWidth) * 100 - 50) * 2;
      const syPos = ((e.pageY / clientHeight) * 100 - 50) * 2;
      setMousePos({ x: sxPos, y: syPos });
    };

    if (!showIntroAnimation) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showIntroAnimation]);


  const handleNext = async () => {
    const question = questions[currentQuestion];
    
    // Validar pregunta generacional
    if (question.type === 'generational' && !selectedGeneration) {
      alert('Por favor selecciona un recuerdo que te identifique.');
      return;
    }
    
    // Validar pregunta de preferencias
    if (question.type === 'ranking' && selectedPreferences.length === 0) {
      alert('Por favor selecciona al menos una categoría de tu preferencia.');
      return;
    }
    
    // Validar pregunta de satisfacción
    if (question.type === 'satisfaction' && !selectedSatisfaction) {
      alert('Por favor selecciona tu nivel de satisfacción actual.');
      return;
    }
    
    if (currentQuestion === questions.length - 1) {
      // Última pregunta - guardar preferencias
      setIsSubmitting(true);
      // setAnimationPhase('celebration'); // Removed since setAnimationPhase is not defined
      try {
        const preferencesString = selectedPreferences.join(',');
        const surveyData = {
          generationalMemory: selectedGeneration,
          benefitPreferences: preferencesString,
          satisfactionLevel: selectedSatisfaction
        };
        
        console.log('Guardando datos de encuesta:', surveyData);
        console.log('Usuario ID:', currentUser?.uid);
        
        if (!currentUser || !currentUser.uid) {
          throw new Error('No se pudo obtener el ID del usuario');
        }
        
        await saveSurveyPreferences(currentUser.uid, preferencesString, selectedGeneration);
        
        // Update survey status in AuthContext
        updateSurveyStatus(true);
        
        // Mostrar celebración
        setShowCelebration(true);
        setTimeout(() => {
          navigate('/level3/dashboard');
        }, 3000); // Changed to 3 seconds
      } catch (error) {
        console.error('Error detallado al guardar preferencias:', error);
        alert(`Error al guardar tus preferencias: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Animation phase changes removed since setAnimationPhase is not defined
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];

    switch (question.type) {
      case 'intro':
        return (
          <div className="survey-intro">
            <div className="intro-animation">🎉</div>
            <h2>{question.title}</h2>
            <button 
              className="survey-button primary"
              onClick={handleNext}
            >
              {question.buttonText}
            </button>
          </div>
        );

      case 'generational':
        return (
          <div className="survey-generational">
            <h2>{question.title}</h2>
            
            <div className="memories-grid">
              {generationalMemories.map((memory) => {
                const isSelected = selectedGeneration === memory.id;
                
                return (
                  <div
                    key={memory.id}
                    className={`memory-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleGenerationalSelect(memory.id)}
                  >
                    <div className="memory-icon">{memory.icon}</div>
                    <h3>{memory.name}</h3>
                    <p>{memory.description}</p>
                    <div className="memory-era">{memory.era}</div>
                    {isSelected && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="survey-actions">
              <button 
                className="survey-button secondary"
                onClick={handleSkip}
              >
                Omitir
              </button>
              <button 
                className="survey-button primary"
                onClick={handleNext}
                disabled={!selectedGeneration}
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 'ranking':
        return (
          <div className="survey-ranking">
            <h2>{question.title}</h2>
            
            <div className="categories-grid">
              {benefitCategories.map((category) => {
                const isSelected = selectedPreferences.includes(category.id);
                const selectionIndex = selectedPreferences.indexOf(category.id);
                
                return (
                  <div
                    key={category.id}
                    className={`category-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: isSelected ? category.color : 'transparent',
                      backgroundColor: isSelected ? `${category.color}20` : 'rgba(0, 0, 0, 0.7)'
                    }}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {isSelected && (
                      <div className="selection-badge" style={{ backgroundColor: category.color }}>
                        {selectionIndex + 1}
                      </div>
                    )}
                    <div className="category-icon" style={{ color: category.color }}>
                      {category.icon}
                    </div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="survey-actions">
              <button 
                className="survey-button secondary"
                onClick={handleSkip}
              >
                Omitir
              </button>
              <button 
                className="survey-button primary"
                onClick={handleNext}
                disabled={selectedPreferences.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : `Continuar (${selectedPreferences.length}/3)`}
              </button>
            </div>
          </div>
        );

      case 'satisfaction':
        const satisfactionLevels = [
          {
            id: 'muy_insatisfecho',
            emoji: '😤',
            title: 'Muy Insatisfecho',
            subtitle: 'Los beneficios no cubren mis necesidades',
            color: '#FF4444',
            description: 'Necesito cambios urgentes'
          },
          {
            id: 'insatisfecho',
            emoji: '😕',
            title: 'Insatisfecho',
            subtitle: 'Los beneficios son insuficientes',
            color: '#FF8844',
            description: 'Hay mucho por mejorar'
          },
          {
            id: 'neutral',
            emoji: '😐',
            title: 'Neutral',
            subtitle: 'Los beneficios están bien pero...',
            color: '#FFB044',
            description: 'Podrían ser mejores'
          },
          {
            id: 'satisfecho',
            emoji: '😊',
            title: 'Satisfecho',
            subtitle: 'Los beneficios cubren mis necesidades',
            color: '#88DD44',
            description: 'Me siento valorado'
          },
          {
            id: 'muy_satisfecho',
            emoji: '😍',
            title: 'Muy Satisfecho',
            subtitle: 'Los beneficios superan mis expectativas',
            color: '#44DD88',
            description: '¡Excelente empresa!'
          }
        ];

        return (
          <div className="survey-satisfaction">
            <h2>{question.title}</h2>
            <p className="satisfaction-subtitle">
              Arrastra el emoji que mejor represente tu sentir actual 👇
            </p>
            
            <div className="satisfaction-scale">
              {satisfactionLevels.map((level, index) => {
                const isSelected = selectedSatisfaction === level.id;
                
                return (
                  <div
                    key={level.id}
                    className={`satisfaction-level ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSatisfactionSelect(level.id)}
                    style={{
                      '--level-color': level.color,
                      '--animation-delay': `${index * 0.1}s`
                    }}
                  >
                    <div className="satisfaction-emoji">{level.emoji}</div>
                    <div className="satisfaction-title">{level.title}</div>
                    <div className="satisfaction-subtitle-text">{level.subtitle}</div>
                    <div className="satisfaction-description">{level.description}</div>
                    {isSelected && (
                      <div className="satisfaction-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="survey-actions">
              <button 
                className="survey-button secondary"
                onClick={handleSkip}
              >
                Omitir
              </button>
              <button 
                className="survey-button primary"
                onClick={handleNext}
                disabled={!selectedSatisfaction || isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Finalizar'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Componente de animación 3D intro - ESTILO SPOTIFY WRAPPED ORIGINAL
  if (showIntroAnimation) {
    return (
      <div className="intro-animation-container">
        <div className="intro-tube" ref={introRef}>
          <h1 className="intro-line intro-line-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="intro-char" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={`icon-shape icon-${i + 1}`}></div>
              </span>
            ))}
          </h1>
          <h1 className="intro-line intro-line-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="intro-char" style={{ animationDelay: `${0.45 + i * 0.08}s` }}>
                <div className={`icon-shape icon-${i + 1}`}></div>
              </span>
            ))}
          </h1>
          <h1 className="intro-line intro-line-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="intro-char" style={{ animationDelay: `${0.9 + i * 0.08}s` }}>
                <div className={`icon-shape icon-${i + 1}`}></div>
              </span>
            ))}
          </h1>
        </div>
        <div 
          className="intro-final-wrap" 
          ref={finalRef}
          style={{
            transform: `rotateY(${mousePos.x * 0.04}deg) rotateX(${-mousePos.y * 0.04}deg)`
          }}
        >
          <h1 className="intro-final">
            {'JOBBY'.split('').map((char, i) => (
              <span key={i} className="intro-final-char" style={{ animationDelay: `${1.6 + i * 0.06}s` }}>
                {char}
              </span>
            ))}
          </h1>
        </div>
      </div>
    );
  }

  if (showCelebration) {
    return (
      <div className="survey-celebration">
        <div className="celebration-content">
          <div className="ai-loading-animation">
            <div className="ai-brain-icon">
              <svg viewBox="0 0 100 100" className="ai-brain">
                <circle cx="50" cy="50" r="45" className="brain-outline" />
                <path d="M30 50 Q40 30, 50 50 T70 50" className="brain-wave brain-wave-1" />
                <path d="M25 50 Q35 70, 45 50 T65 50 T85 50" className="brain-wave brain-wave-2" />
                <path d="M20 50 Q30 40, 40 50 T60 50 T80 50" className="brain-wave brain-wave-3" />
              </svg>
            </div>
            <h2 className="ai-loading-title">La IA de Jobby está perfeccionando tu experiencia</h2>
            <div className="ai-progress-bar">
              <div className="ai-progress-fill"></div>
            </div>
            <p className="ai-loading-subtitle">Analizando tus preferencias para crear beneficios personalizados</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-survey">
      {/* Fondo simple sin animación */}
      <div className="animated-bg" ref={animationBgRef}>
        {/* Solo panel1 group - 8 panels para mejor rendimiento */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`panel1-${i}`} className="panel panel1" />
        ))}
      </div>

      <div className="survey-container">
        <div className="survey-progress">
          <div 
            className="progress-bar"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="survey-content">
          {renderQuestion()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSurvey;