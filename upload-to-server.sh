#!/bin/bash

# Script para subir archivos al servidor
# Ejecutar desde tu máquina local

SERVER_IP="TU-SERVIDOR-IP"
SERVER_USER="root"
LOCAL_PROJECT="/home/mecanica/Downloads/app-mecanica"

echo "🚀 Subiendo archivos al servidor $SERVER_IP"

# Comprimir proyecto
echo "📦 Comprimiendo proyecto..."
cd /home/mecanica/Downloads/
tar -czf mecanica-deploy.tar.gz app-mecanica/

# Subir al servidor
echo "⬆️  Subiendo archivos..."
scp mecanica-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Conectar y descomprimir
echo "📂 Descomprimiendo en servidor..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /tmp
tar -xzf mecanica-deploy.tar.gz
mv app-mecanica mecanica-deploy
chmod +x mecanica-deploy/*.sh
ls -la mecanica-deploy/
EOF

echo "✅ Archivos subidos exitosamente"
echo "🔗 Conecta al servidor y ejecuta:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   cd /tmp/mecanica-deploy"
echo "   ./deploy-system.sh"
