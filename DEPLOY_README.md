# 🚀 Despliegue en Ubuntu Server

Este documento te guía paso a paso para desplegar **Mecánica Asistida en Línea** en un servidor Ubuntu.

## 📋 Requisitos Previos

- Ubuntu Server 20.04 LTS o superior
- Acceso root o usuario con permisos sudo
- Al menos 2GB de RAM
- 10GB de espacio libre en disco
- Conexión a internet estable

## 🚀 Instalación Automática (Recomendado)

### Opción 1: Instalación Completa Automatizada

```bash
# 1. Navegar al directorio del proyecto
cd /home/mecanica/Downloads/app-mecanica

# 2. Ejecutar el script de despliegue
./deploy-ubuntu.sh
```

El script automáticamente:
- ✅ Instala todas las dependencias necesarias
- ✅ Configura PHP, Nginx, y base de datos
- ✅ Instala y configura el proyecto
- ✅ Optimiza para producción
- ✅ Configura permisos y seguridad

### Opción 2: Instalación Manual

Si prefieres control total sobre el proceso, sigue la [Guía Manual](UBUNTU_SERVER_SETUP.md).

## 🔧 Gestión Post-Instalación

### Script de Mantenimiento

Después de la instalación, usa el script de mantenimiento para gestionar el proyecto:

```bash
./maintenance.sh
```

**Funciones disponibles:**
- 📊 Ver estado de servicios
- 🔄 Reiniciar servicios
- 📋 Ver logs en tiempo real
- 🧹 Limpiar cache
- 🗄️ Gestionar base de datos
- 🔒 Configurar SSL/HTTPS
- ⚙️ Optimizar rendimiento

## 🌐 Configuración de Dominio

### Para Desarrollo/Testing (localhost)
Ya está configurado automáticamente. Accede a:
- **Frontend**: http://tu-ip-servidor
- **API**: http://tu-ip-servidor/api

### Para Producción (dominio real)

1. **Actualizar configuración de Nginx:**
```bash
sudo nano /etc/nginx/sites-available/app-mecanica
# Cambiar "server_name localhost;" por "server_name tu-dominio.com;"
sudo systemctl reload nginx
```

2. **Configurar SSL/HTTPS:**
```bash
./maintenance.sh
# Seleccionar opción 13: "Configurar SSL/HTTPS"
```

## 🗄️ Configuración de Base de Datos

### PostgreSQL (Recomendado)
- **Host**: 127.0.0.1
- **Puerto**: 5432
- **Base de datos**: mecanica_db
- **Usuario**: mecanica

### MySQL (Alternativa)
- **Host**: 127.0.0.1
- **Puerto**: 3306
- **Base de datos**: mecanica_db
- **Usuario**: mecanica

## 📁 Estructura en Servidor

```
/var/www/html/app-mecanica/
├── Mecanica/              # Backend Laravel
│   ├── public/           # Punto de entrada
│   ├── storage/          # Logs y archivos
│   └── .env             # Configuración
├── vistas/               # Frontend React
│   └── dist/            # Build de producción
└── nginx-mecanica.conf   # Configuración Nginx
```

## 🔍 Monitoreo y Logs

### Ver Logs en Tiempo Real
```bash
# Laravel
sudo tail -f /var/www/html/app-mecanica/Mecanica/storage/logs/laravel.log

# Nginx
sudo tail -f /var/log/nginx/mecanica_error.log
sudo tail -f /var/log/nginx/mecanica_access.log

# Sistema
sudo journalctl -f
```

### Verificar Estado de Servicios
```bash
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status postgresql  # o mysql
```

## 🔧 Comandos Útiles

### Reiniciar Servicios
```bash
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
```

### Limpiar Cache Laravel
```bash
cd /var/www/html/app-mecanica/Mecanica
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan route:clear
sudo -u www-data php artisan view:clear
```

### Ejecutar Migraciones
```bash
cd /var/www/html/app-mecanica/Mecanica
sudo -u www-data php artisan migrate
```

### Reconstruir Frontend
```bash
cd /var/www/html/app-mecanica/vistas
sudo -u www-data npm run build
```

## 🔒 Seguridad

### Firewall Configurado
- **Puerto 22**: SSH
- **Puerto 80**: HTTP
- **Puerto 443**: HTTPS

### Permisos de Archivos
```bash
# Verificar permisos
ls -la /var/www/html/app-mecanica/Mecanica/storage/
ls -la /var/www/html/app-mecanica/Mecanica/bootstrap/cache/

# Corregir permisos si es necesario
sudo chown -R www-data:www-data /var/www/html/app-mecanica
sudo chmod -R 755 /var/www/html/app-mecanica
sudo chmod -R 775 /var/www/html/app-mecanica/Mecanica/storage
sudo chmod -R 775 /var/www/html/app-mecanica/Mecanica/bootstrap/cache
```

## 🆘 Solución de Problemas

### Error 500 - Internal Server Error
1. Verificar logs de Laravel y Nginx
2. Comprobar permisos de archivos
3. Verificar configuración de .env
4. Limpiar cache de Laravel

### Error de Conexión a Base de Datos
1. Verificar credenciales en .env
2. Comprobar que la base de datos esté activa
3. Verificar firewall y puertos

### Frontend no Carga
1. Verificar que el build esté actualizado
2. Comprobar configuración de Nginx
3. Verificar logs de acceso

### Comandos de Diagnóstico
```bash
# Verificar configuración PHP
php -m | grep -E "(mbstring|xml|curl|zip|pdo)"

# Verificar configuración Nginx
sudo nginx -t

# Verificar conectividad base de datos
cd /var/www/html/app-mecanica/Mecanica
sudo -u www-data php artisan migrate:status
```

## 📞 Soporte

Si encuentras problemas:

1. 📋 Consulta los logs detallados
2. 🔍 Revisa esta documentación
3. 🛠️ Usa el script de mantenimiento para diagnósticos
4. 📧 Contacta al equipo de desarrollo con los logs específicos

## 🔄 Actualizaciones

Para actualizar el proyecto:

```bash
# 1. Hacer backup
./maintenance.sh  # Opción 9: Backup base de datos

# 2. Actualizar código
cd /var/www/html/app-mecanica
git pull origin main  # Si usas Git

# 3. Actualizar dependencias
./maintenance.sh  # Opción 7: Actualizar dependencias

# 4. Ejecutar migraciones
./maintenance.sh  # Opción 5: Ejecutar migraciones

# 5. Reconstruir frontend
./maintenance.sh  # Opción 8: Reconstruir frontend

# 6. Optimizar
./maintenance.sh  # Opción 6: Optimizar Laravel
```

---

¡Tu proyecto **Mecánica Asistida en Línea** está listo para producción! 🎉
