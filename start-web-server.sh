#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🌐 Configurando servidor web para Mecánica Asistida"
echo "IP: 172.28.101.4"
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

# Verificar si estamos en el directorio correcto
if [ ! -d "vistas/dist" ]; then
    error_exit "No se encontró el directorio vistas/dist. Ejecute: cd vistas && npm run build"
fi

# Verificar si Python está disponible
if ! command -v python3 &> /dev/null; then
    error_exit "Python3 no está instalado. Instálelo con: sudo apt install python3"
fi

# Crear servidor web simple
echo -e "${YELLOW}🚀 Iniciando servidor web en puerto 80...${NC}"

# Verificar si el puerto 80 está libre
if netstat -tuln | grep -q ":80 "; then
    echo -e "${YELLOW}⚠️ Puerto 80 ocupado. Intentando con puerto 8080...${NC}"
    PORT=8080
else
    PORT=80
fi

# Cambiar al directorio dist
cd vistas/dist

# Crear servidor HTTP simple
echo -e "${GREEN}🌐 Servidor web iniciado en:${NC}"
echo -e "${GREEN}   http://172.28.101.4:${PORT}${NC}"
echo -e "${GREEN}   http://127.0.0.1:${PORT}${NC}"
echo ""
echo -e "${YELLOW}Presione Ctrl+C para detener el servidor${NC}"
echo ""

# Iniciar servidor
if [ "$PORT" = "80" ]; then
    sudo python3 -m http.server 80
else
    python3 -m http.server 8080
fi
