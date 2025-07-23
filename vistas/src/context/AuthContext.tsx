import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User, AuthContextType, RegisterRequest } from '../types';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Funciones auxiliares para verificar roles
  const hasRole = (role: string): boolean => {
    return user?.roles?.some(r => r.name === role) ?? false;
  };

  const isClient = (): boolean => hasRole('cliente');
  const isMechanic = (): boolean => hasRole('mecanico');
  const isAdmin = (): boolean => hasRole('administrador');

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verificar que el token sigue siendo válido
          await authAPI.getCurrentUser();
        } catch {
          // Token inválido, limpiar datos
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await authAPI.login({ email, password });
    
    setUser(response.user);
    setToken(response.token);
    
    // Guardar en localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setIsLoading(false);
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    const response = await authAPI.register(data);
    
    setUser(response.user);
    setToken(response.token);
    
    // Guardar en localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      // Ignorar errores de logout
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar estado local
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    hasRole,
    isClient,
    isMechanic,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
