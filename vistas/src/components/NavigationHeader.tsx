import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LogOut, 
  User, 
  Users, 
  Home, 
  ArrowLeft, 
  Crown,
  Car,
  Wrench,
  Settings,
  Moon,
  Sun
} from 'lucide-react';

interface NavigationHeaderProps {
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
  customBackPath?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ 
  title, 
  showBack = false, 
  showHome = false,
  customBackPath 
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener roles del usuario
  const userRoles = user?.roles?.map((role: any) => role.name.toLowerCase()) || [];
  const isAdmin = userRoles.includes('administrador');
  const isMechanic = userRoles.includes('mecanico');
  const isClient = userRoles.includes('cliente');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    if (customBackPath) {
      navigate(customBackPath);
    } else {
      navigate(-1);
    }
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Crown className="h-4 w-4 text-purple-600" />;
    if (isMechanic) return <Wrench className="h-4 w-4 text-blue-600" />;
    if (isClient) return <Car className="h-4 w-4 text-green-600" />;
    return <User className="h-4 w-4 text-gray-600" />;
  };

  const getRoleText = () => {
    if (isAdmin) return 'Administrador';
    if (isMechanic) return 'Mecánico';
    if (isClient) return 'Cliente';
    return 'Usuario';
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isMechanic) return '/mechanic';
    if (isClient) return '/client';
    return '/dashboard';
  };

  // Si no hay usuario y no se requieren botones especiales, usar header simple
  if (!user && !showBack && !showHome) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">RuedaExpress</span>
            </Link>

            {/* Botones de auth y tema */}
            <div className="flex items-center space-x-2">
              {/* Botón de cambio de tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Lado izquierdo - Navegación y logo */}
          <div className="flex items-center space-x-4">
            {/* Botón de retroceso */}
            {(showBack || location.pathname !== '/') && (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RuedaExpress</span>
            </Link>

            {/* Título de página */}
            {title && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              </>
            )}
          </div>

          {/* Centro - Navegación por roles */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              
              {/* Botón Home */}
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1"
              >
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </Link>

              {/* Dashboard según rol */}
              <Link
                to={getDashboardPath()}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1"
              >
                {getRoleIcon()}
                <span>Mi Panel</span>
              </Link>

              {/* Navegación específica por roles */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/users"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  >
                    <Users className="h-4 w-4" />
                    <span>Usuarios</span>
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Config</span>
                  </Link>
                </>
              )}

              {/* Navegación para cliente */}
              {isClient && (
                <>
                  <Link
                    to="/client/vehicles"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  >
                    <Car className="h-4 w-4" />
                    <span>Vehículos</span>
                  </Link>
                  <Link
                    to="/client/services"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Servicios</span>
                  </Link>
                </>
              )}

              {/* Navegación para mecánico */}
              {isMechanic && (
                <>
                  <Link
                    to="/mechanic/services"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Servicios</span>
                  </Link>
                  <Link
                    to="/mechanic/profile"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  >
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Lado derecho - Usuario y acciones */}
          <div className="flex items-center space-x-3">
            
            {user ? (
              <>
                {/* Información del usuario */}
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon()}
                    <span className="text-xs text-gray-600">{getRoleText()}</span>
                  </div>
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Botón de cambio de tema */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                  title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>

                {/* Botón de logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              /* Botones para usuarios no autenticados */
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      {user && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRoleIcon()}
              <div>
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-600">{getRoleText()}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Inicio"
              >
                <Home className="h-5 w-5" />
              </Link>
              <Link
                to={getDashboardPath()}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Mi Panel"
              >
                {getRoleIcon()}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationHeader;
