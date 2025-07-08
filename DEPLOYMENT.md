# 🚀 GUÍA DE DESPLIEGUE - MECÁNICA ASISTIDA
## Ubuntu Server 20.04+ / 22.04+

### 📋 PRE-REQUISITOS

1. **Ubuntu Server** con acceso root/sudo
2. **Dominio** configurado apuntando al servidor
3. **Puertos abiertos**: 80, 443, 22
4. **Mínimo 2GB RAM**, 20GB disco

---

## 🔧 PASO 1: PREPARACIÓN DEL SERVIDOR

```bash
# 1. Conectar al servidor
ssh root@tu-servidor.com

# 2. Copiar archivos del proyecto
scp -r /home/mecanica/Downloads/app-mecanica/ root@tu-servidor.com:/tmp/

# 3. Ejecutar script de sistema
cd /tmp/app-mecanica
./deploy-system.sh
```

---

## 🚀 PASO 2: DESPLEGAR APLICACIÓN

```bash
# 1. Editar configuración de dominio
nano deploy-app.sh
# Cambiar "tu-servidor.com" por tu dominio real

# 2. Editar archivos .env de producción
nano Mecanica/.env.production
nano vistas/.env.production
# Actualizar URLs y configuraciones

# 3. Ejecutar despliegue
./deploy-app.sh
```

---

## ⚙️ PASO 3: CONFIGURACIONES ADICIONALES

### 🔐 SSL/HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-servidor.com -d www.tu-servidor.com

# Auto-renovación
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 🛡️ Configurar Firewall

```bash
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### 📊 Monitoreo y Logs

```bash
# Ver logs de Laravel
tail -f /var/www/mecanica/backend/storage/logs/laravel.log

# Ver logs de Nginx
tail -f /var/log/nginx/mecanica_error.log

# Ver estado de servicios
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status postgresql
```

---

## 🧪 PASO 4: VERIFICACIÓN

### ✅ Pruebas de Funcionamiento

1. **Frontend**: `http://tu-servidor.com`
2. **API Health**: `http://tu-servidor.com/api/health`
3. **Login**: `http://tu-servidor.com/login`
4. **Dashboard**: `http://tu-servidor.com/dashboard`

### 🔑 Credenciales por Defecto

```
📧 Admin Email: admin@mecanica.com
🔒 Password: password123
```

---

## 🔧 MANTENIMIENTO

### 📦 Actualizar Aplicación

```bash
# 1. Backup de base de datos
sudo -u postgres pg_dump mecanica_db > backup_$(date +%Y%m%d).sql

# 2. Subir nuevos archivos
# 3. Ejecutar migraciones
cd /var/www/mecanica/backend
sudo -u www-data php artisan migrate

# 4. Limpiar cachés
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:clear

# 5. Reconstruir frontend
cd /var/www/mecanica/frontend
sudo npm run build
sudo cp -r dist/* /var/www/html/
```

### 🔄 Reiniciar Servicios

```bash
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo supervisorctl restart all
```

---

## 🆘 TROUBLESHOOTING

### Problemas Comunes

1. **Error 502**: Verificar que Laravel esté corriendo en puerto 8000
2. **Error CORS**: Verificar configuración de dominios en .env
3. **Error DB**: Verificar credenciales de PostgreSQL
4. **Permisos**: Verificar ownership de www-data

### Comandos Útiles

```bash
# Verificar procesos Laravel
ps aux | grep artisan

# Reiniciar Laravel
sudo pkill -f "php artisan serve"
cd /var/www/mecanica/backend
sudo -u www-data nohup php artisan serve --host=0.0.0.0 --port=8000 &

# Verificar configuración Nginx
sudo nginx -t

# Ver puertos ocupados
sudo netstat -tlnp
```

---

## 📞 SOPORTE

- **Logs de aplicación**: `/var/www/mecanica/backend/storage/logs/`
- **Logs de sistema**: `/var/log/nginx/`, `/var/log/syslog`
- **Configuración Nginx**: `/etc/nginx/sites-available/mecanica`

---

**🎉 ¡Despliegue Completado!**

Tu aplicación Mecánica Asistida está lista para producción.
