# Script de configuración inicial para el proyecto Mecánica Asistida (Windows)
# Este script configura tanto el backend como el frontend

Write-Host "🚀 Configurando Mecánica Asistida en Línea..." -ForegroundColor Green
Write-Host ""

# Verificar prerrequisitos
Write-Host "📋 Verificando prerrequisitos..." -ForegroundColor Yellow

# Verificar PHP
try {
    php --version | Out-Null
    Write-Host "✅ PHP encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ PHP no está instalado. Por favor instala PHP 8.1 o superior." -ForegroundColor Red
    exit 1
}

# Verificar Composer
try {
    composer --version | Out-Null
    Write-Host "✅ Composer encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Composer no está instalado. Por favor instala Composer." -ForegroundColor Red
    exit 1
}

# Verificar Node.js
try {
    node --version | Out-Null
    Write-Host "✅ Node.js encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js 18 o superior." -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    npm --version | Out-Null
    Write-Host "✅ npm encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado. Por favor instala npm." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Configurar Backend
Write-Host "⚙️ Configurando Backend (Laravel)..." -ForegroundColor Yellow
Set-Location -Path "Mecanica"

# Instalar dependencias de PHP
Write-Host "📦 Instalando dependencias de PHP..." -ForegroundColor Cyan
composer install

# Configurar archivo .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "📄 Archivo .env creado" -ForegroundColor Green
}

# Generar clave de aplicación
Write-Host "🔑 Generando clave de aplicación..." -ForegroundColor Cyan
php artisan key:generate

# Configurar base de datos (opcional)
$response = Read-Host "¿Quieres ejecutar las migraciones ahora? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "🗄️ Configurando base de datos..." -ForegroundColor Cyan
    php artisan migrate
    php artisan db:seed
    Write-Host "✅ Base de datos configurada" -ForegroundColor Green
}

Set-Location -Path ".."

# Configurar Frontend
Write-Host ""
Write-Host "⚙️ Configurando Frontend (React)..." -ForegroundColor Yellow
Set-Location -Path "vistas"

# Instalar dependencias de Node.js
Write-Host "📦 Instalando dependencias de Node.js..." -ForegroundColor Cyan
npm install

# Configurar archivo .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "📄 Archivo .env creado" -ForegroundColor Green
}

Set-Location -Path ".."

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el desarrollo:" -ForegroundColor Yellow
Write-Host "1. Backend:  cd Mecanica; php artisan serve" -ForegroundColor Cyan
Write-Host "2. Frontend: cd vistas; npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "- Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "- Frontend:    http://localhost:5173" -ForegroundColor Cyan
