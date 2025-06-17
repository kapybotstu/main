import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/firebase/auth/authService';
import { getUserSurveyStatus } from '../../services/firebase/database/databaseService';
import { useAuth } from '../../context/AuthContext';
import formStyles from './styles/LoginForm.module.css';
import carouselStyles from './styles/BenefitsCarousel.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBenefitIndex, setCurrentBenefitIndex] = useState(0);
  
  const navigate = useNavigate();
  const { currentUser, userLevel, surveyCompleted } = useAuth();
  
  // Beneficios para el carrusel
  const benefitsShowcase = [
    {
      title: 'Descuentos Exclusivos',
      description: 'Accede a descuentos especiales en tiendas, restaurantes y servicios',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&crop=center',
      category: 'Compras',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Bienestar y Salud',
      description: 'Gimnasios, spas y servicios de bienestar para cuidar tu salud',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center',
      category: 'Salud',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Entretenimiento',
      description: 'Cine, conciertos y experiencias únicas para disfrutar tu tiempo libre',
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=400&fit=crop&crop=center',
      category: 'Entretenimiento',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Alimentación',
      description: 'Restaurantes premium y delivery con beneficios especiales',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&crop=center',
      category: 'Alimentación',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (currentUser && userLevel && surveyCompleted !== null) {
      console.log("User authenticated, redirecting based on level:", userLevel);
      console.log("Survey completed status:", surveyCompleted);
      
      // Si es nivel 3 y no ha completado la encuesta, redirigir a la encuesta
      if (userLevel === 3 && !surveyCompleted) {
        console.log("Level 3 user hasn't completed survey, redirecting to survey");
        navigate('/level3/survey');
      } else {
        redirectBasedOnUserLevel(userLevel);
      }
    }
  }, [currentUser, userLevel, surveyCompleted]);
  
  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefitIndex((prevIndex) => 
        (prevIndex + 1) % benefitsShowcase.length
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [benefitsShowcase.length]);
  
  const redirectBasedOnUserLevel = (level) => {
    console.log("Redirecting to level:", level);
    switch (level) {
      case 1:
        navigate('/level1/dashboard');
        break;
      case 2:
        navigate('/level2/dashboard');
        break;
      case 3:
        navigate('/level3/dashboard');
        break;
      case 4:
        navigate('/level4');
        break;
      default:
        navigate('/login');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      console.log("Attempting login with email:", email);
      
      // Intentar iniciar sesión
      const result = await loginUser(email, password);
      console.log("Login successful:", result);
      
      // No necesitamos redirigir aquí, el efecto se encargará cuando cambie currentUser
    } catch (error) {
      console.error("Login error details:", {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      let errorMessage = 'Error al iniciar sesión';
      
      // Manejar errores específicos de Firebase
      switch (error.code) {
        case 'auth/invalid-login-credentials':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido.';
          break;
        default:
          errorMessage = `Error al iniciar sesión: ${error.message} (${error.code})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={formStyles.loginLayout}>
      {/* Sección del formulario de login */}
      <div className={formStyles.loginSection}>
        <div className={formStyles.loginContainer}>
          <div className={formStyles.loginBranding}>
            <div className={formStyles.jobbyLogo}>
              <div className={formStyles.logoGradient}>Jobby</div>
              <p className={formStyles.logoTagline}>Tu plataforma de beneficios laborales</p>
            </div>
          </div>
          
          <div className={formStyles.loginFormContainer}>
            <h2>Iniciar Sesión</h2>
            
            {error && (
              <div className={formStyles.errorModal}>
                <div className={formStyles.errorContent}>
                  <span className={formStyles.errorIcon}>⚠️</span>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={formStyles.loginForm}>
              <div className={formStyles.formGroupWithIcon}>
                <div className={formStyles.inputIcon}>📧</div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo Electrónico"
                  required
                />
              </div>
              
              <div className={formStyles.formGroupWithIcon}>
                <div className={formStyles.inputIcon}>🔒</div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className={formStyles.loginButton} 
                disabled={loading}
              >
                {loading ? (
                  <span className={formStyles.loadingSpinner}>
                    <span className={formStyles.spinner}></span>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Sección del carrusel de beneficios */}
      <div className={carouselStyles.benefitsShowcase}>
        <div className={carouselStyles.benefitSlide} 
             style={{background: benefitsShowcase[currentBenefitIndex].color}}>
          <div className={carouselStyles.benefitImageContainer}>
            <img 
              src={benefitsShowcase[currentBenefitIndex].image} 
              alt={benefitsShowcase[currentBenefitIndex].title}
              className={carouselStyles.benefitImage}
            />
          </div>
          <div className={carouselStyles.benefitOverlay}>
            <div className={carouselStyles.benefitPromoText}>
              <h2>🎉 ¡Descubre Jobby Benefits!</h2>
              <p>Accede a miles de beneficios exclusivos para empleados</p>
              <span className={carouselStyles.benefitCategoryBadge}>
                {benefitsShowcase[currentBenefitIndex].category}
              </span>
            </div>
            <div className={carouselStyles.previewDots}>
              {benefitsShowcase.map((_, index) => (
                <span 
                  key={index}
                  className={`${carouselStyles.dot} ${index === currentBenefitIndex ? carouselStyles.active : ''}`}
                  onClick={() => setCurrentBenefitIndex(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;