import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Car, 
  Users, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const WelcomePage: React.FC = () => {
  const { user } = useAuth();

  // Verificar roles del usuario
  const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];
  const hasAdminAccess = userRoles.includes('admin') || userRoles.includes('manager');

  const features = [
    {
      icon: <Car className="w-8 h-8 text-indigo-600" />,
      title: "Gestión de Vehículos",
      description: "Control completo del inventario y mantenimiento de vehículos"
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Gestión de Usuarios",
      description: "Administración de personal con roles y permisos específicos"
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: "Seguridad Avanzada",
      description: "Sistema de autenticación robusto con control de acceso"
    },
    {
      icon: <Wrench className="w-8 h-8 text-indigo-600" />,
      title: "Mecánica Asistida",
      description: "Herramientas inteligentes para diagnóstico y reparación"
    }
  ];

  const benefits = [
    "Reducción del 40% en tiempo de diagnóstico",
    "Control completo de inventario en tiempo real",
    "Reportes detallados y analytics avanzados",
    "Integración con sistemas existentes",
    "Soporte técnico 24/7"
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Mecánica Asistida
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                hasAdminAccess ? (
                  <Link
                    to="/dashboard"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Ir al Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/user-profile"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Mi Perfil
                  </Link>
                )
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              Sistema de Gestión Mecánica #1
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Mecánica Asistida
              <span className="block text-indigo-600 dark:text-indigo-400">
                Inteligente
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Revoluciona tu taller mecánico con nuestro sistema inteligente de gestión. 
              Control total de vehículos, usuarios y procesos en una sola plataforma.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                hasAdminAccess ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Ir al Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    to="/user-profile"
                    className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Acceder a Mi Perfil
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                )
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Comenzar Gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-colors duration-200"
                  >
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* User Status Indicator */}
      {user && (
        <section className="py-8 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                <div className="h-3 w-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conectado como: <strong>{user.name}</strong>
                </span>
                <span className="ml-3 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">
                  {hasAdminAccess ? 'Admin/Manager' : 'Usuario'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas para maximizar la eficiencia de tu taller
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Beneficios Comprobados
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Optimiza tu Taller con Tecnología Avanzada
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Nuestro sistema ha sido probado en cientos de talleres, 
                demostrando mejoras significativas en productividad y rentabilidad.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">40%</div>
                    <div className="text-indigo-100">Ahorro de Tiempo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">99.9%</div>
                    <div className="text-indigo-100">Disponibilidad</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">500+</div>
                    <div className="text-indigo-100">Talleres Confiados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-indigo-100">Soporte</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 dark:bg-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para Modernizar tu Taller?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de talleres que ya confían en nuestra plataforma para 
            gestionar sus operaciones de manera eficiente.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 hover:bg-gray-50 font-medium rounded-lg transition-colors duration-200"
              >
                Comenzar Prueba Gratuita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 border border-white/20 text-white hover:bg-white/10 font-medium rounded-lg transition-colors duration-200"
              >
                <Clock className="mr-2 w-5 h-5" />
                Ya tengo cuenta
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-white">
                Mecánica Asistida
              </span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 Mecánica Asistida. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
