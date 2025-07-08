#!/bin/bash

# Script para actualizar un deploy existente con nuevas configuraciones
# Ejecutar cuando ya tienes un deploy funcional y quieres aplicar mejoras

echo "🔄 ACTUALIZANDO DEPLOY EXISTENTE"
echo "================================"

# Variables
PROJECT_DIR="/var/www/mecanica"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DOMAIN="192.168.0.103"

print_status() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

# 1. Verificar que el backend existe
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend no encontrado en $BACKEND_DIR"
    echo "Ejecuta primero: ./deploy-app.sh"
    exit 1
fi

echo "📁 Backend encontrado en $BACKEND_DIR"

# 2. Crear enlace simbólico para storage si no existe
echo "🔗 Verificando enlace simbólico de storage..."
cd $BACKEND_DIR

if [ ! -L "public/storage" ]; then
    echo "Creando enlace simbólico para storage..."
    sudo -u www-data php artisan storage:link
    print_status "Enlace simbólico creado"
else
    print_status "Enlace simbólico ya existe"
fi

# 3. Verificar permisos de storage
echo "🔐 Verificando permisos de storage..."
sudo chown -R www-data:www-data $BACKEND_DIR/storage/app/public
sudo chmod -R 755 $BACKEND_DIR/storage/app/public
print_status "Permisos de storage actualizados"

# 4. Actualizar configuración de Nginx para incluir /storage
echo "🌐 Actualizando configuración de Nginx..."
sudo tee /etc/nginx/sites-available/mecanica << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root /var/www/html;
    index index.html;

    # Frontend - React SPA
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
    }

    # Backend - Laravel API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Laravel Storage Files
    location /storage {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 5. Validar y recargar Nginx
echo "🔄 Recargando Nginx..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    print_status "Nginx actualizado correctamente"
else
    print_error "Error en la configuración de Nginx"
    exit 1
fi

# 6. Verificar que Laravel esté corriendo
echo "🚀 Verificando Laravel..."
if ! pgrep -f "php artisan serve" > /dev/null; then
    print_warning "Laravel no está corriendo, iniciando..."
    cd $BACKEND_DIR
    sudo -u www-data nohup php artisan serve --host=0.0.0.0 --port=8000 > /dev/null 2>&1 &
    sleep 3
fi

# 7. Probar endpoints
echo "🔍 Probando endpoints..."

# Test API Health
if curl -s -f "http://$DOMAIN/api/health" > /dev/null; then
    print_status "API funcionando correctamente"
else
    print_error "API no responde"
fi

# Test Storage (crear archivo de prueba si no existe)
TEST_FILE="$BACKEND_DIR/storage/app/public/test.txt"
if [ ! -f "$TEST_FILE" ]; then
    echo "Test file" | sudo tee "$TEST_FILE" > /dev/null
fi

if curl -s -f "http://$DOMAIN/storage/test.txt" > /dev/null; then
    print_status "Storage funcionando correctamente"
else
    print_error "Storage no responde correctamente"
fi

# Test HTTPS (si está configurado)
if [ -f "/etc/ssl/certs/mecanica-selfsigned.crt" ] || [ -d "/etc/letsencrypt/live" ]; then
    echo "🔒 Verificando HTTPS..."
    if curl -k -s -f "https://$DOMAIN/api/health" > /dev/null; then
        print_status "HTTPS funcionando correctamente"
        
        # Test redirección HTTP → HTTPS
        HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ 2>/dev/null || echo "000")
        if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
            print_status "Redirección HTTP → HTTPS funcionando"
        else
            print_warning "Redirección HTTP → HTTPS no funciona"
        fi
    else
        print_warning "HTTPS no responde correctamente"
    fi
fi

# 8. Limpiar cache de Laravel
echo "🧹 Limpiando cache..."
cd $BACKEND_DIR
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:cache
print_status "Cache limpiado"

print_status "¡Actualización completada!"
echo ""
echo "🌐 URLs disponibles:"
echo "   Frontend: http://$DOMAIN"
echo "   API: http://$DOMAIN/api"
echo "   Storage: http://$DOMAIN/storage"
echo ""
echo "🔍 Pruebas realizadas:"
echo "   ✅ API Health Check"
echo "   ✅ Storage Access"
echo "   ✅ Nginx Configuration"
echo ""
echo "📋 CREDENCIALES DE ADMIN:"
echo "📧 Email: admin@mecanica.com"
echo "🔒 Password: password123"
