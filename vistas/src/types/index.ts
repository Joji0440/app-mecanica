export interface User {
  id: number;
  name: string;
  email: string;
  roles?: Role[];
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  token_type: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

export interface DashboardData {
  stats: {
    total_users: number;
    admin_users: number;
    manager_users: number;
    regular_users: number;
    users_this_month: number;
    users_today: number;
  };
  recent_users: User[];
  user_growth: {
    labels: string[];
    data: number[];
  };
  role_distribution: {
    admin: number;
    manager: number;
    user: number;
  };
  system_info: {
    php_version: string;
    laravel_version: string;
    database_connection: string;
    environment: string;
    debug_mode: boolean;
    timezone: string;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
