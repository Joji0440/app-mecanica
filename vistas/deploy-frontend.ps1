# 🪟 PowerShell Deploy Script - Frontend
# Script PowerShell para deployar cambios del frontend

Write-Host "🚀 DEPLOYANDO CAMBIOS DEL FRONTEND" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde el directorio vistas/" -ForegroundColor Red
    exit 1
}

# 1. Instalar dependencias si es necesario
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}

# 2. Verificar TypeScript
Write-Host "🔍 Verificando TypeScript..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en TypeScript" -ForegroundColor Red
    exit 1
}

# 3. Build del proyecto
Write-Host "🏗️ Construyendo proyecto..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en build" -ForegroundColor Red
    exit 1
}

# 4. Iniciar servidor
Write-Host "🌐 Iniciando servidor..." -ForegroundColor Green
Write-Host "✅ Frontend desplegado exitosamente" -ForegroundColor Green
Write-Host "🌍 Servidor disponible en: http://localhost:3001" -ForegroundColor Cyan

npm run serve
