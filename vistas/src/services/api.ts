import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  ApiResponse,
  Vehicle,
  CreateVehicleRequest,
  MechanicProfile,
  CreateMechanicProfileRequest,
  ClientProfile,
  UpdateClientProfileRequest,
  ClientStats,
  DashboardLayoutConfig,
  LoyaltyPointsData,
  ServiceRequest,
  ExtendedServiceRequest,
  ServiceRequestCreate,
  CreateServiceRequestRequest,
  AvailableServiceRequest,
  LocationUpdate,
  NearbyMechanicSearchParams,
  DashboardStats,
  MechanicStats
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.100:8000/api';

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

// ==========================================
// AUTENTICACIÓN
// ==========================================
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

  // Cerrar todas las sesiones
  logoutAll: async (): Promise<void> => {
    await api.post('/logout-all');
  },

  // Verificar salud del API
  healthCheck: async (): Promise<{ status: string; database: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// ==========================================
// GESTIÓN DE VEHÍCULOS
// ==========================================
export const vehicleAPI = {
  // Obtener vehículos del usuario
  getVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<ApiResponse<Vehicle[]>>('/vehicles');
    return response.data.data!;
  },

  // Obtener un vehículo específico
  getVehicle: async (id: number): Promise<Vehicle> => {
    const response = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return response.data.data!;
  },

  // Crear nuevo vehículo
  createVehicle: async (vehicleData: CreateVehicleRequest): Promise<Vehicle> => {
    const response = await api.post<ApiResponse<Vehicle>>('/vehicles', vehicleData);
    return response.data.data!;
  },

  // Actualizar vehículo
  updateVehicle: async (id: number, vehicleData: Partial<CreateVehicleRequest>): Promise<Vehicle> => {
    const response = await api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, vehicleData);
    return response.data.data!;
  },

  // Eliminar vehículo
  deleteVehicle: async (id: number): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  // Agregar registro de servicio
  addServiceRecord: async (vehicleId: number, serviceData: {
    service_type: string;
    description: string;
    cost: number;
    mileage: number;
    notes?: string;
  }): Promise<void> => {
    await api.post(`/vehicles/${vehicleId}/service-record`, serviceData);
  },

  // Obtener vehículos cercanos (para mecánicos)
  getNearbyVehicles: async (params: {
    latitude: number;
    longitude: number;
    radius?: number;
  }): Promise<Vehicle[]> => {
    const response = await api.get<ApiResponse<Vehicle[]>>('/vehicles/nearby', { params });
    return response.data.data!;
  },
};

// ==========================================
// PERFILES DE MECÁNICOS
// ==========================================
export const mechanicAPI = {
  // Obtener todos los mecánicos
  getMechanics: async (): Promise<MechanicProfile[]> => {
    const response = await api.get<ApiResponse<MechanicProfile[]>>('/mechanics');
    return response.data.data!;
  },

  // Obtener un mecánico específico
  getMechanic: async (id: number): Promise<MechanicProfile> => {
    const response = await api.get<ApiResponse<MechanicProfile>>(`/mechanics/${id}`);
    return response.data.data!;
  },

  // Obtener perfil del mecánico actual
  getProfile: async (): Promise<ApiResponse<MechanicProfile>> => {
    const response = await api.get<ApiResponse<MechanicProfile>>('/mechanics/profile');
    return response.data;
  },

  // Crear perfil de mecánico
  createProfile: async (profileData: CreateMechanicProfileRequest): Promise<MechanicProfile> => {
    const response = await api.post<ApiResponse<MechanicProfile>>('/mechanics/profile', profileData);
    return response.data.data!;
  },

  // Actualizar perfil de mecánico
  updateProfile: async (profileData: Partial<CreateMechanicProfileRequest>): Promise<MechanicProfile> => {
    const response = await api.put<ApiResponse<MechanicProfile>>('/mechanics/profile', profileData);
    return response.data.data!;
  },

  // Actualizar disponibilidad
  updateAvailability: async (id: number, isAvailable: boolean): Promise<void> => {
    await api.put(`/mechanics/${id}/availability`, { is_available: isAvailable });
  },

  // Obtener estadísticas del mecánico
  getStats: async (id: number): Promise<MechanicStats> => {
    const response = await api.get<ApiResponse<MechanicStats>>(`/mechanics/${id}/stats`);
    return response.data.data!;
  },

  // Buscar mecánicos cercanos (para clientes)
  getNearbyMechanics: async (params: NearbyMechanicSearchParams): Promise<{
    data: MechanicProfile[];
    client_location: { latitude: string; longitude: string; search_radius: string };
  }> => {
    const response = await api.get<ApiResponse<{
      data: MechanicProfile[];
      client_location: { latitude: string; longitude: string; search_radius: string };
    }>>('/mechanics/nearby', { params });
    return response.data.data!;
  },
};

// ==========================================
// PERFILES DE CLIENTES
// ==========================================
export const clientAPI = {
  // Obtener perfil del cliente actual
  getProfile: async (): Promise<ApiResponse<ClientProfile>> => {
    const response = await api.get<ApiResponse<ClientProfile>>('/client/profile');
    return response.data;
  },

  // Actualizar perfil de cliente
  updateProfile: async (profileData: UpdateClientProfileRequest): Promise<ClientProfile> => {
    const response = await api.put<ApiResponse<ClientProfile>>('/client/profile', profileData);
    return response.data.data!;
  },

  // Obtener configuración del dashboard
  getDashboardConfig: async (): Promise<DashboardLayoutConfig> => {
    const response = await api.get<ApiResponse<DashboardLayoutConfig>>('/client/dashboard-config');
    return response.data.data!;
  },

  // Actualizar configuración del dashboard
  updateDashboardConfig: async (config: {
    dashboard_layout: DashboardLayoutConfig;
    theme_preference?: string;
    language_preference?: string;
  }): Promise<DashboardLayoutConfig> => {
    const response = await api.put<ApiResponse<DashboardLayoutConfig>>('/client/dashboard-config', config);
    return response.data.data!;
  },

  // Obtener estadísticas del cliente
  getStats: async (): Promise<ClientStats> => {
    const response = await api.get<ApiResponse<ClientStats>>('/client/stats');
    return response.data.data!;
  },

  // Obtener historial de puntos de lealtad
  getLoyaltyPointsHistory: async (): Promise<LoyaltyPointsData> => {
    const response = await api.post<ApiResponse<LoyaltyPointsData>>('/client/loyalty-points', {
      action: 'history'
    });
    return response.data.data!;
  },

  // Usar puntos de lealtad
  useLoyaltyPoints: async (points: number, reason: string): Promise<{ message: string; remaining_points: number }> => {
    const response = await api.post<ApiResponse<{ message: string; remaining_points: number }>>('/client/loyalty-points', {
      action: 'use',
      points,
      reason
    });
    return response.data.data!;
  },
};

// ==========================================
// SERVICIOS Y SOLICITUDES
// ==========================================
export const serviceAPI = {
  // Crear solicitud de servicio (clientes)
  createRequest: async (requestData: CreateServiceRequestRequest): Promise<ServiceRequest> => {
    const response = await api.post<ApiResponse<ServiceRequest>>('/services/request', requestData);
    return response.data.data!;
  },

  // Obtener historial de servicios
  getHistory: async (): Promise<ServiceRequest[]> => {
    const response = await api.get<ApiResponse<ServiceRequest[]>>('/services/history');
    return response.data.data!;
  },

  // Ver solicitudes disponibles (mecánicos)
  getAvailableRequests: async (): Promise<{
    data: AvailableServiceRequest[];
    mechanic_info: {
      location: { latitude: string; longitude: string };
      travel_radius: number;
      specializations: string[];
    };
  }> => {
    const response = await api.get<ApiResponse<{
      data: AvailableServiceRequest[];
      mechanic_info: {
        location: { latitude: string; longitude: string };
        travel_radius: number;
        specializations: string[];
      };
    }>>('/services/available-requests');
    return response.data.data!;
  },

  // Responder a solicitud (mecánicos)
  respondToRequest: async (requestId: string, response: {
    message: string;
    estimated_arrival?: number;
    quoted_price?: number;
  }): Promise<void> => {
    await api.post('/services/respond', { request_id: requestId, ...response });
  },

  // Buscar mecánicos por especialidad
  findMechanicsBySpecialty: async (params: {
    specialty: string;
    latitude: number;
    longitude: number;
    radius?: number;
    urgency?: string;
  }): Promise<MechanicProfile[]> => {
    const response = await api.get<ApiResponse<MechanicProfile[]>>('/services/find-mechanics', { params });
    return response.data.data!;
  },
};

// ==========================================
// SERVICIOS EXTENDIDOS (SISTEMA MEJORADO)
// ==========================================
export const serviceRequestAPI = {
  // Obtener todas las solicitudes
  getAll: async (): Promise<ApiResponse<ExtendedServiceRequest[]>> => {
    const response = await api.get<ApiResponse<ExtendedServiceRequest[]>>('/service-requests');
    return response.data;
  },

  // Crear nueva solicitud
  create: async (data: ServiceRequestCreate): Promise<ApiResponse<ExtendedServiceRequest>> => {
    const response = await api.post<ApiResponse<ExtendedServiceRequest>>('/service-requests', data);
    return response.data;
  },

  // Obtener solicitud específica
  getById: async (id: number): Promise<ApiResponse<ExtendedServiceRequest>> => {
    const response = await api.get<ApiResponse<ExtendedServiceRequest>>(`/service-requests/${id}`);
    return response.data;
  },

  // Actualizar solicitud
  update: async (id: number, data: Partial<ServiceRequestCreate>): Promise<ApiResponse<ExtendedServiceRequest>> => {
    const response = await api.put<ApiResponse<ExtendedServiceRequest>>(`/service-requests/${id}`, data);
    return response.data;
  },

  // Eliminar solicitud
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/service-requests/${id}`);
    return response.data;
  },

  // Actualizar estado de solicitud
  updateStatus: async (id: number, status: string): Promise<ApiResponse<ExtendedServiceRequest>> => {
    const response = await api.patch<ApiResponse<ExtendedServiceRequest>>(`/service-requests/${id}/status`, { status });
    return response.data;
  },

  // Obtener solicitudes por mecánico
  getByMechanic: async (mechanicId?: number): Promise<ApiResponse<ExtendedServiceRequest[]>> => {
    const url = mechanicId ? `/service-requests/mechanic/${mechanicId}` : '/service-requests/my-requests';
    const response = await api.get<ApiResponse<ExtendedServiceRequest[]>>(url);
    return response.data;
  },

  // Obtener solicitudes por cliente
  getByClient: async (clientId?: number): Promise<ApiResponse<ExtendedServiceRequest[]>> => {
    const url = clientId ? `/service-requests/client/${clientId}` : '/service-requests/my-requests';
    const response = await api.get<ApiResponse<ExtendedServiceRequest[]>>(url);
    return response.data;
  },

  // NUEVAS FUNCIONES ESPECÍFICAS PARA MECÁNICOS
  
  // Obtener solicitudes disponibles (sin asignar)
  getAvailableRequests: async (): Promise<ApiResponse<ExtendedServiceRequest[]>> => {
    console.log('🌐 Llamando a /mechanics/service-requests/available...');
    try {
      const response = await api.get<ApiResponse<ExtendedServiceRequest[]>>('/mechanics/service-requests/available');
      console.log('🌐 Respuesta recibida:', response);
      console.log('🌐 Datos de la respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 Error en getAvailableRequests:', error);
      throw error;
    }
  },

  // Aceptar solicitud de servicio
  acceptRequest: async (id: number): Promise<ApiResponse<ExtendedServiceRequest>> => {
    const response = await api.post<ApiResponse<ExtendedServiceRequest>>(`/mechanics/service-requests/${id}/accept`);
    return response.data;
  },

  // Rechazar solicitud de servicio
  rejectRequest: async (id: number): Promise<ApiResponse<ExtendedServiceRequest>> => {
    const response = await api.post<ApiResponse<ExtendedServiceRequest>>(`/mechanics/service-requests/${id}/reject`);
    return response.data;
  },

  // NUEVAS FUNCIONES PARA CÁLCULO DE DISTANCIAS

  // Calcular distancia entre mecánico y servicio específico
  calculateDistance: async (serviceId: number): Promise<ApiResponse<{
    distance: { km: number; formatted: string };
    travel_time: { hours: number; minutes: number; formatted: string };
    radius_validation: {
      status: 'optimal' | 'good' | 'limit' | 'exceeded';
      within_radius: boolean;
      percentage: number;
      message: string;
    };
    travel_radius_km: number;
    mechanic_location: { latitude: number; longitude: number };
    service_location: { latitude: number; longitude: number };
  }>> => {
    const response = await api.get(`/service-requests/${serviceId}/distance`);
    return response.data;
  },

  // Obtener todos los servicios disponibles con información de distancia
  getServicesWithDistance: async (params?: {
    search?: string;
    within_radius_only?: boolean;
  }): Promise<ApiResponse<Array<{
    service: ExtendedServiceRequest;
    distance_info: {
      distance: { km: number; formatted: string };
      travel_time: { hours: number; minutes: number; formatted: string };
      radius_validation: {
        status: 'optimal' | 'good' | 'limit' | 'exceeded';
        within_radius: boolean;
        percentage: number;
        message: string;
      };
      travel_radius_km: number;
    };
  }>>> => {
    const response = await api.get('/service-requests/with-distance', { params });
    return response.data;
  },
};

// ==========================================
// GEOLOCALIZACIÓN
// ==========================================
export const locationAPI = {
  // Actualizar ubicación
  updateLocation: async (locationData: LocationUpdate): Promise<{
    latitude: string;
    longitude: string;
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    location_updated_at?: string;
  }> => {
    const response = await api.put<ApiResponse<{
      latitude: string;
      longitude: string;
      address: string;
      city?: string;
      state?: string;
      postal_code?: string;
      location_updated_at?: string;
    }>>('/location', locationData);
    return response.data.data!;
  },

  // Obtener ubicación actual
  getCurrentLocation: async (): Promise<{
    latitude: string;
    longitude: string;
    address: string;
    last_updated: string;
  }> => {
    const response = await api.get<ApiResponse<{
      latitude: string;
      longitude: string;
      address: string;
      last_updated: string;
    }>>('/location');
    return response.data.data!;
  },

  // Buscar direcciones
  searchAddresses: async (query: string): Promise<{
    suggestions: Array<{
      address: string;
      latitude: number;
      longitude: number;
      city: string;
      state: string;
    }>;
  }> => {
    const response = await api.get<ApiResponse<{
      suggestions: Array<{
        address: string;
        latitude: number;
        longitude: number;
        city: string;
        state: string;
      }>;
    }>>('/location/search-addresses', { params: { query } });
    return response.data.data!;
  },

  // Calcular ruta
  calculateRoute: async (params: {
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
  }): Promise<{
    distance_km: number;
    duration_minutes: number;
    estimated_cost: number;
    route_summary: string;
  }> => {
    const response = await api.post<ApiResponse<{
      distance_km: number;
      duration_minutes: number;
      estimated_cost: number;
      route_summary: string;
    }>>('/location/calculate-route', params);
    return response.data.data!;
  },
};

// ==========================================
// DASHBOARD Y ESTADÍSTICAS
// ==========================================
export const dashboardAPI = {
  // Dashboard general (admin)
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard-stats');
    return response.data.data!;
  },

  // Estadísticas del cliente
  getClientStats: async (): Promise<ClientStats> => {
    const response = await api.get<ApiResponse<ClientStats>>('/stats');
    return response.data.data!;
  },
};

// ==========================================
// GESTIÓN DE USUARIOS (ADMIN)
// ==========================================
export const userManagementAPI = {
  // Obtener usuarios
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/admin/users');
    return response.data.data!;
  },

  // Obtener usuario específico
  getUser: async (id: number): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data.data!;
  },

  // Actualizar usuario
  updateUser: async (userId: number, userData: { name: string; email: string }): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}`, userData);
    return response.data.data!;
  },

  // Eliminar usuario
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Cambiar estado del usuario
  toggleUserStatus: async (userId: number, isActive: boolean): Promise<void> => {
    await api.patch(`/admin/users/${userId}/toggle-status`, { is_active: isActive });
  },

  // Asignar rol
  assignRole: async (userId: number, role: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/assign-role`, { role });
  },

  // Remover rol
  removeRole: async (userId: number, role: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/remove-role`, { role });
  },
};

// ==========================================
// PERFIL DE USUARIO
// ==========================================
export const profileAPI = {
  // Obtener perfil
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/profile');
    return response.data.data!;
  },

  // Actualizar perfil
  updateProfile: async (profileData: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  }): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/profile', profileData);
    return response.data.data!;
  },
};

export default api;
