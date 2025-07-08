#!/bin/bash

# Script para verificar completamente el funcionamiento HTTPS
echo "🔍 VERIFICACIÓN COMPLETA DEL SISTEMA HTTPS"
echo "=========================================="

# Variables
DOMAIN="192.168.0.103"
BASE_URL="https://$DOMAIN"

print_status() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

print_info() {
    echo -e "\033[0;34mℹ️  $1\033[0m"
}

# 1. Verificar servicios del sistema
echo "🔍 1. Verificando servicios del sistema..."

# Nginx
if systemctl is-active --quiet nginx; then
    print_status "Nginx está ejecutándose"
else
    print_error "Nginx no está ejecutándose"
fi

# Laravel (verificar proceso PHP)
if pgrep -f "php.*artisan.*serve" > /dev/null; then
    print_status "Laravel está ejecutándose"
else
    print_warning "Laravel podría no estar ejecutándose"
fi

# PostgreSQL
if systemctl is-active --quiet postgresql; then
    print_status "PostgreSQL está ejecutándose"
else
    print_error "PostgreSQL no está ejecutándose"
fi

# 2. Verificar certificados SSL
echo ""
echo "🔒 2. Verificando certificados SSL..."

if [ -f "/etc/ssl/certs/mecanica-selfsigned.crt" ]; then
    print_status "Certificado SSL encontrado"
    
    # Verificar validez del certificado
    CERT_INFO=$(openssl x509 -in /etc/ssl/certs/mecanica-selfsigned.crt -text -noout 2>/dev/null)
    if [ $? -eq 0 ]; then
        print_status "Certificado SSL válido"
        
        # Mostrar información del certificado
        EXPIRY=$(openssl x509 -in /etc/ssl/certs/mecanica-selfsigned.crt -enddate -noout | cut -d= -f2)
        print_info "Expira: $EXPIRY"
    else
        print_error "Certificado SSL corrupto"
    fi
else
    print_error "Certificado SSL no encontrado"
fi

# 3. Verificar configuración de Nginx
echo ""
echo "🌐 3. Verificando configuración de Nginx..."

if nginx -t 2>/dev/null; then
    print_status "Configuración de Nginx válida"
else
    print_error "Error en configuración de Nginx"
fi

# Verificar sitio habilitado
if [ -L "/etc/nginx/sites-enabled/mecanica" ]; then
    print_status "Sitio mecanica habilitado en Nginx"
else
    print_error "Sitio mecanica no habilitado"
fi

# 4. Pruebas de conectividad HTTPS
echo ""
echo "🔗 4. Probando conectividad HTTPS..."

# Test Frontend HTTPS
print_info "Probando frontend HTTPS..."
FRONTEND_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" "$BASE_URL/" 2>/dev/null || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    print_status "Frontend HTTPS: OK ($FRONTEND_RESPONSE)"
else
    print_error "Frontend HTTPS: FALLO ($FRONTEND_RESPONSE)"
fi

# Test API Health HTTPS
print_info "Probando API health HTTPS..."
API_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    print_status "API Health HTTPS: OK ($API_RESPONSE)"
else
    print_error "API Health HTTPS: FALLO ($API_RESPONSE)"
fi

# Test Storage HTTPS (si existe algún archivo)
print_info "Probando storage HTTPS..."
STORAGE_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" "$BASE_URL/storage/" 2>/dev/null || echo "000")
if [ "$STORAGE_RESPONSE" = "200" ] || [ "$STORAGE_RESPONSE" = "403" ] || [ "$STORAGE_RESPONSE" = "404" ]; then
    print_status "Storage HTTPS: OK ($STORAGE_RESPONSE)"
else
    print_warning "Storage HTTPS: Verificar ($STORAGE_RESPONSE)"
fi

# 5. Verificar redirección HTTP → HTTPS
echo ""
echo "🔄 5. Verificando redirección HTTP → HTTPS..."

HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/" 2>/dev/null || echo "000")
if [ "$HTTP_REDIRECT" = "301" ] || [ "$HTTP_REDIRECT" = "302" ]; then
    print_status "Redirección HTTP → HTTPS: OK ($HTTP_REDIRECT)"
else
    print_warning "Redirección HTTP → HTTPS: No configurada ($HTTP_REDIRECT)"
fi

# 6. Verificar variables de entorno
echo ""
echo "⚙️  6. Verificando variables de entorno..."

# Backend .env
if [ -f "/var/www/mecanica/backend/.env" ]; then
    if grep -q "APP_URL=https://$DOMAIN" /var/www/mecanica/backend/.env; then
        print_status "Backend .env configurado para HTTPS"
    else
        print_warning "Backend .env no configurado para HTTPS"
    fi
else
    print_error "Backend .env no encontrado"
fi

# Frontend .env (en desarrollo)
if [ -f "/home/mecanica/Downloads/app-mecanica/vistas/.env" ]; then
    if grep -q "VITE_API_URL=https://$DOMAIN/api" /home/mecanica/Downloads/app-mecanica/vistas/.env; then
        print_status "Frontend .env (desarrollo) configurado para HTTPS"
    else
        print_warning "Frontend .env (desarrollo) no configurado para HTTPS"
    fi
fi

# Frontend .env (producción)
if [ -f "/var/www/mecanica/frontend/.env" ]; then
    if grep -q "VITE_API_URL=https://$DOMAIN/api" /var/www/mecanica/frontend/.env; then
        print_status "Frontend .env (producción) configurado para HTTPS"
    else
        print_warning "Frontend .env (producción) no configurado para HTTPS"
    fi
fi

# 7. Verificar logs recientes
echo ""
echo "📋 7. Verificando logs recientes..."

# Nginx error log
if [ -f "/var/log/nginx/error.log" ]; then
    RECENT_ERRORS=$(tail -10 /var/log/nginx/error.log | grep -i error | wc -l)
    if [ "$RECENT_ERRORS" -eq 0 ]; then
        print_status "Sin errores recientes en Nginx"
    else
        print_warning "$RECENT_ERRORS errores recientes en Nginx"
    fi
fi

# Laravel log
if [ -f "/var/www/mecanica/backend/storage/logs/laravel.log" ]; then
    RECENT_LARAVEL_ERRORS=$(tail -20 /var/www/mecanica/backend/storage/logs/laravel.log | grep -i error | wc -l)
    if [ "$RECENT_LARAVEL_ERRORS" -eq 0 ]; then
        print_status "Sin errores recientes en Laravel"
    else
        print_warning "$RECENT_LARAVEL_ERRORS errores recientes en Laravel"
    fi
fi

# 8. Test de SSL/TLS
echo ""
echo "🔐 8. Probando configuración SSL/TLS..."

SSL_TEST=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | grep "Verify return code")
if echo "$SSL_TEST" | grep -q "ok"; then
    print_status "Configuración SSL/TLS: OK"
elif echo "$SSL_TEST" | grep -q "self signed certificate"; then
    print_status "Certificado auto-firmado funcionando correctamente"
else
    print_warning "Verificar configuración SSL/TLS"
fi

# 9. Resumen final
echo ""
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=========================="

# URLs principales
echo "🌐 URLs del sistema:"
echo "   Frontend: $BASE_URL"
echo "   API: $BASE_URL/api"
echo "   Health: $BASE_URL/api/health"
echo "   Storage: $BASE_URL/storage"

# Estado de servicios
echo ""
echo "🔧 Estado de servicios:"
systemctl is-active --quiet nginx && echo "   ✅ Nginx: Activo" || echo "   ❌ Nginx: Inactivo"
systemctl is-active --quiet postgresql && echo "   ✅ PostgreSQL: Activo" || echo "   ❌ PostgreSQL: Inactivo"
pgrep -f "php.*artisan.*serve" > /dev/null && echo "   ✅ Laravel: Activo" || echo "   ❌ Laravel: Inactivo"

echo ""
echo "🔒 VERIFICACIÓN HTTPS COMPLETADA"
echo ""
print_info "Para acceder al sistema:"
print_info "1. Abrir navegador en: $BASE_URL"
print_info "2. Aceptar certificado auto-firmado (Avanzado → Proceder)"
print_info "3. Login con credenciales configuradas"
echo ""

# 10. Comandos útiles
echo "📝 Comandos útiles para mantenimiento:"
echo "   sudo systemctl status nginx"
echo "   sudo systemctl reload nginx"
echo "   sudo tail -f /var/log/nginx/error.log"
echo "   curl -k $BASE_URL/api/health"
echo ""
