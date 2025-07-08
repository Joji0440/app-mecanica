#!/bin/bash

# Script para gestionar entornos de desarrollo
# ./manage-env.sh [development|staging|production]

ENVIRONMENT=${1:-development}
BACKEND_DIR="./Mecanica"
FRONTEND_DIR="./vistas"

echo "🔧 Configurando entorno: $ENVIRONMENT"

case $ENVIRONMENT in
    "development")
        echo "📝 Configurando para DESARROLLO LOCAL..."
        
        # Backend
        cp $BACKEND_DIR/.env.development $BACKEND_DIR/.env
        
        # Frontend
        echo "VITE_API_URL=http://localhost:8000/api" > $FRONTEND_DIR/.env
        
        echo "✅ Entorno de desarrollo configurado"
        echo "🚀 Para iniciar:"
        echo "   Backend:  cd Mecanica && php artisan serve"
        echo "   Frontend: cd vistas && npm run dev"
        ;;
        
    "staging")
        echo "🧪 Configurando para TESTING/STAGING..."
        
        # Backend
        cp $BACKEND_DIR/.env.staging $BACKEND_DIR/.env
        
        # Frontend
        echo "VITE_API_URL=http://staging.tu-servidor.com/api" > $FRONTEND_DIR/.env
        
        echo "✅ Entorno de staging configurado"
        ;;
        
    "production")
        echo "🚀 Configurando para PRODUCCIÓN..."
        
        # Backend
        cp $BACKEND_DIR/.env.production $BACKEND_DIR/.env
        
        # Frontend
        echo "VITE_API_URL=http://tu-servidor.com/api" > $FRONTEND_DIR/.env
        
        echo "✅ Entorno de producción configurado"
        echo "⚠️  Recuerda actualizar las URLs con tu dominio real"
        ;;
        
    *)
        echo "❌ Entorno no válido. Usa: development, staging, o production"
        exit 1
        ;;
esac

echo ""
echo "📋 Siguiente paso:"
echo "   cd Mecanica && php artisan config:clear"
