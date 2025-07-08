#!/bin/bash

echo "🚀 Iniciando build para producción..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Paso 1: Preparando backend...${NC}"

cd /home/mecanica/Downloads/app-mecanica/Mecanica

# Limpiar caché de Laravel
echo "Limpiando caché de Laravel..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

# Optimizar para producción
echo "Optimizando para producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Instalar dependencias de producción
echo "Instalando dependencias de Composer..."
composer install --optimize-autoloader --no-dev

echo -e "${GREEN}✅ Backend preparado${NC}"

echo -e "${BLUE}📦 Paso 2: Preparando frontend...${NC}"

cd /home/mecanica/Downloads/app-mecanica/vistas

# Instalar dependencias
echo "Instalando dependencias de Node.js..."
npm ci

# Copiar archivo de entorno de producción
echo "Configurando variables de entorno..."
cp .env.production .env

# Build para producción
echo "Compilando aplicación React..."
npm run build

echo -e "${GREEN}✅ Frontend compilado${NC}"

echo -e "${BLUE}📦 Paso 3: Verificando archivos de build...${NC}"

if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Directorio dist creado correctamente${NC}"
    echo "📊 Tamaño del build:"
    du -sh dist/
else
    echo -e "${RED}❌ Error: No se creó el directorio dist${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Build completado exitosamente${NC}"
echo -e "${BLUE}📁 Archivos listos para deploy en:${NC}"
echo "   Backend: /home/mecanica/Downloads/app-mecanica/Mecanica"
echo "   Frontend: /home/mecanica/Downloads/app-mecanica/vistas/dist"
echo ""
echo -e "${BLUE}📋 Siguiente paso: Configurar servidor web (Apache/Nginx)${NC}"
