import React, { useState, useEffect } from 'react';
import { mechanicAPI, locationAPI } from '../../services/api';
import type { MechanicProfile, NearbyMechanicSearchParams } from '../../types';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Wrench,
  Phone,
  Mail,
  Award,
  Loader,
  AlertCircle,
  Target
} from 'lucide-react';

const MechanicSearch: React.FC = () => {
  const [mechanics, setMechanics] = useState<MechanicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [searchParams, setSearchParams] = useState<NearbyMechanicSearchParams>({
    latitude: 0,
    longitude: 0,
    radius: 20,
    specialty: '',
    min_rating: 0,
    emergency_only: false
  });

  const specialties = [
    { value: 'motor', label: 'Motor' },
    { value: 'transmision', label: 'Transmisión' },
    { value: 'frenos', label: 'Frenos' },
    { value: 'suspension', label: 'Suspensión' },
    { value: 'electrico', label: 'Sistema Eléctrico' },
    { value: 'aire_acondicionado', label: 'Aire Acondicionado' },
    { value: 'diagnostico', label: 'Diagnóstico' },
    { value: 'carroceria', label: 'Carrocería' },
    { value: 'llantas', label: 'Llantas' },
    { value: 'otros', label: 'Otros' }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setSearchParams(prev => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude
          }));
          // Buscar mecánicos automáticamente con la ubicación actual
          searchMechanics({
            ...searchParams,
            latitude: location.latitude,
            longitude: location.longitude
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setError('No se pudo obtener tu ubicación. Ingresa una ubicación manualmente.');
        }
      );
    }
  };

  const searchMechanics = async (params = searchParams) => {
    if (!params.latitude || !params.longitude) {
      setError('Se requiere una ubicación para buscar mecánicos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Primero actualizar la ubicación del usuario
      await locationAPI.updateLocation({
        latitude: params.latitude,
        longitude: params.longitude,
        address: 'Ubicación actual'
      });

      // Luego buscar mecánicos cercanos
      const result = await mechanicAPI.getNearbyMechanics(params);
      setMechanics(result.data);
    } catch (err: any) {
      setError('Error al buscar mecánicos: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchMechanics();
  };

  const handleParamChange = (key: keyof NearbyMechanicSearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Buscar Mecánicos</h1>
        <p className="text-gray-600">Encuentra mecánicos cercanos especializados en tu necesidad</p>
      </div>

      {/* Search Filters */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Radio de Búsqueda (km)</label>
            <input
              type="number"
              value={searchParams.radius}
              onChange={(e) => handleParamChange('radius', parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
            <select
              value={searchParams.specialty || ''}
              onChange={(e) => handleParamChange('specialty', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todas las especialidades</option>
              {specialties.map(spec => (
                <option key={spec.value} value={spec.value}>{spec.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calificación Mínima</label>
            <select
              value={searchParams.min_rating || 0}
              onChange={(e) => handleParamChange('min_rating', parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={0}>Cualquier calificación</option>
              <option value={3}>3+ estrellas</option>
              <option value={4}>4+ estrellas</option>
              <option value={4.5}>4.5+ estrellas</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchParams.emergency_only}
                onChange={(e) => handleParamChange('emergency_only', e.target.checked)}
                className="mr-2 h-4 w-4 text-indigo-600"
              />
              <span className="text-sm font-medium text-gray-700">Solo emergencias</span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {isLoading ? 'Buscando...' : 'Buscar Mecánicos'}
          </button>
          
          <button
            onClick={getCurrentLocation}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Mi Ubicación
          </button>
        </div>

        {userLocation && (
          <div className="mt-2 text-sm text-gray-600">
            📍 Ubicación actual: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Buscando mecánicos cercanos...</span>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mechanics.map((mechanic) => (
          <div key={mechanic.id} className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{mechanic.user?.name}</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex">{getRatingStars(parseFloat(mechanic.rating_average))}</div>
                    <span className="ml-2 text-sm text-gray-600">
                      {mechanic.rating_average} ({mechanic.total_reviews} reseñas)
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center text-indigo-600 mb-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{mechanic.distance_km?.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{mechanic.estimated_arrival_minutes} min</span>
                  </div>
                </div>
              </div>

              {/* Experience and Rate */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Experiencia</div>
                    <div className="font-medium">{mechanic.experience_years} años</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Tarifa/hora</div>
                    <div className="font-medium">${mechanic.hourly_rate}</div>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Especialidades:</div>
                <div className="flex flex-wrap gap-1">
                  {mechanic.specializations.map((spec, index) => (
                    <span 
                      key={index} 
                      className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs"
                    >
                      {specialties.find(s => s.value === spec)?.label || spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {mechanic.bio && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Descripción:</div>
                  <p className="text-sm text-gray-700">{mechanic.bio}</p>
                </div>
              )}

              {/* Certifications */}
              {mechanic.certifications.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Certificaciones:</div>
                  <div className="flex flex-wrap gap-1">
                    {mechanic.certifications.map((cert, index) => (
                      <span 
                        key={index} 
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mechanic.emergency_available && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    🚨 Emergencias 24/7
                  </span>
                )}
                {mechanic.accepts_weekend_jobs && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    📅 Fines de semana
                  </span>
                )}
                {mechanic.accepts_night_jobs && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    🌙 Horario nocturno
                  </span>
                )}
                {mechanic.is_verified && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    ✅ Verificado
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{mechanic.user?.email}</span>
                  </div>
                  {mechanic.user?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{mechanic.user.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Solicitar Servicio
                  </button>
                  <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                    Ver Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && mechanics.length === 0 && !error && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron mecánicos</h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar los filtros de búsqueda o ampliar el radio de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default MechanicSearch;
