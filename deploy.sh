#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Iniciando despliegue de Mecánica Asistida con IP: 172.28.101.4"
echo "=========================================="

# Función para mostrar errores y salir
function error_exit {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Función para mostrar éxito
function success_msg {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar advertencia
function warning_msg {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "Mecanica" ] || [ ! -d "vistas" ]; then
    error_exit "Debe ejecutar este script desde el directorio raíz del proyecto"
fi

# 1. Actualizar dependencias del backend
echo -e "${YELLOW}📦 Actualizando dependencias del backend...${NC}"
cd Mecanica
composer install --no-dev --optimize-autoloader || error_exit "Error al instalar dependencias de PHP"
success_msg "Dependencias de PHP actualizadas"

# 2. Limpiar cache de Laravel
echo -e "${YELLOW}🧹 Limpiando cache de Laravel...${NC}"
php artisan cache:clear || warning_msg "Error al limpiar cache"
php artisan config:clear || warning_msg "Error al limpiar config cache"
php artisan route:clear || warning_msg "Error al limpiar route cache"
php artisan view:clear || warning_msg "Error al limpiar view cache"
success_msg "Cache de Laravel limpiado"

# 3. Ejecutar migraciones
echo -e "${YELLOW}🗄️ Ejecutando migraciones...${NC}"
php artisan migrate --force || error_exit "Error al ejecutar migraciones"
success_msg "Migraciones ejecutadas"

# 4. Ejecutar seeders de roles y permisos
echo -e "${YELLOW}👥 Configurando roles y permisos...${NC}"
php artisan db:seed --class=RolesAndPermissionsSeeder --force || warning_msg "Error al ejecutar seeder de roles"
success_msg "Roles y permisos configurados"

# 5. Optimizar Laravel para producción
echo -e "${YELLOW}⚡ Optimizando Laravel para producción...${NC}"
php artisan config:cache || error_exit "Error al cachear configuración"
php artisan route:cache || error_exit "Error al cachear rutas"
php artisan view:cache || error_exit "Error al cachear vistas"
success_msg "Laravel optimizado para producción"

# 6. Configurar permisos de storage
echo -e "${YELLOW}🔒 Configurando permisos de storage...${NC}"
chmod -R 775 storage bootstrap/cache || warning_msg "Error al configurar permisos"
success_msg "Permisos de storage configurados"

# 7. Volver al directorio raíz y construir frontend
cd ..
echo -e "${YELLOW}🏗️ Construyendo frontend...${NC}"
cd vistas
npm install || error_exit "Error al instalar dependencias de Node.js"
npm run build || error_exit "Error al construir frontend"
success_msg "Frontend construido exitosamente"

# 8. Volver al directorio raíz
cd ..

# 9. Mostrar información de configuración
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}📋 Información de configuración:${NC}"
echo "- IP del servidor: 172.28.101.4"
echo "- Puerto del backend: 8000"
echo "- Puerto del frontend: 5173 (desarrollo)"
echo "- Archivos del frontend construidos en: vistas/dist/"
echo ""
echo -e "${GREEN}🔗 URLs de acceso:${NC}"
echo "- Backend API: http://172.28.101.4:8000/api"
echo "- Health Check: http://172.28.101.4:8000/api/health"
echo "- Frontend (desarrollo): http://172.28.101.4:5173"
echo "- Panel de Admin: http://172.28.101.4:5173/user-management"
echo ""
echo -e "${GREEN}🚀 Próximos pasos:${NC}"
echo "1. Configurar servidor web (Apache/Nginx) para servir los archivos estáticos"
echo "2. Configurar SSL/HTTPS si es necesario"
echo "3. Configurar proxy reverso para el backend"
echo "4. Probar el sistema desde otras máquinas en la red"
echo ""
echo -e "${GREEN}📝 Para desarrollo:${NC}"
echo "Ejecute: ./start-dev-servers.sh"
echo ""
echo -e "${GREEN}🆘 Para troubleshooting:${NC}"
echo "Consulte: DEPLOY_GUIDE.md y TROUBLESHOOTING.md"
