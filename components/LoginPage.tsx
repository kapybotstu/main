import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../assets/logotipo-jobby-3.png';

const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await login(email, password);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-jobby-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <img src={logoImage} alt="Jobby Logo" className="h-12" />
          </div>
          
          <h2 className="text-2xl font-bold text-jobby-gray-800 text-center mb-2">
            Bienvenido de nuevo
          </h2>
          <p className="text-jobby-gray-600 text-center mb-8">
            Inicia sesión para acceder a tu dashboard
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-jobby-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-jobby-gray-500">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-jobby-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jobby-purple"
                    placeholder="ejemplo@empresa.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-jobby-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-jobby-gray-500">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-jobby-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jobby-purple"
                    placeholder="********"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-jobby-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-jobby-purple focus:ring-jobby-purple border-jobby-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-jobby-gray-700">
                    Recordarme
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-jobby-purple hover:text-jobby-purple-dark"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-jobby-purple/5 border border-jobby-purple/20 p-3 rounded-lg"
                >
                  <p className="text-sm text-jobby-gray-800">
                    <strong>Usuarios de prueba:</strong><br />
                    - Admin: admin@jobby.com<br />
                    - Empleador: employer@company.com<br />
                    - Empleado: employee@company.com<br />
                    <strong>Contraseña:</strong> 12345
                  </p>
                </motion.div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-jobby-purple text-white py-2.5 px-4 rounded-lg font-medium hover:bg-jobby-purple-dark focus:outline-none focus:ring-2 focus:ring-jobby-purple focus:ring-offset-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Cargando...</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-jobby-gray-50 px-8 py-4 border-t border-jobby-gray-200">
          <p className="text-sm text-center text-jobby-gray-600">
            ¿No tienes una cuenta? <a href="#" className="font-medium text-jobby-purple hover:text-jobby-purple-dark">Regístrate ahora</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;