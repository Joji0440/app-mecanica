# 📖 Guía Completa de Instalación y Configuración

Esta guía te ayudará a configurar completamente el proyecto **Mecánica Asistida en Línea** desde cero después de clonar el repositorio.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### 1. **Git**
- **Windows**: Descargar desde [git-scm.com](https://git-scm.com/download/win)
- **macOS**: `brew install git` o descargar desde [git-scm.com](https://git-scm.com/download/mac)
- **Linux**: `sudo apt install git` (Ubuntu/Debian) o `sudo yum install git` (RHEL/CentOS)

**Verificar instalación:**
```bash
git --version
```

### 2. **PHP 8.1 o superior**

#### Windows:
1. Descargar desde [php.net](https://windows.php.net/download/)
2. Extraer en `C:\php`
3. Añadir `C:\php` al PATH
4. Habilitar extensiones en `php.ini`:
   ```ini
   extension=openssl
   extension=pdo_mysql
   extension=mbstring
   extension=tokenizer
   extension=xml
   extension=ctype
   extension=json
   extension=bcmath
   ```

#### macOS:
```bash
# Con Homebrew
brew install php@8.1

# O usar XAMPP/MAMP
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php8.1 php8.1-cli php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip

# RHEL/CentOS
sudo yum install php php-cli php-fpm php-mysql php-xml php-mbstring php-curl php-zip
```

**Verificar instalación:**
```bash
php --version
```

### 3. **Composer (Gestor de dependencias PHP)**

#### Windows:
1. Descargar desde [getcomposer.org](https://getcomposer.org/download/)
2. Ejecutar el instalador
3. Reiniciar terminal

#### macOS/Linux:
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

**Verificar instalación:**
```bash
composer --version
```

### 4. **Node.js 18 o superior**

#### Todas las plataformas:
- Descargar desde [nodejs.org](https://nodejs.org/) (LTS recomendado)
- El instalador incluye npm automáticamente

#### Con gestores de versiones (recomendado):
```bash
# Windows (con Chocolatey)
choco install nodejs

# macOS (con Homebrew)
brew install node

# Linux (con NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verificar instalación:**
```bash
node --version
npm --version
```

### 5. **Base de Datos (MySQL/PostgreSQL/SQLite)**

#### MySQL (Recomendado):

**Windows:**
- Descargar MySQL Installer desde [mysql.com](https://dev.mysql.com/downloads/installer/)
- O usar XAMPP que incluye MySQL

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### PostgreSQL (Alternativa):
```bash
# Windows: Descargar desde postgresql.org
# macOS: brew install postgresql
# Linux: sudo apt install postgresql
```

#### SQLite (Para desarrollo rápido):
Ya incluido con PHP, no requiere instalación adicional.

## 🚀 Configuración del Proyecto

### Paso 1: Clonar el Repositorio
```bash
git clone [URL-DEL-REPOSITORIO]
cd app-mecanica
```

### Paso 2: Configuración Automática (Recomendado)

#### Windows (PowerShell):
```powershell
# Ejecutar como Administrador si es necesario
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

#### Linux/macOS:
```bash
chmod +x setup.sh
./setup.sh
```

### Paso 3: Configuración Manual (Si falla la automática)

#### 3.1 Configurar Backend (Laravel)

```bash
# Ir al directorio del backend
cd Mecanica

# Instalar dependencias PHP
composer install

# Crear archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate
```

#### 3.2 Configurar Base de Datos

**Editar el archivo `.env` en la carpeta `Mecanica`:**

**Para MySQL:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mecanica_db
DB_USERNAME=root
DB_PASSWORD=tu_password_mysql
```

**Para PostgreSQL:**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mecanica_db
DB_USERNAME=postgres
DB_PASSWORD=tu_password_postgres
```

**Para SQLite (desarrollo):**
```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

#### 3.3 Crear Base de Datos

**MySQL:**
```sql
CREATE DATABASE mecanica_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**PostgreSQL:**
```sql
CREATE DATABASE mecanica_db;
```

**SQLite:**
```bash
touch database/database.sqlite
```

#### 3.4 Ejecutar Migraciones
```bash
# Desde la carpeta Mecanica
php artisan migrate
php artisan db:seed
```

#### 3.5 Configurar Frontend (React)

```bash
# Ir al directorio del frontend
cd ../vistas

# Instalar dependencias Node.js
npm install

# Crear archivo de configuración
cp .env.example .env
```

## ✅ Verificación de la Instalación

### 1. Probar Backend
```bash
cd Mecanica
php artisan serve
```
- Debería mostrar: "Laravel development server started on http://127.0.0.1:8000"
- Visitar: http://localhost:8000/api/health (debería devolver JSON)

### 2. Probar Frontend
```bash
cd vistas
npm run dev
```
- Debería mostrar: "Local: http://localhost:5173"
- Visitar: http://localhost:5173 (debería mostrar la aplicación React)

### 3. Probar Conexión API
- En el frontend, intentar hacer login/registro
- Verificar que se comunique correctamente con el backend

## 🛠️ Comandos Útiles para Desarrollo

### Backend (Laravel)
```bash
# Servidor de desarrollo
php artisan serve

# Ver rutas disponibles
php artisan route:list

# Ejecutar migraciones
php artisan migrate

# Revertir migraciones
php artisan migrate:rollback

# Poblar base de datos
php artisan db:seed

# Crear controlador
php artisan make:controller NombreController

# Crear modelo
php artisan make:model NombreModel

# Crear migración
php artisan make:migration create_tabla_table

# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Ejecutar tests
php artisan test
```

### Frontend (React)
```bash
# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Previsualizar build
npm run preview

# Linter
npm run lint

# Corregir problemas de lint
npm run lint:fix

# Verificar tipos TypeScript
npm run type-check

# Ejecutar tests (cuando estén configurados)
npm run test

# Instalar nueva dependencia
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install -D nombre-paquete
```

## 🐛 Solución de Problemas Comunes

### Error: "composer: command not found"
```bash
# Verificar que Composer esté en el PATH
which composer  # Linux/macOS
where composer   # Windows

# Re-instalar Composer si es necesario
```

### Error: "php: command not found"
```bash
# Verificar instalación de PHP
php --version

# En Windows, verificar que PHP esté en el PATH
```

### Error: "npm: command not found"
```bash
# Verificar instalación de Node.js
node --version
npm --version

# Re-instalar Node.js si es necesario
```

### Error: "Access denied" en base de datos
```bash
# Verificar credenciales en .env
# Verificar que el servicio de base de datos esté corriendo

# MySQL
sudo systemctl status mysql    # Linux
brew services list | grep mysql  # macOS

# Crear usuario si es necesario
mysql -u root -p
CREATE USER 'tu_usuario'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON mecanica_db.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Port 8000 is already in use"
```bash
# Usar otro puerto
php artisan serve --port=8001

# O matar el proceso que usa el puerto
# Windows: netstat -ano | findstr :8000
# Linux/macOS: lsof -ti:8000 | xargs kill
```

### Error: "Port 5173 is already in use"
```bash
# Usar otro puerto
npm run dev -- --port 5174

# O configurar en vite.config.ts
```

### Problemas con CORS
```bash
# Verificar que ambos servidores estén corriendo
# Verificar configuración en config/cors.php
# Verificar que la URL del API esté correcta en .env del frontend
```

## 📁 Estructura de Archivos Importantes

```
app-mecanica/
├── Mecanica/                    # Backend Laravel
│   ├── .env                    # ❗ Configuración (crear desde .env.example)
│   ├── composer.json           # Dependencias PHP
│   ├── app/Http/Controllers/   # Controladores
│   ├── routes/api.php          # Rutas de API
│   └── database/migrations/    # Migraciones de BD
├── vistas/                     # Frontend React
│   ├── .env                    # ❗ Configuración (crear desde .env.example)
│   ├── package.json            # Dependencias Node.js
│   ├── src/components/         # Componentes React
│   ├── src/pages/              # Páginas
│   └── src/services/api.ts     # Configuración de API
├── README.md                   # Documentación principal
├── QUICK_START.md              # Guía rápida
└── CONTRIBUTING.md             # Guía de contribución
```

## 🤝 Siguientes Pasos

1. **Leer la documentación**: `README.md` y `CONTRIBUTING.md`
2. **Configurar IDE**: Instalar extensiones para PHP, TypeScript, y React
3. **Crear rama de desarrollo**: `git checkout -b feature/mi-nueva-funcionalidad`
4. **Comenzar a desarrollar**: Seguir las convenciones del proyecto

## 📞 Obtener Ayuda

Si tienes problemas:

1. **Revisar esta guía** completa
2. **Buscar en los issues** del repositorio
3. **Crear un nuevo issue** con:
   - Descripción del problema
   - Pasos para reproducir
   - Información del sistema (OS, versiones)
   - Screenshots o logs de error
4. **Preguntar al equipo** en el chat del proyecto

## 🎉 ¡Listo para Desarrollar!

Una vez completada la configuración, deberías tener:
- ✅ Backend corriendo en http://localhost:8000
- ✅ Frontend corriendo en http://localhost:5173  
- ✅ Base de datos configurada y poblada
- ✅ Ambos proyectos comunicándose correctamente

¡Ahora puedes comenzar a desarrollar nuevas funcionalidades! 🚀
