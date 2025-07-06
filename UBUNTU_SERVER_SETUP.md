# 🚀 Guía de Despliegue en Ubuntu Server

Esta guía te ayudará a configurar y desplegar el proyecto Mecánica Asistida en Ubuntu Server.

## 📋 Prerrequisitos del Sistema

### 1. Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar dependencias básicas
```bash
sudo apt install -y curl wget git unzip build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

## 🐘 Instalar PHP 8.2+

### 1. Añadir repositorio PHP
```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
```

### 2. Instalar PHP y extensiones necesarias
```bash
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-common php8.2-mysql php8.2-pgsql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-bcmath php8.2-json php8.2-tokenizer php8.2-gd php8.2-intl php8.2-sqlite3
```

### 3. Verificar instalación
```bash
php -v
```

## 🎼 Instalar Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
composer --version
```

## 🟢 Instalar Node.js 18+

### Método recomendado: NodeSource
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

## 🗄️ Instalar Base de Datos

### Opción A: PostgreSQL (Recomendado)
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuario y base de datos
sudo -u postgres psql
```

En PostgreSQL:
```sql
CREATE USER mecanica WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE mecanica_db OWNER mecanica;
GRANT ALL PRIVILEGES ON DATABASE mecanica_db TO mecanica;
\q
```

### Opción B: MySQL
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation

# Configurar usuario y base de datos
sudo mysql -u root -p
```

En MySQL:
```sql
CREATE DATABASE mecanica_db;
CREATE USER 'mecanica'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON mecanica_db.* TO 'mecanica'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 🌐 Instalar y Configurar Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🔒 Configurar Firewall

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
```

## 📁 Configurar el Proyecto

### 1. Clonar/Mover el proyecto
```bash
# Si estás trabajando localmente, mover a directorio web
sudo mkdir -p /var/www/html
sudo cp -r /home/mecanica/Downloads/app-mecanica /var/www/html/
sudo chown -R www-data:www-data /var/www/html/app-mecanica
sudo chmod -R 755 /var/www/html/app-mecanica
```

### 2. Configurar permisos
```bash
cd /var/www/html/app-mecanica/Mecanica
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 3. Instalar dependencias PHP
```bash
cd /var/www/html/app-mecanica/Mecanica
composer install --optimize-autoloader --no-dev
```

### 4. Configurar archivo .env
```bash
cp .env.example .env
php artisan key:generate
```

### 5. Instalar dependencias Node.js y construir frontend
```bash
cd /var/www/html/app-mecanica/vistas
npm install
npm run build
```

### 6. Configurar base de datos
```bash
cd /var/www/html/app-mecanica/Mecanica
php artisan migrate --force
php artisan db:seed --force
```

## ⚙️ Configuración de Nginx

### 1. Crear configuración del sitio
```bash
sudo nano /etc/nginx/sites-available/mecanica
```

### 2. Configurar PHP-FPM
```bash
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

Buscar y modificar:
```ini
user = www-data
group = www-data
listen = /run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 5
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
```

### 3. Reiniciar servicios
```bash
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
```

## 🔧 Configurar Servicios del Sistema

### 1. Crear servicio para Queue Worker (opcional)
```bash
sudo nano /etc/systemd/system/mecanica-worker.service
```

### 2. Configurar cron para scheduler
```bash
sudo crontab -e
```

Añadir:
```
* * * * * cd /var/www/html/app-mecanica/Mecanica && php artisan schedule:run >> /dev/null 2>&1
```

## 🔒 SSL/HTTPS con Let's Encrypt (Opcional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## 📊 Monitoreo y Logs

### Ver logs de Laravel
```bash
tail -f /var/www/html/app-mecanica/Mecanica/storage/logs/laravel.log
```

### Ver logs de Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Ver logs de PHP-FPM
```bash
sudo tail -f /var/log/php8.2-fpm.log
```

## ✅ Verificación Final

1. Verificar que Nginx esté funcionando: `sudo systemctl status nginx`
2. Verificar PHP-FPM: `sudo systemctl status php8.2-fpm`
3. Verificar base de datos: `sudo systemctl status postgresql` o `sudo systemctl status mysql`
4. Probar la aplicación en el navegador

## 🚨 Resolución de Problemas

### Permisos
```bash
sudo chown -R www-data:www-data /var/www/html/app-mecanica
sudo chmod -R 755 /var/www/html/app-mecanica
sudo chmod -R 775 /var/www/html/app-mecanica/Mecanica/storage
sudo chmod -R 775 /var/www/html/app-mecanica/Mecanica/bootstrap/cache
```

### Limpiar cache
```bash
cd /var/www/html/app-mecanica/Mecanica
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Recrear autoload
```bash
composer dump-autoload
```
