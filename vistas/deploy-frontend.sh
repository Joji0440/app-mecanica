#!/bin/bash

# 🚀 DEPLOY RÁPIDO FRONTEND
# Script para deployar cambios del frontend rápidamente

echo "🚀 DEPLOYANDO CAMBIOS DEL FRONTEND"
echo "=================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio vistas/"
    exit 1
fi

# 1. Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# 2. Construir el proyecto
echo "🔨 Construyendo proyecto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build"
    exit 1
fi

# 3. Copiar al servidor
echo "📁 Copiando archivos al servidor..."
sudo cp -r dist/* /var/www/html/app-mecanica/vistas/
sudo chown -R www-data:www-data /var/www/html/app-mecanica/vistas/

# 4. Verificar deploy
echo "🔍 Verificando deploy..."
RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" https://192.168.0.103/)

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Deploy exitoso! Visita: https://192.168.0.103"
else
    echo "⚠️  Deploy completado pero respuesta: $RESPONSE"
fi

echo ""
echo "🎉 ¡DEPLOY COMPLETADO!"
echo "📱 Frontend: https://192.168.0.103"
echo "🔐 Login: https://192.168.0.103/login"
echo "📝 Register: https://192.168.0.103/register"
