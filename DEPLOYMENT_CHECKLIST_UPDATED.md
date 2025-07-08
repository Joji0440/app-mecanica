# 📋 CHECKLIST DE DESPLIEGUE ACTUALIZADO

## 🚀 Primer Despliegue
Ejecutar en orden:

1. **Sistema base**: `./deploy-system.sh`
2. **Aplicación**: `./deploy-app.sh`

## 🔄 Actualización de Deploy Existente
Si ya tienes un deploy funcionando y quieres aplicar las mejoras:

```bash
./update-deploy.sh
```

## ✅ Verificaciones Post-Deploy

### 🌐 URLs a probar:
- [ ] Frontend: http://192.168.0.103
- [ ] API Health: http://192.168.0.103/api/health
- [ ] Login: http://192.168.0.103/api/auth/login
- [ ] Storage: http://192.168.0.103/storage/test.txt

### 🔐 Credenciales de prueba:
- **Admin**: admin@mecanica.com / password123
- **Manager**: manager@mecanica.com / password123
- **User**: user@mecanica.com / password123

### 🔍 Comandos de verificación:

```bash
# Verificar servicios
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status php8.2-fpm

# Verificar Laravel
ps aux | grep "artisan serve"

# Verificar enlace simbólico
ls -la /var/www/mecanica/backend/public/storage

# Verificar base de datos
sudo -u postgres psql -d mecanica_db -c "SELECT email FROM users;"

# Verificar permisos
ls -la /var/www/mecanica/backend/storage/app/public/
```

## 🆕 Nuevas Funcionalidades Incluidas

### 📁 Storage Management
- [x] Enlace simbólico configurado: `public/storage` → `storage/app/public`
- [x] Nginx configurado para servir archivos de storage
- [x] Permisos correctos para www-data
- [x] URLs accesibles: `/storage/ruta/archivo.ext`

### 🎯 Casos de uso:
```php
// En controladores Laravel:
$path = $request->file('avatar')->store('avatars', 'public');
// Accesible en: http://192.168.0.103/storage/avatars/filename.jpg

$path = $request->file('document')->store('documents', 'public');
// Accesible en: http://192.168.0.103/storage/documents/filename.pdf
```

## 🔧 Configuraciones Incluidas

### Nginx actualizado:
- ✅ Frontend React en `/`
- ✅ API Laravel en `/api`
- ✅ Storage Laravel en `/storage`
- ✅ Cache estático optimizado

### Laravel configurado:
- ✅ Storage link creado
- ✅ Migraciones ejecutadas
- ✅ Seeders aplicados
- ✅ Cache optimizado
- ✅ Permisos correctos

## 🚨 Troubleshooting

### Problema: Storage no accesible
```bash
# Verificar enlace
ls -la /var/www/mecanica/backend/public/storage

# Recrear si es necesario
cd /var/www/mecanica/backend
sudo -u www-data php artisan storage:link
```

### Problema: 502 Bad Gateway
```bash
# Verificar Laravel
ps aux | grep "artisan serve"

# Reiniciar si es necesario
cd /var/www/mecanica/backend
sudo -u www-data nohup php artisan serve --host=0.0.0.0 --port=8000 > /dev/null 2>&1 &
```

### Problema: Frontend no carga
```bash
# Verificar archivos
ls -la /var/www/html/

# Reconstruir si es necesario
cd /var/www/mecanica/frontend
sudo npm run build
sudo cp -r dist/* /var/www/html/
```

## 📈 Próximos Pasos

### Producción Real:
1. **SSL**: Configurar HTTPS con Let's Encrypt
2. **PHP-FPM**: Migrar de `artisan serve` a PHP-FPM
3. **Firewall**: Configurar UFW
4. **Backup**: Script automático de respaldo
5. **Monitoring**: Logs y alertas

### Desarrollo:
1. **Docker**: Usar docker-compose para desarrollo
2. **CI/CD**: Pipeline de despliegue automático
3. **Testing**: Suite de pruebas automatizadas
4. **API**: Expandir endpoints para servicios mecánicos

## 📊 Estado Actual

### ✅ Completado:
- [x] Sistema base (Ubuntu, Nginx, PostgreSQL, PHP)
- [x] Backend Laravel funcional
- [x] Frontend React funcional  
- [x] Base de datos con seeders
- [x] Autenticación completa
- [x] Roles y permisos
- [x] Storage management
- [x] Nginx proxy configurado

### 🔄 En progreso:
- [ ] Migración a PHP-FPM
- [ ] Configuración SSL
- [ ] Funcionalidades de negocio

### 🎯 MVP Actual:
Sistema completo de autenticación con roles, listo para desarrollo de funcionalidades específicas del negocio mecánico.
