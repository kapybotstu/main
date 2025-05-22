import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/firebase/auth/authService';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBenefitIndex, setCurrentBenefitIndex] = useState(0);
  
  const navigate = useNavigate();
  const { currentUser, userLevel } = useAuth();
  
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
    if (currentUser && userLevel) {
      console.log("User authenticated, redirecting based on level:", userLevel);
      redirectBasedOnUserLevel(userLevel);
    }
  }, [currentUser, userLevel]);
  
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
        navigate('/level4/dashboard');
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
    <div className="login-layout">
      {/* Sección del formulario de login */}
      <div className="login-section">
        <div className="login-container">
          <div className="login-branding">
            <div className="jobby-logo">
              <div className="logo-gradient">Jobby</div>
              <p className="logo-tagline">Tu plataforma de beneficios laborales</p>
            </div>
          </div>
          
          <div className="login-form-container">
            <h2>Iniciar Sesión</h2>
            
            {error && (
              <div className="error-modal">
                <div className="error-content">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group-with-icon">
                <div className="input-icon">📧</div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo Electrónico"
                  required
                />
              </div>
              
              <div className="form-group-with-icon">
                <div className="input-icon">🔒</div>
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
                className="login-button" 
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
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
      <div className="benefits-showcase">
        <div className="benefit-slide" 
             style={{background: benefitsShowcase[currentBenefitIndex].color}}>
          <div className="benefit-image-container">
            <img 
              src={benefitsShowcase[currentBenefitIndex].image} 
              alt={benefitsShowcase[currentBenefitIndex].title}
              className="benefit-image"
            />
          </div>
          <div className="benefit-overlay">
            <div className="benefit-promo-text">
              <h2>🎉 ¡Descubre Jobby Benefits!</h2>
              <p>Accede a miles de beneficios exclusivos para empleados</p>
              <span className="benefit-category-badge">
                {benefitsShowcase[currentBenefitIndex].category}
              </span>
            </div>
            <div className="preview-dots">
              {benefitsShowcase.map((_, index) => (
                <span 
                  key={index}
                  className={`dot ${index === currentBenefitIndex ? 'active' : ''}`}
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