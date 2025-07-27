// ==========================================
// TIPOS BASE DEL SISTEMA
// ==========================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  last_location_update?: string;
  is_active: boolean;
  roles?: Role[];
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

// ==========================================
// AUTENTICACIÓN
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'cliente' | 'mecanico' | 'administrador';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  token_type: string;
}

// Tipos auxiliares para Vehicle
export interface ServiceRecord {
  id: number;
  date: string;
  description: string;
  cost?: number;
  mechanic?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface VehiclePreferences {
  preferred_mechanic?: number;
  service_reminders: boolean;
  emergency_notifications: boolean;
}

// Tipo auxiliar para MechanicProfile
export interface AvailabilitySchedule {
  monday?: { start: string; end: string; available: boolean };
  tuesday?: { start: string; end: string; available: boolean };
  wednesday?: { start: string; end: string; available: boolean };
  thursday?: { start: string; end: string; available: boolean };
  friday?: { start: string; end: string; available: boolean };
  saturday?: { start: string; end: string; available: boolean };
  sunday?: { start: string; end: string; available: boolean };
}

// ==========================================
// VEHÍCULOS
// ==========================================

export interface Vehicle {
  id: number;
  user_id: number;
  make: string;
  model: string;
  year: number;
  fuel_type: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other';
  transmission_type: 'manual' | 'automatic' | 'cvt' | 'other';
  engine_size?: string;
  mileage: number;
  license_plate: string;
  color: string;
  vin: string;
  notes?: string;
  service_history?: ServiceRecord[];
  last_service_date?: string;
  next_service_due?: string;
  insurance_company?: string;
  insurance_policy_number?: string;
  emergency_contacts?: EmergencyContact[];
  preferences?: VehiclePreferences;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  fuel_type: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other';
  transmission_type: 'manual' | 'automatic' | 'cvt' | 'other';
  engine_type?: string;
  mileage: number;
  license_plate: string;
  color: string;
  vin: string;
  notes?: string;
}

// ==========================================
// PERFILES DE MECÁNICOS
// ==========================================

export interface MechanicProfile {
  id: number;
  user_id: number;
  specializations: string[];
  experience_years: number;
  hourly_rate: string;
  travel_radius: number;
  availability_schedule?: AvailabilitySchedule;
  emergency_available: boolean;
  is_verified: boolean;
  is_available: boolean;
  rating_average: string;
  total_jobs: number;
  total_reviews: number;
  bio?: string;
  certifications: string[];
  tools_owned?: string[];
  minimum_service_fee?: string;
  accepts_weekend_jobs: boolean;
  accepts_night_jobs: boolean;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  location_updated_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  distance_km?: number;
  estimated_arrival_minutes?: number;
}

export interface CreateMechanicProfileRequest {
  specializations: string[];
  experience_years: number;
  hourly_rate: number;
  travel_radius: number;
  emergency_available: boolean;
  bio?: string;
  certifications: string[];
  accepts_weekend_jobs: boolean;
  accepts_night_jobs: boolean;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
}

// ==========================================
// SERVICIOS Y SOLICITUDES
// ==========================================

export interface ServiceRequest {
  id: string;
  client_id: number;
  vehicle_id: number;
  mechanic_id?: number;
  service_type: 'emergency' | 'scheduled' | 'diagnostic' | 'maintenance' | 'repair';
  problem_description: string;
  location_description: string;
  client_location: {
    latitude: string;
    longitude: string;
    address: string;
    city?: string;
  };
  preferred_date?: string;
  preferred_time?: string;
  max_budget?: number;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  images: string[];
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
  mechanic?: User;
  client?: User;
}

// Tipo extendido para el sistema de dashboard con campos adicionales
export interface ExtendedServiceRequest {
  id: number;
  title: string;
  description: string;
  service_type: string;
  urgency_level: 'baja' | 'media' | 'alta' | 'critica';
  estimated_duration_hours: number;
  budget_max: number;
  is_emergency: boolean;
  preferred_date?: string;
  location_address?: string;
  location_notes?: string;
  location_latitude?: number;
  location_longitude?: number;
  vehicle_id?: number;
  preferred_mechanic_id?: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  final_cost?: number;
  created_at: string;
  updated_at: string;
  client?: User;
  mechanic?: MechanicProfile;
  vehicle?: Vehicle;
}

export interface ServiceRequestCreate {
  title: string;
  description: string;
  service_type: string;
  urgency_level: string;
  estimated_duration_hours: number;
  budget_max: number;
  is_emergency: boolean;
  preferred_date?: string;
  location_address?: string;
  location_notes?: string;
  location_latitude?: number;
  location_longitude?: number;
  vehicle_id?: number | null;
  preferred_mechanic_id?: number | null;
}

export interface CreateServiceRequestRequest {
  vehicle_id: number;
  service_type: 'emergency' | 'scheduled' | 'diagnostic' | 'maintenance' | 'repair';
  problem_description: string;
  location_description: string;
  preferred_date?: string;
  preferred_time?: string;
  max_budget?: number;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  images?: string[];
}

export interface AvailableServiceRequest {
  id: string;
  client_name: string;
  vehicle: string;
  service_type: string;
  problem_description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    description: string;
  };
  distance_km: number;
  priority: string;
  max_budget: number;
  preferred_time: string;
  created_at: string;
}

// ==========================================
// GEOLOCALIZACIÓN
// ==========================================

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export interface NearbyMechanicSearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  specialty?: string;
  min_rating?: number;
  emergency_only?: boolean;
}

// ==========================================
// RESPUESTAS DE API
// ==========================================

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ==========================================
// CONTEXTO DE AUTENTICACIÓN
// ==========================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  isClient: () => boolean;
  isMechanic: () => boolean;
  isAdmin: () => boolean;
}

// ==========================================
// ESTADÍSTICAS Y DASHBOARD
// ==========================================

export interface DashboardStats {
  // Contadores principales
  total_users: number;
  admin_users: number;
  mechanic_users: number;
  client_users: number;
  active_users: number;
  
  // Estadísticas temporales
  users_today: number;
  users_this_week: number;
  users_this_month: number;
  users_last_month: number;
  
  // Análisis de crecimiento
  growth_percentage: number;
  is_growing: boolean;
  
  // Distribución de roles
  role_distribution: {
    administradores: number;
    mecanicos: number;
    clientes: number;
  };
  
  // Datos adicionales
  recent_users: User[];
  
  // Estadísticas del sistema (futuro)
  total_vehicles: number;
  total_services: number;
  active_services: number;
  completed_services: number;
  monthly_revenue: number;
}

export interface MechanicStats {
  total_jobs: number;
  jobs_this_month: number;
  average_rating: number;
  total_earnings: number;
  active_requests: number;
  completion_rate: number;
}

export interface ClientStats {
  total_vehicles: number;
  total_services: number;
  services_this_month: number;
  total_spent: number;
  favorite_mechanics: number;
}
