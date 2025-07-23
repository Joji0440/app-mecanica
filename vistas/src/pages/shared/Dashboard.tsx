import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavigationHeader from '../../components/NavigationHeader';
import { 
  Users, 
  Settings, 
  Shield,
  UserCheck,
  Activity,
  TrendingUp
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  // Verificación adicional de seguridad en el componente
  const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];
  const hasAdminAccess = userRoles.includes('admin') || userRoles.includes('manager');

  const handleLogout = async () => {
    await logout();
  };

  // Si el usuario no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <Shield className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para acceder a esta área. Solo administradores y managers pueden ver el dashboard.
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Usuarios', value: '2', icon: Users, color: 'bg-blue-500' },
    { name: 'Administradores', value: '1', icon: Shield, color: 'bg-green-500' },
    { name: 'Managers', value: '1', icon: UserCheck, color: 'bg-purple-500' },
    { name: 'Sesiones Activas', value: '1', icon: Activity, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader title="Dashboard" showBack={false} showHome={false} />
      
      {/* User Info Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email} • {user?.roles?.[0]?.name || 'Usuario'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bienvenido, {user?.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Aquí tienes un resumen de tu sistema de mecánica asistida.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`${stat.color} p-3 rounded-lg`}>
                          <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            {stat.name}
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {stat.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Acciones Rápidas
                </h3>
                <div className="mt-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                      to="/user-management"
                      className="relative group bg-white dark:bg-gray-700 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <div>
                        <span className="rounded-lg inline-flex p-3 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                          <Users className="h-6 w-6" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Gestionar Usuarios
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Crear, editar y gestionar usuarios del sistema.
                        </p>
                      </div>
                    </Link>

                    <button className="relative group bg-white dark:bg-gray-700 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <div>
                        <span className="rounded-lg inline-flex p-3 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400">
                          <Settings className="h-6 w-6" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Configuración
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Ajustar la configuración del sistema.
                        </p>
                      </div>
                    </button>

                    <button className="relative group bg-white dark:bg-gray-700 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <div>
                        <span className="rounded-lg inline-flex p-3 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                          <TrendingUp className="h-6 w-6" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Reportes
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Ver estadísticas y reportes del sistema.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;