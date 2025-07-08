#!/bin/bash

# 🔍 VERIFICACIÓN DE ENTORNO DE DESARROLLO
echo "🔍 VERIFICACIÓN DE ENTORNO DE DESARROLLO"
echo "========================================"

print_status() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

print_info() {
    echo -e "\033[0;34mℹ️  $1\033[0m"
}

# 1. Verificar backend
echo "🔧 1. Verificando Backend Laravel..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health 2>/dev/null || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    print_status "Backend funcionando en http://localhost:8000"
    API_RESPONSE=$(curl -s http://localhost:8000/api/health | jq -r '.status' 2>/dev/null || echo "error")
    print_info "API Status: $API_RESPONSE"
else
    print_error "Backend no responde (Status: $BACKEND_STATUS)"
    print_info "Ejecutar: ./start-backend.sh"
fi

# 2. Verificar frontend
echo ""
echo "🎨 2. Verificando Frontend React..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    print_status "Frontend funcionando en http://localhost:5173"
else
    print_warning "Frontend no responde (Status: $FRONTEND_STATUS)"
    print_info "Ejecutar: ./start-frontend.sh"
fi

# 3. Verificar base de datos
echo ""
echo "🗄️  3. Verificando Base de Datos..."
cd /home/mecanica/Downloads/app-mecanica/Mecanica
DB_CHECK=$(php artisan migrate:status 2>/dev/null | grep -c "Ran" || echo "0")

if [ "$DB_CHECK" -gt "0" ]; then
    print_status "Base de datos conectada ($DB_CHECK migraciones)"
else
    print_error "Error en base de datos"
    print_info "Ejecutar: php artisan migrate"
fi

# 4. Verificar archivos de configuración
echo ""
echo "⚙️  4. Verificando Configuración..."

cd /home/mecanica/Downloads/app-mecanica

# Backend .env
if [ -f "Mecanica/.env" ]; then
    print_status "Backend .env encontrado"
    APP_URL=$(grep "APP_URL=" Mecanica/.env | cut -d'=' -f2)
    print_info "Backend URL: $APP_URL"
else
    print_error "Backend .env no encontrado"
fi

# Frontend .env
if [ -f "vistas/.env" ]; then
    print_status "Frontend .env encontrado"
    API_URL=$(grep "VITE_API_URL=" vistas/.env | cut -d'=' -f2)
    print_info "Frontend API URL: $API_URL"
else
    print_error "Frontend .env no encontrado"
fi

# 5. Verificar dependencias
echo ""
echo "📦 5. Verificando Dependencias..."

# Composer
if [ -d "Mecanica/vendor" ]; then
    print_status "Dependencias Composer instaladas"
else
    print_warning "Dependencias Composer no encontradas"
    print_info "Ejecutar: cd Mecanica && composer install"
fi

# NPM
if [ -d "vistas/node_modules" ]; then
    print_status "Dependencias NPM instaladas"
else
    print_warning "Dependencias NPM no encontradas"
    print_info "Ejecutar: cd vistas && npm install"
fi

# 6. Resumen
echo ""
echo "📋 RESUMEN"
echo "=========="

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
    print_status "🎉 Entorno de desarrollo completamente funcional"
    echo ""
    print_info "🌐 URLs disponibles:"
    echo "   Backend:  http://localhost:8000"
    echo "   Frontend: http://localhost:5173"
    echo "   API:      http://localhost:8000/api"
    echo "   Health:   http://localhost:8000/api/health"
    echo ""
    print_info "🛠️  Para desarrollo:"
    echo "   Abrir VS Code: code mecanica-dev.code-workspace"
    echo "   Ver logs: tail -f Mecanica/storage/logs/laravel.log"
    echo "   Tests: ./run-tests.sh"
elif [ "$BACKEND_STATUS" = "200" ]; then
    print_warning "⚠️  Backend funcionando, pero frontend no"
    print_info "Ejecutar: ./start-frontend.sh"
else
    print_error "❌ Entorno necesita configuración"
    print_info "Ejecutar: ./setup-dev.sh"
fi

echo ""
print_info "📚 Ver documentación: DEV_README.md"
