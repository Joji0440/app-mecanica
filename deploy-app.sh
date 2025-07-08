#!/bin/bash

# Script para desplegar la aplicación
# Ejecutar después de deploy-system.sh

echo "🚀 DESPLEGANDO APLICACIÓN MECÁNICA ASISTIDA"
echo "========================================="

# Variables
PROJECT_DIR="/var/www/mecanica"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DOMAIN="tu-servidor.com"

print_status() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

# 1. Copiar archivos del backend
echo "📁 Copiando archivos del backend..."
sudo cp -r ./Mecanica/* $BACKEND_DIR/
sudo chown -R www-data:www-data $BACKEND_DIR

# 2. Instalar dependencias de Laravel
echo "📦 Instalando dependencias de Laravel..."
cd $BACKEND_DIR
sudo -u www-data composer install --optimize-autoloader --no-dev

# 3. Configurar Laravel para producción
echo "⚙️  Configurando Laravel..."
sudo cp .env.production .env
sudo -u www-data php artisan key:generate
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache

# 4. Ejecutar migraciones
echo "🗄️  Ejecutando migraciones..."
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan db:seed --class=RolesAndPermissionsSeeder --force

# 5. Configurar permisos
echo "🔐 Configurando permisos..."
sudo chown -R www-data:www-data $BACKEND_DIR/storage
sudo chown -R www-data:www-data $BACKEND_DIR/bootstrap/cache
sudo chmod -R 775 $BACKEND_DIR/storage
sudo chmod -R 775 $BACKEND_DIR/bootstrap/cache

# 6. Copiar y construir frontend
echo "🎨 Desplegando frontend..."
sudo cp -r ./vistas/* $FRONTEND_DIR/
cd $FRONTEND_DIR
sudo cp .env.production .env
sudo npm install
sudo npm run build
sudo cp -r dist/* /var/www/html/

# 7. Configurar Nginx
echo "🌐 Configurando Nginx..."
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

    # Archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 8. Activar sitio
sudo ln -sf /etc/nginx/sites-available/mecanica /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 9. Configurar PHP-FPM
echo "🐘 Configurando PHP-FPM..."
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm

# 10. Iniciar Laravel con supervisor
echo "🔄 Configurando servicios..."
sudo tee /etc/supervisor/conf.d/laravel-worker.conf << EOF
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php $BACKEND_DIR/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=$BACKEND_DIR/storage/logs/worker.log
stopwaitsecs=3600
EOF

# 11. Iniciar Laravel Serve (temporal - usar con cuidado en producción)
echo "🚀 Iniciando Laravel..."
cd $BACKEND_DIR
sudo -u www-data nohup php artisan serve --host=0.0.0.0 --port=8000 > /dev/null 2>&1 &

print_status "¡Despliegue completado!"
echo ""
echo "🌐 URL del frontend: http://$DOMAIN"
echo "🔌 URL de la API: http://$DOMAIN/api"
echo "🏠 Dashboard: http://$DOMAIN/dashboard"
echo ""
echo "📋 CREDENCIALES DE ADMIN:"
echo "📧 Email: admin@mecanica.com"
echo "🔒 Password: password123"
echo ""
echo "⚠️  SIGUIENTES PASOS RECOMENDADOS:"
echo "1. Configurar SSL con Let's Encrypt"
echo "2. Configurar firewall (UFW)"
echo "3. Configurar backup automático"
echo "4. Monitoreo y logs"
