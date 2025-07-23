import React, { useState, useEffect } from 'react';
import { mechanicAPI } from '../../services/api';
import type { MechanicProfile as MechanicProfileType, CreateMechanicProfileRequest } from '../../types';
import { 
  User, 
  Star, 
  Award, 
  DollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  AlertCircle,
  Loader,
  Plus,
  X
} from 'lucide-react';

const MechanicProfileComponent: React.FC = () => {
  const [profile, setProfile] = useState<MechanicProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editData, setEditData] = useState<Partial<CreateMechanicProfileRequest>>({
    specializations: [],
    experience_years: 0,
    hourly_rate: 0,
    travel_radius: 20,
    emergency_available: false,
    bio: '',
    certifications: [],
    accepts_weekend_jobs: false,
    accepts_night_jobs: false
  });

  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const specialtyOptions = [
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const result = await mechanicAPI.getProfile();
      if (result.data) {
        setProfile(result.data);
        setEditData({
          specializations: result.data.specializations,
          experience_years: result.data.experience_years,
          hourly_rate: parseFloat(result.data.hourly_rate),
          travel_radius: result.data.travel_radius,
          emergency_available: result.data.emergency_available,
          bio: result.data.bio || '',
          certifications: result.data.certifications,
          accepts_weekend_jobs: result.data.accepts_weekend_jobs,
          accepts_night_jobs: result.data.accepts_night_jobs
        });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No hay perfil, mostrar formulario de creación
        setError('Necesitas crear tu perfil de mecánico');
        setIsEditing(true);
      } else {
        setError('Error al cargar perfil: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.specializations?.length || editData.experience_years === 0 || editData.hourly_rate === 0) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    setIsLoading(true);
    try {
      if (profile) {
        // Actualizar perfil existente
        await mechanicAPI.updateProfile(profile.id, editData);
        setSuccess('Perfil actualizado exitosamente');
      } else {
        // Crear nuevo perfil
        await mechanicAPI.createProfile(editData as CreateMechanicProfileRequest);
        setSuccess('Perfil creado exitosamente');
      }
      
      await fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      setError('Error al guardar perfil: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      await mechanicAPI.updateAvailability(profile.id, !profile.is_available);
      await fetchProfile();
      setSuccess(`Estado actualizado: ${!profile.is_available ? 'Disponible' : 'No disponible'}`);
    } catch (err: any) {
      setError('Error al actualizar disponibilidad: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecialization = () => {
    if (newSpecialization && !editData.specializations?.includes(newSpecialization)) {
      setEditData(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), newSpecialization]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setEditData(prev => ({
      ...prev,
      specializations: prev.specializations?.filter(s => s !== spec) || []
    }));
  };

  const addCertification = () => {
    if (newCertification && !editData.certifications?.includes(newCertification)) {
      setEditData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setEditData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter(c => c !== cert) || []
    }));
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (isLoading && !profile && !isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información profesional</p>
        </div>
        
        {profile && (
          <div className="flex gap-2">
            <button
              onClick={handleAvailabilityToggle}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                profile.is_available 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {profile.is_available ? 'Marcar No Disponible' : 'Marcar Disponible'}
            </button>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {!isEditing && profile ? (
        /* Profile View */
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-500" />
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.user?.name}</h2>
                  <p className="text-gray-600">{profile.user?.email}</p>
                  {profile.user?.phone && (
                    <p className="text-gray-600">{profile.user.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center justify-end mb-2">
                  <div className="flex">{getRatingStars(parseFloat(profile.rating_average))}</div>
                  <span className="ml-2 font-medium">{profile.rating_average}</span>
                </div>
                <p className="text-sm text-gray-600">{profile.total_reviews} reseñas</p>
                <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  profile.is_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile.is_available ? '✅ Disponible' : '❌ No disponible'}
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience & Rates */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4">Información Profesional</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Experiencia</div>
                    <div className="font-medium">{profile.experience_years} años</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Tarifa por hora</div>
                    <div className="font-medium">${profile.hourly_rate}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Radio de viaje</div>
                    <div className="font-medium">{profile.travel_radius} km</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Trabajos completados</div>
                    <div className="font-medium">{profile.total_jobs}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4">Disponibilidad</h3>
              
              <div className="space-y-3">
                {profile.emergency_available && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm">Disponible para emergencias 24/7</span>
                  </div>
                )}

                {profile.accepts_weekend_jobs && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm">Acepta trabajos de fin de semana</span>
                  </div>
                )}

                {profile.accepts_night_jobs && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm">Acepta trabajos nocturnos</span>
                  </div>
                )}

                {profile.is_verified && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm">Perfil verificado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-4">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map((spec, index) => (
                <span 
                  key={index} 
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                >
                  {specialtyOptions.find(s => s.value === spec)?.label || spec}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {profile.certifications.length > 0 && (
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold mb-4">Certificaciones</h3>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert, index) => (
                  <span 
                    key={index} 
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Edit Form */
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-xl font-semibold mb-6">
            {profile ? 'Editar Perfil' : 'Crear Perfil de Mecánico'}
          </h2>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Años de experiencia *
                </label>
                <input
                  type="number"
                  value={editData.experience_years || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, experience_years: parseInt(e.target.value) }))}
                  min="0"
                  max="50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa por hora ($) *
                </label>
                <input
                  type="number"
                  value={editData.hourly_rate || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) }))}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radio de viaje (km)
                </label>
                <input
                  type="number"
                  value={editData.travel_radius || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, travel_radius: parseInt(e.target.value) }))}
                  min="1"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción profesional
              </label>
              <textarea
                value={editData.bio || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Cuéntanos sobre tu experiencia y especialidades..."
              />
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidades *
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar especialidad</option>
                  {specialtyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editData.specializations?.map((spec, index) => (
                  <span 
                    key={index} 
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {specialtyOptions.find(s => s.value === spec)?.label || spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificaciones
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Nombre de la certificación"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editData.certifications?.map((cert, index) => (
                  <span 
                    key={index} 
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Availability Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Disponibilidad
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editData.emergency_available || false}
                    onChange={(e) => setEditData(prev => ({ ...prev, emergency_available: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-indigo-600"
                  />
                  <span className="text-sm">Disponible para emergencias 24/7</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editData.accepts_weekend_jobs || false}
                    onChange={(e) => setEditData(prev => ({ ...prev, accepts_weekend_jobs: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-indigo-600"
                  />
                  <span className="text-sm">Acepto trabajos de fin de semana</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editData.accepts_night_jobs || false}
                    onChange={(e) => setEditData(prev => ({ ...prev, accepts_night_jobs: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-indigo-600"
                  />
                  <span className="text-sm">Acepto trabajos nocturnos</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-6 border-t">
              {profile && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Guardando...' : (profile ? 'Actualizar' : 'Crear Perfil')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicProfileComponent;
