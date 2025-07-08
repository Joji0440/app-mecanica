#!/bin/bash

# Script para corregir permisos de Laravel en producción
# Uso: sudo ./fix-laravel-permissions.sh

echo "🔧 Corrigiendo permisos de Laravel..."

# Directorio base de Laravel
LARAVEL_DIR="/var/www/mecanica/backend"

# Verificar que el directorio existe
if [ ! -d "$LARAVEL_DIR" ]; then
    echo "❌ Error: Directorio $LARAVEL_DIR no encontrado"
    exit 1
fi

echo "📁 Estableciendo propietario www-data para todo el proyecto..."
chown -R www-data:www-data $LARAVEL_DIR

echo "🔐 Estableciendo permisos base (755) para archivos y directorios..."
chmod -R 755 $LARAVEL_DIR

echo "📝 Estableciendo permisos de escritura (775) para storage y cache..."
chmod -R 775 $LARAVEL_DIR/storage
chmod -R 775 $LARAVEL_DIR/bootstrap/cache

echo "� Agregando usuario mecanica al grupo www-data..."
usermod -a -G www-data mecanica

echo "�📄 Estableciendo permisos específicos para archivos de logs..."
find $LARAVEL_DIR/storage/logs -type f -exec chmod 664 {} \;

echo "🔑 Verificando permisos críticos..."
echo "Storage: $(ls -ld $LARAVEL_DIR/storage | awk '{print $1, $3, $4}')"
echo "Cache: $(ls -ld $LARAVEL_DIR/bootstrap/cache | awk '{print $1, $3, $4}')"
echo "Logs: $(ls -ld $LARAVEL_DIR/storage/logs | awk '{print $1, $3, $4}')"

echo "✅ Permisos corregidos exitosamente"

# Limpiar cachés de Laravel para aplicar cambios
echo "🧹 Limpiando cachés de Laravel..."
cd $LARAVEL_DIR
php artisan config:clear 2>/dev/null || echo "⚠️  No se pudo limpiar config cache"
php artisan cache:clear 2>/dev/null || echo "⚠️  No se pudo limpiar application cache"
php artisan route:clear 2>/dev/null || echo "⚠️  No se pudo limpiar route cache"

echo "🎉 ¡Permisos y cachés configurados correctamente!"
