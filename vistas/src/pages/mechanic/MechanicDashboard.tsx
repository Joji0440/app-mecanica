import React, { useState, useEffect } from 'react';
import { serviceRequestAPI, mechanicAPI } from '../../services/api';
import type { ExtendedServiceRequest, MechanicProfile } from '../../types';
import NavigationHeader from '../../components/NavigationHeader';
import useLocation from '../../hooks/useLocation';
import { 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Wrench,
  Eye,
  CheckSquare,
  X,
  Loader,
  Car,
  MessageCircle,
  Navigation,
  Target
} from 'lucide-react';

interface DashboardStats {
  pending_requests: number;
  active_services: number;
  completed_services: number;
  total_earnings: number;
  average_rating: number;
  total_reviews: number;
}

interface DistanceInfo {
  distance: {
    km: number;
    formatted: string;
  };
  radius_validation: {
    status: string;
    within_radius: boolean;
    percentage: number;
    message: string;
  };
  travel_radius_km: number;
}

const MechanicDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    pending_requests: 0,
    active_services: 0,
    completed_services: 0,
    total_earnings: 0,
    average_rating: 0,
    total_reviews: 0
  });
  
  const [pendingRequests, setPendingRequests] = useState<ExtendedServiceRequest[]>([]);
  const [activeServices, setActiveServices] = useState<ExtendedServiceRequest[]>([]);
  const [recentServices, setRecentServices] = useState<ExtendedServiceRequest[]>([]);
  const [profile, setProfile] = useState<MechanicProfile | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ExtendedServiceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  
  // Estados para cálculo de distancia
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const [serviceDistances, setServiceDistances] = useState<{[key: number]: number}>({});

  // Hook de ubicación
  const {
    mechanicLocation,
  } = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Iniciando fetchDashboardData...');
      
      // Obtener perfil del mecánico
      const profileResult = await mechanicAPI.getProfile();
      console.log('👤 Perfil del mecánico:', profileResult);
      console.log('👤 Perfil completo:', profileResult.data);
      console.log('👤 User ID del mecánico:', profileResult.data?.user_id);
      console.log('👤 Profile ID del mecánico:', profileResult.data?.id);
      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      // Obtener solicitudes disponibles (pendientes sin asignar)
      console.log('📋 Obteniendo solicitudes disponibles...');
      const availableResult = await serviceRequestAPI.getAvailableRequests();
      console.log('📋 Respuesta de getAvailableRequests:', availableResult);
      // Las solicitudes están en availableResult.data.data (estructura paginada de Laravel)
      const availableServices = (availableResult.data as any)?.data || availableResult.data || [];
      console.log('📋 Solicitudes disponibles procesadas:', availableServices);
      
      // Obtener todas las solicitudes del mecánico para servicios activos y completados
      console.log('🔧 Obteniendo todas las solicitudes...');
      const allResult = await serviceRequestAPI.getAll();
      console.log('🔧 Respuesta de getAll:', allResult);
      const allServices = allResult.data || [];
      console.log('🔧 Todas las solicitudes procesadas:', allServices);
      
      // Filtrar solicitudes asignadas al mecánico actual
      // mechanic_id en las solicitudes corresponde al user_id, no al profile_id
      const mechanicServices = allServices.filter((s: ExtendedServiceRequest) => 
        (s as any).mechanic_id === profileResult.data?.user_id
      );
      console.log('🎯 Servicios del mecánico filtrados:', mechanicServices);
      console.log('🔍 Comparando mechanic_id con user_id:', {
        solicitudes: allServices.map(s => ({ id: s.id, mechanic_id: (s as any).mechanic_id })),
        user_id_mecanico: profileResult.data?.user_id
      });
      
      // Los servicios activos incluyen tanto 'accepted' como 'in_progress'
      const active = mechanicServices.filter((s: ExtendedServiceRequest) => 
        s.status === 'accepted' || s.status === 'in_progress'
      );
      const recent = mechanicServices.filter((s: ExtendedServiceRequest) => s.status === 'completed').slice(0, 5);
      
      console.log('⚡ Servicios activos (accepted + in_progress):', active);
      console.log('✅ Servicios recientes (completed):', recent);
      
      setPendingRequests(availableServices);
      setActiveServices(active);
      setRecentServices(recent);

      // Calcular distancias de las solicitudes disponibles
      if (availableServices.length > 0 && mechanicLocation) {
        await calculateMultipleDistances(availableServices);
      }

      // Calcular estadísticas
      const completed = mechanicServices.filter((s: ExtendedServiceRequest) => s.status === 'completed');
      const totalEarnings = completed.reduce((sum: number, service: ExtendedServiceRequest) => {
        return sum + (service.final_cost || 0);
      }, 0);

      console.log('📊 Estadísticas calculadas:', {
        pending_requests: availableServices.length,
        active_services: active.length,
        completed_services: completed.length,
        total_earnings: totalEarnings
      });

      setStats({
        pending_requests: availableServices.length,
        active_services: active.length,
        completed_services: completed.length,
        total_earnings: totalEarnings,
        average_rating: parseFloat(profileResult.data?.rating_average || '0'),
        total_reviews: profileResult.data?.total_reviews || 0
      });

    } catch (err: any) {
      console.error('❌ Error en fetchDashboardData:', err);
      setError('Error al cargar datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      setIsLoading(true);
      await serviceRequestAPI.acceptRequest(requestId);
      await fetchDashboardData();
    } catch (err: any) {
      setError('Error al aceptar solicitud: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      setIsLoading(true);
      await serviceRequestAPI.rejectRequest(requestId);
      await fetchDashboardData();
    } catch (err: any) {
      setError('Error al rechazar solicitud: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartService = async (requestId: number) => {
    try {
      setIsLoading(true);
      await serviceRequestAPI.updateStatus(requestId, 'in_progress');
      await fetchDashboardData();
    } catch (err: any) {
      setError('Error al iniciar servicio: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteService = async (requestId: number) => {
    try {
      setIsLoading(true);
      await serviceRequestAPI.updateStatus(requestId, 'completed');
      await fetchDashboardData();
    } catch (err: any) {
      setError('Error al completar servicio: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para calcular distancias de múltiples servicios
  const calculateMultipleDistances = async (services: ExtendedServiceRequest[]) => {
    try {
      const distances: {[key: number]: number} = {};
      
      for (const service of services) {
        if (service.location_latitude && service.location_longitude) {
          try {
            const response = await serviceRequestAPI.calculateDistance(service.id);
            if (response.data && response.data.distance) {
              distances[service.id] = response.data.distance.km;
            }
          } catch (err) {
            console.error(`Error calculando distancia para servicio ${service.id}:`, err);
          }
        }
      }
      
      setServiceDistances(distances);
    } catch (err) {
      console.error('Error calculando distancias múltiples:', err);
    }
  };

  // Función para calcular distancia
  const calculateServiceDistance = async (serviceId: number) => {
    try {
      setCalculatingDistance(true);
      setDistanceError(null);
      
      console.log('🧮 Calculando distancia para servicio:', serviceId);
      
      const response = await serviceRequestAPI.calculateDistance(serviceId);
      
      console.log('✅ Respuesta de cálculo de distancia:', response);
      
      if (response.data) {
        setDistanceInfo(response.data);
      } else {
        setDistanceError('No se pudo obtener información de distancia');
      }
    } catch (err: any) {
      console.error('❌ Error calculando distancia:', err);
      setDistanceError(err.response?.data?.message || 'Error al calcular distancia');
    } finally {
      setCalculatingDistance(false);
    }
  };

  // Calcular distancia cuando se selecciona un servicio
  useEffect(() => {
    if (selectedRequest && selectedRequest.id) {
      console.log('🎯 Servicio seleccionado, calculando distancia...', selectedRequest.id);
      calculateServiceDistance(selectedRequest.id);
    } else {
      // Limpiar información de distancia cuando no hay servicio seleccionado
      setDistanceInfo(null);
      setDistanceError(null);
    }
  }, [selectedRequest]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-800', bg: 'bg-yellow-100' },
    accepted: { label: 'Aceptado', color: 'text-blue-800', bg: 'bg-blue-100' },
    in_progress: { label: 'En Progreso', color: 'text-indigo-800', bg: 'bg-indigo-100' },
    completed: { label: 'Completado', color: 'text-green-800', bg: 'bg-green-100' },
    cancelled: { label: 'Cancelado', color: 'text-red-800', bg: 'bg-red-100' },
    rejected: { label: 'Rechazado', color: 'text-gray-800', bg: 'bg-gray-100' }
  };

  const urgencyLevels = [
    { value: 'baja', label: 'Baja', color: 'text-green-600' },
    { value: 'media', label: 'Media', color: 'text-yellow-600' },
    { value: 'alta', label: 'Alta', color: 'text-orange-600' },
    { value: 'critica', label: 'Crítica', color: 'text-red-600' }
  ];

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Dashboard Mecánico" showBack={true} customBackPath="/" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel Mecánico</h1>
              <p className="text-gray-600">
                Bienvenido de vuelta, {profile?.user?.name}
              </p>
            </div>
        
        {profile && (
          <div className="flex items-center space-x-2">
            <div className="flex">{getRatingStars(parseFloat(profile.rating_average))}</div>
            <span className="text-sm text-gray-600">
              {profile.rating_average} ({profile.total_reviews} reseñas)
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Solicitudes Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_requests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Wrench className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Servicios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active_services}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed_services}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">${stats.total_earnings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-600" />
              Solicitudes Disponibles
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </h2>
            {pendingRequests.length > 2 && (
              <p className="text-xs text-gray-500 mt-1">
                Mostrando 2 de {pendingRequests.length} solicitudes. Desplázate para ver más.
              </p>
            )}
          </div>
          
          {/* Contenedor con scroll limitado a 2 servicios */}
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div key={request.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyLevels.find(u => u.value === request.urgency_level)?.color}`}>
                        {urgencyLevels.find(u => u.value === request.urgency_level)?.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                    
                    {/* Información del Vehículo */}
                    {request.vehicle && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                        <div className="flex items-center text-xs text-blue-800">
                          <Car className="h-3 w-3 mr-1" />
                          <span className="font-medium">
                            {request.vehicle.make} {request.vehicle.model} {request.vehicle.year}
                          </span>
                          {request.vehicle.license_plate && (
                            <span className="ml-2 font-mono bg-blue-100 px-1 rounded">
                              {request.vehicle.license_plate}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-blue-600 mt-1 space-x-2">
                          <span>⚙️ {request.vehicle.transmission_type}</span>
                          <span>⛽ {request.vehicle.fuel_type}</span>
                          {request.vehicle.mileage && (
                            <span>📊 {request.vehicle.mileage.toLocaleString()} km</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Información de Distancia */}
                    {mechanicLocation && request.location_address && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                        <div className="flex items-center text-xs text-green-800">
                          <Navigation className="h-3 w-3 mr-1" />
                          <span className="font-medium">Ubicación del servicio</span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{request.location_address}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="flex items-center">
                              <Target className="h-3 w-3 mr-1" />
                              {serviceDistances[request.id] ? (
                                <span className="font-medium text-green-700">
                                  Distancia: {serviceDistances[request.id].toFixed(1)} km
                                </span>
                              ) : (
                                'Calculando distancia...'
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              Radio: {mechanicLocation.travel_radius_km || 10} km
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {request.client?.name}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {request.estimated_duration_hours}h
                      </span>
                      {request.budget_max > 0 && (
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${request.budget_max}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </button>
                      
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(Number(request.id))}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckSquare className="h-3 w-3" />
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRejectRequest(Number(request.id))}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      )}
                      
                      {request.status === 'accepted' && (
                        <button
                          onClick={() => handleStartService(Number(request.id))}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
                        >
                          Iniciar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay solicitudes disponibles</p>
                  <p className="text-xs mt-1">Solo se muestran solicitudes de las últimas 5 horas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Services */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-indigo-600" />
              Servicios Activos
            </h2>
          </div>
          
          <div className="divide-y">
            {activeServices.length > 0 ? (
              activeServices.map((service) => (
                <div key={service.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{service.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.status === 'accepted' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {service.status === 'accepted' ? 'Aceptado' : 'En Progreso'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                  
                  {/* Información del Vehículo */}
                  {service.vehicle && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 mb-3">
                      <div className="flex items-center text-xs text-indigo-800">
                        <Car className="h-3 w-3 mr-1" />
                        <span className="font-medium">
                          {service.vehicle.make} {service.vehicle.model} {service.vehicle.year}
                        </span>
                        {service.vehicle.license_plate && (
                          <span className="ml-2 font-mono bg-indigo-100 px-1 rounded">
                            {service.vehicle.license_plate}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-indigo-600 mt-1 space-x-2">
                        <span>⚙️ {service.vehicle.transmission_type}</span>
                        <span>⛽ {service.vehicle.fuel_type}</span>
                        {service.vehicle.mileage && (
                          <span>📊 {service.vehicle.mileage.toLocaleString()} km</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {service.client?.name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(service.created_at)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(service);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Ver Detalles
                    </button>
                    
                    {service.status === 'accepted' && (
                      <button
                        onClick={() => handleStartService(Number(service.id))}
                        className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 flex items-center gap-1"
                      >
                        <Wrench className="h-3 w-3" />
                        Iniciar
                      </button>
                    )}
                    
                    {service.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteService(Number(service.id))}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Completar
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No hay servicios activos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Services */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Servicios Recientes Completados
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentServices.length > 0 ? (
                recentServices.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{service.title}</div>
                        <div className="text-sm text-gray-500">{service.service_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.client?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(service.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.estimated_duration_hours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${service.final_cost || service.budget_max || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No hay servicios completados recientes</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Detalle de la Solicitud</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Request Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedRequest.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[selectedRequest.status]?.bg} ${statusLabels[selectedRequest.status]?.color}`}>
                      {statusLabels[selectedRequest.status]?.label}
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                {/* Request Details Grid - 3 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Información del Cliente */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Información del Cliente</h4>
                    
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Cliente</div>
                        <div className="font-medium">{selectedRequest.client?.name}</div>
                        <div className="text-sm text-gray-500">{selectedRequest.client?.email}</div>
                      </div>
                    </div>

                    {selectedRequest.location_address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Ubicación</div>
                          <div className="font-medium">{selectedRequest.location_address}</div>
                        </div>
                      </div>
                    )}

                    {selectedRequest.location_notes && (
                      <div className="flex items-start">
                        <MessageCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Notas de ubicación</div>
                          <div className="font-medium">{selectedRequest.location_notes}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Duración estimada</div>
                        <div className="font-medium">{selectedRequest.estimated_duration_hours} horas</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Presupuesto máximo</div>
                        <div className="font-medium">${selectedRequest.budget_max || 'No especificado'}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Nivel de urgencia</div>
                        <div className={`font-medium ${urgencyLevels.find(u => u.value === selectedRequest.urgency_level)?.color}`}>
                          {urgencyLevels.find(u => u.value === selectedRequest.urgency_level)?.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Fecha de creación</div>
                        <div className="font-medium">{formatDate(selectedRequest.created_at)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Información del Vehículo */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Vehículo</h4>
                    
                    {selectedRequest.vehicle ? (
                      <>
                        <div className="flex items-center">
                          <Car className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm text-gray-600">Vehículo</div>
                            <div className="font-medium">
                              {selectedRequest.vehicle.make} {selectedRequest.vehicle.model} {selectedRequest.vehicle.year}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-mono">🏷️</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Placa</div>
                            <div className="font-medium">{selectedRequest.vehicle.license_plate}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">🎨</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Color</div>
                            <div className="font-medium capitalize">{selectedRequest.vehicle.color}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">⚙️</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Transmisión</div>
                            <div className="font-medium capitalize">{selectedRequest.vehicle.transmission_type}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">⛽</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Combustible</div>
                            <div className="font-medium capitalize">{selectedRequest.vehicle.fuel_type}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">📊</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Kilometraje</div>
                            <div className="font-medium">{selectedRequest.vehicle.mileage?.toLocaleString() || 'No especificado'} km</div>
                          </div>
                        </div>

                        {selectedRequest.vehicle.engine_size && (
                          <div className="flex items-center">
                            <div className="h-5 w-5 mr-3 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">🔧</span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Motor</div>
                              <div className="font-medium">{selectedRequest.vehicle.engine_size}</div>
                            </div>
                          </div>
                        )}

                        {selectedRequest.vehicle.notes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-800 font-medium mb-1">Notas del vehículo:</div>
                            <div className="text-sm text-blue-700">{selectedRequest.vehicle.notes}</div>
                          </div>
                        )}

                        <button
                          onClick={() => setShowVehicleDetails(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Ver detalles completos del vehículo →
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No se especificó vehículo para este servicio
                      </div>
                    )}
                  </div>

                  {/* Información del Servicio */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Ubicación y Distancia</h4>
                    
                    {selectedRequest.location_address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Dirección</div>
                          <div className="font-medium">{selectedRequest.location_address}</div>
                        </div>
                      </div>
                    )}

                    {selectedRequest.location_notes && (
                      <div className="flex items-start">
                        <MessageCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Notas de ubicación</div>
                          <div className="font-medium text-sm">{selectedRequest.location_notes}</div>
                        </div>
                      </div>
                    )}

                    {/* Información de distancia */}
                    {mechanicLocation && selectedRequest.location_address ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <Navigation className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">Información de viaje</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-green-700">Tu ubicación:</span>
                            <span className="text-green-600 text-xs">{mechanicLocation.address || 'Ubicación configurada'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-700">Radio de viaje:</span>
                            <span className="text-green-600 font-medium">{mechanicLocation.travel_radius_km || 10} km</span>
                          </div>
                          <div className="pt-2 border-t border-green-200">
                            {calculatingDistance ? (
                              <div className="flex items-center text-green-700 text-xs">
                                <Loader className="h-3 w-3 animate-spin mr-1" />
                                Calculando distancia...
                              </div>
                            ) : distanceError ? (
                              <div className="text-red-600 text-xs">
                                ❌ {distanceError}
                              </div>
                            ) : distanceInfo ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-green-700">Distancia:</span>
                                  <span className="text-green-800 font-medium">{distanceInfo.distance.formatted}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-green-700">Estado:</span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    distanceInfo.radius_validation.status === 'optimal' ? 'bg-green-100 text-green-800' :
                                    distanceInfo.radius_validation.status === 'good' ? 'bg-blue-100 text-blue-800' :
                                    distanceInfo.radius_validation.status === 'limit' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {distanceInfo.radius_validation.percentage}% del radio
                                  </span>
                                </div>
                                <div className="text-green-600 text-xs mt-1">
                                  {distanceInfo.radius_validation.message}
                                </div>
                              </div>
                            ) : (
                              <div className="text-green-700 text-xs">
                                📊 Información de distancia no disponible
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : !mechanicLocation ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center mb-1">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium text-yellow-800">Ubicación no configurada</span>
                        </div>
                        <div className="text-xs text-yellow-700">
                          Configure su ubicación en el perfil para ver distancias
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-sm text-gray-600">
                          Coordenadas del servicio no disponibles
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <div className="h-5 w-5 mr-3 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">🔧</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Tipo de servicio</div>
                        <div className="font-medium capitalize">{selectedRequest.service_type}</div>
                      </div>
                    </div>

                    {selectedRequest.is_emergency && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center text-red-800">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="font-medium">🚨 EMERGENCIA</span>
                        </div>
                        <div className="text-sm text-red-600 mt-1">
                          Este servicio requiere atención inmediata
                        </div>
                      </div>
                    )}

                    {selectedRequest.preferred_date && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Fecha preferida</div>
                          <div className="font-medium">{formatDate(selectedRequest.preferred_date)}</div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 border rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-2">Estado del servicio:</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[selectedRequest.status]?.bg} ${statusLabels[selectedRequest.status]?.color}`}>
                        {statusLabels[selectedRequest.status]?.label}
                      </span>
                    </div>

                    {selectedRequest.final_cost && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm text-green-800 font-medium">Costo final:</div>
                        <div className="text-lg font-bold text-green-900">${selectedRequest.final_cost}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-6 border-t">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleRejectRequest(Number(selectedRequest.id));
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => {
                          handleAcceptRequest(Number(selectedRequest.id));
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Aceptar Solicitud
                      </button>
                    </>
                  )}
                  
                  {selectedRequest.status === 'accepted' && (
                    <button
                      onClick={() => {
                        handleStartService(Number(selectedRequest.id));
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Iniciar Servicio
                    </button>
                  )}
                  
                  {selectedRequest.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        handleCompleteService(Number(selectedRequest.id));
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Marcar Completado
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedRequest?.vehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Car className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Detalles Completos del Vehículo</h2>
                </div>
                <button
                  onClick={() => setShowVehicleDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header del vehículo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {selectedRequest.vehicle.make} {selectedRequest.vehicle.model} {selectedRequest.vehicle.year}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Placa:</span>
                      <span className="ml-2 font-mono">{selectedRequest.vehicle.license_plate}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Color:</span>
                      <span className="ml-2 capitalize">{selectedRequest.vehicle.color}</span>
                    </div>
                  </div>
                </div>

                {/* Especificaciones técnicas */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Especificaciones Técnicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">⚙️</span>
                      <div>
                        <div className="text-sm text-gray-600">Transmisión</div>
                        <div className="font-medium capitalize">{selectedRequest.vehicle.transmission_type}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">⛽</span>
                      <div>
                        <div className="text-sm text-gray-600">Tipo de combustible</div>
                        <div className="font-medium capitalize">{selectedRequest.vehicle.fuel_type}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">📊</span>
                      <div>
                        <div className="text-sm text-gray-600">Kilometraje</div>
                        <div className="font-medium">{selectedRequest.vehicle.mileage?.toLocaleString() || 'No especificado'} km</div>
                      </div>
                    </div>

                    {selectedRequest.vehicle.engine_size && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-3">🔧</span>
                        <div>
                          <div className="text-sm text-gray-600">Motor</div>
                          <div className="font-medium">{selectedRequest.vehicle.engine_size}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">🗓️</span>
                      <div>
                        <div className="text-sm text-gray-600">Registrado</div>
                        <div className="font-medium">{formatDate(selectedRequest.vehicle.created_at)}</div>
                      </div>
                    </div>

                    {selectedRequest.vehicle.last_service_date && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-3">🔧</span>
                        <div>
                          <div className="text-sm text-gray-600">Último servicio</div>
                          <div className="font-medium">{formatDate(selectedRequest.vehicle.last_service_date)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* VIN */}
                {selectedRequest.vehicle.vin && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Información Adicional</h4>
                    <div className="bg-gray-50 border rounded-lg p-3">
                      <div className="text-sm text-gray-600">Número VIN</div>
                      <div className="font-mono text-sm bg-white border rounded px-2 py-1 mt-1">
                        {selectedRequest.vehicle.vin}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas del vehículo */}
                {selectedRequest.vehicle.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notas del Propietario</h4>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="text-sm text-amber-800">{selectedRequest.vehicle.notes}</div>
                    </div>
                  </div>
                )}

                {/* Recomendaciones para el mecánico */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">💡 Información Útil para el Servicio</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• <strong>Transmisión {selectedRequest.vehicle.transmission_type}:</strong> Considerar herramientas específicas</p>
                    <p>• <strong>Combustible {selectedRequest.vehicle.fuel_type}:</strong> Verificar compatibilidad de repuestos</p>
                    <p>• <strong>Kilometraje:</strong> {selectedRequest.vehicle.mileage?.toLocaleString() || 'No especificado'} km - evaluar desgaste</p>
                    {selectedRequest.vehicle.engine_size && (
                      <p>• <strong>Motor {selectedRequest.vehicle.engine_size}:</strong> Preparar herramientas adecuadas</p>
                    )}
                  </div>
                </div>

                {/* Estado del vehículo */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado del vehículo:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedRequest.vehicle.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedRequest.vehicle.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowVehicleDetails(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default MechanicDashboard;
