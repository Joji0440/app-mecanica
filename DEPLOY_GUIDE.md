# 🚀 Guía de Deploy - Sistema de Mecánica Móvil

## 📋 Resumen del Sistema

**Sistema completo Laravel + React con gestión de usuarios y roles**

### ✅ Características Implementadas:
- **Backend Laravel 11** con API REST
- **Frontend React 19** con TypeScript y Tailwind CSS v4
- **Sistema de autenticación** con Laravel Sanctum
- **Roles y permisos** con Spatie Permission
- **CRUD completo de usuarios** con protección por roles
- **Interfaz moderna** inspirada en sitios automotrices

### 🔐 Roles del Sistema:
- **Admin**: Acceso completo (create, read, update, delete usuarios y gestión de roles)
- **Manager**: Acceso limitado (create, read, update usuarios y gestión de roles)
- **User**: Solo lectura de información propia

---

## 🛠️ Deploy Paso a Paso

### 1. **Preparar el Build de Producción**

```bash
cd /home/mecanica/Downloads/app-mecanica
./build-production.sh
```

### 2. **Configurar Base de Datos**

```sql
-- Crear base de datos de producción
CREATE DATABASE mecanica_produccion;
CREATE USER 'mecanica_user'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON mecanica_produccion.* TO 'mecanica_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. **Migrar y Configurar Laravel**

```bash
cd /home/mecanica/Downloads/app-mecanica/Mecanica

# Copiar configuración de producción
cp .env.production .env

# Actualizar variables de base de datos en .env:
# DB_DATABASE=mecanica_produccion
# DB_USERNAME=mecanica_user
# DB_PASSWORD=password_seguro

# Ejecutar migraciones
php artisan migrate --force

# Ejecutar seeders (roles y permisos)
php artisan db:seed --class=RolesAndPermissionsSeeder

# Crear usuario admin inicial
php artisan tinker
# User::create([
#     'name' => 'Administrador',
#     'email' => 'admin@tudominio.com',
#     'password' => bcrypt('password_seguro')
# ])->assignRole('admin');
```

### 4. **Configurar Servidor Web**

#### **Opción A: Apache**

```apache
<VirtualHost *:80>
    DocumentRoot /home/mecanica/Downloads/app-mecanica/vistas/dist
    ServerName tudominio.com
    
    # Configuración para React Router
    <Directory /home/mecanica/Downloads/app-mecanica/vistas/dist>
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
    
    # Proxy para API
    ProxyPass /api http://localhost:8001/api
    ProxyPassReverse /api http://localhost:8001/api
</VirtualHost>

<VirtualHost *:8001>
    DocumentRoot /home/mecanica/Downloads/app-mecanica/Mecanica/public
    ServerName tudominio.com:8001
    
    <Directory /home/mecanica/Downloads/app-mecanica/Mecanica/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### **Opción B: Nginx**

```nginx
# Frontend
server {
    listen 80;
    server_name tudominio.com;
    root /home/mecanica/Downloads/app-mecanica/vistas/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy para API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend API
server {
    listen 8001;
    server_name tudominio.com;
    root /home/mecanica/Downloads/app-mecanica/Mecanica/public;
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 5. **Configurar HTTPS (Recomendado)**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-apache

# Obtener certificado SSL
sudo certbot --apache -d tudominio.com
```

---

## 🔧 Comandos de Mantenimiento

### **Actualizar Sistema:**

```bash
cd /home/mecanica/Downloads/app-mecanica

# Backend
cd Mecanica
git pull
composer install --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Frontend
cd ../vistas
git pull
npm ci
npm run build
```

### **Logs y Debug:**

```bash
# Ver logs de Laravel
tail -f /home/mecanica/Downloads/app-mecanica/Mecanica/storage/logs/laravel.log

# Limpiar logs
> /home/mecanica/Downloads/app-mecanica/Mecanica/storage/logs/laravel.log
```

---

## 📊 URLs del Sistema

- **Frontend:** `https://172.28.101.4`
- **API Backend:** `https://172.28.101.4/api`
- **Panel de Administración:** `https://172.28.101.4/user-management`
- **Salud de API:** `https://172.28.101.4/api/health`

---

## 🔐 Usuarios por Defecto

| Email | Password | Rol | Permisos |
|-------|----------|-----|----------|
| admin@tudominio.com | password_seguro | admin | Completos |

---

## 📱 Funcionalidades

### **Para Usuarios Admin:**
- ✅ Ver lista completa de usuarios
- ✅ Crear nuevos usuarios
- ✅ Editar información de usuarios
- ✅ Eliminar usuarios (con protecciones)
- ✅ Asignar y remover roles
- ✅ Ver estadísticas del sistema

### **Para Usuarios Manager:**
- ✅ Ver lista de usuarios
- ✅ Crear y editar usuarios
- ✅ Asignar roles (sin eliminar)

### **Para Usuarios Normales:**
- ✅ Ver información propia
- ✅ Editar perfil personal

---

## 🆘 Troubleshooting

**Error 500:** Verificar permisos de storage y logs de Laravel
**Error 404 en rutas:** Verificar configuración de servidor web
**Error de CORS:** Verificar configuración de Sanctum
**Error de permisos:** Verificar roles en base de datos

---

## 📞 Soporte

Sistema desarrollado con:
- Laravel 11
- React 19 + TypeScript
- Tailwind CSS v4
- Laravel Sanctum
- Spatie Permission
