#!/bin/bash

# Script para desarrollo continuo
# ./dev-workflow.sh [start|deploy-staging|deploy-prod|new-feature]

ACTION=${1}

case $ACTION in
    "start")
        echo "🚀 Iniciando entorno de desarrollo..."
        ./manage-env.sh development
        
        cd Mecanica
        php artisan config:clear
        php artisan migrate
        
        echo "✅ Backend listo en http://localhost:8000"
        echo "🎨 Inicia el frontend con: cd vistas && npm run dev"
        ;;
        
    "new-feature")
        FEATURE_NAME=${2}
        if [ -z "$FEATURE_NAME" ]; then
            echo "❌ Especifica el nombre de la feature"
            echo "Uso: ./dev-workflow.sh new-feature nombre-feature"
            exit 1
        fi
        
        echo "🌟 Creando nueva feature: $FEATURE_NAME"
        git checkout -b "feature/$FEATURE_NAME"
        
        # Crear estructura básica para la feature
        mkdir -p "Mecanica/app/Http/Controllers/${FEATURE_NAME^}"
        mkdir -p "vistas/src/components/${FEATURE_NAME}"
        mkdir -p "vistas/src/pages/${FEATURE_NAME}"
        
        echo "✅ Rama feature/$FEATURE_NAME creada"
        echo "📁 Estructura de directorios creada"
        ;;
        
    "deploy-staging")
        echo "🧪 Desplegando a staging..."
        ./manage-env.sh staging
        
        # Aquí irían los comandos de despliegue a staging
        echo "✅ Listo para desplegar a staging"
        echo "💡 Ejecuta: scp -r . user@staging-server:/path/to/app"
        ;;
        
    "deploy-prod")
        echo "🚀 Desplegando a producción..."
        ./manage-env.sh production
        
        echo "⚠️  DESPLIEGUE A PRODUCCIÓN"
        echo "1. ¿Has probado en staging? (y/n)"
        read -r confirmation
        
        if [ "$confirmation" = "y" ]; then
            echo "✅ Procediendo con despliegue..."
            ./deploy-app.sh
        else
            echo "❌ Despliegue cancelado. Prueba primero en staging."
        fi
        ;;
        
    *)
        echo "🔧 MECÁNICA ASISTIDA - Workflow de Desarrollo"
        echo ""
        echo "Comandos disponibles:"
        echo "  start                    - Iniciar entorno de desarrollo"
        echo "  new-feature <nombre>     - Crear nueva feature"
        echo "  deploy-staging          - Desplegar a staging"
        echo "  deploy-prod             - Desplegar a producción"
        echo ""
        echo "Ejemplos:"
        echo "  ./dev-workflow.sh start"
        echo "  ./dev-workflow.sh new-feature servicios"
        echo "  ./dev-workflow.sh deploy-staging"
        ;;
esac
