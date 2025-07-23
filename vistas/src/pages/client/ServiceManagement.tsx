import React, { useState, useEffect } from 'react';
import { serviceRequestAPI } from '../../services/api';
import type { ExtendedServiceRequest, ServiceRequestCreate } from '../../types';
import NavigationHeader from '../../components/NavigationHeader';
import { 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  Search,
  Filter,
  MessageCircle,
  Loader,
  Trash2
} from 'lucide-react';

interface ServiceRequestFilters {
  status?: string;
  search?: string;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<ExtendedServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ExtendedServiceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
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
    vehicle_id: null,
    preferred_mechanic_id: null
  });

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-800', bg: 'bg-yellow-100' },
    accepted: { label: 'Aceptado', color: 'text-blue-800', bg: 'bg-blue-100' },
    in_progress: { label: 'En Progreso', color: 'text-indigo-800', bg: 'bg-indigo-100' },
    completed: { label: 'Completado', color: 'text-green-800', bg: 'bg-green-100' },
    cancelled: { label: 'Cancelado', color: 'text-red-800', bg: 'bg-red-100' },
    rejected: { label: 'Rechazado', color: 'text-gray-800', bg: 'bg-gray-100' }
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
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const result = await serviceRequestAPI.getAll();
      setServices(result.data || []);
    } catch (err: any) {
      setError('Error al cargar servicios: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateService = async () => {
    if (!createData.description.trim() || !createData.title.trim()) {
      setError('Por favor completa los campos requeridos');
      return;
    }

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
      vehicle_id: null,
      preferred_mechanic_id: null
    });
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = !filters.search || 
      service.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      service.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || service.status === filters.status;
    
    return matchesSearch && matchesStatus;
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
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader title="Mis Servicios" showBack={true} />
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Cargando servicios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Mis Servicios" showBack={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Servicios</h1>
              <p className="text-gray-600">Gestiona tus solicitudes de servicio automotriz</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Solicitud
            </button>
          </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([status, config]) => (
              <option key={status} value={status}>{config.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setFilters({})}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Limpiar Filtros
          </button>
        </div>
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.title}</h3>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusLabels[service.status]?.bg} ${statusLabels[service.status]?.color}`}>
                    {statusLabels[service.status]?.label}
                  </span>
                </div>
                
                {service.is_emergency && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    🚨 Emergencia
                  </span>
                )}
              </div>

              {/* Service Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Creado: {formatDate(service.created_at)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <span className={`font-medium ${urgencyLevels.find(u => u.value === service.urgency_level)?.color || 'text-gray-600'}`}>
                    Urgencia: {urgencyLevels.find(u => u.value === service.urgency_level)?.label || 'Media'}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{service.estimated_duration_hours}h estimadas</span>
                </div>

                {service.budget_max > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Presupuesto máx: ${service.budget_max}</span>
                  </div>
                )}

                {service.location_address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span className="line-clamp-2">{service.location_address}</span>
                  </div>
                )}

                {service.mechanic && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Mecánico: {service.mechanic?.user?.name}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 line-clamp-3">{service.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowDetailModal(true);
                  }}
                  className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </button>

                {service.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleCancelService(Number(service.id))}
                      className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(Number(service.id))}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
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
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay servicios</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.status 
              ? 'No se encontraron servicios con los filtros seleccionados'
              : 'Aún no has creado ninguna solicitud de servicio'
            }
          </p>
          {!filters.search && !filters.status && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Crear Primera Solicitud
            </button>
          )}
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Nueva Solicitud de Servicio</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateService(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={createData.title}
                      onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ej: Revisión de frenos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Servicio
                    </label>
                    <select
                      value={createData.service_type}
                      onChange={(e) => setCreateData(prev => ({ ...prev, service_type: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    >
                      {serviceTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={createData.description}
                    onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe detalladamente el problema o servicio requerido..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel de Urgencia
                    </label>
                    <select
                      value={createData.urgency_level}
                      onChange={(e) => setCreateData(prev => ({ ...prev, urgency_level: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    >
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración Estimada (horas)
                    </label>
                    <input
                      type="number"
                      value={createData.estimated_duration_hours}
                      onChange={(e) => setCreateData(prev => ({ ...prev, estimated_duration_hours: parseInt(e.target.value) }))}
                      min="1"
                      max="48"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Presupuesto Máximo ($)
                    </label>
                    <input
                      type="number"
                      value={createData.budget_max}
                      onChange={(e) => setCreateData(prev => ({ ...prev, budget_max: parseInt(e.target.value) }))}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección del Servicio
                  </label>
                  <input
                    type="text"
                    value={createData.location_address}
                    onChange={(e) => setCreateData(prev => ({ ...prev, location_address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Dirección donde se realizará el servicio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas adicionales de ubicación
                  </label>
                  <textarea
                    value={createData.location_notes}
                    onChange={(e) => setCreateData(prev => ({ ...prev, location_notes: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Referencias, puntos de encuentro, etc..."
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createData.is_emergency}
                      onChange={(e) => setCreateData(prev => ({ ...prev, is_emergency: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-indigo-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Es una emergencia</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creando...' : 'Crear Solicitud'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Detalle del Servicio</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Service Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedService.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[selectedService.status]?.bg} ${statusLabels[selectedService.status]?.color}`}>
                      {statusLabels[selectedService.status]?.label}
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedService.description}</p>
                </div>

                {/* Service Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Información del Servicio</h4>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Duración estimada</div>
                        <div className="font-medium">{selectedService.estimated_duration_hours} horas</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Presupuesto máximo</div>
                        <div className="font-medium">${selectedService.budget_max || 'No especificado'}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Nivel de urgencia</div>
                        <div className={`font-medium ${urgencyLevels.find(u => u.value === selectedService.urgency_level)?.color || 'text-gray-600'}`}>
                          {urgencyLevels.find(u => u.value === selectedService.urgency_level)?.label || 'Media'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Fecha de creación</div>
                        <div className="font-medium">{formatDate(selectedService.created_at)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Ubicación y Mecánico</h4>
                    
                    {selectedService.location_address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Dirección</div>
                          <div className="font-medium">{selectedService.location_address}</div>
                        </div>
                      </div>
                    )}

                    {selectedService.location_notes && (
                      <div className="flex items-start">
                        <MessageCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Notas de ubicación</div>
                          <div className="font-medium">{selectedService.location_notes}</div>
                        </div>
                      </div>
                    )}

                    {selectedService.mechanic && (
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Mecánico asignado</div>
                          <div className="font-medium">{selectedService.mechanic.user?.name}</div>
                          <div className="text-sm text-gray-500">{selectedService.mechanic.user?.email}</div>
                        </div>
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
                  
                  {selectedService.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleCancelService(Number(selectedService.id));
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                      >
                        Cancelar Servicio
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteService(Number(selectedService.id));
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;
