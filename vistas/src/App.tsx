import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ChatBot from './components/ChatBot';
import Welcome from './pages/auth/Welcome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/shared/Dashboard';
import UserProfile from './pages/shared/UserProfile';
import UserManagement from './pages/admin/UserManagement';

// Páginas específicas por roles
import MechanicDashboard from './pages/mechanic/MechanicDashboard';
import MechanicProfileComponent from './pages/mechanic/MechanicProfile';
import VehicleManagement from './pages/client/VehicleManagement';
import ServiceManagement from './pages/client/ServiceManagement';
import MechanicSearch from './pages/client/MechanicSearch';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas generales */}
          <Route 
            path="/user-profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas para clientes */}
          <Route 
            path="/vehicles" 
            element={
              <RoleProtectedRoute allowedRoles={['cliente']}>
                <VehicleManagement />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <RoleProtectedRoute allowedRoles={['cliente']}>
                <ServiceManagement />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/search-mechanics" 
            element={
              <RoleProtectedRoute allowedRoles={['cliente']}>
                <MechanicSearch />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Rutas para mecánicos */}
          <Route 
            path="/mechanic-dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['mecanico']}>
                <MechanicDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/mechanic-profile" 
            element={
              <RoleProtectedRoute allowedRoles={['mecanico']}>
                <MechanicProfileComponent />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Rutas para administradores */}
          <Route 
            path="/admin" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador']}>
                <UserManagement />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador']}>
                <UserManagement />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/user-management" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador']}>
                <UserManagement />
              </RoleProtectedRoute>
            } 
          />

          {/* Rutas específicas para roles */}
          <Route 
            path="/client" 
            element={
              <RoleProtectedRoute allowedRoles={['cliente']}>
                <VehicleManagement />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/client/vehicles" 
            element={
              <RoleProtectedRoute allowedRoles={['cliente']}>
                <VehicleManagement />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/client/services" 
            element={
              <RoleProtectedRoute allowedRoles={['cliente']}>
                <ServiceManagement />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/mechanic" 
            element={
              <RoleProtectedRoute allowedRoles={['mecanico']}>
                <MechanicDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/mechanic/services" 
            element={
              <RoleProtectedRoute allowedRoles={['mecanico']}>
                <MechanicDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/mechanic/profile" 
            element={
              <RoleProtectedRoute allowedRoles={['mecanico']}>
                <MechanicProfileComponent />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Dashboard general (compartido) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        {/* ChatBot global - aparece en todas las páginas */}
        <ChatBot />
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
