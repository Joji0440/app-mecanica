# 🛠️ GUÍA DE DESARROLLO LOCAL - MECÁNICA ASISTIDA

## 🚀 INICIO RÁPIDO

### 1️⃣ Iniciar Backend (Laravel)
```bash
./start-backend.sh
```
- **URL:** http://localhost:8000
- **API:** http://localhost:8000/api
- **Health:** http://localhost:8000/api/health

### 2️⃣ Iniciar Frontend (React) - En nueva terminal
```bash
./start-frontend.sh
```
- **URL:** http://localhost:5173
- **Dev Server:** Vite con Hot Reload

## 🔧 COMANDOS ÚTILES

### Backend (Laravel)
```bash
cd Mecanica

# Comandos artisan
php artisan tinker              # Consola interactiva
php artisan route:list          # Ver todas las rutas
php artisan migrate:fresh       # Recrear BD
php artisan db:seed             # Ejecutar seeders
php artisan config:clear        # Limpiar cache
php artisan storage:link        # Enlace simbólico storage

# Tests
php artisan test                # Ejecutar tests
php artisan test --filter=AuthTest  # Test específico
```

### Frontend (React)
```bash
cd vistas

# Desarrollo
npm run dev                     # Servidor desarrollo
npm run build                   # Build producción
npm run preview                 # Preview build

# Linting y formato
npm run lint                    # ESLint
npm run lint:fix                # Fix automático
```

## 🔍 DEBUGGING

### Logs Backend
```bash
tail -f Mecanica/storage/logs/laravel.log
```

### Logs Frontend
- Abrir DevTools del navegador
- Ver consola para errores React

### Base de Datos
```bash
# Conectar a PostgreSQL
psql -h localhost -U mecanica2025 -d mecanica_db
```

## 🧪 TESTING

### Ejecutar todos los tests
```bash
./run-tests.sh
```

### Tests específicos
```bash
# Backend
cd Mecanica
php artisan test --filter=AuthTest

# Frontend  
cd vistas
npm test -- --testNamePattern="Login"
```

## 📁 ESTRUCTURA DE ARCHIVOS IMPORTANTES

```
app-mecanica/
├── 📁 Mecanica/                 # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/    # Controladores
│   │   ├── Models/             # Modelos Eloquent
│   │   └── ...
│   ├── routes/
│   │   ├── api.php             # Rutas API
│   │   └── web.php             # Rutas web
│   ├── database/
│   │   ├── migrations/         # Migraciones BD
│   │   └── seeders/            # Seeders
│   ├── .env                    # Config desarrollo
│   └── ...
│
├── 📁 vistas/                   # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas
│   │   ├── services/           # API calls
│   │   └── ...
│   ├── .env                    # Config desarrollo
│   └── ...
│
├── start-backend.sh            # Script inicio Laravel
├── start-frontend.sh           # Script inicio React
├── run-tests.sh               # Script tests
└── setup-dev.sh               # Setup desarrollo
```

## 🔗 ENDPOINTS IMPORTANTES

### API Backend (http://localhost:8000)
- `GET /api/health` - Health check
- `POST /api/login` - Login usuario
- `POST /api/register` - Registro usuario
- `GET /api/user` - Usuario autenticado
- `POST /api/logout` - Logout

### Frontend (http://localhost:5173)
- `/` - Dashboard
- `/login` - Página login
- `/register` - Página registro

## ⚙️ CONFIGURACIÓN

### Variables de Entorno Backend (Mecanica/.env)
```bash
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_DATABASE=mecanica_db
```

### Variables de Entorno Frontend (vistas/.env)
```bash
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:8000
```

## 🐛 TROUBLESHOOTING

### Problema: Error de conexión API
```bash
# Verificar que backend esté ejecutándose
curl http://localhost:8000/api/health

# Verificar variables de entorno frontend
cat vistas/.env
```

### Problema: Error de base de datos
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Recrear base de datos
cd Mecanica
php artisan migrate:fresh --seed
```

### Problema: Error de dependencias
```bash
# Reinstalar backend
cd Mecanica
rm -rf vendor
composer install

# Reinstalar frontend
cd vistas
rm -rf node_modules
npm install
```

### Problema: Error de permisos storage
```bash
cd Mecanica
sudo chmod -R 775 storage
sudo chown -R $USER:www-data storage
php artisan storage:link
```

## 🔄 FLUJO DE DESARROLLO

1. **Hacer cambios en código**
2. **Ver cambios automáticamente** (Hot Reload)
3. **Ejecutar tests** cuando sea necesario
4. **Commit cambios** cuando estén listos
5. **Actualizar deploy** con `./deploy-complete.sh`

## 📋 CHECKLIST ANTES DE DEPLOY

- [ ] ✅ Tests backend pasando
- [ ] ✅ Tests frontend pasando
- [ ] ✅ No errores en consola
- [ ] ✅ API funcionando correctamente
- [ ] ✅ Build de producción sin errores
- [ ] ✅ Variables de entorno actualizadas

## 🆘 OBTENER AYUDA

- **Logs Laravel:** `tail -f Mecanica/storage/logs/laravel.log`
- **DevTools:** F12 en navegador
- **Artisan:** `php artisan list` para ver todos los comandos
- **NPM:** `npm run` para ver scripts disponibles

---

**¡Happy Coding!** 🚀✨
