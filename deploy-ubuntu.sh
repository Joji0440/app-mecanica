#!/bin/bash

# Script de despliegue automatizado para Ubuntu Server
# Proyecto: Mecánica Asistida en Línea

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando despliegue de Mecánica Asistida en Ubuntu Server${NC}"
echo ""

# Función para mostrar mensajes
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar si se ejecuta como root o con sudo
if [[ $EUID -eq 0 ]]; then
   print_error "Este script no debe ejecutarse como root. Usa un usuario con permisos sudo."
   exit 1
fi

# Verificar que sudo esté disponible
if ! sudo -n true 2>/dev/null; then
    print_error "Este script requiere permisos sudo. Ejecuta: sudo -v"
    exit 1
fi

# Variables de configuración
PROJECT_NAME="app-mecanica"
DOMAIN="localhost"
DB_NAME="mecanica_db"
DB_USER="mecanica"
PROJECT_DIR="/var/www/html/$PROJECT_NAME"
CURRENT_DIR="$(pwd)"

print_info "Configuración del proyecto:"
echo "  - Nombre: $PROJECT_NAME"
echo "  - Dominio: $DOMAIN"
echo "  - Base de datos: $DB_NAME"
echo "  - Usuario DB: $DB_USER"
echo "  - Directorio: $PROJECT_DIR"
echo ""

read -p "¿Continuar con la instalación? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 1. Actualizar sistema
print_info "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_status "Sistema actualizado"

# 2. Instalar dependencias básicas
print_info "Instalando dependencias básicas..."
sudo apt install -y curl wget git unzip build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_status "Dependencias básicas instaladas"

# 3. Instalar PHP 8.2
print_info "Instalando PHP 8.2..."
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-common php8.2-mysql php8.2-pgsql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-bcmath php8.2-json php8.2-tokenizer php8.2-gd php8.2-intl php8.2-sqlite3
print_status "PHP 8.2 instalado"

# 4. Instalar Composer
print_info "Instalando Composer..."
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi
print_status "Composer instalado"

# 5. Instalar Node.js
print_info "Instalando Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
print_status "Node.js instalado"

# 6. Instalar Nginx
print_info "Instalando Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
print_status "Nginx instalado y configurado"

# 7. Configurar firewall
print_info "Configurando firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
print_status "Firewall configurado"

# 8. Preguntar por el tipo de base de datos
echo ""
print_info "Selecciona el tipo de base de datos:"
echo "1) PostgreSQL (Recomendado)"
echo "2) MySQL"
read -p "Opción (1-2): " db_choice

DB_PASSWORD=""
while [[ -z "$DB_PASSWORD" ]]; do
    read -s -p "Introduce una contraseña segura para la base de datos: " DB_PASSWORD
    echo
    if [[ ${#DB_PASSWORD} -lt 8 ]]; then
        print_warning "La contraseña debe tener al menos 8 caracteres"
        DB_PASSWORD=""
    fi
done

if [[ $db_choice == "1" ]]; then
    # Instalar PostgreSQL
    print_info "Instalando PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Configurar base de datos PostgreSQL
    print_info "Configurando base de datos PostgreSQL..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    
    DB_CONNECTION="pgsql"
    DB_PORT="5432"
    print_status "PostgreSQL configurado"
    
elif [[ $db_choice == "2" ]]; then
    # Instalar MySQL
    print_info "Instalando MySQL..."
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    # Configurar base de datos MySQL
    print_info "Configurando base de datos MySQL..."
    sudo mysql -e "CREATE DATABASE $DB_NAME;"
    sudo mysql -e "CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
    sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
    sudo mysql -e "FLUSH PRIVILEGES;"
    
    DB_CONNECTION="mysql"
    DB_PORT="3306"
    print_status "MySQL configurado"
else
    print_error "Opción inválida"
    exit 1
fi

# 9. Copiar proyecto al directorio web
print_info "Copiando proyecto..."
sudo mkdir -p /var/www/html
sudo cp -r "$CURRENT_DIR" "$PROJECT_DIR"
sudo chown -R www-data:www-data "$PROJECT_DIR"
sudo chmod -R 755 "$PROJECT_DIR"
print_status "Proyecto copiado"

# 10. Configurar permisos específicos
print_info "Configurando permisos..."
cd "$PROJECT_DIR/Mecanica"
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
print_status "Permisos configurados"

# 11. Instalar dependencias PHP
print_info "Instalando dependencias PHP..."
sudo -u www-data composer install --optimize-autoloader --no-dev
print_status "Dependencias PHP instaladas"

# 12. Configurar archivo .env
print_info "Configurando archivo .env..."
sudo -u www-data cp .env.example .env
sudo -u www-data php artisan key:generate

# Actualizar configuración de base de datos en .env
sudo sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=$DB_CONNECTION/" .env
sudo sed -i "s/DB_HOST=.*/DB_HOST=127.0.0.1/" .env
sudo sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env
sudo sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sudo sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
sudo sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env

print_status "Archivo .env configurado"

# 13. Instalar dependencias Node.js y construir frontend
print_info "Instalando dependencias del frontend..."
cd "$PROJECT_DIR/vistas"
sudo -u www-data npm install
sudo -u www-data npm run build
print_status "Frontend construido"

# 14. Configurar base de datos
print_info "Ejecutando migraciones..."
cd "$PROJECT_DIR/Mecanica"
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan db:seed --force
print_status "Base de datos configurada"

# 15. Configurar Nginx
print_info "Configurando Nginx..."
sudo cp "$PROJECT_DIR/nginx-mecanica.conf" "/etc/nginx/sites-available/$PROJECT_NAME"
sudo ln -sf "/etc/nginx/sites-available/$PROJECT_NAME" "/etc/nginx/sites-enabled/"
sudo rm -f /etc/nginx/sites-enabled/default

# Reemplazar localhost con el dominio si es diferente
if [[ "$DOMAIN" != "localhost" ]]; then
    sudo sed -i "s/server_name localhost;/server_name $DOMAIN;/" "/etc/nginx/sites-available/$PROJECT_NAME"
fi

# Verificar configuración de Nginx
sudo nginx -t
if [[ $? -eq 0 ]]; then
    sudo systemctl reload nginx
    print_status "Nginx configurado"
else
    print_error "Error en la configuración de Nginx"
    exit 1
fi

# 16. Configurar PHP-FPM
print_info "Configurando PHP-FPM..."
sudo systemctl restart php8.2-fpm
print_status "PHP-FPM configurado"

# 17. Configurar cron para scheduler (opcional)
print_info "¿Quieres configurar el scheduler de Laravel? (y/n)"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    (sudo crontab -l 2>/dev/null; echo "* * * * * cd $PROJECT_DIR/Mecanica && php artisan schedule:run >> /dev/null 2>&1") | sudo crontab -
    print_status "Scheduler configurado"
fi

# 18. Optimizar Laravel para producción
print_info "Optimizando para producción..."
cd "$PROJECT_DIR/Mecanica"
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
print_status "Optimización completada"

echo ""
echo -e "${GREEN}🎉 ¡Despliegue completado exitosamente!${NC}"
echo ""
echo -e "${BLUE}Información del despliegue:${NC}"
echo "  - URL: http://$DOMAIN"
echo "  - Directorio: $PROJECT_DIR"
echo "  - Base de datos: $DB_CONNECTION ($DB_NAME)"
echo "  - Logs Laravel: $PROJECT_DIR/Mecanica/storage/logs/laravel.log"
echo "  - Logs Nginx: /var/log/nginx/mecanica_*.log"
echo ""
echo -e "${YELLOW}Comandos útiles:${NC}"
echo "  - Ver logs Laravel: sudo tail -f $PROJECT_DIR/Mecanica/storage/logs/laravel.log"
echo "  - Ver logs Nginx: sudo tail -f /var/log/nginx/mecanica_error.log"
echo "  - Reiniciar servicios: sudo systemctl restart nginx php8.2-fpm"
echo "  - Limpiar cache: cd $PROJECT_DIR/Mecanica && sudo -u www-data php artisan cache:clear"
echo ""

# Verificar estado de servicios
print_info "Estado de servicios:"
sudo systemctl is-active --quiet nginx && echo -e "${GREEN}✅ Nginx: Activo${NC}" || echo -e "${RED}❌ Nginx: Inactivo${NC}"
sudo systemctl is-active --quiet php8.2-fpm && echo -e "${GREEN}✅ PHP-FPM: Activo${NC}" || echo -e "${RED}❌ PHP-FPM: Inactivo${NC}"

if [[ $DB_CONNECTION == "pgsql" ]]; then
    sudo systemctl is-active --quiet postgresql && echo -e "${GREEN}✅ PostgreSQL: Activo${NC}" || echo -e "${RED}❌ PostgreSQL: Inactivo${NC}"
else
    sudo systemctl is-active --quiet mysql && echo -e "${GREEN}✅ MySQL: Activo${NC}" || echo -e "${RED}❌ MySQL: Inactivo${NC}"
fi

echo ""
print_info "Verifica que todo funcione visitando: http://$DOMAIN"
