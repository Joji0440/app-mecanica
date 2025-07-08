#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 DIAGNÓSTICO COMPLETO DEL SERVIDOR"
echo "IP: 172.28.101.4"
echo "========================================"

# Función para mostrar estado
function check_status {
    local service=$1
    local command=$2
    local description=$3
    
    echo -n "Verificando $description... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR${NC}"
        return 1
    fi
}

# Función para mostrar información
function show_info {
    local title=$1
    local command=$2
    
    echo -e "${BLUE}$title:${NC}"
    eval "$command"
    echo ""
}

# 1. Verificar servicios
echo -e "${YELLOW}🔧 SERVICIOS${NC}"
check_status "nginx" "sudo systemctl is-active nginx" "Nginx"
check_status "postgresql" "sudo systemctl is-active postgresql" "PostgreSQL"
echo ""

# 2. Verificar puertos
echo -e "${YELLOW}🌐 PUERTOS${NC}"
check_status "puerto80" "sudo ss -tuln | grep -q ':80'" "Puerto 80"
check_status "puerto8000" "sudo ss -tuln | grep -q ':8000'" "Puerto 8000"
check_status "puerto5432" "sudo ss -tuln | grep -q ':5432'" "Puerto 5432"
echo ""

# 3. Verificar procesos
echo -e "${YELLOW}⚙️ PROCESOS${NC}"
check_status "laravel" "ps aux | grep -q 'php artisan serve'" "Laravel Server"
check_status "postgres" "ps aux | grep -q postgres" "PostgreSQL"
echo ""

# 4. Verificar conectividad
echo -e "${YELLOW}🔗 CONECTIVIDAD${NC}"
check_status "local_web" "curl -f -s http://172.28.101.4 > /dev/null" "Web Local"
check_status "local_api" "curl -f -s http://172.28.101.4/api/health > /dev/null" "API Local"
check_status "backend_direct" "curl -f -s http://172.28.101.4:8000/api/health > /dev/null" "Backend Directo"
echo ""

# 5. Verificar configuración
echo -e "${YELLOW}📋 CONFIGURACIÓN${NC}"
check_status "nginx_config" "sudo nginx -t" "Configuración Nginx"
check_status "nginx_site" "test -f /etc/nginx/sites-enabled/mecanica" "Sitio Habilitado"
check_status "dist_files" "test -f /home/mecanica/Downloads/app-mecanica/vistas/dist/index.html" "Archivos Dist"
echo ""

# 6. Información detallada
show_info "📡 INTERFACES DE RED" "ip addr show enp0s3 | grep inet"
show_info "🚪 PUERTOS EN USO" "sudo ss -tuln | grep -E ':(80|8000|5432)'"
show_info "🔄 PROCESOS ACTIVOS" "ps aux | grep -E '(nginx|postgres|php artisan)' | grep -v grep"
show_info "📄 LOGS RECIENTES" "sudo tail -3 /var/log/nginx/mecanica_error.log 2>/dev/null || echo 'No hay logs de error'"

# 7. Pruebas de conectividad
echo -e "${YELLOW}🧪 PRUEBAS DE CONECTIVIDAD${NC}"

echo -n "Prueba HTTP directo... "
if curl -f -s --connect-timeout 5 http://172.28.101.4 > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR${NC}"
fi

echo -n "Prueba API Health... "
if curl -f -s --connect-timeout 5 http://172.28.101.4/api/health > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR${NC}"
fi

echo -n "Prueba desde localhost... "
if curl -f -s --connect-timeout 5 http://localhost > /dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERROR${NC}"
fi

echo ""

# 8. URLs de acceso
echo -e "${BLUE}🌐 URLS DE ACCESO:${NC}"
echo "- Frontend: http://172.28.101.4"
echo "- API: http://172.28.101.4/api"
echo "- Health: http://172.28.101.4/api/health"
echo "- Backend: http://172.28.101.4:8000"
echo ""

# 9. Comandos útiles
echo -e "${BLUE}🛠️ COMANDOS ÚTILES:${NC}"
echo "- Ver logs: sudo tail -f /var/log/nginx/mecanica_access.log"
echo "- Reiniciar: sudo systemctl restart nginx"
echo "- Verificar: curl -v http://172.28.101.4"
echo ""

echo "========================================"
echo -e "${GREEN}✅ Diagnóstico completado${NC}"
echo "========================================"
