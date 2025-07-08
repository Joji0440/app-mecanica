#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🌐 Configuración de Nginx para Mecánica Asistida"
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

# Verificar si está en el directorio correcto
if [ ! -d "vistas/dist" ]; then
    error_exit "Debe ejecutar desde el directorio raíz del proyecto"
fi

# Verificar si Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando Nginx...${NC}"
    sudo apt update
    sudo apt install -y nginx || error_exit "Error al instalar Nginx"
fi

# Crear directorio de configuración si no existe
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Crear configuración de Nginx
echo -e "${YELLOW}⚙️ Creando configuración de Nginx...${NC}"

sudo tee /etc/nginx/sites-available/mecanica > /dev/null << 'EOF'
server {
    listen 80;
    server_name 172.28.101.4 localhost;
    root /home/mecanica/Downloads/app-mecanica/vistas/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/mecanica_access.log;
    error_log /var/log/nginx/mecanica_error.log;

    # Configuración para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Configuración para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxy para el backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Headers para CORS
        add_header Access-Control-Allow-Origin "http://172.28.101.4" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "http://172.28.101.4";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 200;
        }
    }

    # Proxy para Sanctum
    location /sanctum/ {
        proxy_pass http://127.0.0.1:8000/sanctum/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar el sitio
echo -e "${YELLOW}🔗 Habilitando sitio...${NC}"
sudo ln -sf /etc/nginx/sites-available/mecanica /etc/nginx/sites-enabled/

# Deshabilitar sitio por defecto
sudo rm -f /etc/nginx/sites-enabled/default

# Dar permisos al directorio
echo -e "${YELLOW}🔒 Configurando permisos...${NC}"
sudo chown -R www-data:www-data /home/mecanica/Downloads/app-mecanica/vistas/dist
sudo chmod -R 755 /home/mecanica/Downloads/app-mecanica/vistas/dist

# Probar configuración
echo -e "${YELLOW}🧪 Probando configuración de Nginx...${NC}"
sudo nginx -t || error_exit "Error en la configuración de Nginx"

# Reiniciar Nginx
echo -e "${YELLOW}🔄 Reiniciando Nginx...${NC}"
sudo systemctl restart nginx || error_exit "Error al reiniciar Nginx"

# Verificar estado
sudo systemctl status nginx --no-pager -l

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Configuración completada exitosamente!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}🌐 URLs de acceso:${NC}"
echo "- Frontend: http://172.28.101.4"
echo "- API: http://172.28.101.4/api"
echo "- Health Check: http://172.28.101.4/api/health"
echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo "- Ver logs: sudo tail -f /var/log/nginx/mecanica_access.log"
echo "- Reiniciar: sudo systemctl restart nginx"
echo "- Estado: sudo systemctl status nginx"
echo ""
echo -e "${GREEN}🎉 ¡Ahora puedes acceder a http://172.28.101.4 sin puerto!${NC}"
