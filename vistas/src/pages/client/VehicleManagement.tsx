import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../../services/api';
import type { Vehicle, CreateVehicleRequest } from '../../types';
import NavigationHeader from '../../components/NavigationHeader';
import { 
  Car, 
  Plus, 
  Edit3, 
  Trash2, 
  Fuel, 
  Settings, 
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<CreateVehicleRequest>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    fuel_type: 'gasoline',
    transmission_type: 'automatic',
    mileage: 0,
    license_plate: '',
    color: '',
    vin: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await vehicleAPI.getVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError('Error al cargar vehículos: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingVehicle) {
        const updated = await vehicleAPI.updateVehicle(editingVehicle.id, formData);
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? updated : v));
        setSuccess('Vehículo actualizado exitosamente');
      } else {
        const newVehicle = await vehicleAPI.createVehicle(formData);
        setVehicles([...vehicles, newVehicle]);
        setSuccess('Vehículo creado exitosamente');
      }
      
      resetForm();
    } catch (err: any) {
      setError('Error al guardar vehículo: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      fuel_type: vehicle.fuel_type,
      transmission_type: vehicle.transmission_type,
      mileage: vehicle.mileage,
      license_plate: vehicle.license_plate,
      color: vehicle.color,
      vin: vehicle.vin,
      notes: vehicle.notes || undefined
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) return;

    try {
      await vehicleAPI.deleteVehicle(id);
      setVehicles(vehicles.filter(v => v.id !== id));
      setSuccess('Vehículo eliminado exitosamente');
    } catch (err: any) {
      setError('Error al eliminar vehículo: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      fuel_type: 'gasoline',
      transmission_type: 'automatic',
      mileage: 0,
      license_plate: '',
      color: '',
      vin: ''
    });
    setEditingVehicle(null);
    setIsCreating(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? parseInt(value) : value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando vehículos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader title="Gestión de Vehículos" showBack={true} customBackPath="/" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Vehículos</h1>
              <p className="text-gray-600 dark:text-gray-300">Gestiona tu flota de vehículos</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Agregar Vehículo
            </button>
          </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                placeholder="Toyota, Ford, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                placeholder="Corolla, Focus, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Año</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placa</label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                placeholder="ABC-123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Combustible</label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              >
                <option value="gasoline">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="hybrid">Híbrido</option>
                <option value="electric">Eléctrico</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transmisión</label>
              <select
                name="transmission_type"
                value={formData.transmission_type}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automática</option>
                <option value="cvt">CVT</option>
                <option value="other">Otra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kilometraje</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                placeholder="Rojo, Azul, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VIN</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                placeholder="1HGCM82633A123456"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 resize-none"
                rows={3}
                placeholder="Información adicional sobre el vehículo..."
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                {editingVehicle ? 'Actualizar' : 'Crear'} Vehículo
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <Car className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{vehicle.license_plate}</span>
                </div>
                <div className="flex items-center">
                  <Fuel className="h-4 w-4 mr-2" />
                  <span>{vehicle.fuel_type} • {vehicle.transmission_type}</span>
                </div>
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Color: {vehicle.color}</span>
                </div>
              </div>

              {vehicle.notes && (
                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                  {vehicle.notes}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Creado: {new Date(vehicle.created_at).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full ${vehicle.is_active 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'}`}>
                    {vehicle.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tienes vehículos registrados</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Comienza agregando tu primer vehículo</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Agregar Vehículo
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;
