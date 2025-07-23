import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Car, 
  Users, 
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Settings,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NavigationHeader from '../../components/NavigationHeader';

const WelcomePage: React.FC = () => {
  const { user } = useAuth();

  // Verificar roles del usuario
  const userRoles = user?.roles?.map((role: any) => role.name.toLowerCase()) || [];
  const isAdmin = userRoles.includes('administrador');
  const isMechanic = userRoles.includes('mecanico');
  const isClient = userRoles.includes('cliente');

  const features = [
    {
      icon: <Car className="w-8 h-8 text-blue-600" />,
      title: "Gestión de Vehículos",
      description: "Registra y gestiona todos tus vehículos en un solo lugar",
      userType: "cliente"
    },
    {
      icon: <Wrench className="w-8 h-8 text-blue-600" />,
      title: "Servicios Mecánicos",
      description: "Solicita servicios de mecánica especializada cuando lo necesites",
      userType: "cliente"
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Mecánicos Cercanos",
      description: "Encuentra mecánicos certificados cerca de tu ubicación",
      userType: "cliente"
    },
    {
      icon: <Settings className="w-8 h-8 text-green-600" />,
      title: "Gestión de Servicios",
      description: "Administra tus servicios mecánicos y solicitudes de clientes",
      userType: "mecanico"
    },
    {
      icon: <Award className="w-8 h-8 text-green-600" />,
      title: "Perfil Profesional",
      description: "Mantén actualizado tu perfil profesional y especialidades",
      userType: "mecanico"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Gestión de Usuarios",
      description: "Administra usuarios, mecánicos y clientes del sistema",
      userType: "admin"
    }
  ];

  const benefits = [
    "Asistencia mecánica disponible 24/7",
    "Red de mecánicos certificados y confiables",
    "Gestión completa de vehículos y servicios",
    "Seguimiento en tiempo real de reparaciones",
    "Presupuestos transparentes y competitivos",
    "Soporte técnico especializado"
  ];

  const getRelevantFeatures = () => {
    if (isAdmin) return features.filter(f => f.userType === 'admin');
    if (isMechanic) return features.filter(f => f.userType === 'mecanico');
    if (isClient) return features.filter(f => f.userType === 'cliente');
    return features.slice(0, 3); // Para usuarios no autenticados, mostrar las principales
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
              <Clock className="w-4 h-4 mr-2" />
              Tu Asistente Mecánico Online 24/7
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="text-blue-600 dark:text-blue-400">RuedaExpress</span>
              <span className="block text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-400 mt-2">
                Asistencia Mecánica Cuando la Necesitas
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Conectamos conductores con mecánicos profesionales. Obtén ayuda mecánica rápida, 
              confiable y transparente las 24 horas del día, los 7 días de la semana.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                isAdmin ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Administrar Sistema
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : isMechanic ? (
                  <Link
                    to="/mechanic-dashboard"
                    className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Ver Solicitudes
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    to="/vehicles"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Gestionar Vehículos
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                )
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Comenzar Ahora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-colors duration-200"
                  >
                    Ya Tengo Cuenta
                  </Link>
                </>
              )}
            </div>

            {/* Stats Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                <div className="text-gray-600 dark:text-gray-400">Disponibilidad</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1000+</div>
                <div className="text-gray-600 dark:text-gray-400">Mecánicos Certificados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50k+</div>
                <div className="text-gray-600 dark:text-gray-400">Servicios Completados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {user 
                ? isAdmin ? "Panel de Administración" 
                  : isMechanic ? "Herramientas para Mecánicos" 
                  : "Servicios para Conductores"
                : "¿Cómo Funciona RuedaExpress?"
              }
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {user 
                ? "Accede a todas las funcionalidades disponibles para tu rol"
                : "Obtén asistencia mecánica profesional en pocos pasos"
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getRelevantFeatures().map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Por Qué Elegir RuedaExpress?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              La plataforma de asistencia mecánica más confiable y eficiente
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-800 dark:text-gray-200">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-blue-600 dark:bg-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para Comenzar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de conductores que confían en RuedaExpress para sus necesidades mecánicas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg transition-colors duration-200"
              >
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 border border-blue-400 text-white hover:bg-blue-500 font-medium rounded-lg transition-colors duration-200"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-white">
                RuedaExpress
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Tu asistente mecánico online 24/7 para ti
            </p>
            <p className="text-sm text-gray-500">
              © 2025 RuedaExpress. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
