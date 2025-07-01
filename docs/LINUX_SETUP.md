# 🐧 Guía de Instalación para Linux

Esta guía cubre las principales distribuciones de Linux (Ubuntu, Debian, CentOS, Fedora, Arch).

## 📋 Prerrequisitos para Linux

### Ubuntu/Debian

#### 1. Actualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Instalar dependencias básicas
```bash
sudo apt install -y curl wget git build-essential software-properties-common apt-transport-https
```

#### 3. Instalar PHP 8.1+
```bash
# Añadir repositorio PHP
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Instalar PHP y extensiones
sudo apt install -y php8.1 php8.1-cli php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip php8.1-bcmath php8.1-json php8.1-tokenizer
```

#### 4. Instalar Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

#### 5. Instalar Node.js 18+
```bash
# Método 1: NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Método 2: Snap
sudo snap install node --classic

# Método 3: NVM (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 6. Instalar MySQL
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

### CentOS/RHEL/Fedora

#### 1. Actualizar sistema
```bash
# CentOS/RHEL
sudo yum update -y

# Fedora
sudo dnf update -y
```

#### 2. Instalar dependencias
```bash
# CentOS/RHEL
sudo yum install -y curl wget git gcc gcc-c++ make

# Fedora  
sudo dnf install -y curl wget git gcc gcc-c++ make
```

#### 3. Instalar PHP
```bash
# CentOS/RHEL - Habilitar EPEL y Remi
sudo yum install -y epel-release
sudo yum install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
sudo yum module enable php:remi-8.1 -y
sudo yum install -y php php-cli php-fpm php-mysql php-xml php-mbstring php-curl php-zip php-bcmath php-json

# Fedora
sudo dnf install -y php php-cli php-fpm php-mysql php-xml php-mbstring php-curl php-zip php-bcmath php-json
```

#### 4. Instalar Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

#### 5. Instalar Node.js
```bash
# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Fedora
sudo dnf install -y npm nodejs
```

#### 6. Instalar MySQL
```bash
# CentOS/RHEL
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Fedora
sudo dnf install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

### Arch Linux

#### 1. Actualizar sistema
```bash
sudo pacman -Syu
```

#### 2. Instalar paquetes
```bash
sudo pacman -S base-devel git curl wget php php-apache composer nodejs npm mysql
```

#### 3. Configurar servicios
```bash
sudo systemctl enable mysqld
sudo systemctl start mysqld
```

## 🚀 Configuración del Proyecto

### Paso 1: Clonar Repositorio
```bash
git clone [URL-DEL-REPOSITORIO]
cd app-mecanica
```

### Paso 2: Configuración Automática
```bash
chmod +x setup.sh
./setup.sh
```

### Paso 3: Configuración Manual

#### Backend
```bash
cd Mecanica
composer install
cp .env.example .env
php artisan key:generate
```

#### Configurar MySQL
```bash
# Conectar a MySQL
sudo mysql -u root -p

# Crear base de datos y usuario
CREATE DATABASE mecanica_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mecanica_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON mecanica_db.* TO 'mecanica_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Configurar .env
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mecanica_db
DB_USERNAME=mecanica_user
DB_PASSWORD=password123
```

#### Ejecutar migraciones
```bash
php artisan migrate
php artisan db:seed
```

#### Frontend
```bash
cd ../vistas
npm install
cp .env.example .env
```

## ✅ Ejecutar Proyecto

### Terminal 1: Backend
```bash
cd Mecanica
php artisan serve
```

### Terminal 2: Frontend
```bash
cd vistas
npm run dev
```

## 🛠️ Herramientas Adicionales

### Visual Studio Code
```bash
# Ubuntu/Debian
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code

# Fedora
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
sudo dnf install code

# Arch Linux
sudo pacman -S code
```

### MySQL Workbench
```bash
# Ubuntu/Debian
sudo apt install mysql-workbench

# Fedora
sudo dnf install mysql-workbench

# Arch Linux
sudo pacman -S mysql-workbench
```

### Postman
```bash
# Snap (todas las distribuciones)
sudo snap install postman

# O descargar desde postman.com
```

## 🐛 Solución de Problemas Linux

### Error: "php: command not found"
```bash
# Verificar instalación
which php
php --version

# Reinstalar PHP
sudo apt install --reinstall php8.1-cli  # Ubuntu/Debian
sudo dnf reinstall php-cli               # Fedora
```

### Error: "composer: command not found"
```bash
# Verificar ubicación
which composer

# Reinstalar
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

### Error: "Permission denied" con npm
```bash
# Cambiar propietario de directorio npm
sudo chown -R $(whoami) ~/.npm

# O instalar paquetes globalmente sin sudo
npm config set prefix ~/.local
echo 'export PATH=~/.local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Error: MySQL "Access denied"
```bash
# Ubuntu/Debian - Sin password inicialmente
sudo mysql -u root

# CentOS/RHEL - Usar password temporal
sudo grep 'temporary password' /var/log/mysqld.log
mysql -u root -p
# Cambiar password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NuevoPassword123!';
```

### Error: "Port already in use"
```bash
# Ver qué proceso usa el puerto
sudo lsof -ti:8000
sudo netstat -tlnp | grep :8000

# Matar proceso
sudo kill -9 $(lsof -ti:8000)
```

### Problemas con extensiones PHP
```bash
# Ver extensiones instaladas
php -m

# Instalar extensiones faltantes (Ubuntu/Debian)
sudo apt install php8.1-[extension]

# Reiniciar PHP-FPM si es necesario
sudo systemctl restart php8.1-fpm
```

### Error: "Node: command not found"
```bash
# Verificar PATH
echo $PATH

# Añadir Node.js al PATH
echo 'export PATH=/usr/local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# O reinstalar con NVM
```

## 🔥 Configuración de Firewall

### UFW (Ubuntu/Debian)
```bash
# Habilitar firewall
sudo ufw enable

# Permitir puertos para desarrollo
sudo ufw allow 8000
sudo ufw allow 5173
sudo ufw allow 3306  # MySQL

# Ver estado
sudo ufw status
```

### Firewalld (CentOS/RHEL/Fedora)
```bash
# Habilitar firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Permitir puertos
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

## 🚀 Optimizaciones de Rendimiento

### PHP
```bash
# Editar configuración PHP
sudo nano /etc/php/8.1/cli/php.ini

# Optimizaciones recomendadas:
memory_limit = 512M
max_execution_time = 300
upload_max_filesize = 100M
post_max_size = 100M
```

### MySQL
```bash
# Editar configuración MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Optimizaciones básicas:
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
```

### Node.js
```bash
# Aumentar límite de memoria para Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc
```

## 📁 Estructura de Directorios Linux

```
/home/[usuario]/
├── Proyectos/
│   └── app-mecanica/     # Tu proyecto aquí
├── .bashrc               # Configuración de shell
├── .gitconfig            # Configuración de Git
└── .ssh/                 # Claves SSH
```

## 🔧 Configuración Adicional

### Git
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"
git config --global init.defaultBranch main
```

### SSH para GitHub
```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu.email@ejemplo.com"

# Añadir al agente SSH
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar clave pública
cat ~/.ssh/id_ed25519.pub
# Pegar en GitHub → Settings → SSH Keys
```

### Alias útiles en ~/.bashrc
```bash
# Editar ~/.bashrc
nano ~/.bashrc

# Añadir aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias art='php artisan'
alias serve='php artisan serve'

# Recargar configuración
source ~/.bashrc
```

## 💡 Tips para Linux

- **Usar sudo** con precaución
- **Mantener sistema actualizado** regularmente
- **Usar SSH keys** para GitHub
- **Configurar aliases** para comandos frecuentes
- **Monitorear recursos** con `htop`
- **Usar tmux/screen** para sesiones persistentes
- **Backups regulares** de configuraciones importantes

## 🔒 Seguridad

```bash
# Actualizar sistema regularmente
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
sudo dnf update -y                       # Fedora

# Configurar fail2ban (opcional)
sudo apt install fail2ban               # Ubuntu/Debian
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configurar firewall básico
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

¡Con esta configuración tendrás un entorno robusto en Linux! 🐧🚀
