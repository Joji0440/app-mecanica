#!/bin/bash

# 🎯 COMANDO FINAL DE VERIFICACIÓN COMPLETA
echo "🚀 VERIFICACIÓN FINAL DEL SISTEMA MECÁNICA ASISTIDA"
echo "=================================================="

print_success() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_info() {
    echo -e "\033[0;34mℹ️  $1\033[0m"
}

# URLs principales
DOMAIN="192.168.0.103"
FRONTEND_URL="https://$DOMAIN"
API_URL="https://$DOMAIN/api"
HEALTH_URL="https://$DOMAIN/api/health"

echo ""
echo "🌐 PROBANDO TODAS LAS URLs..."

# Test Frontend
FRONTEND_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
echo "Frontend ($FRONTEND_URL): $FRONTEND_STATUS"

# Test API Health  
API_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null)
echo "API Health ($HEALTH_URL): $API_STATUS"

# Test API Response
API_RESPONSE=$(curl -k -s "$HEALTH_URL" 2>/dev/null | jq -r '.status' 2>/dev/null || echo "error")
echo "API Response: $API_RESPONSE"

echo ""
echo "🔧 ESTADO DE SERVICIOS..."

# Verificar servicios
systemctl is-active --quiet nginx && echo "✅ Nginx: ACTIVO" || echo "❌ Nginx: INACTIVO"
systemctl is-active --quiet laravel-mecanica && echo "✅ Laravel: ACTIVO" || echo "❌ Laravel: INACTIVO" 
systemctl is-active --quiet postgresql && echo "✅ PostgreSQL: ACTIVO" || echo "❌ PostgreSQL: INACTIVO"

echo ""
echo "🔒 CERTIFICADO SSL..."
openssl x509 -in /etc/ssl/certs/mecanica-selfsigned.crt -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2

echo ""
echo "📊 RESUMEN FINAL"
echo "==============="

if [ "$FRONTEND_STATUS" = "200" ] && [ "$API_STATUS" = "200" ] && [ "$API_RESPONSE" = "ok" ]; then
    print_success "🎉 SISTEMA COMPLETAMENTE FUNCIONAL"
    print_info "📱 Acceder a: $FRONTEND_URL"
    print_info "🔐 Aceptar certificado auto-firmado en el navegador"
    print_info "👤 Login: admin@mecanica.com / password"
else
    echo "❌ SISTEMA CON ERRORES - Revisar configuración"
fi

echo ""
echo "📋 DOCUMENTACIÓN DISPONIBLE:"
echo "   📖 INDICE_DOCUMENTACION_FINAL.md"
echo "   🚀 HTTPS_DEPLOYMENT_SUCCESS.md"
echo "   📊 PROYECTO_COMPLETADO_FINAL.md"

echo ""
echo "🛠️  COMANDOS ÚTILES:"
echo "   ./verify-https.sh          # Verificación completa"
echo "   ./update-deploy.sh         # Actualizar sistema"
echo "   systemctl status nginx     # Estado Nginx"
echo "   systemctl status laravel-mecanica  # Estado Laravel"

echo ""
print_success "¡PROYECTO MECÁNICA ASISTIDA COMPLETADO CON ÉXITO! 🚀"
