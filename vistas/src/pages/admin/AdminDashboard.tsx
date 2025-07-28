import React, { useState, useEffect } from 'react';
import { userManagementAPI, dashboardAPI } from '../../services/api';
import type { User, DashboardStats } from '../../types';
import NavigationHeader from '../../components/NavigationHeader';
import ExcelJS from 'exceljs';
import { 
  Users,
  UserCheck,
  UserX,
  Wrench,
  Car,
  TrendingUp,
  DollarSign,
  Calendar,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Obtener estadísticas del dashboard
      const statsResult = await dashboardAPI.getDashboardStats();
      setStats(statsResult || null);

      // Obtener lista de usuarios
      const usersResult = await userManagementAPI.getUsers();
      setUsers(usersResult || []);
    } catch (err: any) {
      setError('Error al cargar datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      await userManagementAPI.toggleUserStatus(userId, !currentStatus);
      setSuccess(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      await fetchDashboardData();
    } catch (err: any) {
      setError('Error al cambiar estado del usuario: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      setIsLoading(true);
      await userManagementAPI.deleteUser(userId);
      setSuccess('Usuario eliminado exitosamente');
      await fetchDashboardData();
    } catch (err: any) {
      setError('Error al eliminar usuario: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Crear un nuevo libro de trabajo
      const workbook = new ExcelJS.Workbook();
      
      // Configurar metadatos del archivo
      workbook.creator = 'RuedaExpress Admin';
      workbook.lastModifiedBy = 'Sistema Administrativo';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Hoja 1: Estadísticas Generales
      const statsSheet = workbook.addWorksheet('Estadísticas');
      
      // Agregar encabezados con estilo
      const statsHeaders = ['Métrica', 'Valor'];
      const headerRow = statsSheet.addRow(statsHeaders);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Agregar datos de estadísticas
      const statsData = [
        ['Total de Usuarios', stats?.total_users || 0],
        ['Usuarios Activos', stats?.active_users || 0],
        ['Clientes', stats?.client_users || 0],
        ['Mecánicos', stats?.mechanic_users || 0],
        ['Crecimiento (%)', stats?.growth_percentage || 0],
        ['Registros Hoy', stats?.users_today || 0],
        ['Registros Esta Semana', stats?.users_this_week || 0],
        ['Registros Este Mes', stats?.users_this_month || 0],
      ];

      statsData.forEach(row => {
        statsSheet.addRow(row);
      });

      // Ajustar ancho de columnas
      statsSheet.getColumn(1).width = 25;
      statsSheet.getColumn(2).width = 15;

      // Hoja 2: Distribución de Roles
      if (stats?.role_distribution) {
        const rolesSheet = workbook.addWorksheet('Distribución de Roles');
        
        const rolesHeaders = ['Rol', 'Porcentaje'];
        const rolesHeaderRow = rolesSheet.addRow(rolesHeaders);
        rolesHeaderRow.font = { bold: true };
        rolesHeaderRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' }
        };
        rolesHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

        const rolesData = [
          ['Administradores', stats.role_distribution.administradores || 0],
          ['Mecánicos', stats.role_distribution.mecanicos || 0],
          ['Clientes', stats.role_distribution.clientes || 0],
        ];

        rolesData.forEach(row => {
          rolesSheet.addRow(row);
        });

        rolesSheet.getColumn(1).width = 20;
        rolesSheet.getColumn(2).width = 15;
      }

      // Hoja 3: Lista de Usuarios
      const usersSheet = workbook.addWorksheet('Usuarios');
      
      const usersHeaders = ['ID', 'Nombre', 'Email', 'Teléfono', 'Roles', 'Estado', 'Fecha de Registro'];
      const usersHeaderRow = usersSheet.addRow(usersHeaders);
      usersHeaderRow.font = { bold: true };
      usersHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B5CF6' }
      };
      usersHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

      filteredUsers.forEach(user => {
        usersSheet.addRow([
          user.id,
          user.name,
          user.email,
          user.phone || 'N/A',
          getUserRole(user),
          user.is_active ? 'Activo' : 'Inactivo',
          formatDate(user.created_at)
        ]);
      });

      // Ajustar ancho de columnas
      usersSheet.getColumn(1).width = 8;
      usersSheet.getColumn(2).width = 25;
      usersSheet.getColumn(3).width = 30;
      usersSheet.getColumn(4).width = 15;
      usersSheet.getColumn(5).width = 15;
      usersSheet.getColumn(6).width = 12;
      usersSheet.getColumn(7).width = 18;

      // Hoja 4: Usuarios Recientes
      if (stats?.recent_users && stats.recent_users.length > 0) {
        const recentUsersSheet = workbook.addWorksheet('Usuarios Recientes');
        
        const recentHeaders = ['Nombre', 'Email', 'Fecha de Registro'];
        const recentHeaderRow = recentUsersSheet.addRow(recentHeaders);
        recentHeaderRow.font = { bold: true };
        recentHeaderRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF59E0B' }
        };
        recentHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

        stats.recent_users.forEach(user => {
          recentUsersSheet.addRow([
            user.name,
            user.email,
            formatDate(user.created_at)
          ]);
        });

        recentUsersSheet.getColumn(1).width = 25;
        recentUsersSheet.getColumn(2).width = 30;
        recentUsersSheet.getColumn(3).width = 18;
      }

      // Generar el archivo
      const today = new Date();
      const fileName = `RuedaExpress_Dashboard_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;
      
      // Escribir el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      
      // Limpiar URL temporal
      window.URL.revokeObjectURL(url);
      
      setSuccess('Datos exportados exitosamente');
    } catch (err: any) {
      setError('Error al exportar datos: ' + err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search || 
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRole = !filters.role || 
      user.roles?.some(role => role.name === filters.role);
    
    const matchesStatus = !filters.status || 
      (filters.status === 'active' ? user.is_active : !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserRole = (user: User): string => {
    if (!user.roles || user.roles.length === 0) return 'Sin rol';
    return user.roles.map(role => role.name).join(', ');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader title="Dashboard Administrativo" showBack={true} customBackPath="/" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Control</h1>
              <p className="text-gray-600 dark:text-gray-300">Gestión completa del sistema RuedaExpress</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleExportData}
                className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 flex items-center gap-2 disabled:opacity-50 transition-colors duration-200"
                disabled={isLoading}
              >
                <Download className="h-4 w-4" />
                {isLoading ? 'Exportando...' : 'Exportar Datos'}
              </button>
            </div>
          </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <>
          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.active_users} activos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.client_users}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.role_distribution?.clientes || 0}% del total
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Wrench className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mecánicos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mechanic_users}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.role_distribution?.mecanicos || 0}% del total
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Crecimiento</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(stats.growth_percentage || 0) > 0 ? '+' : ''}{stats.growth_percentage || 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    vs mes anterior
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas Temporales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registros Recientes</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hoy</span>
                  <span className="text-lg font-bold text-gray-900">{stats.users_today}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Esta semana</span>
                  <span className="text-lg font-bold text-gray-900">{stats.users_this_week}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Este mes</span>
                  <span className="text-lg font-bold text-gray-900">{stats.users_this_month}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Roles</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    Administradores
                  </span>
                  <span className="text-sm font-semibold">{stats.role_distribution?.administradores || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    Mecánicos
                  </span>
                  <span className="text-sm font-semibold">{stats.role_distribution?.mecanicos || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    Clientes
                  </span>
                  <span className="text-sm font-semibold">{stats.role_distribution?.clientes || 0}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuarios Recientes</h3>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {(stats.recent_users || []).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Futuras Estadísticas del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border opacity-50">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Car className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Vehículos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_vehicles}</p>
                  <p className="text-xs text-gray-500">Próximamente</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border opacity-50">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Servicios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_services}</p>
                  <p className="text-xs text-gray-500">Próximamente</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border opacity-50">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed_services}</p>
                  <p className="text-xs text-gray-500">Próximamente</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border opacity-50">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Ingresos del Mes</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.monthly_revenue}</p>
                  <p className="text-xs text-gray-500">Próximamente</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
              />
            </div>
            
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="">Todos los roles</option>
              <option value="cliente">Cliente</option>
              <option value="mecanico">Mecánico</option>
              <option value="administrador">Administrador</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            
            <button
              onClick={() => setFilters({ search: '', role: '', status: '' })}
              className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <Filter className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {getUserRole(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        className={`transition-colors duration-200 ${user.is_active ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'}`}
                      >
                        {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
              <p className="text-gray-600">
                {filters.search || filters.role || filters.status
                  ? 'No se encontraron usuarios con los filtros seleccionados'
                  : 'No hay usuarios registrados en el sistema'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Detalle del Usuario</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>

                {selectedUser.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.phone}</p>
                  </div>
                )}

                {selectedUser.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.address}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Roles</label>
                    <p className="mt-1 text-sm text-gray-900">{getUserRole(selectedUser)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de registro</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Última actualización</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.updated_at)}</p>
                  </div>
                </div>

                {selectedUser.last_location_update && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Última ubicación actualizada</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.last_location_update)}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                
                <button
                  onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.is_active)}
                  className={`px-4 py-2 rounded-lg text-white ${
                    selectedUser.is_active 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {selectedUser.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
