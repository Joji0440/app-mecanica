#!/bin/bash

# Script de configuración inicial para el proyecto Mecánica Asistida
# Este script configura tanto el backend como el frontend

echo "🚀 Configurando Mecánica Asistida en Línea..."
echo ""

# Verificar prerrequisitos
echo "📋 Verificando prerrequisitos..."

# Verificar PHP
if ! command -v php &> /dev/null; then
    echo "❌ PHP no está instalado. Por favor instala PHP 8.1 o superior."
    exit 1
fi

# Verificar Composer
if ! command -v composer &> /dev/null; then
    echo "❌ Composer no está instalado. Por favor instala Composer."
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18 o superior."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm."
    exit 1
fi

echo "✅ Prerrequisitos verificados"
echo ""

# Configurar Backend
echo "⚙️ Configurando Backend (Laravel)..."
cd Mecanica

# Instalar dependencias de PHP
composer install

# Configurar archivo .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📄 Archivo .env creado"
fi

# Generar clave de aplicación
php artisan key:generate

# Configurar base de datos (opcional)
read -p "¿Quieres ejecutar las migraciones ahora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan migrate
    php artisan db:seed
    echo "✅ Base de datos configurada"
fi

cd ..

# Configurar Frontend
echo ""
echo "⚙️ Configurando Frontend (React)..."
cd vistas

# Instalar dependencias de Node.js
npm install

# Configurar archivo .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📄 Archivo .env creado"
fi

cd ..

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "Para iniciar el desarrollo:"
echo "1. Backend:  cd Mecanica && php artisan serve"
echo "2. Frontend: cd vistas && npm run dev"
echo ""
echo "URLs:"
echo "- Backend API: http://localhost:8000"
echo "- Frontend:    http://localhost:5173"
