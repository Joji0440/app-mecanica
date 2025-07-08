# Guía de Migración de IP - Mecánica Asistida

## Cambio de IP de 172.28.101.4 a Nueva IP

Esta guía documenta los pasos necesarios para migrar el sistema cuando cambie la IP de red.

### IP Actual: 172.28.101.4

### Archivos Modificados Automáticamente

El sistema ya ha sido configurado para la nueva IP `172.28.101.4`. Los siguientes archivos fueron actualizados:

#### Backend (Laravel)
- ✅ `Mecanica/.env` - APP_URL y SANCTUM_STATEFUL_DOMAINS
- ✅ `Mecanica/.env.production` - Configuración de producción
- ✅ `Mecanica/config/cors.php` - Orígenes permitidos para CORS

#### Frontend (React)
- ✅ `vistas/.env` - VITE_API_URL y VITE_APP_URL
- ✅ `vistas/.env.production` - Configuración de producción

#### Scripts y Documentación
- ✅ `start-dev-servers.sh` - Script de desarrollo
- ✅ `build-production.sh` - Script de producción
- ✅ `DEPLOY_GUIDE.md` - Guía de despliegue

### Cambios Realizados

#### 1. Backend (.env)
```bash
# Anterior
APP_URL=http://localhost:8000

# Nuevo
APP_URL=http://172.28.101.4:8000
```

#### 2. CORS (config/cors.php)
```php
'allowed_origins' => [
    'http://172.28.101.4:5173',
    'http://172.28.101.4:3000',
    'http://172.28.101.4',
    'https://172.28.101.4',
    // ... otros orígenes
],
```

#### 3. Sanctum (.env)
```bash
SANCTUM_STATEFUL_DOMAINS=172.28.101.4,172.28.101.4:5173,172.28.101.4:8000,localhost,127.0.0.1,localhost:3000,localhost:5173
```

#### 4. Frontend (.env)
```bash
VITE_API_URL=http://172.28.101.4:8000/api
VITE_APP_URL=http://172.28.101.4:5173
```

### Comandos Ejecutados

```bash
# 1. Verificar configuración
./check-system.sh

# 2. Ejecutar migraciones (si es necesario)
cd Mecanica && php artisan migrate

# 3. Iniciar servidor backend
cd Mecanica && php artisan serve --host=172.28.101.4 --port=8000

# 4. Probar health check
curl -s http://172.28.101.4:8000/api/health

# 5. Iniciar servidores de desarrollo
./start-dev-servers.sh
```

### URLs de Acceso

- **Backend API:** http://172.28.101.4:8000/api
- **Health Check:** http://172.28.101.4:8000/api/health
- **Frontend:** http://172.28.101.4:5173
- **Panel de Admin:** http://172.28.101.4:5173/user-management

### Scripts Disponibles

- `./check-system.sh` - Verificar configuración del sistema
- `./start-dev-servers.sh` - Iniciar servidores de desarrollo
- `./deploy.sh` - Desplegar sistema completo
- `./build-production.sh` - Construir para producción

### Para Futuras Migraciones de IP

Si necesitas cambiar a una nueva IP, sigue estos pasos:

1. **Actualizar archivos de configuración:**
   ```bash
   # Buscar todas las referencias a la IP actual
   grep -r "172.28.101.4" .
   
   # Reemplazar en todos los archivos necesarios
   find . -type f -name "*.env*" -exec sed -i 's/172.28.101.4/NUEVA_IP/g' {} +
   find . -type f -name "*.php" -exec sed -i 's/172.28.101.4/NUEVA_IP/g' {} +
   find . -type f -name "*.sh" -exec sed -i 's/172.28.101.4/NUEVA_IP/g' {} +
   find . -type f -name "*.md" -exec sed -i 's/172.28.101.4/NUEVA_IP/g' {} +
   ```

2. **Limpiar cache de Laravel:**
   ```bash
   cd Mecanica
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   ```

3. **Verificar configuración:**
   ```bash
   ./check-system.sh
   ```

4. **Probar el sistema:**
   ```bash
   ./start-dev-servers.sh
   ```

### Troubleshooting

Si hay problemas después del cambio de IP:

1. **Verificar conectividad:**
   ```bash
   ping 172.28.101.4
   ```

2. **Verificar puertos:**
   ```bash
   netstat -tuln | grep :8000
   netstat -tuln | grep :5173
   ```

3. **Verificar logs:**
   ```bash
   tail -f Mecanica/storage/logs/laravel.log
   ```

4. **Reiniciar servicios:**
   ```bash
   sudo systemctl restart apache2  # o nginx
   sudo systemctl restart postgresql
   ```

### Estado Actual

✅ **Backend:** Funcionando en http://172.28.101.4:8000
✅ **API Health:** Respondiendo correctamente
✅ **Base de datos:** Conectada y migrada
✅ **CORS:** Configurado para la nueva IP
✅ **Sanctum:** Configurado para la nueva IP

### Próximos Pasos

1. Iniciar el frontend en desarrollo
2. Probar la integración completa
3. Configurar servidor web para producción
4. Realizar pruebas desde otras máquinas en la red
