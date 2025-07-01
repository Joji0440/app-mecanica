# 🪟 Guía de Instalación para Windows

Esta guía está específicamente diseñada para usuarios de Windows 10/11.

## 📋 Prerrequisitos para Windows

### 1. Habilitar Windows Subsystem for Linux (WSL) - Opcional pero Recomendado

```powershell
# Ejecutar como Administrador
wsl --install
# Reiniciar cuando se solicite
```

### 2. Instalar Git para Windows
1. Descargar desde: https://git-scm.com/download/win
2. Ejecutar instalador con configuración por defecto
3. Verificar: `git --version` en Command Prompt

### 3. Instalar PHP para Windows

#### Opción A: XAMPP (Recomendado para principiantes)
1. Descargar XAMPP desde: https://www.apachefriends.org/
2. Instalar con componentes: Apache, MySQL, PHP
3. Añadir al PATH: `C:\xampp\php`

#### Opción B: PHP Oficial
1. Descargar desde: https://windows.php.net/download/
2. Extraer en `C:\php`
3. Añadir `C:\php` al PATH:
   - Win + R → `sysdm.cpl` → Advanced → Environment Variables
   - En "System Variables" seleccionar "Path" → Edit → New
   - Añadir: `C:\php`
4. Configurar `php.ini`:
   ```ini
   extension=openssl
   extension=pdo_mysql
   extension=mbstring
   extension=curl
   extension=zip
   extension=xml
   extension=tokenizer
   ```

**Verificar instalación:**
```cmd
php --version
```

### 4. Instalar Composer
1. Descargar desde: https://getcomposer.org/Composer-Setup.exe
2. Ejecutar instalador
3. Verificar: `composer --version`

### 5. Instalar Node.js
1. Descargar LTS desde: https://nodejs.org/
2. Ejecutar instalador con configuración por defecto
3. Verificar: `node --version` y `npm --version`

### 6. Instalar MySQL

#### Con XAMPP (si se instaló)
- MySQL ya está incluido
- Iniciar desde XAMPP Control Panel

#### Standalone MySQL
1. Descargar MySQL Installer desde: https://dev.mysql.com/downloads/installer/
2. Instalar MySQL Server
3. Configurar password para root
4. Iniciar servicio MySQL

## 🚀 Configuración del Proyecto

### Paso 1: Clonar Repositorio
```cmd
git clone [URL-DEL-REPOSITORIO]
cd app-mecanica
```

### Paso 2: Configuración Automática
```powershell
# Ejecutar como Administrador si es necesario
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

### Paso 3: Configuración Manual (Si falla automática)

#### Backend
```cmd
cd Mecanica
composer install
copy .env.example .env
php artisan key:generate
```

**Editar `.env` con tu configuración MySQL:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mecanica_db
DB_USERNAME=root
DB_PASSWORD=tu_password
```

**Crear base de datos:**
```sql
-- En MySQL Workbench o phpMyAdmin
CREATE DATABASE mecanica_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Ejecutar migraciones:**
```cmd
php artisan migrate
php artisan db:seed
```

#### Frontend
```cmd
cd ..\vistas
npm install
copy .env.example .env
```

## ✅ Ejecutar Proyecto

### Terminal 1: Backend
```cmd
cd Mecanica
php artisan serve
```
Disponible en: http://localhost:8000

### Terminal 2: Frontend
```cmd
cd vistas
npm run dev
```
Disponible en: http://localhost:5173

## 🛠️ Herramientas Adicionales para Windows

### Visual Studio Code
1. Descargar desde: https://code.visualstudio.com/
2. Instalar extensiones recomendadas:
   - PHP Extension Pack
   - Laravel Extension Pack
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - Thunder Client (para probar APIs)

### Windows Terminal (Recomendado)
1. Instalar desde Microsoft Store
2. Configurar como terminal por defecto

### MySQL Workbench
1. Descargar desde: https://dev.mysql.com/downloads/workbench/
2. Conectar a tu instancia local de MySQL

### Postman (Para probar APIs)
1. Descargar desde: https://www.postman.com/downloads/
2. Configurar colección para probar endpoints

## 🐛 Solución de Problemas Windows

### Error: "php is not recognized"
```cmd
# Verificar PATH
echo %PATH%

# Si no está, añadir manualmente:
# 1. Buscar "Environment Variables" en Start Menu
# 2. Edit System Environment Variables
# 3. Environment Variables → System Variables → Path → Edit
# 4. Añadir: C:\php o C:\xampp\php
```

### Error: "composer is not recognized"
```cmd
# Re-descargar e instalar Composer desde getcomposer.org
# Asegurar que está en PATH
```

### Error: "Access denied" MySQL
```cmd
# Reiniciar servicio MySQL
net stop mysql
net start mysql

# O desde Services.msc buscar MySQL y reiniciar
```

### Error: "Port 8000 is already in use"
```cmd
# Ver qué usa el puerto
netstat -ano | findstr :8000

# Matar proceso
taskkill /PID [PID_NUMBER] /F

# O usar otro puerto
php artisan serve --port=8001
```

### Problemas con PowerShell Execution Policy
```powershell
# Como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

# Solo para usuario actual
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "npm ERR! peer dep missing"
```cmd
# Limpiar caché
npm cache clean --force

# Reinstalar
rmdir /s node_modules
del package-lock.json
npm install
```

## 📁 Estructura Recomendada de Directorios

```
C:\
├── xampp\              # Si usas XAMPP
│   ├── php\
│   └── mysql\
├── php\                # Si usas PHP standalone
└── Users\[TuUsuario]\
    └── Documents\
        └── Proyectos\
            └── app-mecanica\    # Tu proyecto aquí
```

## 🎯 Próximos Pasos

1. **Configurar Git:**
   ```cmd
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu.email@ejemplo.com"
   ```

2. **Crear rama de desarrollo:**
   ```cmd
   git checkout -b feature/mi-primera-funcionalidad
   ```

3. **Abrir en VS Code:**
   ```cmd
   code .
   ```

4. **Instalar extensiones VS Code recomendadas**

5. **Familiarizarse con la estructura del proyecto**

## 💡 Tips para Windows

- **Usar PowerShell o Command Prompt** en lugar de Git Bash para comandos npm/composer
- **Windows Defender** puede causar lentitud en npm install - añadir excepción para node_modules
- **Usar rutas cortas** para evitar problemas con límite de caracteres en Windows
- **WSL2** puede ser útil para desarrollo más similar a Linux/macOS
- **Docker Desktop** es una alternativa para evitar instalar dependencias localmente

¡Con esta configuración tendrás todo listo para desarrollar en Windows! 🚀
