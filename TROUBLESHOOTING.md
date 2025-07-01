# 🔧 Troubleshooting - Solución de Problemas

Esta guía contiene soluciones a los problemas más comunes que pueden surgir durante la instalación y desarrollo.

## 🚨 Problemas de Instalación

### PHP No Funciona

#### Windows
**Problema**: `php: command not found` o `php is not recognized`
```powershell
# Verificar si PHP está instalado
php --version

# Si no está instalado, descargar desde php.net
# Extraer en C:\php
# Añadir C:\php al PATH:
# 1. Win + R → sysdm.cpl → Advanced → Environment Variables
# 2. En "System Variables" seleccionar "Path" → Edit → New
# 3. Añadir: C:\php
# 4. Reiniciar terminal

# Verificar extensiones en C:\php\php.ini
extension=openssl
extension=pdo_mysql
extension=mbstring
extension=curl
extension=zip
```

#### macOS
```bash
# Instalar con Homebrew
brew install php@8.1
brew link php@8.1 --force

# Añadir al PATH en ~/.zshrc o ~/.bash_profile
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php8.1-cli php8.1-curl php8.1-mbstring php8.1-xml php8.1-zip

# CentOS/RHEL
sudo yum install epel-release
sudo yum install php php-cli php-curl php-mbstring php-xml php-zip
```

### Composer No Funciona

#### Error: "composer: command not found"
```bash
# Descargar e instalar globalmente
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# En Windows, re-descargar desde getcomposer.org
```

#### Error: "composer install" falla
```bash
# Limpiar caché
composer clear-cache

# Actualizar composer
composer self-update

# Instalar con verbose para ver errores
composer install -v

# Si falla por memoria
php -d memory_limit=-1 /usr/local/bin/composer install
```

### Node.js/NPM No Funciona

#### Error: "node: command not found"
```bash
# Verificar instalación
node --version
npm --version

# Reinstalar desde nodejs.org
# O usar gestor de versiones

# Windows (Chocolatey)
choco install nodejs

# macOS (Homebrew)  
brew install node

# Linux (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Error: "npm install" falla
```bash
# Limpiar caché
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Si hay problemas de permisos (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
```

## 🗄️ Problemas de Base de Datos

### MySQL

#### Error: "Access denied for user"
```sql
-- Conectar como root
mysql -u root -p

-- Crear usuario
CREATE USER 'mecanica_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON mecanica_db.* TO 'mecanica_user'@'localhost';
FLUSH PRIVILEGES;

-- Crear base de datos
CREATE DATABASE mecanica_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Error: "Connection refused"
```bash
# Verificar que MySQL esté corriendo
# Windows
net start mysql

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
sudo systemctl enable mysql

# Verificar puerto
netstat -tlnp | grep :3306
```

#### Error: "Unknown database"
```bash
# Crear la base de datos manualmente
mysql -u root -p
CREATE DATABASE mecanica_db;

# O usar SQLite para desarrollo rápido
# En .env cambiar:
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

### SQLite (Alternativa simple)

```bash
# Crear archivo de base de datos
cd Mecanica
touch database/database.sqlite

# En .env configurar:
DB_CONNECTION=sqlite
DB_DATABASE=/full/path/to/your/project/Mecanica/database/database.sqlite
```

## 🌐 Problemas de Red y CORS

### Error: "CORS policy"
**Frontend no puede conectar con Backend**

1. **Verificar que ambos servidores estén corriendo:**
```bash
# Terminal 1
cd Mecanica && php artisan serve

# Terminal 2  
cd vistas && npm run dev
```

2. **Verificar configuración de CORS en Laravel:**
```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

3. **Verificar URL del API en frontend:**
```javascript
// vistas/.env
VITE_API_URL=http://localhost:8000/api
```

### Error: "Network Error" en Axios
```javascript
// Verificar configuración en vistas/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Verificar que el backend responda
curl http://localhost:8000/api/health
```

## 🔐 Problemas de Autenticación

### Error: "Unauthenticated" (401)
```bash
# Verificar que Laravel Sanctum esté configurado
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Verificar middleware en routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    // rutas protegidas
});
```

### Token no se guarda en Frontend
```javascript
// Verificar en DevTools → Application → Local Storage
// Debería haber:
// - token: "Bearer ..."
// - user: "{...}"

// Verificar en vistas/src/context/AuthContext.tsx
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

## 🐛 Problemas de Desarrollo

### Puerto ya en uso

#### Backend (Puerto 8000)
```bash
# Usar otro puerto
php artisan serve --port=8001

# Matar proceso existente
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8000 | xargs kill -9
```

#### Frontend (Puerto 5173)
```bash
# Usar otro puerto
npm run dev -- --port 5174

# Configurar en vite.config.ts
export default defineConfig({
  server: {
    port: 5174
  }
})
```

### Problemas con Migraciones

#### Error: "Migration file not found"
```bash
# Verificar archivos en database/migrations/
# Ejecutar con verbose
php artisan migrate -v

# Reset completo (¡CUIDADO! Borra todos los datos)
php artisan migrate:fresh --seed
```

#### Error: "Column already exists"
```bash
# Revertir migraciones problemáticas
php artisan migrate:rollback --step=1

# O reset completo
php artisan migrate:fresh
```

### Problemas con Seeder

#### Error: "Class not found"
```bash
# Regenerar autoload
composer dump-autoload

# Verificar que el seeder esté registrado en DatabaseSeeder.php
$this->call([
    UserSeeder::class,
]);
```

## 🎨 Problemas de Frontend

### Tailwind CSS no funciona
```bash
# Verificar que tailwind esté instalado
npm list tailwindcss

# Verificar configuración en tailwind.config.js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],

# Verificar import en src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

# Reconstruir
npm run build
```

### TypeScript errores
```bash
# Verificar configuración
npm run type-check

# Instalar tipos faltantes
npm install -D @types/react @types/react-dom

# Limpiar caché de TypeScript
rm -rf node_modules/.cache
```

### React Hot Reload no funciona
```bash
# Verificar puerto y configuración
npm run dev

# Si no funciona, reconstruir
rm -rf node_modules dist
npm install
npm run dev
```

## 🔍 Herramientas de Debugging

### Logs de Laravel
```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Limpiar logs
> storage/logs/laravel.log
```

### Debugging en Browser
```javascript
// Abrir DevTools (F12)
// Console → Ver errores JavaScript
// Network → Ver llamadas a API
// Application → LocalStorage para tokens
```

### Verificar Configuración
```bash
# Laravel
php artisan config:show
php artisan route:list

# Node.js
npm run type-check
npm run lint
```

## 📞 Cuando Todo Falla

### Reset Completo del Proyecto

```bash
# 1. Backup de cambios importantes
git stash

# 2. Reset Backend
cd Mecanica
rm -rf vendor/
composer install
php artisan migrate:fresh --seed

# 3. Reset Frontend  
cd ../vistas
rm -rf node_modules/ dist/
npm install

# 4. Verificar configuración
cp .env.example .env  # Si es necesario
```

### Información del Sistema
```bash
# Versiones
php --version
composer --version
node --version
npm --version
git --version

# Sistema
uname -a  # Linux/macOS
systeminfo  # Windows

# Procesos corriendo
ps aux | grep php     # Linux/macOS
tasklist | findstr php  # Windows
```

### Crear Issue en GitHub

Si ninguna solución funciona, crear un issue con:

1. **Descripción del problema**
2. **Pasos para reproducir**
3. **Información del sistema** (comandos de arriba)
4. **Logs de error completos**
5. **Screenshots si es relevante**

```markdown
## Problema
Descripción clara del problema

## Pasos para reproducir
1. Paso 1
2. Paso 2
3. Error ocurre

## Entorno
- OS: Windows 11 / macOS 13 / Ubuntu 20.04
- PHP: 8.1.10
- Node.js: 18.17.0
- Navegador: Chrome 119

## Logs de error
```
[Error logs aquí]
```

## Screenshots
[Si es relevante]
```

## 💡 Consejos Preventivos

1. **Siempre usar las versiones recomendadas** de PHP y Node.js
2. **Mantener dependencias actualizadas** regularmente
3. **Hacer backup de .env** antes de cambios importantes
4. **Usar ramas de Git** para nuevas funcionalidades
5. **Probar en local** antes de hacer push
6. **Leer logs** cuando algo no funciona
7. **Documentar problemas nuevos** para el equipo

¡Con esta guía deberías poder resolver la mayoría de problemas comunes! 🛠️
