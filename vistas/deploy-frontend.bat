@echo off
REM 🚀 DEPLOY RÁPIDO FRONTEND - Windows Version
REM Script para deployar cambios del frontend rápidamente en Windows

echo 🚀 DEPLOYANDO CAMBIOS DEL FRONTEND
echo ==================================

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: Ejecuta este script desde el directorio vistas/
    exit /b 1
)

REM 1. Instalar dependencias si es necesario
echo 📦 Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

REM 2. Verificar TypeScript
echo 🔍 Verificando TypeScript...
npm run type-check
if %errorlevel% neq 0 (
    echo ❌ Error en TypeScript
    exit /b 1
)

REM 3. Build del proyecto
echo 🏗️ Construyendo proyecto...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Error en build
    exit /b 1
)

REM 4. Iniciar servidor
echo 🌐 Iniciando servidor...
echo ✅ Frontend desplegado exitosamente
echo 🌍 Servidor disponible en: http://localhost:3001
npm run serve

pause
