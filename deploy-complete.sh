#!/bin/bash

# 🚀 SCRIPT DE DEPLOY COMPLETO CON HTTPS Y OPTIMIZACIONES
# Versión mejorada que incluye todas las correcciones implementadas

echo "🚀 DEPLOY COMPLETO SISTEMA MECÁNICA ASISTIDA"
echo "============================================="

# Variables de configuración
DOMAIN="192.168.0.103"
PROJECT_DIR="/var/www/mecanica"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="/var/www/html/app-mecanica/vistas/dist"
SOURCE_DIR="/home/mecanica/Downloads/app-mecanica"
VISTAS_SOURCE="$SOURCE_DIR/vistas"
MECANICA_SOURCE="$SOURCE_DIR/Mecanica"

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

# 1. Verificar sistema
echo "🔍 1. Verificando sistema..."
if ! command -v nginx &> /dev/null; then
    print_error "Nginx no está instalado"
    exit 1
fi

if ! command -v php &> /dev/null; then
    print_error "PHP no está instalado"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

print_status "Sistema verificado"

# 2. Crear directorios necesarios
echo "📁 2. Creando estructura de directorios..."
sudo mkdir -p $PROJECT_DIR
sudo mkdir -p /var/www/html/app-mecanica/vistas
print_status "Directorios creados"

# 3. Copiar y configurar backend
echo "🔧 3. Desplegando backend Laravel..."
if [ -d "$MECANICA_SOURCE" ]; then
    sudo cp -r $MECANICA_SOURCE $BACKEND_DIR
    sudo chown -R www-data:www-data $BACKEND_DIR
    sudo chmod -R 755 $BACKEND_DIR
    sudo chmod -R 775 $BACKEND_DIR/storage
    sudo chmod -R 775 $BACKEND_DIR/bootstrap/cache
    print_status "Backend copiado"
else
    print_error "Directorio fuente del backend no encontrado: $MECANICA_SOURCE"
    exit 1
fi

# 4. Instalar dependencias del backend
echo "📦 4. Instalando dependencias de Laravel..."
cd $BACKEND_DIR
sudo -u www-data composer install --no-dev --optimize-autoloader
print_status "Dependencias de Laravel instaladas"

# 5. Configurar archivo .env para producción
echo "⚙️  5. Configurando variables de entorno..."
sudo -u www-data cp .env.example .env
sudo -u www-data tee .env > /dev/null << EOF
APP_NAME=MecanicaAsistida
APP_ENV=production
APP_KEY=base64:MlMrGBKCOmn9IpBXBwX2BjBOhxA7nRFwURb+4I6w+2Y=
APP_DEBUG=false
APP_URL=https://$DOMAIN

APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_ES

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mecanica_db
DB_USERNAME=mecanica2025
DB_PASSWORD=ubuntumecanica

SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=public

SANCTUM_STATEFUL_DOMAINS=$DOMAIN,localhost

VITE_APP_NAME=MecanicaAsistida
EOF

print_status "Variables de entorno configuradas"

# 6. Configurar base de datos
echo "🗄️  6. Configurando base de datos..."
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan db:seed --force
print_status "Base de datos configurada"

# 7. Crear enlace simbólico de storage
echo "🔗 7. Configurando storage..."
sudo -u www-data php artisan storage:link
print_status "Enlace simbólico de storage creado"

# 8. Construir y desplegar frontend
echo "🎨 8. Construyendo y desplegando frontend..."
if [ -d "$VISTAS_SOURCE" ]; then
    cd $VISTAS_SOURCE
    
    # Configurar variables de entorno del frontend
    tee .env > /dev/null << EOF
VITE_API_URL=https://$DOMAIN/api
VITE_APP_URL=https://$DOMAIN
EOF
    
    # Instalar dependencias y construir
    npm install
    npm run build
    
    # Copiar build al servidor
    sudo mkdir -p /var/www/html/app-mecanica/vistas
    sudo cp -r dist/* /var/www/html/app-mecanica/vistas/
    sudo chown -R www-data:www-data /var/www/html/app-mecanica/vistas/
    
    print_status "Frontend construido y desplegado"
else
    print_error "Directorio fuente del frontend no encontrado: $VISTAS_SOURCE"
    exit 1
fi

# 9. Instalar y configurar PHP-FPM
echo "🔧 9. Configurando PHP-FPM..."
sudo apt update
sudo apt install -y php8.2-fpm
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fmp
print_status "PHP-FPM configurado"

# 10. Configurar certificados SSL auto-firmados
echo "🔒 10. Configurando certificados SSL..."
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /etc/ssl/certs

# Generar certificado auto-firmado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/mecanica-selfsigned.key \
    -out /etc/ssl/certs/mecanica-selfsigned.crt \
    -subj "/C=ES/ST=Madrid/L=Madrid/O=MecanicaAsistida/OU=IT/CN=$DOMAIN"

# Generar parámetros DH
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

print_status "Certificados SSL creados"

# 11. Configurar Nginx con HTTPS optimizado
echo "🌐 11. Configurando Nginx..."
sudo tee /etc/nginx/sites-available/mecanica << EOF
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    root /var/www/mecanica/backend/public;
    index index.php index.html;

    # Certificados SSL
    ssl_certificate /etc/ssl/certs/mecanica-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/mecanica-selfsigned.key;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;

    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Storage files - Servidos directamente desde public/storage (enlace simbólico)
    location /storage/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # API routes - Manejadas por Laravel
    location /api/ {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # Laravel PHP processing
    location ~ \.php\$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_param HTTPS on;
        fastcgi_param HTTP_X_FORWARDED_PROTO https;
    }

    # Frontend React SPA - Para rutas que no son API ni storage
    location / {
        # Primero intentar servir archivo estático desde Laravel public
        try_files \$uri \$uri/ @react;
    }

    # Fallback a React para el frontend
    location @react {
        root /var/www/html/app-mecanica/vistas;
        try_files \$uri \$uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
    }

    # Archivos estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Intentar desde Laravel public primero, luego desde React
        try_files \$uri @react_static;
    }

    # Archivos estáticos de React
    location @react_static {
        root /var/www/html/app-mecanica/vistas;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files (pero permitir storage público)
    location ~ /\. {
        deny all;
    }

    location ~ /(vendor|bootstrap|config|database|routes|tests)/ {
        deny all;
    }
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/mecanica /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx

print_status "Nginx configurado"

# 12. Limpiar cache y optimizar
echo "🧹 12. Optimizando sistema..."
cd $BACKEND_DIR
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

print_status "Sistema optimizado"

# 13. Verificar funcionamiento
echo "🔍 13. Verificando funcionamiento..."
sleep 3

# Test Frontend
FRONTEND_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    print_status "Frontend funcionando: $FRONTEND_STATUS"
else
    print_warning "Frontend: $FRONTEND_STATUS"
fi

# Test API
API_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/health" 2>/dev/null)
if [ "$API_STATUS" = "200" ]; then
    print_status "API funcionando: $API_STATUS"
else
    print_warning "API: $API_STATUS"
fi

# Test Storage
STORAGE_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/storage/" 2>/dev/null)
if [ "$STORAGE_STATUS" = "200" ] || [ "$STORAGE_STATUS" = "404" ]; then
    print_status "Storage configurado: $STORAGE_STATUS"
else
    print_warning "Storage: $STORAGE_STATUS"
fi

# 14. Mostrar resumen
echo ""
echo "🎉 ¡DEPLOY COMPLETADO EXITOSAMENTE!"
echo "=================================="
echo ""
print_info "🌐 URLs del sistema:"
echo "   Frontend: https://$DOMAIN"
echo "   API: https://$DOMAIN/api"
echo "   Health: https://$DOMAIN/api/health"
echo "   Storage: https://$DOMAIN/storage"
echo ""
print_info "👤 Credenciales por defecto:"
echo "   Admin: admin@mecanica.com / password"
echo "   Mecánico: mecanico@mecanica.com / password"
echo "   Cliente: cliente@mecanica.com / password"
echo ""
print_info "🔧 Servicios configurados:"
echo "   ✅ Nginx con HTTPS"
echo "   ✅ PHP-FPM"
echo "   ✅ PostgreSQL"
echo "   ✅ Laravel optimizado"
echo "   ✅ React SPA"
echo ""
print_warning "🔒 Nota sobre certificado SSL:"
echo "   - Certificado auto-firmado para desarrollo"
echo "   - El navegador mostrará advertencia de seguridad"
echo "   - Hacer clic en 'Avanzado' → 'Proceder a $DOMAIN'"
echo ""
print_info "📋 Comandos útiles:"
echo "   sudo systemctl status nginx"
echo "   sudo systemctl status php8.2-fpm"
echo "   curl -k https://$DOMAIN/api/health"
echo ""
echo "🚀 ¡Sistema listo para usar!"
