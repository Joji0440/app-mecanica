import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Car, 
  Users, 
  Shield, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const WelcomePage = () => {
  const features = [
    {
      icon: <Car className="w-8 h-8" />,
      title: "Gestión de Vehículos",
      description: "Administra toda la información de los vehículos de tus clientes"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Control de Servicios",
      description: "Programa y controla todos los servicios y reparaciones"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestión de Clientes",
      description: "Mantén un registro completo de tus clientes y su historial"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Citas y Agenda",
      description: "Organiza tu tiempo y programa citas de manera eficiente"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Seguro y Confiable",
      description: "Tus datos están protegidos con la más alta seguridad"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Calidad Garantizada",
      description: "Sistema probado y confiable para talleres mecánicos"
    }
  ];

  const benefits = [
    "Reduce el tiempo de gestión administrativa",
    "Mejora la comunicación con los clientes",
    "Optimiza la programación de servicios",
    "Mantén un historial completo de reparaciones",
    "Genera reportes y estadísticas automáticamente"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mecánica Asistida
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Gestiona tu Taller Mecánico
              <span className="text-blue-600 block">de Forma Inteligente</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema completo de gestión para talleres mecánicos. Administra clientes, 
              servicios, citas y mucho más desde una sola plataforma moderna y fácil de usar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center space-x-2"
              >
                <span>Comenzar Gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu taller
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas profesionales diseñadas específicamente para la gestión 
              eficiente de talleres mecánicos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir Mecánica Asistida?
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center space-x-2"
                >
                  <span>Empezar Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Toyota Corolla 2020</div>
                      <div className="text-sm text-gray-500">Mantenimiento programado</div>
                    </div>
                  </div>
                  <div className="border-l-2 border-green-400 pl-4">
                    <div className="text-sm font-medium text-green-600">Completado</div>
                    <div className="text-xs text-gray-500">Cambio de aceite y filtros</div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="font-bold text-lg text-gray-900">$85.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            ¿Listo para modernizar tu taller?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de talleres que ya confían en nuestra plataforma
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-semibold text-lg">
                Mecánica Asistida
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Mecánica Asistida. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
