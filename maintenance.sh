#!/bin/bash

# Script de mantenimiento para Mecánica Asistida
# Permite realizar tareas comunes de administración

set -e

PROJECT_DIR="/var/www/html/app-mecanica"
LARAVEL_DIR="$PROJECT_DIR/Mecanica"
FRONTEND_DIR="$PROJECT_DIR/vistas"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

show_menu() {
    echo ""
    echo -e "${BLUE}🛠️  Herramientas de Mantenimiento - Mecánica Asistida${NC}"
    echo ""
    echo "1)  Ver estado de servicios"
    echo "2)  Reiniciar servicios"
    echo "3)  Ver logs en tiempo real"
    echo "4)  Limpiar cache de Laravel"
    echo "5)  Ejecutar migraciones"
    echo "6)  Optimizar Laravel para producción"
    echo "7)  Actualizar dependencias"
    echo "8)  Reconstruir frontend"
    echo "9)  Hacer backup de base de datos"
    echo "10) Restaurar backup de base de datos"
    echo "11) Verificar configuración"
    echo "12) Ver información del sistema"
    echo "13) Configurar SSL/HTTPS"
    echo "14) Gestionar workers de cola"
    echo "0)  Salir"
    echo ""
    read -p "Selecciona una opción (0-14): " choice
}

check_services() {
    print_info "Estado de servicios:"
    
    if sudo systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx: Activo${NC}"
    else
        echo -e "${RED}❌ Nginx: Inactivo${NC}"
    fi
    
    if sudo systemctl is-active --quiet php8.2-fpm; then
        echo -e "${GREEN}✅ PHP-FPM: Activo${NC}"
    else
        echo -e "${RED}❌ PHP-FPM: Inactivo${NC}"
    fi
    
    if sudo systemctl is-active --quiet postgresql; then
        echo -e "${GREEN}✅ PostgreSQL: Activo${NC}"
    elif sudo systemctl is-active --quiet mysql; then
        echo -e "${GREEN}✅ MySQL: Activo${NC}"
    else
        echo -e "${RED}❌ Base de datos: Inactiva${NC}"
    fi
    
    if sudo systemctl is-active --quiet mecanica-worker; then
        echo -e "${GREEN}✅ Queue Worker: Activo${NC}"
    else
        echo -e "${YELLOW}⚠️  Queue Worker: Inactivo${NC}"
    fi
}

restart_services() {
    print_info "Reiniciando servicios..."
    
    sudo systemctl restart nginx
    print_status "Nginx reiniciado"
    
    sudo systemctl restart php8.2-fpm
    print_status "PHP-FPM reiniciado"
    
    if sudo systemctl is-enabled --quiet mecanica-worker; then
        sudo systemctl restart mecanica-worker
        print_status "Queue Worker reiniciado"
    fi
}

view_logs() {
    echo ""
    echo "Selecciona qué logs ver:"
    echo "1) Laravel"
    echo "2) Nginx Error"
    echo "3) Nginx Access"
    echo "4) PHP-FPM"
    echo "5) Sistema"
    read -p "Opción (1-5): " log_choice
    
    case $log_choice in
        1)
            print_info "Viendo logs de Laravel (Ctrl+C para salir)..."
            sudo tail -f "$LARAVEL_DIR/storage/logs/laravel.log"
            ;;
        2)
            print_info "Viendo logs de error de Nginx (Ctrl+C para salir)..."
            sudo tail -f /var/log/nginx/mecanica_error.log
            ;;
        3)
            print_info "Viendo logs de acceso de Nginx (Ctrl+C para salir)..."
            sudo tail -f /var/log/nginx/mecanica_access.log
            ;;
        4)
            print_info "Viendo logs de PHP-FPM (Ctrl+C para salir)..."
            sudo tail -f /var/log/php8.2-fpm.log
            ;;
        5)
            print_info "Viendo logs del sistema (Ctrl+C para salir)..."
            sudo journalctl -f
            ;;
        *)
            print_error "Opción inválida"
            ;;
    esac
}

clear_cache() {
    print_info "Limpiando cache de Laravel..."
    cd "$LARAVEL_DIR"
    
    sudo -u www-data php artisan config:clear
    sudo -u www-data php artisan cache:clear
    sudo -u www-data php artisan route:clear
    sudo -u www-data php artisan view:clear
    
    print_status "Cache limpiado"
}

run_migrations() {
    print_info "Ejecutando migraciones..."
    cd "$LARAVEL_DIR"
    
    read -p "¿Ejecutar migraciones? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo -u www-data php artisan migrate --force
        print_status "Migraciones ejecutadas"
    fi
}

optimize_laravel() {
    print_info "Optimizando Laravel para producción..."
    cd "$LARAVEL_DIR"
    
    sudo -u www-data php artisan config:cache
    sudo -u www-data php artisan route:cache
    sudo -u www-data php artisan view:cache
    sudo -u www-data composer dump-autoload --optimize
    
    print_status "Laravel optimizado"
}

update_dependencies() {
    print_info "Actualizando dependencias..."
    
    read -p "¿Actualizar dependencias de PHP? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$LARAVEL_DIR"
        sudo -u www-data composer update --optimize-autoloader --no-dev
        print_status "Dependencias PHP actualizadas"
    fi
    
    read -p "¿Actualizar dependencias de Node.js? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$FRONTEND_DIR"
        sudo -u www-data npm update
        print_status "Dependencias Node.js actualizadas"
    fi
}

rebuild_frontend() {
    print_info "Reconstruyendo frontend..."
    cd "$FRONTEND_DIR"
    
    sudo -u www-data npm run build
    print_status "Frontend reconstruido"
}

backup_database() {
    print_info "Creando backup de base de datos..."
    
    BACKUP_DIR="/var/backups/mecanica"
    sudo mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    
    # Detectar tipo de base de datos desde .env
    DB_CONNECTION=$(grep "^DB_CONNECTION=" "$LARAVEL_DIR/.env" | cut -d'=' -f2)
    DB_DATABASE=$(grep "^DB_DATABASE=" "$LARAVEL_DIR/.env" | cut -d'=' -f2)
    DB_USERNAME=$(grep "^DB_USERNAME=" "$LARAVEL_DIR/.env" | cut -d'=' -f2)
    
    if [[ "$DB_CONNECTION" == "pgsql" ]]; then
        BACKUP_FILE="$BACKUP_DIR/mecanica_backup_$TIMESTAMP.sql"
        sudo -u postgres pg_dump "$DB_DATABASE" > "$BACKUP_FILE"
        print_status "Backup PostgreSQL creado: $BACKUP_FILE"
    elif [[ "$DB_CONNECTION" == "mysql" ]]; then
        BACKUP_FILE="$BACKUP_DIR/mecanica_backup_$TIMESTAMP.sql"
        read -s -p "Contraseña de la base de datos: " DB_PASSWORD
        echo
        mysqldump -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" > "$BACKUP_FILE"
        print_status "Backup MySQL creado: $BACKUP_FILE"
    else
        print_error "Tipo de base de datos no reconocido"
    fi
}

restore_database() {
    print_info "Restaurar backup de base de datos..."
    
    BACKUP_DIR="/var/backups/mecanica"
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        print_error "No se encontró directorio de backups"
        return
    fi
    
    echo "Backups disponibles:"
    ls -la "$BACKUP_DIR"/*.sql 2>/dev/null || { print_error "No hay backups disponibles"; return; }
    
    read -p "Nombre del archivo de backup: " backup_file
    
    if [[ ! -f "$BACKUP_DIR/$backup_file" ]]; then
        print_error "Archivo de backup no encontrado"
        return
    fi
    
    read -p "⚠️  ¿ESTÁS SEGURO? Esto sobrescribirá la base de datos actual (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    # Detectar tipo de base de datos
    DB_CONNECTION=$(grep "^DB_CONNECTION=" "$LARAVEL_DIR/.env" | cut -d'=' -f2)
    DB_DATABASE=$(grep "^DB_DATABASE=" "$LARAVEL_DIR/.env" | cut -d'=' -f2)
    DB_USERNAME=$(grep "^DB_USERNAME=" "$LARAVEL_DIR/.env" | cut -d'=' -f2)
    
    if [[ "$DB_CONNECTION" == "pgsql" ]]; then
        sudo -u postgres psql "$DB_DATABASE" < "$BACKUP_DIR/$backup_file"
        print_status "Base de datos PostgreSQL restaurada"
    elif [[ "$DB_CONNECTION" == "mysql" ]]; then
        read -s -p "Contraseña de la base de datos: " DB_PASSWORD
        echo
        mysql -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" < "$BACKUP_DIR/$backup_file"
        print_status "Base de datos MySQL restaurada"
    fi
}

check_config() {
    print_info "Verificando configuración..."
    
    # Verificar permisos
    echo "Verificando permisos..."
    if [[ $(stat -c "%U" "$LARAVEL_DIR/storage") == "www-data" ]]; then
        echo -e "${GREEN}✅ Permisos storage: OK${NC}"
    else
        echo -e "${RED}❌ Permisos storage: Incorrectos${NC}"
    fi
    
    # Verificar .env
    if [[ -f "$LARAVEL_DIR/.env" ]]; then
        echo -e "${GREEN}✅ Archivo .env: Existe${NC}"
    else
        echo -e "${RED}❌ Archivo .env: No existe${NC}"
    fi
    
    # Verificar configuración Nginx
    sudo nginx -t && echo -e "${GREEN}✅ Configuración Nginx: OK${NC}" || echo -e "${RED}❌ Configuración Nginx: Error${NC}"
    
    # Verificar conexión base de datos
    cd "$LARAVEL_DIR"
    if sudo -u www-data php artisan migrate:status &>/dev/null; then
        echo -e "${GREEN}✅ Conexión base de datos: OK${NC}"
    else
        echo -e "${RED}❌ Conexión base de datos: Error${NC}"
    fi
}

system_info() {
    print_info "Información del sistema:"
    echo "Sistema: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Memoria: $(free -h | grep Mem | awk '{print $2 " total, " $3 " usado, " $7 " disponible"}')"
    echo "Disco: $(df -h / | tail -1 | awk '{print $2 " total, " $3 " usado, " $4 " disponible"}')"
    echo "PHP: $(php -v | head -1)"
    echo "Node.js: $(node -v)"
    echo "Nginx: $(nginx -v 2>&1)"
}

setup_ssl() {
    print_info "Configuración SSL/HTTPS..."
    
    read -p "Introduce tu dominio: " domain
    if [[ -z "$domain" ]]; then
        print_error "Dominio requerido"
        return
    fi
    
    # Instalar Certbot
    if ! command -v certbot &> /dev/null; then
        print_info "Instalando Certbot..."
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Obtener certificado
    sudo certbot --nginx -d "$domain"
    
    if [[ $? -eq 0 ]]; then
        print_status "SSL configurado para $domain"
        
        # Configurar renovación automática
        (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
        print_status "Renovación automática configurada"
    else
        print_error "Error configurando SSL"
    fi
}

manage_workers() {
    print_info "Gestión de workers de cola..."
    
    echo "1) Instalar servicio worker"
    echo "2) Iniciar worker"
    echo "3) Parar worker"
    echo "4) Ver estado worker"
    echo "5) Ver logs worker"
    read -p "Opción (1-5): " worker_choice
    
    case $worker_choice in
        1)
            sudo cp "$PROJECT_DIR/mecanica-worker.service" /etc/systemd/system/
            sudo systemctl daemon-reload
            sudo systemctl enable mecanica-worker
            print_status "Servicio worker instalado"
            ;;
        2)
            sudo systemctl start mecanica-worker
            print_status "Worker iniciado"
            ;;
        3)
            sudo systemctl stop mecanica-worker
            print_status "Worker parado"
            ;;
        4)
            sudo systemctl status mecanica-worker
            ;;
        5)
            sudo journalctl -u mecanica-worker -f
            ;;
        *)
            print_error "Opción inválida"
            ;;
    esac
}

# Función principal
main() {
    while true; do
        show_menu
        
        case $choice in
            1) check_services ;;
            2) restart_services ;;
            3) view_logs ;;
            4) clear_cache ;;
            5) run_migrations ;;
            6) optimize_laravel ;;
            7) update_dependencies ;;
            8) rebuild_frontend ;;
            9) backup_database ;;
            10) restore_database ;;
            11) check_config ;;
            12) system_info ;;
            13) setup_ssl ;;
            14) manage_workers ;;
            0) 
                print_info "¡Hasta luego!"
                exit 0
                ;;
            *)
                print_error "Opción inválida"
                ;;
        esac
        
        echo ""
        read -p "Presiona Enter para continuar..."
    done
}

# Verificar que el proyecto existe
if [[ ! -d "$PROJECT_DIR" ]]; then
    print_error "Proyecto no encontrado en $PROJECT_DIR"
    print_info "Ejecuta primero el script de despliegue: ./deploy-ubuntu.sh"
    exit 1
fi

# Iniciar menú principal
main
