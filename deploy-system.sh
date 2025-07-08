#!/bin/bash

# Script de despliegue para Ubuntu Server
# Mecánica Asistida - Laravel + React

echo "🚀 INICIANDO DESPLIEGUE EN UBUNTU SERVER"
echo "======================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/var/www/mecanica"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
USER="www-data"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias del sistema
echo "🔧 Instalando dependencias del sistema..."
sudo apt install -y nginx postgresql postgresql-contrib php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mysql php8.2-pgsql php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl \
    php8.2-xml php8.2-bcmath php8.2-json php8.2-tokenizer unzip curl

# 3. Instalar Node.js y npm
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Instalar Composer
echo "🎼 Instalando Composer..."
if [ ! -f /usr/local/bin/composer ]; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi

# 5. Crear directorios del proyecto
echo "📁 Creando estructura de directorios..."
sudo mkdir -p $PROJECT_DIR
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $FRONTEND_DIR

# 6. Configurar PostgreSQL
echo "🐘 Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE mecanica_db;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER mecanica2025 WITH PASSWORD 'ubuntumecanica';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mecanica_db TO mecanica2025;" 2>/dev/null || true

print_status "Sistema base configurado"

echo ""
echo "📋 SIGUIENTES PASOS MANUALES:"
echo "1. Copiar archivos del proyecto a $PROJECT_DIR"
echo "2. Configurar Nginx"
echo "3. Configurar SSL/HTTPS"
echo "4. Ejecutar migraciones y seeders"
echo ""
echo "🔗 Usar: ./deploy-app.sh para continuar con la instalación"
