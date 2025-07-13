import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest, User, ApiResponse, DashboardData, UserStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para añadir token de autorización
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Iniciar sesión
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', credentials);
    return response.data;
  },

  // Registrarse
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/register', userData);
    return response.data;
  },

  // Obtener usuario actual
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/user');
    return response.data.user;
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    await api.post('/logout');
  },

  // Verificar salud del API
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export const dashboardAPI = {
  // Obtener datos del dashboard
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data.data!;
  },
};

export const userManagementAPI = {
  // Obtener usuarios
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data!;
  },

  // Actualizar usuario (el backend decide qué puede hacer cada rol)
  updateUser: async (userId: number, userData: { name: string; email: string }): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${userId}`, userData);
    return response.data.data!;
  },

  // Asignar rol (el backend valida permisos)
  assignRole: async (userId: number, role: string): Promise<void> => {
    await api.post(`/users/${userId}/assign-role`, { role });
  },

  // Remover rol (el backend valida permisos)
  removeRole: async (userId: number, role: string): Promise<void> => {
    await api.post(`/users/${userId}/remove-role`, { role });
  },

  // Eliminar usuario (el backend valida permisos)
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // Crear usuario (el backend valida permisos)
  createUser: async (userData: { name: string; email: string; password: string; role: string }): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', userData);
    return response.data.data!;
  },

  // Obtener estadísticas (el backend decide qué estadísticas devolver)
  getStats: async (): Promise<UserStats> => {
    const response = await api.get<ApiResponse<UserStats>>('/stats');
    return response.data.data!;
  },
};

export default api;
