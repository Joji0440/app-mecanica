#!/bin/bash
cd /home/mecanica/Downloads/app-mecanica/Mecanica
echo "🚀 Iniciando servidor Laravel en http://localhost:8000"
php artisan serve --host=0.0.0.0 --port=8000
