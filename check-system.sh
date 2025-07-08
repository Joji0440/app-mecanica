#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Verificando configuración del sistema Mecánica Asistida"
echo "IP: 172.28.101.4"
echo "=========================================="

# Función para verificar URL
function check_url {
    local url=$1
    local description=$2
    
    echo -n "Verificando $description... "
    
    # Usar curl para verificar la URL
    if curl -s --max-time 10 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR${NC}"
        return 1
    fi
}

# Función para verificar archivo
function check_file {
    local file=$1
    local description=$2
    
    echo -n "Verificando $description... "
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR${NC}"
        return 1
    fi
}

# Función para verificar directorio
function check_directory {
    local dir=$1
    local description=$2
    
    echo -n "Verificando $description... "
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR${NC}"
        return 1
    fi
}

# Verificar estructura de archivos
echo -e "${YELLOW}📁 Verificando estructura de archivos...${NC}"
check_directory "Mecanica" "Directorio del backend"
check_directory "vistas" "Directorio del frontend"
check_file "Mecanica/.env" "Archivo de configuración del backend"
check_file "vistas/.env" "Archivo de configuración del frontend"
check_file "Mecanica/composer.json" "Archivo composer.json"
check_file "vistas/package.json" "Archivo package.json"

echo ""

# Verificar configuraciones
echo -e "${YELLOW}⚙️ Verificando configuraciones...${NC}"

# Verificar IP en archivos de configuración
echo -n "Verificando IP en backend (.env)... "
if grep -q "172.28.101.4" Mecanica/.env; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR${NC}"
fi

echo -n "Verificando IP en frontend (.env)... "
if grep -q "172.28.101.4" vistas/.env; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR${NC}"
fi

echo -n "Verificando CORS en Laravel... "
if grep -q "172.28.101.4" Mecanica/config/cors.php; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR${NC}"
fi

echo -n "Verificando Sanctum... "
if grep -q "172.28.101.4" Mecanica/.env; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR${NC}"
fi

echo ""

# Verificar dependencias
echo -e "${YELLOW}📦 Verificando dependencias...${NC}"

echo -n "Verificando vendor de Laravel... "
if [ -d "Mecanica/vendor" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR - Ejecute: cd Mecanica && composer install${NC}"
fi

echo -n "Verificando node_modules de React... "
if [ -d "vistas/node_modules" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR - Ejecute: cd vistas && npm install${NC}"
fi

echo ""

# Verificar base de datos
echo -e "${YELLOW}🗄️ Verificando base de datos...${NC}"

cd Mecanica
echo -n "Verificando conexión a base de datos... "
if php artisan migrate:status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR - Verifique configuración de DB${NC}"
fi

echo -n "Verificando migraciones... "
if php artisan migrate:status | grep -q "Yes"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR - Ejecute: php artisan migrate${NC}"
fi

cd ..

echo ""

# Mostrar información de configuración actual
echo -e "${YELLOW}📋 Configuración actual:${NC}"
echo "- IP del servidor: 172.28.101.4"
echo "- Puerto del backend: 8000"
echo "- Puerto del frontend: 5173"
echo ""

echo -e "${YELLOW}🔗 URLs para probar:${NC}"
echo "- Backend API: http://172.28.101.4:8000/api"
echo "- Health Check: http://172.28.101.4:8000/api/health"
echo "- Frontend: http://172.28.101.4:5173"
echo "- Panel de Admin: http://172.28.101.4:5173/user-management"
echo ""

echo -e "${YELLOW}🚀 Comandos útiles:${NC}"
echo "- Iniciar desarrollo: ./start-dev-servers.sh"
echo "- Desplegar sistema: ./deploy.sh"
echo "- Build producción: ./build-production.sh"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Verificación completada${NC}"
echo "=========================================="
