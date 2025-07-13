import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userManagementAPI } from '../services/api';
import NavigationHeader from '../components/NavigationHeader';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  AlertTriangle,
  Loader,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import type { User, UserStats } from '../types';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar datos - el backend decide qué devolver según permisos
      const [usersData, statsData] = await Promise.all([
        userManagementAPI.getUsers(),
        userManagementAPI.getStats().catch(() => null) // Stats pueden fallar si no hay permisos
      ]);
      
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar los datos de usuarios');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    // Solo confirmar la acción - el backend maneja todas las validaciones
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${userToDelete.name}?`)) {
      return;
    }

    try {
      await userManagementAPI.deleteUser(userId);
      await loadData();
      alert('Usuario eliminado exitosamente');
    } catch (err: unknown) {
      // Mostrar el mensaje de error del backend
      let errorMessage = 'Error al eliminar el usuario';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      alert(errorMessage);
      console.error('Error deleting user:', err);
    }
  };

  const handleAssignRole = async (userId: number, role: string) => {
    try {
      // El backend decide si el usuario puede asignar este rol
      await userManagementAPI.assignRole(userId, role);
      await loadData();
      alert(`Rol ${role} asignado exitosamente`);
    } catch (err: unknown) {
      // Mostrar el mensaje de error del backend
      let errorMessage = 'Error al asignar el rol';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      alert(errorMessage);
      console.error('Error assigning role:', err);
    }
  };

  const handleRemoveRole = async (userId: number, role: string) => {
    try {
      // El backend decide si el usuario puede remover este rol
      await userManagementAPI.removeRole(userId, role);
      await loadData();
      alert(`Rol ${role} removido exitosamente`);
    } catch (err: unknown) {
      // Mostrar el mensaje de error del backend
      let errorMessage = 'Error al remover el rol';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      alert(errorMessage);
      console.error('Error removing role:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await userManagementAPI.createUser(newUser);
      await loadData();
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: '' });
      alert('Usuario creado exitosamente');
    } catch (err: unknown) {
      let errorMessage = 'Error al crear el usuario';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      alert(errorMessage);
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    try {
      await userManagementAPI.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email
      });
      await loadData();
      setShowEditModal(false);
      setEditingUser(null);
      alert('Usuario actualizado exitosamente');
    } catch (err: unknown) {
      let errorMessage = 'Error al actualizar el usuario';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      alert(errorMessage);
      console.error('Error updating user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (roleFilter === 'all') return matchesSearch;
    
    const userRoles = user.roles?.map(r => r.name.toLowerCase()) || [];
    return matchesSearch && userRoles.includes(roleFilter);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader title="Gestión de Usuarios" showBack={true} showHome={true} />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader title="Gestión de Usuarios" showBack={true} showHome={true} />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader title="Gestión de Usuarios" showBack={true} showHome={true} />
      
      {/* Header with stats */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Usuarios
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestión centralizada de usuarios y roles del sistema
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
              
              {/* Botón crear usuario - el backend decide si el usuario puede usarlo */}
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </button>
            </div>
          </div>

          {/* Stats Cards - Solo se muestran si están disponibles */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total_users}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Admins</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.admin_users}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Managers</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.manager_users}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Usuarios</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.regular_users}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters and search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="manager">Managers</option>
                  <option value="user">Usuarios</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(Tú)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {(user.roles || []).map((role) => (
                            <span
                              key={role.id}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                role.name === 'admin' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  : role.name === 'manager'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}
                            >
                              {role.name}
                              {/* Botón para remover rol - el backend decide si el usuario puede usarlo */}
                              <button
                                onClick={() => handleRemoveRole(user.id, role.name)}
                                className="ml-1 text-red-500 hover:text-red-700"
                                title="Remover rol"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {(!user.roles || user.roles.length === 0) && (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Sin roles
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          
                          {/* Selector para asignar roles - el backend decide si el usuario puede usarlo */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignRole(user.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            defaultValue=""
                          >
                            <option value="" disabled>Asignar rol</option>
                            <option value="user">Usuario</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>

                          {/* Botón editar - el backend decide si el usuario puede usarlo */}
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Editar información del usuario"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* Botón eliminar - el backend decide si el usuario puede usarlo */}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Información del sistema */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Sistema de Gestión de Usuarios
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Los permisos para realizar acciones son validados automáticamente por el sistema. 
                Si no tienes permisos para una acción específica, recibirás un mensaje de error al intentar realizarla.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Crear Nuevo Usuario
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol
                </label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar rol</option>
                  <option value="user">Usuario</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ name: '', email: '', password: '', role: '' });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Editar Usuario: {editingUser.name}
            </h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                >
                  Actualizar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
