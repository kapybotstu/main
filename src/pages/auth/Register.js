import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, getUserLevel } from '../../services/firebase/auth/authService';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    
    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      // Intentar registro
      await registerUser(email, password, displayName);
      
      setSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      
      // Limpiar formulario
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      
      // Redirigir al login después de un registro exitoso
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      let errorMessage = 'Error al registrarse';
      
      // Manejar errores específicos de Firebase
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está en uso';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil';
          break;
        default:
          errorMessage = `Error al registrarse: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registro</h2>
        
        {error && <div className="error-alert">{error}</div>}
        {success && <div className="success-alert">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Nombre Completo</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <small>
              * Para Administración Jobby: use correo @jobby.cl<br />
              * Para RRHH: use correo admin@nombreempresa.com<br />
              * Para Proveedores: use correo @jobby.sup<br />
              * Para Usuarios: use correo normal de su empresa
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;