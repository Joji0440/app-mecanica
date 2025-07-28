import React, { useState, useEffect } from 'react';
import { serviceRequestAPI, vehicleAPI } from '../../services/api';
import type { ExtendedServiceRequest, ServiceRequestCreate, Vehicle } from '../../types';
import NavigationHeader from '../../components/NavigationHeader';
import ServiceDiagnosticWizard from '../../components/ServiceDiagnosticWizard';
import LocationSelector from '../../components/shared/LocationSelector';
import ChatBot from '../../components/ChatBot';
import { 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  MessageCircle,
  Loader,
  Trash2,
  Brain,
  Settings,
  Car,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

interface ServiceRequestFilters {
  status?: string;
  search?: string;
}

// Helper function to check if a pending service should be shown (less than 5 hours old)
const shouldShowPendingService = (service: ExtendedServiceRequest): boolean => {
  if (service.status !== 'pending') {
    return true; // Always show non-pending services
  }
  
  const currentTime = new Date();
  const fiveHoursAgo = new Date(currentTime.getTime() - (5 * 60 * 60 * 1000));
  const serviceCreatedAt = new Date(service.created_at);
  
  return serviceCreatedAt > fiveHoursAgo;
};

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<ExtendedServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGuidedWizard, setShowGuidedWizard] = useState(false);
  const [selectedService, setSelectedService] = useState<ExtendedServiceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Estados para modo experto mejorado
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showExpertWarning, setShowExpertWarning] = useState(true);
  const [acceptedExpertTerms, setAcceptedExpertTerms] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  
  const [filters, setFilters] = useState<ServiceRequestFilters>({});
  
  const [createData, setCreateData] = useState<ServiceRequestCreate>({
    title: '',
    description: '',
    service_type: 'diagnostic',
    urgency_level: 'media',
    estimated_duration_hours: 1,
    budget_max: 0,
    is_emergency: false,
    preferred_date: '',
    location_address: '',
    location_notes: '',
    location_latitude: undefined,
    location_longitude: undefined,
    vehicle_id: null,
    preferred_mechanic_id: null
  });

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    accepted: { label: 'Aceptado', color: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    in_progress: { label: 'En Progreso', color: 'text-indigo-800 dark:text-indigo-200', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
    completed: { label: 'Completado', color: 'text-green-800 dark:text-green-200', bg: 'bg-green-100 dark:bg-green-900/20' },
    cancelled: { label: 'Cancelado', color: 'text-red-800 dark:text-red-200', bg: 'bg-red-100 dark:bg-red-900/20' },
    rejected: { label: 'Rechazado', color: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-100 dark:bg-gray-900/20' }
  };

  const serviceTypes = [
    { value: 'emergency', label: 'Emergencia' },
    { value: 'scheduled', label: 'Programado' },
    { value: 'diagnostic', label: 'Diagnóstico' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'repair', label: 'Reparación' }
  ];

  const urgencyLevels = [
    { value: 'baja', label: 'Baja', color: 'text-green-600' },
    { value: 'media', label: 'Media', color: 'text-blue-600' },
    { value: 'alta', label: 'Alta', color: 'text-orange-600' },
    { value: 'critica', label: 'Crítica', color: 'text-red-600' }
  ];

  useEffect(() => {
    fetchServices();
    fetchVehicles();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const result = await serviceRequestAPI.getAll();
      
      // Filtrar servicios pendientes con más de 5 horas
      const filteredServices = (result.data || []).filter(shouldShowPendingService);
      
      setServices(filteredServices);
    } catch (err: any) {
      setError('Error al cargar servicios: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const result = await vehicleAPI.getVehicles();
      setVehicles(result || []);
    } catch (err: any) {
      console.error('Error al cargar vehículos:', err);
      // No mostramos error para vehículos ya que no es crítico
    }
  };

  const handleCreateService = async () => {
    if (!createData.description.trim() || !createData.title.trim()) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    // DEBUG: Verificar qué datos se están enviando
    console.log('🚀 FRONTEND - Enviando datos de servicio:', {
      title: createData.title,
      description: createData.description,
      location_address: createData.location_address,
      location_latitude: createData.location_latitude,
      location_longitude: createData.location_longitude,
      service_type: createData.service_type,
      urgency_level: createData.urgency_level,
      full_create_data: createData
    });

    try {
      setIsLoading(true);
      await serviceRequestAPI.create(createData);
      await fetchServices();
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err: any) {
      setError('Error al crear servicio: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;

    try {
      setIsLoading(true);
      await serviceRequestAPI.delete(id);
      await fetchServices();
    } catch (err: any) {
      setError('Error al eliminar servicio: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelService = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este servicio?')) return;

    try {
      setIsLoading(true);
      await serviceRequestAPI.updateStatus(id, 'cancelled');
      await fetchServices();
    } catch (err: any) {
      setError('Error al cancelar servicio: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateData({
      title: '',
      description: '',
      service_type: 'diagnostic',
      urgency_level: 'media',
      estimated_duration_hours: 1,
      budget_max: 0,
      is_emergency: false,
      preferred_date: '',
      location_address: '',
      location_notes: '',
      location_latitude: undefined,
      location_longitude: undefined,
      vehicle_id: null,
      preferred_mechanic_id: null
    });
    setShowExpertWarning(true);
    setAcceptedExpertTerms(false);
  };

  const handleExpertModeOpen = () => {
    setShowCreateModal(true);
    setShowExpertWarning(true);
    setAcceptedExpertTerms(false);
  };

  const handleLocationUpdate = (location: string, coordinates?: { lat: number; lng: number }) => {
    console.log('📍 FRONTEND - handleLocationUpdate EJECUTADO:', {
      function_called: 'handleLocationUpdate',
      location,
      coordinates,
      has_coordinates: !!coordinates,
      lat: coordinates?.lat,
      lng: coordinates?.lng,
      timestamp: new Date().toISOString()
    });
    
    setCreateData(prev => {
      const newData = {
        ...prev,
        location_address: location,
        location_latitude: coordinates?.lat,
        location_longitude: coordinates?.lng
      };
      
      console.log('🔄 FRONTEND - Actualizando createData:', {
        previous_data: {
          location_address: prev.location_address,
          location_latitude: prev.location_latitude,
          location_longitude: prev.location_longitude
        },
        new_data: {
          location_address: newData.location_address,
          location_latitude: newData.location_latitude,
          location_longitude: newData.location_longitude
        }
      });
      
      return newData;
    });
  };

  const handleLocationNotesChange = (notes: string) => {
    setCreateData(prev => ({
      ...prev,
      location_notes: notes
    }));
  };

  const handleGuidedDiagnosisComplete = async (diagnosticData: any) => {
    try {
      setIsLoading(true);
      
      console.log('🎯 FRONTEND - Diagnóstico guiado completado:', {
        diagnosticData,
        finalRequest: diagnosticData.finalRequest,
        location: diagnosticData.finalRequest?.location,
        coordinates: diagnosticData.finalRequest?.coordinates
      });
      
      // Convertir los datos del diagnóstico guiado al formato esperado por la API
      const serviceRequest: ServiceRequestCreate = {
        title: diagnosticData.diagnosis?.problems[0]?.problem.name || `Diagnóstico: ${diagnosticData.category}`,
        description: `Diagnóstico asistido por IA:\n\nProblema identificado: ${diagnosticData.diagnosis?.problems[0]?.problem.name}\n\nDescripción: ${diagnosticData.diagnosis?.problems[0]?.problem.description}\n\nSíntomas reportados: ${diagnosticData.symptoms.length} síntomas\nVehículo: ${diagnosticData.vehicleInfo.make} ${diagnosticData.vehicleInfo.model} ${diagnosticData.vehicleInfo.year}\n\nRecomendaciones del sistema:\n${diagnosticData.diagnosis?.recommendations?.join('\n') || 'Contactar mecánico para revisión'}`,
        service_type: 'diagnostic',
        urgency_level: mapUrgencyLevel(diagnosticData.diagnosis?.urgencyLevel || 'medium'),
        estimated_duration_hours: diagnosticData.diagnosis?.problems[0]?.problem.estimatedTime?.average || 2,
        budget_max: diagnosticData.finalRequest.maxBudget || diagnosticData.diagnosis?.estimatedCost?.max || 0,
        is_emergency: diagnosticData.diagnosis?.urgencyLevel === 'emergency',
        preferred_date: '',
        location_address: diagnosticData.finalRequest.location,
        location_notes: `Diagnóstico guiado - Confianza: ${Math.round((diagnosticData.diagnosis?.overallConfidence || 0) * 100)}%`,
        location_latitude: diagnosticData.finalRequest?.coordinates?.lat,
        location_longitude: diagnosticData.finalRequest?.coordinates?.lng,
        vehicle_id: diagnosticData.vehicle_id || null,
        preferred_mechanic_id: null
      };

      console.log('🚀 FRONTEND - Creando servicio desde diagnóstico guiado:', {
        serviceRequest,
        coordinates_included: {
          latitude: serviceRequest.location_latitude,
          longitude: serviceRequest.location_longitude,
          has_coordinates: !!(serviceRequest.location_latitude && serviceRequest.location_longitude)
        }
      });

      await serviceRequestAPI.create(serviceRequest);
      await fetchServices();
      setShowGuidedWizard(false);
    } catch (err: any) {
      setError('Error al crear servicio desde diagnóstico: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const mapUrgencyLevel = (aiUrgency: string): 'baja' | 'media' | 'alta' | 'critica' => {
    switch (aiUrgency) {
      case 'emergency': return 'critica';
      case 'high': return 'alta';
      case 'medium': return 'media';
      case 'low': return 'baja';
      default: return 'media';
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = !filters.search || 
      service.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      service.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || service.status === filters.status;
    
    // Filtrar servicios pendientes con más de 5 horas (verificación adicional)
    const isValidService = shouldShowPendingService(service);
    
    return matchesSearch && matchesStatus && isValidService;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader title="Mis Servicios" showBack={true} />
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando servicios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader title="Mis Servicios" showBack={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Servicios</h1>
              <p className="text-gray-600 dark:text-gray-300">Gestiona tus solicitudes de servicio automotriz</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowGuidedWizard(true)}
                className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2 transition-colors"
              >
                <Brain className="h-4 w-4" />
                Diagnóstico Guiado
              </button>
              
              <button
                onClick={handleExpertModeOpen}
                className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 flex items-center gap-2 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Modo Experto
              </button>
            </div>
          </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([status, config]) => (
              <option key={status} value={status}>{config.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setFilters({})}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Limpiar Filtros
          </button>
        </div>
        
        {/* Información de optimización */}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Los servicios pendientes con más de 5 horas se ocultan automáticamente para optimizar el rendimiento
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{service.title}</h3>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusLabels[service.status]?.bg} ${statusLabels[service.status]?.color}`}>
                    {statusLabels[service.status]?.label}
                  </span>
                </div>
                
                {service.is_emergency && (
                  <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                    🚨 Emergencia
                  </span>
                )}
              </div>

              {/* Service Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Creado: {formatDate(service.created_at)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <span className={`font-medium ${urgencyLevels.find(u => u.value === service.urgency_level)?.color || 'text-gray-600 dark:text-gray-300'}`}>
                    Urgencia: {urgencyLevels.find(u => u.value === service.urgency_level)?.label || 'Media'}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{service.estimated_duration_hours}h estimadas</span>
                </div>

                {service.budget_max > 0 && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Presupuesto máx: ${service.budget_max}</span>
                  </div>
                )}

                {service.location_address && (
                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span className="line-clamp-2">{service.location_address}</span>
                  </div>
                )}

                {service.mechanic && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <User className="h-4 w-4 mr-2" />
                    <span>Mecánico: {service.mechanic?.user?.name}</span>
                  </div>
                )}

                {/* Información del Vehículo */}
                {service.vehicle && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Car className="h-4 w-4 mr-2" />
                    <span className="line-clamp-1">
                      {service.vehicle.make} {service.vehicle.model} {service.vehicle.year}
                      {service.vehicle.license_plate && ` - ${service.vehicle.license_plate}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{service.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowDetailModal(true);
                  }}
                  className="flex-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/30 flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </button>

                {service.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleCancelService(Number(service.id))}
                      className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/30"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(Number(service.id))}
                      className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay servicios</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {filters.search || filters.status 
              ? 'No se encontraron servicios con los filtros seleccionados'
              : 'Aún no has creado ninguna solicitud de servicio'
            }
          </p>
          {!filters.search && !filters.status && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800"
            >
              Crear Primera Solicitud
            </button>
          )}
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Modo Experto - Nueva Solicitud</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Aviso de Responsabilidad para Modo Experto */}
              {showExpertWarning && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                        ⚠️ Importante: Responsabilidades del Modo Experto
                      </h3>
                      <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                        <p>
                          <strong>El Modo Experto está diseñado únicamente para usuarios con conocimiento técnico automotriz.</strong>
                        </p>
                        <p>
                          Al utilizar este modo, usted declara que:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Posee conocimientos técnicos sobre mecánica automotriz</li>
                          <li>Ha identificado correctamente la falla o problema del vehículo</li>
                          <li>Comprende las implicaciones de crear solicitudes incorrectas</li>
                        </ul>
                        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded p-3 mt-3">
                          <p className="font-medium text-amber-800 dark:text-amber-200">
                            ⚠️ Advertencia sobre solicitudes incorrectas:
                          </p>
                          <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                            Las solicitudes basadas en diagnósticos erróneos, información falsa o descripciones 
                            inexactas pueden resultar en: <strong>costos adicionales de diagnóstico, 
                            tarifas por servicios no solicitados, suspensión temporal o permanente de la cuenta, 
                            y responsabilidad por gastos innecesarios del mecánico.</strong>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={acceptedExpertTerms}
                            onChange={(e) => setAcceptedExpertTerms(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-amber-300 rounded"
                          />
                          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            He leído y acepto las responsabilidades del Modo Experto
                          </span>
                        </label>
                        <button
                          onClick={() => setShowExpertWarning(false)}
                          disabled={!acceptedExpertTerms}
                          className="bg-amber-600 dark:bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-700 dark:hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario principal - solo visible después de aceptar términos */}
              {!showExpertWarning && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreateService(); }}>
                  
                  {/* Selección de Vehículo */}
                  {vehicles.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-200 mb-3">
                        <Car className="h-5 w-5" />
                        Seleccionar Vehículo (Opcional)
                      </h3>
                      <select
                        value={createData.vehicle_id || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, vehicle_id: e.target.value ? parseInt(e.target.value) : null }))}
                        className="w-full border border-blue-300 dark:border-blue-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Seleccionar vehículo registrado...</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} {vehicle.year} - {vehicle.license_plate}
                          </option>
                        ))}
                      </select>
                      <p className="text-blue-600 dark:text-blue-300 text-xs mt-2">
                        💡 Seleccionar un vehículo registrado ayuda al mecánico a preparar mejor el servicio
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={createData.title}
                      onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Ej: Revisión de frenos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Servicio
                    </label>
                    <select
                      value={createData.service_type}
                      onChange={(e) => setCreateData(prev => ({ ...prev, service_type: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {serviceTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={createData.description}
                    onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Describe detalladamente el problema o servicio requerido..."
                  />
                </div>

                {/* Sección de Ubicación con Mapa */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-green-800 dark:text-green-200 mb-3">
                    <MapPin className="h-5 w-5" />
                    Ubicación del Servicio
                  </h3>
                  <LocationSelector
                    value={createData.location_address || ''}
                    onChange={handleLocationUpdate}
                    onLocationNotesChange={handleLocationNotesChange}
                    locationNotes={createData.location_notes || ''}
                    placeholder="¿Dónde necesitas el servicio?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nivel de Urgencia
                    </label>
                    <select
                      value={createData.urgency_level}
                      onChange={(e) => setCreateData(prev => ({ ...prev, urgency_level: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duración Estimada (horas)
                    </label>
                    <input
                      type="number"
                      value={createData.estimated_duration_hours}
                      onChange={(e) => setCreateData(prev => ({ ...prev, estimated_duration_hours: parseInt(e.target.value) }))}
                      min="1"
                      max="48"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Presupuesto Máximo ($)
                    </label>
                    <input
                      type="number"
                      value={createData.budget_max}
                      onChange={(e) => setCreateData(prev => ({ ...prev, budget_max: parseInt(e.target.value) }))}
                      min="0"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createData.is_emergency}
                      onChange={(e) => setCreateData(prev => ({ ...prev, is_emergency: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-indigo-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Es una emergencia</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50"
                  >
                    {isLoading ? 'Creando...' : 'Crear Solicitud'}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detalle del Servicio</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Service Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedService.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[selectedService.status]?.bg} ${statusLabels[selectedService.status]?.color}`}>
                      {statusLabels[selectedService.status]?.label}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{selectedService.description}</p>
                </div>

                {/* Service Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Información del Servicio</h4>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Duración estimada</div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedService.estimated_duration_hours} horas</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Presupuesto máximo</div>
                        <div className="font-medium text-gray-900 dark:text-white">${selectedService.budget_max || 'No especificado'}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Nivel de urgencia</div>
                        <div className={`font-medium ${urgencyLevels.find(u => u.value === selectedService.urgency_level)?.color || 'text-gray-600 dark:text-gray-300'}`}>
                          {urgencyLevels.find(u => u.value === selectedService.urgency_level)?.label || 'Media'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Fecha de creación</div>
                        <div className="font-medium text-gray-900 dark:text-white">{formatDate(selectedService.created_at)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Información del Vehículo */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Vehículo</h4>
                    
                    {selectedService.vehicle ? (
                      <>
                        <div className="flex items-center">
                          <Car className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Vehículo</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {selectedService.vehicle.make} {selectedService.vehicle.model} {selectedService.vehicle.year}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-500 text-xs font-mono">🏷️</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Placa</div>
                            <div className="font-medium text-gray-900 dark:text-white">{selectedService.vehicle.license_plate}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-500 text-xs">⚙️</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Transmisión</div>
                            <div className="font-medium text-gray-900 dark:text-white capitalize">{selectedService.vehicle.transmission_type}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-500 text-xs">⛽</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Combustible</div>
                            <div className="font-medium text-gray-900 dark:text-white capitalize">{selectedService.vehicle.fuel_type}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-5 w-5 mr-3 flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-500 text-xs">📊</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Kilometraje</div>
                            <div className="font-medium text-gray-900 dark:text-white">{selectedService.vehicle.mileage?.toLocaleString() || 'No especificado'} km</div>
                          </div>
                        </div>

                        {selectedService.vehicle.notes && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">Notas del vehículo:</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">{selectedService.vehicle.notes}</div>
                          </div>
                        )}

                        <button
                          onClick={() => setShowVehicleDetails(true)}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                        >
                          Ver detalles completos del vehículo →
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No se especificó vehículo para este servicio
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Ubicación y Mecánico</h4>
                    
                    {selectedService.location_address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Dirección</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedService.location_address}</div>
                        </div>
                      </div>
                    )}

                    {selectedService.location_notes && (
                      <div className="flex items-start">
                        <MessageCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Notas de ubicación</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedService.location_notes}</div>
                        </div>
                      </div>
                    )}

                    {selectedService.mechanic && (
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Mecánico asignado</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedService.mechanic.user?.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{selectedService.mechanic.user?.email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cerrar
                  </button>
                  
                  {selectedService.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleCancelService(Number(selectedService.id));
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-800"
                      >
                        Cancelar Servicio
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteService(Number(selectedService.id));
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedService?.vehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detalles del Vehículo</h2>
                </div>
                <button
                  onClick={() => setShowVehicleDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header del vehículo */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                    {selectedService.vehicle.make} {selectedService.vehicle.model} {selectedService.vehicle.year}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Placa:</span>
                      <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">{selectedService.vehicle.license_plate}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Color:</span>
                      <span className="ml-2 capitalize text-gray-900 dark:text-gray-100">{selectedService.vehicle.color}</span>
                    </div>
                  </div>
                </div>

                {/* Especificaciones técnicas */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Especificaciones Técnicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span className="text-gray-400 dark:text-gray-500 mr-3">⚙️</span>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Transmisión</div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">{selectedService.vehicle.transmission_type}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-400 dark:text-gray-500 mr-3">⛽</span>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tipo de combustible</div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">{selectedService.vehicle.fuel_type}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-400 dark:text-gray-500 mr-3">📊</span>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Kilometraje</div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedService.vehicle.mileage?.toLocaleString() || 'No especificado'} km</div>
                      </div>
                    </div>

                    {selectedService.vehicle.engine_size && (
                      <div className="flex items-center">
                        <span className="text-gray-400 dark:text-gray-500 mr-3">🔧</span>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Motor</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedService.vehicle.engine_size}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <span className="text-gray-400 dark:text-gray-500 mr-3">🗓️</span>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Registrado</div>
                        <div className="font-medium text-gray-900 dark:text-white">{formatDate(selectedService.vehicle.created_at)}</div>
                      </div>
                    </div>

                    {selectedService.vehicle.last_service_date && (
                      <div className="flex items-center">
                        <span className="text-gray-400 dark:text-gray-500 mr-3">🔧</span>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Último servicio</div>
                          <div className="font-medium text-gray-900 dark:text-white">{formatDate(selectedService.vehicle.last_service_date)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* VIN */}
                {selectedService.vehicle.vin && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Información Adicional</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Número VIN</div>
                      <div className="font-mono text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 mt-1 text-gray-900 dark:text-white">
                        {selectedService.vehicle.vin}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas del vehículo */}
                {selectedService.vehicle.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notas del Propietario</h4>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="text-sm text-amber-800 dark:text-amber-200">{selectedService.vehicle.notes}</div>
                    </div>
                  </div>
                )}

                {/* Estado del vehículo */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estado del vehículo:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedService.vehicle.is_active 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      {selectedService.vehicle.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowVehicleDetails(false)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guided Diagnostic Wizard */}
      {showGuidedWizard && (
        <ServiceDiagnosticWizard
          onComplete={handleGuidedDiagnosisComplete}
          onCancel={() => setShowGuidedWizard(false)}
        />
      )}
        </div>
      </div>

      {/* Chatbot flotante */}
      <ChatBot />
    </div>
  );
};

export default ServiceManagement;
