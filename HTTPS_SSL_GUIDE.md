# 🔒 GUÍA COMPLETA: CONFIGURACIÓN HTTPS/SSL

> **Objetivo**: Configurar certificación HTTPS para el sistema Mecánica Asistida  
> **Opciones**: Let's Encrypt (dominio público) o Certificado Auto-firmado (IP local)  
> **Tiempo estimado**: 15-30 minutos  

---

## 🎯 OPCIONES DISPONIBLES

### Opción 1: Let's Encrypt (RECOMENDADO PARA PRODUCCIÓN) ⭐
- ✅ **Certificado gratuito y confiable**
- ✅ **Renovación automática**
- ✅ **Reconocido por todos los navegadores**
- ❌ **Requiere dominio público válido**
- ❌ **Servidor debe ser accesible desde internet**

### Opción 2: Certificado Auto-firmado (DESARROLLO/TESTING)
- ✅ **Funciona con IP local (192.168.x.x)**
- ✅ **No requiere dominio público**
- ✅ **Configuración inmediata**
- ❌ **Advertencia de seguridad en navegadores**
- ❌ **No recomendado para producción real**

---

## 🚀 IMPLEMENTACIÓN RÁPIDA

### Método Automatizado (RECOMENDADO)
```bash
# Ejecutar script automatizado
cd /home/mecanica/Downloads/app-mecanica
./setup-https.sh
```

El script detectará tu situación y te guiará paso a paso.

---

## 📋 IMPLEMENTACIÓN MANUAL

### PASO 1: Preparación del Sistema

#### 1.1. Verificar sistema actual
```bash
# Verificar que HTTP funciona
curl http://192.168.0.103/api/health

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

#### 1.2. Instalar Certbot
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### PASO 2A: Let's Encrypt (Dominio Público)

#### 2A.1. Requisitos previos
- **Dominio público válido** (ej: mecanica.midominio.com)
- **DNS apuntando** a tu servidor
- **Puerto 80 y 443 abiertos** en firewall
- **Servidor accesible** desde internet

#### 2A.2. Obtener certificado
```bash
# Reemplazar con tu dominio y email real
DOMAIN="mecanica.midominio.com"
EMAIL="admin@midominio.com"

sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email
```

#### 2A.3. Verificar instalación
```bash
# Certbot configura Nginx automáticamente
sudo nginx -t
sudo systemctl reload nginx

# Probar HTTPS
curl https://mecanica.midominio.com/api/health
```

### PASO 2B: Certificado Auto-firmado (IP Local)

#### 2B.1. Crear certificados
```bash
# Crear directorios
sudo mkdir -p /etc/ssl/private /etc/ssl/certs

# Generar certificado auto-firmado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/mecanica-selfsigned.key \
    -out /etc/ssl/certs/mecanica-selfsigned.crt \
    -subj "/C=ES/ST=Madrid/L=Madrid/O=MecanicaAsistida/OU=IT/CN=192.168.0.103"

# Generar parámetros DH para mayor seguridad
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

#### 2B.2. Configurar Nginx
```bash
sudo tee /etc/nginx/sites-available/mecanica << 'EOF'
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name 192.168.0.103;
    return 301 https://$server_name$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name 192.168.0.103;
    root /var/www/html;
    index index.html;

    # Certificados SSL
    ssl_certificate /etc/ssl/certs/mecanica-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/mecanica-selfsigned.key;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;

    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Frontend - React SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend - Laravel API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Port 443;
    }

    # Laravel Storage Files
    location /storage {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Port 443;
    }

    # Archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

### PASO 3: Actualizar Variables de Entorno

#### 3.1. Backend Laravel (.env)
```bash
cd /var/www/mecanica/backend

# Backup del .env actual
sudo cp .env .env.backup

# Actualizar URLs
sudo sed -i 's|APP_URL=http://|APP_URL=https://|g' .env
sudo sed -i 's|APP_URL=https://https://|APP_URL=https://|g' .env

# Verificar cambios
grep "APP_URL=" .env
```

#### 3.2. Frontend React (.env)
```bash
cd /var/www/mecanica/frontend

# Actualizar URLs de API
sudo sed -i 's|VITE_API_URL=http://|VITE_API_URL=https://|g' .env
sudo sed -i 's|VITE_APP_URL=http://|VITE_APP_URL=https://|g' .env

# Verificar cambios
grep "VITE_" .env
```

#### 3.3. Aplicar cambios
```bash
# Validar y recargar Nginx
sudo nginx -t
sudo systemctl reload nginx

# Limpiar cache Laravel
cd /var/www/mecanica/backend
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:cache

# Reconstruir frontend con nuevas URLs
cd /var/www/mecanica/frontend
sudo npm run build
sudo cp -r dist/* /var/www/html/
```

### PASO 4: Configurar Renovación Automática (Solo Let's Encrypt)

#### 4.1. Cron job para renovación
```bash
# Solo para certificados Let's Encrypt
sudo tee /etc/cron.d/certbot << 'EOF'
# Renovar certificados Let's Encrypt automáticamente
0 12 * * * root certbot renew --quiet && systemctl reload nginx
EOF
```

#### 4.2. Probar renovación
```bash
# Probar renovación en dry-run
sudo certbot renew --dry-run
```

---

## 🧪 TESTING Y VALIDACIÓN

### Tests Básicos
```bash
# 1. Verificar certificado SSL
openssl s_client -connect 192.168.0.103:443 -servername 192.168.0.103 < /dev/null

# 2. Probar redirección HTTP → HTTPS
curl -I http://192.168.0.103/

# 3. Probar endpoints HTTPS
curl -k https://192.168.0.103/api/health

# 4. Verificar headers de seguridad
curl -k -I https://192.168.0.103/
```

### Tests en Navegador
1. **Abrir**: https://192.168.0.103
2. **Verificar**: Candado de seguridad en la barra de direcciones
3. **Probar**: Login y funcionalidades
4. **Confirmar**: Redirección automática de HTTP a HTTPS

---

## 🚨 TROUBLESHOOTING

### Problema: Certificado auto-firmado no confiable
**Síntoma**: Navegador muestra "Tu conexión no es privada"
```bash
# Solución en navegador:
1. Hacer clic en "Avanzado"
2. Hacer clic en "Proceder a 192.168.0.103 (no seguro)"
3. El sitio cargará normalmente

# Alternativa: Agregar excepción permanente
# Chrome: chrome://flags/#allow-insecure-localhost
# Firefox: about:config → security.insecure_connection_text.enabled
```

### Problema: Mixed content (HTTP en HTTPS)
**Síntoma**: Recursos bloqueados por política de seguridad
```bash
# Verificar todas las URLs en el código
grep -r "http://" /var/www/mecanica/frontend/src/
grep -r "http://" /var/www/mecanica/backend/

# Actualizar URLs hardcodeadas
# React: usar variables de entorno
# Laravel: usar helper url() o asset()
```

### Problema: API no responde via HTTPS
**Síntoma**: Error 502 o timeout en /api
```bash
# Verificar proxy headers en Nginx
sudo nginx -t

# Verificar Laravel está corriendo
ps aux | grep "artisan serve"

# Verificar logs
tail -f /var/log/nginx/error.log
tail -f /var/www/mecanica/backend/storage/logs/laravel.log
```

### Problema: Let's Encrypt falla
**Síntoma**: Error obteniendo certificado
```bash
# Verificar dominio apunta al servidor
nslookup tudominio.com

# Verificar puertos abiertos
sudo ufw status
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Verificar acceso desde internet
curl -I http://tudominio.com
```

---

## 🔧 COMANDOS DE MANTENIMIENTO

### Verificar estado SSL
```bash
# Información del certificado
sudo certbot certificates

# Estado de renovación
sudo certbot renew --dry-run

# Verificar configuración Nginx
sudo nginx -t

# Logs de SSL
sudo tail -f /var/log/nginx/error.log | grep -i ssl
```

### Renovar certificado manualmente
```bash
# Solo Let's Encrypt
sudo certbot renew
sudo systemctl reload nginx
```

### Revocar certificado (si es necesario)
```bash
# Solo Let's Encrypt
sudo certbot revoke --cert-path /etc/letsencrypt/live/tudominio.com/cert.pem
```

---

## 📊 CONFIGURACIÓN FINAL

### URLs HTTPS Funcionales
```
Frontend:    https://192.168.0.103
API:         https://192.168.0.103/api
Storage:     https://192.168.0.103/storage
Health:      https://192.168.0.103/api/health
```

### Archivos Configurados
```
/etc/nginx/sites-available/mecanica     # Configuración HTTPS
/etc/ssl/certs/mecanica-selfsigned.crt  # Certificado (auto-firmado)
/etc/ssl/private/mecanica-selfsigned.key # Clave privada
/var/www/mecanica/backend/.env          # URLs HTTPS
/var/www/mecanica/frontend/.env         # URLs HTTPS
```

### Headers de Seguridad Incluidos
- `Strict-Transport-Security`: Fuerza HTTPS
- `X-Frame-Options`: Previene clickjacking
- `X-Content-Type-Options`: Previene MIME sniffing
- `X-XSS-Protection`: Protección XSS

---

## 🎯 SIGUIENTES PASOS RECOMENDADOS

### Seguridad Adicional
1. **Firewall**: Configurar UFW para abrir solo puertos necesarios
2. **Rate Limiting**: Nginx rate limiting para APIs
3. **Security Headers**: Headers adicionales de seguridad
4. **Monitoring**: Logs y alertas de seguridad

### Performance
1. **HTTP/2**: Ya incluido en configuración
2. **Gzip**: Comprimir respuestas
3. **Caching**: Headers de cache optimizados
4. **CDN**: Para archivos estáticos

### Producción Real
1. **Dominio público**: Migrar de IP a dominio real
2. **DNS**: Configurar registros A/AAAA
3. **Backup**: Incluir certificados en strategy de backup
4. **Monitoring**: Alertas de expiración de certificados

---

## ✅ CHECKLIST HTTPS

### Preparación
- [ ] Sistema HTTP funcionando correctamente
- [ ] Nginx configurado y validado
- [ ] Backup de configuraciones actuales

### Certificado SSL
- [ ] Let's Encrypt instalado (si aplica)
- [ ] Certificado obtenido y validado
- [ ] Archivos de certificado en lugar correcto

### Configuración
- [ ] Nginx configurado para HTTPS
- [ ] Variables de entorno actualizadas
- [ ] Frontend rebuildeado con nuevas URLs
- [ ] Cache Laravel limpiado

### Testing
- [ ] HTTPS responde correctamente
- [ ] Redirección HTTP → HTTPS funciona
- [ ] API accesible via HTTPS
- [ ] Frontend carga completamente
- [ ] No hay errores de mixed content

### Mantenimiento
- [ ] Renovación automática configurada (Let's Encrypt)
- [ ] Monitoring de certificados
- [ ] Documentación actualizada

---

**🔒 HTTPS CONFIGURADO EXITOSAMENTE**

Tu sistema ahora tiene:
- ✅ **Certificación SSL** funcionando
- ✅ **Redirección automática** HTTP → HTTPS  
- ✅ **Headers de seguridad** configurados
- ✅ **Todas las URLs** actualizadas
- ✅ **Sistema completamente seguro**

---

*Guía generada el: Julio 8, 2025*  
*Versión: 1.0*  
*Estado: ✅ Completa*
