import React, { useState, useEffect, useCallback } from 'react';
import { userManagementAPI } from '../../services/api';
import NavigationHeader from '../../components/NavigationHeader';
import { 
  Users,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Crown,
  Car,
  Wrench,
  Shield,
  XCircle,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import type { User } from '../../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  // Estados para modal de roles
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles] = useState(['cliente', 'mecanico', 'administrador']);
  const [processingRole, setProcessingRole] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await userManagementAPI.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError('Error al cargar los datos de usuarios');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAssignRole = async (userId: number, role: string) => {
    try {
      setProcessingRole(role);
      await userManagementAPI.assignRole(userId, role);
      setSuccess(`Rol ${role} asignado exitosamente`);
      
      // Actualizar el usuario seleccionado inmediatamente
      if (selectedUser && selectedUser.id === userId) {
        const newRole = { id: Date.now(), name: role, guard_name: 'web' };
        const updatedUser = {
          ...selectedUser,
          roles: [...(selectedUser.roles || []), newRole]
        };
        setSelectedUser(updatedUser);
      }
      
      // No necesitamos recargar toda la lista, solo actualizar la tabla
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          const newRole = { id: Date.now(), name: role, guard_name: 'web' };
          return {
            ...user,
            roles: [...(user.roles || []), newRole]
          };
        }
        return user;
      });
      setUsers(updatedUsers);
      
    } catch (err: any) {
      setError(`Error al asignar rol: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingRole(null);
    }
  };

  const handleRemoveRole = async (userId: number, role: string) => {
    try {
      setProcessingRole(role);
      await userManagementAPI.removeRole(userId, role);
      setSuccess(`Rol ${role} removido exitosamente`);
      
      // Actualizar el usuario seleccionado inmediatamente
      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = {
          ...selectedUser,
          roles: selectedUser.roles?.filter(r => r.name !== role) || []
        };
        setSelectedUser(updatedUser);
      }
      
      // Actualizar la tabla de usuarios también
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            roles: user.roles?.filter(r => r.name !== role) || []
          };
        }
        return user;
      });
      setUsers(updatedUsers);
      
    } catch (err: any) {
      setError(`Error al remover rol: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingRole(null);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await userManagementAPI.toggleUserStatus(userId, !currentStatus);
      setSuccess(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      await loadUsers();
    } catch (err: any) {
      setError(`Error al cambiar estado: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      await userManagementAPI.deleteUser(userId);
      setSuccess('Usuario eliminado exitosamente');
      await loadUsers();
    } catch (err: any) {
      setError(`Error al eliminar usuario: ${err.response?.data?.message || err.message}`);
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

  const getUserRoles = (user: User): string[] => {
    return user.roles?.map(role => role.name) || [];
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'administrador': return <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'mecanico': return <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'cliente': return <Car className="h-4 w-4 text-green-600 dark:text-green-400" />;
      default: return <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'administrador': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      case 'mecanico': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'cliente': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader title="Gestión de Usuarios" showBack={true} customBackPath="/admin" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600 dark:text-gray-300">Cargando usuarios...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader title="Gestión de Usuarios" showBack={true} customBackPath="/admin" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
              <p className="text-gray-600 dark:text-gray-300">Administra usuarios y roles del sistema</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
              
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              >
                <option value="">Todos los roles</option>
                <option value="cliente">Cliente</option>
                <option value="mecanico">Mecánico</option>
                <option value="administrador">Administrador</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              
              <button
                onClick={() => setFilters({ search: '', role: '', status: '' })}
                className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center gap-2 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Limpiar
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Usuarios ({filteredUsers.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {getUserRoles(user).length > 0 ? (
                            getUserRoles(user).map((roleName) => (
                              <span
                                key={roleName}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(roleName)}`}
                              >
                                {getRoleIcon(roleName)}
                                <span className="ml-1">{roleName}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">Sin roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.created_at || '').toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            title="Gestionar roles"
                          >
                            <Edit className="h-4 w-4" />
                            Roles
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            className={`flex items-center gap-1 transition-colors ${
                              user.is_active 
                                ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' 
                                : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                            }`}
                            title={user.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {user.is_active ? (
                              <>
                                <XCircle className="h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Activar
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay usuarios</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {filters.search || filters.role || filters.status
                      ? 'No se encontraron usuarios con los filtros seleccionados'
                      : 'No hay usuarios registrados en el sistema'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Role Management Modal */}
          {showRoleModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gestionar Roles</h2>
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {selectedUser.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selectedUser.email}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Roles Actuales</h4>
                      <div className="space-y-2">
                        {getUserRoles(selectedUser).length > 0 ? (
                          getUserRoles(selectedUser).map((roleName) => (
                            <div key={roleName} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center">
                                {getRoleIcon(roleName)}
                                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{roleName}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveRole(selectedUser.id, roleName)}
                                disabled={processingRole === roleName}
                                className={`transition-colors ${
                                  processingRole === roleName 
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                    : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
                                }`}
                                title="Remover rol"
                              >
                                {processingRole === roleName ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full"></div>
                                ) : (
                                  <UserMinus className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Sin roles asignados</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Asignar Nuevos Roles</h4>
                      <div className="space-y-2">
                        {availableRoles
                          .filter(role => !getUserRoles(selectedUser).includes(role))
                          .map((roleName) => (
                            <div key={roleName} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                              <div className="flex items-center">
                                {getRoleIcon(roleName)}
                                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{roleName}</span>
                              </div>
                              <button
                                onClick={() => handleAssignRole(selectedUser.id, roleName)}
                                disabled={processingRole === roleName}
                                className={`transition-colors ${
                                  processingRole === roleName 
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                    : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'
                                }`}
                                title="Asignar rol"
                              >
                                {processingRole === roleName ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-green-600 dark:border-t-green-400 rounded-full"></div>
                                ) : (
                                  <UserPlus className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cerrar
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

export default UserManagement;
