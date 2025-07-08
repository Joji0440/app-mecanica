import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Car, 
  Users, 
  Clock, 
  Settings,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const WelcomePage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.roles?.some(role => role.name === 'admin') || false;

  const getQuickActions = () => {
    if (isAdmin) {
      return [
        {
          icon: <Users className="w-6 h-6" />,
          title: "Gestionar Usuarios",
          description: "Administrar usuarios y permisos",
          link: "/user-management",
          color: "bg-yellow-500 hover:bg-yellow-600"
        },
        {
          icon: <BarChart3 className="w-6 h-6" />,
          title: "Reportes",
          description: "Ver estadísticas y reportes",
          link: "/dashboard",
          color: "bg-blue-500 hover:bg-blue-600"
        },
        {
          icon: <Settings className="w-6 h-6" />,
          title: "Configuración",
          description: "Configurar sistema",
          link: "/dashboard",
          color: "bg-gray-500 hover:bg-gray-600"
        }
      ];
    } else {
      return [
        {
          icon: <Car className="w-6 h-6" />,
          title: "Mis Vehículos",
          description: "Ver mis vehículos registrados",
          link: "/dashboard",
          color: "bg-blue-500 hover:bg-blue-600"
        },
        {
          icon: <Clock className="w-6 h-6" />,
          title: "Mis Citas",
          description: "Programar y ver citas",
          link: "/dashboard",
          color: "bg-indigo-500 hover:bg-indigo-600"
        },
        {
          icon: <Wrench className="w-6 h-6" />,
          title: "Historial",
          description: "Ver historial de servicios",
          link: "/dashboard",
          color: "bg-orange-500 hover:bg-orange-600"
        }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tu vida, sin interrupciones</h1>
          <Link
            to="/register"
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
          >
            Reserva ahora
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">Mecánica Asistida</h2>
          <p className="text-lg text-gray-700 mb-8">Servicio profesional de mecánica móvil a tu puerta.</p>
          <Link
            to="/quote"
            className="bg-yellow-500 text-white px-8 py-4 rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-lg"
          >
            Cotización al instante
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      {user && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {getQuickActions().map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`group p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 ${action.color}`}
                >
                  <div className="flex items-center space-x-4">
                    {action.icon}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                      <p className="text-sm text-gray-200">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 Mecánica Asistida. Todos los derechos reservados.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="/faq" className="hover:underline">FAQ</a>
            <a href="/contact" className="hover:underline">Contacto</a>
            <a href="/terms" className="hover:underline">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
