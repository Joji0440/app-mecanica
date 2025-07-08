#!/bin/bash
echo "🧪 Ejecutando tests del backend..."
cd /home/mecanica/Downloads/app-mecanica/Mecanica
php artisan test

echo ""
echo "🧪 Ejecutando tests del frontend..."
cd /home/mecanica/Downloads/app-mecanica/vistas
npm run test
