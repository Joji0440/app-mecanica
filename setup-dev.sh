#!/bin/bash

# 🛠️ SCRIPT PARA DESARROLLO LOCAL - MECÁNICA ASISTIDA
# Este script configura el entorno de desarrollo local

echo "🛠️ CONFIGURANDO ENTORNO DE DESARROLLO LOCAL"
echo "============================================"

# Variables
PROJECT_DIR="/home/mecanica/Downloads/app-mecanica"
BACKEND_DIR="$PROJECT_DIR/Mecanica"
FRONTEND_DIR="$PROJECT_DIR/vistas"

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

# 1. Verificar dependencias
echo "🔍 1. Verificando dependencias..."

if ! command -v php &> /dev/null; then
    print_error "PHP no está instalado"
    exit 1
fi

if ! command -v composer &> /dev/null; then
    print_error "Composer no está instalado"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_status "Dependencias verificadas"

# 2. Configurar backend Laravel
echo "🔧 2. Configurando backend Laravel..."
cd $BACKEND_DIR

# Instalar dependencias PHP
if [ ! -d "vendor" ]; then
    print_info "Instalando dependencias de Composer..."
    composer install
else
    print_status "Dependencias de Composer ya instaladas"
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    print_error "Archivo .env no encontrado"
    exit 1
fi

# Limpiar y configurar cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Configurar base de datos
print_info "Configurando base de datos..."
php artisan migrate --force
php artisan db:seed --force

# Crear enlace simbólico de storage
php artisan storage:link

print_status "Backend configurado"

# 3. Configurar frontend React
echo "🎨 3. Configurando frontend React..."
cd $FRONTEND_DIR

# Instalar dependencias Node.js
if [ ! -d "node_modules" ]; then
    print_info "Instalando dependencias de npm..."
    npm install
else
    print_status "Dependencias de npm ya instaladas"
fi

print_status "Frontend configurado"

# 4. Crear scripts de inicio
echo "📝 4. Creando scripts de inicio..."

# Script para iniciar backend
cat > $PROJECT_DIR/start-backend.sh << 'EOF'
#!/bin/bash
cd /home/mecanica/Downloads/app-mecanica/Mecanica
echo "🚀 Iniciando servidor Laravel en http://localhost:8000"
php artisan serve --host=0.0.0.0 --port=8000
EOF

# Script para iniciar frontend
cat > $PROJECT_DIR/start-frontend.sh << 'EOF'
#!/bin/bash
cd /home/mecanica/Downloads/app-mecanica/vistas
echo "🎨 Iniciando servidor de desarrollo React en http://localhost:5173"
npm run dev
EOF

# Script para testing
cat > $PROJECT_DIR/run-tests.sh << 'EOF'
#!/bin/bash
echo "🧪 Ejecutando tests del backend..."
cd /home/mecanica/Downloads/app-mecanica/Mecanica
php artisan test

echo ""
echo "🧪 Ejecutando tests del frontend..."
cd /home/mecanica/Downloads/app-mecanica/vistas
npm run test
EOF

# Hacer ejecutables los scripts
chmod +x $PROJECT_DIR/start-backend.sh
chmod +x $PROJECT_DIR/start-frontend.sh
chmod +x $PROJECT_DIR/run-tests.sh

print_status "Scripts de inicio creados"

# 5. Verificar configuración
echo "🔍 5. Verificando configuración..."

# Verificar configuración de Laravel
cd $BACKEND_DIR
if php artisan config:cache > /dev/null 2>&1; then
    print_status "Configuración de Laravel válida"
else
    print_error "Error en configuración de Laravel"
fi

# Verificar base de datos
if php artisan migrate:status > /dev/null 2>&1; then
    print_status "Base de datos conectada"
else
    print_warning "Verificar configuración de base de datos"
fi

print_status "Verificación completada"

# 6. Mostrar instrucciones
echo ""
echo "🎉 ¡ENTORNO DE DESARROLLO CONFIGURADO!"
echo "====================================="
echo ""
print_info "📋 Para iniciar el desarrollo:"
echo ""
echo "  1️⃣ Backend (Laravel):"
echo "     ./start-backend.sh"
echo "     Acceder: http://localhost:8000"
echo ""
echo "  2️⃣ Frontend (React) - En otra terminal:"
echo "     ./start-frontend.sh"
echo "     Acceder: http://localhost:5173"
echo ""
echo "  3️⃣ API Health Check:"
echo "     curl http://localhost:8000/api/health"
echo ""
print_info "🧪 Para ejecutar tests:"
echo "     ./run-tests.sh"
echo ""
print_info "🔧 Comandos útiles:"
echo "     cd Mecanica && php artisan tinker    # Consola Laravel"
echo "     cd Mecanica && php artisan route:list # Ver rutas"
echo "     cd vistas && npm run build           # Build producción"
echo ""
print_info "📁 Archivos importantes:"
echo "     Mecanica/.env                        # Config backend"
echo "     vistas/.env                          # Config frontend"
echo ""
print_warning "⚠️  Notas importantes:"
echo "   - Asegúrate de que PostgreSQL esté ejecutándose"
echo "   - El backend debe iniciarse antes que el frontend"
echo "   - Usar 'Ctrl+C' para detener los servidores"
echo ""
print_status "¡Listo para desarrollar! 🚀"
