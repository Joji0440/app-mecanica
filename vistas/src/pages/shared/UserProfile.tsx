import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Calendar, Mail, Shield } from 'lucide-react';
import NavigationHeader from '../../components/NavigationHeader';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Mi Perfil" showBack={true} showHome={true} />
      
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-white mr-3" />
              <h1 className="text-2xl font-bold text-white">Perfil de Usuario</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900 mt-1">{user.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user.roles?.[0]?.name || 'Sin rol asignado'}
                  </p>
                </div>
              </div>

              {/* Created At */}
              {user.created_at && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Miembro desde
                    </label>
                    <p className="text-gray-900 mt-1">
                      {new Date(user.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="mt-8 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> La edición del perfil estará disponible próximamente. 
                Por ahora, puedes ver tu información actual.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
