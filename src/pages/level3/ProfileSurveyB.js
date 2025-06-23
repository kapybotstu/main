import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveSurveyPreferencesB } from '../../services/firebase/database/databaseService';
import './ProfileSurveyB.css';

const ProfileSurveyB = () => {
  const navigate = useNavigate();
  const { currentUser, updateSurveyStatus } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Encuesta usando tecnología Canvas + WebGL para usuarios tipo B
  const surveySteps = [
    {
      id: 'intro',
      type: 'interactive_intro',
      title: '¡Experiencia Avanzada de Perfilamiento!',
      subtitle: 'Versión Premium con Tecnología Experimental',
      instruction: 'Mueve el mouse para interactuar con el fondo'
    },
    {
      id: 'personality_matrix',
      type: 'matrix_selection',
      title: 'Matriz de Personalidad Laboral',
      subtitle: 'Selecciona tu cuadrante de preferencias',
      options: [
        { id: 'innovator', label: 'Innovador', x: 80, y: 20, color: '#FF6B9D', traits: ['Creativo', 'Arriesgado', 'Visionario'] },
        { id: 'analyzer', label: 'Analítico', x: 20, y: 20, color: '#4ECDC4', traits: ['Metódico', 'Preciso', 'Lógico'] },
        { id: 'collaborator', label: 'Colaborativo', x: 80, y: 80, color: '#FFE66D', traits: ['Social', 'Empático', 'Comunicativo'] },
        { id: 'executor', label: 'Ejecutor', x: 20, y: 80, color: '#A8E6CF', traits: ['Práctico', 'Eficiente', 'Orientado a resultados'] }
      ]
    },
    {
      id: 'benefit_priorities',
      type: 'drag_and_drop',
      title: 'Prioriza tus Beneficios Ideales',
      subtitle: 'Arrastra los elementos según tu prioridad (1 = más importante)',
      benefits: [
        { id: 'wellness', name: 'Bienestar y Salud', icon: '🧘‍♀️', color: '#FF6B9D' },
        { id: 'growth', name: 'Crecimiento Profesional', icon: '📈', color: '#4ECDC4' },
        { id: 'flexibility', name: 'Flexibilidad Horaria', icon: '⏰', color: '#FFE66D' },
        { id: 'team', name: 'Actividades de Equipo', icon: '👥', color: '#A8E6CF' },
        { id: 'tech', name: 'Tecnología y Herramientas', icon: '💻', color: '#FF8A80' },
        { id: 'rewards', name: 'Recompensas Tangibles', icon: '🎁', color: '#B39DDB' }
      ]
    },
    {
      id: 'lifestyle_assessment',
      type: 'slider_multi',
      title: 'Evaluación de Estilo de Vida',
      subtitle: 'Ajusta los deslizadores según tu identificación',
      dimensions: [
        { id: 'work_life_balance', label: 'Balance Vida-Trabajo', min: 0, max: 100, default: 50 },
        { id: 'social_interaction', label: 'Interacción Social', min: 0, max: 100, default: 50 },
        { id: 'challenge_seeking', label: 'Búsqueda de Desafíos', min: 0, max: 100, default: 50 },
        { id: 'stability_preference', label: 'Preferencia por Estabilidad', min: 0, max: 100, default: 50 }
      ]
    },
    {
      id: 'future_vision',
      type: 'timeline_builder',
      title: 'Tu Visión de Futuro Laboral',
      subtitle: 'Construye tu línea de tiempo ideal para los próximos 3 años',
      timePoints: ['6 meses', '1 año', '2 años', '3 años'],
      goals: [
        'Ascenso o promoción',
        'Nuevas habilidades técnicas',
        'Liderazgo de equipo',
        'Cambio de área',
        'Emprendimiento',
        'Especialización',
        'Work-life balance mejorado'
      ]
    }
  ];

  // Inicializar Canvas con efectos visuales
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Redimensionar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear partículas
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }

    // Animación de partículas
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fondo gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(26, 26, 46, 0.9)');
      gradient.addColorStop(1, 'rgba(22, 33, 62, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar y animar partículas
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Rebote en bordes
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;

        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleResponse = (stepId, value) => {
    setResponses(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < surveySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Procesar respuestas en formato específico para tipo B
      const processedData = {
        userType: 'B',
        surveyVersion: 'experimental_v2',
        personalityMatrix: responses.personality_matrix,
        benefitPriorities: responses.benefit_priorities,
        lifestyleAssessment: responses.lifestyle_assessment,
        futureVision: responses.future_vision,
        completedAt: new Date().toISOString()
      };

      await saveSurveyPreferencesB(currentUser.uid, processedData);
      updateSurveyStatus(true);
      
      setShowResults(true);
      setTimeout(() => {
        navigate('/level3/dashboard');
      }, 4000);
    } catch (error) {
      console.error('Error saving survey B:', error);
      alert('Error al guardar tus respuestas. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const step = surveySteps[currentStep];
    
    switch (step.type) {
      case 'interactive_intro':
        return (
          <div className="survey-b-intro">
            <div className="intro-content">
              <h1 className="glitch-text">{step.title}</h1>
              <h2 className="subtitle-b">{step.subtitle}</h2>
              <p className="instruction">{step.instruction}</p>
              <button className="btn-futuristic" onClick={handleNext}>
                <span>Iniciar Experiencia</span>
                <div className="btn-glow"></div>
              </button>
            </div>
          </div>
        );

      case 'matrix_selection':
        return (
          <div className="survey-b-matrix">
            <h2>{step.title}</h2>
            <p className="subtitle-b">{step.subtitle}</p>
            <div className="personality-matrix">
              {step.options.map(option => (
                <div
                  key={option.id}
                  className={`matrix-option ${responses.personality_matrix === option.id ? 'selected' : ''}`}
                  style={{
                    left: `${option.x}%`,
                    top: `${option.y}%`,
                    backgroundColor: option.color
                  }}
                  onClick={() => handleResponse('personality_matrix', option.id)}
                >
                  <h3>{option.label}</h3>
                  <ul>
                    {option.traits.map(trait => (
                      <li key={trait}>{trait}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button 
              className="btn-futuristic" 
              onClick={handleNext}
              disabled={!responses.personality_matrix}
            >
              Continuar
            </button>
          </div>
        );

      default:
        return (
          <div className="survey-b-default">
            <h2>{step.title}</h2>
            <p>{step.subtitle}</p>
            <button className="btn-futuristic" onClick={handleNext}>
              Continuar (En desarrollo)
            </button>
          </div>
        );
    }
  };

  if (showResults) {
    return (
      <div className="survey-b-results">
        <canvas ref={canvasRef} className="canvas-bg" />
        <div className="results-content">
          <div className="hologram-effect">
            <h2>Análisis Avanzado Completado</h2>
            <div className="scanning-animation">
              <div className="scan-line"></div>
            </div>
            <p>Procesando tu perfil experimental...</p>
            <div className="progress-ring">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-survey-b">
      <canvas ref={canvasRef} className="canvas-bg" />
      
      <div className="survey-b-container">
        <div className="progress-b">
          <div className="progress-glow">
            <div 
              className="progress-fill-b" 
              style={{ width: `${((currentStep + 1) / surveySteps.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {currentStep + 1} / {surveySteps.length}
          </span>
        </div>

        <div className="survey-b-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSurveyB;