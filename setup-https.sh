#!/bin/bash

# Script para configurar HTTPS/SSL con Let's Encrypt en el sistema
# Ejecutar después de tener el sistema funcionando con HTTP

echo "🔒 CONFIGURANDO HTTPS/SSL CON LET'S ENCRYPT"
echo "=========================================="

# Variables
DOMAIN="192.168.0.103"
EMAIL="lizzadimilazzo2003@gmail.com
"  # Cambiar por email real
PROJECT_DIR="/var/www/mecanica"
BACKEND_DIR="$PROJECT_DIR/backend"

print_status() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

# 1. Verificar que el sistema actual está funcionando
echo "🔍 Verificando sistema actual..."
if ! curl -s http://$DOMAIN/api/health > /dev/null; then
    print_error "El sistema HTTP no está funcionando. Configúralo primero."
    exit 1
fi
print_status "Sistema HTTP funcionando correctamente"

# 2. Instalar Certbot
echo "📦 Instalando Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 3. Verificar configuración de Nginx
echo "🌐 Verificando configuración de Nginx..."
if ! sudo nginx -t; then
    print_error "Error en configuración de Nginx"
    exit 1
fi

# 4. Obtener certificado SSL
echo "🔒 Obteniendo certificado SSL..."
print_warning "NOTA: Para un certificado real, necesitas un dominio público válido"
print_warning "Para IP local (192.168.x.x), usaremos certificado auto-firmado"

read -p "¿Tienes un dominio público válido? (y/n): " has_domain

if [ "$has_domain" = "y" ] || [ "$has_domain" = "Y" ]; then
    read -p "Ingresa tu dominio (ej: mecanica.midominio.com): " DOMAIN
    read -p "Ingresa tu email: " EMAIL
    
    echo "Obteniendo certificado Let's Encrypt para $DOMAIN..."
    sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email
    
    if [ $? -eq 0 ]; then
        print_status "Certificado SSL obtenido exitosamente"
    else
        print_error "Error obteniendo certificado SSL"
        exit 1
    fi
else
    echo "Creando certificado auto-firmado para desarrollo..."
    
    # Crear directorio para certificados
    sudo mkdir -p /etc/ssl/private
    sudo mkdir -p /etc/ssl/certs
    
    # Generar certificado auto-firmado
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/mecanica-selfsigned.key \
        -out /etc/ssl/certs/mecanica-selfsigned.crt \
        -subj "/C=ES/ST=Madrid/L=Madrid/O=MecanicaAsistida/OU=IT/CN=$DOMAIN"
    
    # Generar parámetros DH
    sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
    
    print_status "Certificado auto-firmado creado"
fi

# 5. Configurar Nginx para HTTPS
echo "🌐 Configurando Nginx para HTTPS..."

if [ "$has_domain" = "y" ] || [ "$has_domain" = "Y" ]; then
    # Certbot ya configuró Nginx automáticamente
    print_status "Nginx configurado automáticamente por Certbot"
else
    # Configurar manualmente para certificado auto-firmado
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
        root /var/www/html/app-mecanica/vistas/dist;
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
        root /var/www/html/app-mecanica/vistas/dist;
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
fi

# 6. Actualizar variables de entorno
echo "⚙️  Actualizando variables de entorno..."

# Backend .env
if [ "$has_domain" = "y" ] || [ "$has_domain" = "Y" ]; then
    NEW_URL="https://$DOMAIN"
else
    NEW_URL="https://$DOMAIN"
fi

# Actualizar .env del backend
cd $BACKEND_DIR
if [ -f .env ]; then
    sudo sed -i "s|APP_URL=.*|APP_URL=$NEW_URL|g" .env
    sudo sed -i "s|SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=$DOMAIN,localhost|g" .env
    print_status "Backend .env actualizado"
fi

# Actualizar .env.production del backend
if [ -f .env.production ]; then
    sudo sed -i "s|APP_URL=.*|APP_URL=$NEW_URL|g" .env.production
    sudo sed -i "s|SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=$DOMAIN,localhost|g" .env.production
fi

# Frontend .env
cd /var/www/mecanica/frontend
if [ -f .env ]; then
    sudo sed -i "s|VITE_API_URL=.*|VITE_API_URL=$NEW_URL/api|g" .env
    sudo sed -i "s|VITE_APP_URL=.*|VITE_APP_URL=$NEW_URL|g" .env
    print_status "Frontend .env actualizado"
fi

# 7. Validar y recargar Nginx
echo "🔄 Validando y recargando Nginx..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    print_status "Nginx recargado exitosamente"
else
    print_error "Error en configuración de Nginx"
    exit 1
fi

# 8. Configurar PHP-FPM y deshabilitar artisan serve
echo "🔧 Configurando PHP-FPM..."
sudo apt install -y php8.2-fpm
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm

# Detener y deshabilitar laravel-mecanica si existe
if systemctl is-active --quiet laravel-mecanica 2>/dev/null; then
    sudo systemctl stop laravel-mecanica
    sudo systemctl disable laravel-mecanica
    print_status "Servicio laravel-mecanica deshabilitado"
fi

# Crear enlace simbólico de storage si no existe
cd $BACKEND_DIR
if [ ! -L "public/storage" ]; then
    sudo -u www-data php artisan storage:link
    print_status "Enlace simbólico de storage creado"
fi

# 9. Limpiar cache de Laravel
echo "🧹 Limpiando cache de Laravel..."
cd $BACKEND_DIR
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:cache

# 10. Configurar renovación automática (solo para Let's Encrypt)
if [ "$has_domain" = "y" ] || [ "$has_domain" = "Y" ]; then
    echo "🔄 Configurando renovación automática..."
    
    # Crear script de renovación
    sudo tee /etc/cron.d/certbot << EOF
# Renovar certificados Let's Encrypt automáticamente
0 12 * * * root certbot renew --quiet
EOF
    
    print_status "Renovación automática configurada"
fi

# 11. Testing
echo "🔍 Probando configuración HTTPS..."
sleep 3

# Test HTTPS
if curl -k -s https://$DOMAIN/api/health > /dev/null; then
    print_status "HTTPS funcionando correctamente"
else
    print_warning "HTTPS no responde, verificando configuración..."
fi

# Test redirección HTTP → HTTPS
if [ "$has_domain" = "y" ] || [ "$has_domain" = "Y" ] || [ "$has_domain" = "n" ] || [ "$has_domain" = "N" ]; then
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ 2>/dev/null || echo "000")
    if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
        print_status "Redirección HTTP → HTTPS funcionando"
    else
        print_warning "Redirección HTTP → HTTPS no configurada"
    fi
fi

print_status "¡Configuración HTTPS completada!"
echo ""
echo "🌐 URLs HTTPS:"
echo "   Frontend: $NEW_URL"
echo "   API: $NEW_URL/api"
echo "   Storage: $NEW_URL/storage"
echo "   Health: $NEW_URL/api/health"
echo ""

if [ "$has_domain" != "y" ] && [ "$has_domain" != "Y" ]; then
    print_warning "CERTIFICADO AUTO-FIRMADO:"
    echo "   - El navegador mostrará advertencia de seguridad"
    echo "   - Hacer clic en 'Avanzado' → 'Proceder a $DOMAIN'"
    echo "   - Para producción real, usar dominio público válido"
fi

echo ""
echo "🔒 CONFIGURACIÓN SSL COMPLETADA"
echo "📋 Próximos pasos:"
echo "   1. Probar HTTPS en navegador"
echo "   2. Verificar redirección HTTP → HTTPS"
echo "   3. Actualizar enlaces en aplicación"
if [ "$has_domain" = "y" ] || [ "$has_domain" = "Y" ]; then
    echo "   4. Certificado se renovará automáticamente"
fi
