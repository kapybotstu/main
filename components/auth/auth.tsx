import React, { createContext, useContext, useState, useEffect } from 'react';

// Definir tipos para la información del usuario
export interface UserRole {
  admin: boolean;
  employer: boolean;
  employee: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  role: UserRole;
}

// Tipos para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// Usuarios de prueba
const MOCK_USERS = [
  {
    id: 'user1',
    name: 'Juan Sánchez',
    email: 'admin@jobby.com',
    avatar: 'JS',
    company: 'Jobby',
    role: {
      admin: true,
      employer: true,
      employee: false
    }
  },
  {
    id: 'user2',
    name: 'María López',
    email: 'employer@company.com',
    avatar: 'ML',
    company: 'TechCorp',
    role: {
      admin: false,
      employer: true,
      employee: false
    }
  },
  {
    id: 'user3',
    name: 'Carlos Pérez',
    email: 'employee@company.com',
    avatar: 'CP',
    company: 'TechCorp',
    role: {
      admin: false,
      employer: false,
      employee: true
    }
  }
];

// Provider del contexto
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Comprobar si hay un usuario guardado en localStorage al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('jobbyUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error al verificar la autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validación simple (en un caso real, esto sería una llamada a la API)
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser && password === '12345') {
        setUser(foundUser);
        localStorage.setItem('jobbyUser', JSON.stringify(foundUser));
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
      console.error('Error de login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('jobbyUser');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};