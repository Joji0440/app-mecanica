#!/bin/bash

echo "🚀 Iniciando servidores de desarrollo con nueva IP: 172.28.101.4"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📡 Configurando y iniciando backend Laravel...${NC}"

# Ir al directorio del backend
cd /home/mecanica/Downloads/app-mecanica/Mecanica

# Usar configuración de desarrollo
cp .env.development .env 2>/dev/null || echo "Usando .env existente"

# Limpiar caché
php artisan config:clear
php artisan route:clear
php artisan cache:clear

echo -e "${GREEN}✅ Backend configurado${NC}"

# Iniciar servidor Laravel en background
echo -e "${BLUE}🚀 Iniciando servidor Laravel en puerto 8001...${NC}"
php artisan serve --host=0.0.0.0 --port=8001 &
LARAVEL_PID=$!

echo -e "${GREEN}✅ Laravel ejecutándose en: http://172.28.101.4:8001${NC}"

sleep 2

echo -e "${BLUE}📡 Configurando y iniciando frontend React...${NC}"

# Ir al directorio del frontend
cd /home/mecanica/Downloads/app-mecanica/vistas

# Usar configuración de desarrollo local
cat > .env << EOF
VITE_API_URL=http://172.28.101.4:8001/api
VITE_APP_URL=http://172.28.101.4:5173
EOF

echo -e "${GREEN}✅ Frontend configurado${NC}"

# Iniciar servidor Vite
echo -e "${BLUE}🚀 Iniciando servidor React...${NC}"
npm run dev -- --host 0.0.0.0 --port 5173 &
VITE_PID=$!

echo -e "${GREEN}✅ React ejecutándose en: http://172.28.101.4:5173${NC}"

sleep 3

echo -e "${YELLOW}📋 SERVIDORES EJECUTÁNDOSE:${NC}"
echo -e "${GREEN}🔧 Backend API:${NC}     http://172.28.101.4:8001"
echo -e "${GREEN}🔧 API Health:${NC}     http://172.28.101.4:8001/api/health"
echo -e "${GREEN}🌐 Frontend:${NC}       http://172.28.101.4:5173"
echo -e "${GREEN}👥 User Management:${NC} http://172.28.101.4:5173/user-management"
echo ""
echo -e "${YELLOW}🔑 Usuario Admin:${NC}"
echo -e "   Email: admin@mecanica.com"
echo -e "   Password: admin123"
echo ""
echo -e "${BLUE}Para detener los servidores, presiona Ctrl+C${NC}"

# Función para limpiar procesos al salir
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo servidores...${NC}"
    kill $LARAVEL_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    echo -e "${GREEN}✅ Servidores detenidos${NC}"
    exit 0
}

# Capturar señal de interrupción
trap cleanup INT

# Mantener el script corriendo
wait
