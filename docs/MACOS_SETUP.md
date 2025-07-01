# 🍎 Guía de Instalación para macOS

Esta guía está específicamente diseñada para usuarios de macOS (Intel y Apple Silicon).

## 📋 Prerrequisitos para macOS

### 1. Instalar Xcode Command Line Tools
```bash
xcode-select --install
```

### 2. Instalar Homebrew (Gestor de paquetes)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Para Apple Silicon (M1/M2), añadir al PATH:
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Instalar Git
```bash
# Homebrew
brew install git

# O usar el que viene con Xcode Command Line Tools
git --version
```

### 4. Instalar PHP
```bash
# PHP 8.1 (recomendado)
brew install php@8.1

# Si quieres la última versión
brew install php

# Enlazar PHP 8.1 como predeterminado
brew link php@8.1 --force

# Añadir al PATH en ~/.zshrc
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/sbin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Verificar instalación:**
```bash
php --version
php -m  # Ver extensiones instaladas
```

### 5. Instalar Composer
```bash
# Método 1: Con Homebrew
brew install composer

# Método 2: Manual
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

**Verificar instalación:**
```bash
composer --version
```

### 6. Instalar Node.js
```bash
# Con Homebrew
brew install node

# O descargar desde nodejs.org
# O usar nvm (Node Version Manager) - recomendado
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install 18
nvm use 18
```

**Verificar instalación:**
```bash
node --version
npm --version
```

### 7. Instalar MySQL
```bash
# Con Homebrew
brew install mysql

# Iniciar MySQL
brew services start mysql

# Configurar MySQL (opcional)
mysql_secure_installation
```

**Alternativas de Base de Datos:**
```bash
# PostgreSQL
brew install postgresql
brew services start postgresql

# SQLite (ya viene instalado)
which sqlite3
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

### Paso 3: Configuración Manual (Si falla automática)

#### Backend
```bash
cd Mecanica
composer install
cp .env.example .env
php artisan key:generate
```

**Configurar base de datos en `.env`:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mecanica_db
DB_USERNAME=root
DB_PASSWORD=
```

**Crear base de datos:**
```bash
# Conectar a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE mecanica_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Ejecutar migraciones:**
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
Disponible en: http://localhost:8000

### Terminal 2: Frontend
```bash
cd vistas
npm run dev
```
Disponible en: http://localhost:5173

## 🛠️ Herramientas Adicionales para macOS

### Visual Studio Code
```bash
# Con Homebrew Cask
brew install --cask visual-studio-code

# O descargar desde code.visualstudio.com
```

**Extensiones recomendadas:**
- PHP Extension Pack
- Laravel Extension Pack
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Thunder Client

### iTerm2 (Terminal mejorado)
```bash
brew install --cask iterm2
```

### MySQL Workbench
```bash
brew install --cask mysql-workbench
```

### Sequel Pro (Cliente MySQL nativo)
```bash
brew install --cask sequel-pro
```

### Postman (Para probar APIs)
```bash
brew install --cask postman
```

### Oh My Zsh (Shell mejorado)
```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

## 🐛 Solución de Problemas macOS

### Error: "php: command not found"
```bash
# Verificar PATH
echo $PATH

# Añadir Homebrew al PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Para Intel Mac
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
```

### Error: "composer: command not found"
```bash
# Verificar ubicación
which composer

# Reinstalar
brew reinstall composer

# O método manual
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### Error: "Permission denied" con npm
```bash
# Cambiar propietario de directorios npm
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# O usar nvm en lugar de npm global
```

### Error: MySQL "Access denied"
```bash
# Conectar sin password
mysql -u root

# Si no funciona, resetear password
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nueva_password';
FLUSH PRIVILEGES;
EXIT;
```

### Error: "Port already in use"
```bash
# Ver qué proceso usa el puerto
lsof -ti:8000

# Matar proceso
lsof -ti:8000 | xargs kill -9

# Para puerto 5173
lsof -ti:5173 | xargs kill -9
```

### Problemas con extensiones PHP
```bash
# Verificar extensiones instaladas
php -m

# Instalar extensiones faltantes
brew install php-mysql php-mbstring php-xml php-curl

# O reinstalar PHP
brew reinstall php@8.1
```

### Error: "Module not found" en Node.js
```bash
# Limpiar caché
npm cache clean --force

# Reinstalar node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Node
node --version  # Debe ser 18+
```

## 🍺 Comandos Útiles con Homebrew

```bash
# Listar paquetes instalados
brew list

# Actualizar Homebrew
brew update

# Actualizar paquetes
brew upgrade

# Buscar paquetes
brew search mysql

# Ver información de un paquete
brew info php

# Servicios (MySQL, PostgreSQL, etc.)
brew services list
brew services start mysql
brew services stop mysql
brew services restart mysql
```

## 📁 Estructura Recomendada

```
/Users/[TuUsuario]/
├── Developer/           # Carpeta para proyectos
│   └── app-mecanica/   # Tu proyecto aquí
├── .zshrc              # Configuración de shell
└── .gitconfig          # Configuración de Git
```

## 🔧 Configuración Adicional

### Git
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"
git config --global init.defaultBranch main
```

### SSH para GitHub (recomendado)
```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu.email@ejemplo.com"

# Añadir al agente SSH
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519

# Copiar clave pública
pbcopy < ~/.ssh/id_ed25519.pub
# Pegar en GitHub → Settings → SSH Keys
```

### Alias útiles en ~/.zshrc
```bash
# Editar ~/.zshrc
nano ~/.zshrc

# Añadir aliases
alias ll="ls -la"
alias la="ls -la"
alias ..="cd .."
alias ...="cd ../.."
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias art="php artisan"
alias serve="php artisan serve"
alias migrate="php artisan migrate"

# Recargar configuración
source ~/.zshrc
```

## 🎯 Optimizaciones para Apple Silicon (M1/M2)

```bash
# Verificar arquitectura
uname -m  # arm64 para Apple Silicon

# Homebrew usa /opt/homebrew en Apple Silicon
# vs /usr/local en Intel

# Para compatibilidad con software Intel:
arch -x86_64 brew install [paquete]

# Rosetta 2 (si es necesario)
softwareupdate --install-rosetta
```

## 💡 Tips para macOS

- **Usar iTerm2** en lugar de Terminal nativo
- **Spotlight (Cmd+Space)** para búsqueda rápida
- **Homebrew** para gestionar todas las dependencias
- **Oh My Zsh** para terminal más potente
- **SSH keys** para GitHub en lugar de HTTPS
- **Time Machine** para backups automáticos
- **Activar "Show hidden files"** (Cmd+Shift+.)

## 🌟 Próximos Pasos

1. **Configurar VS Code** con extensiones
2. **Configurar Git** y SSH para GitHub
3. **Crear alias** útiles en shell
4. **Familiarizarse** con la estructura del proyecto
5. **Crear primera rama** de desarrollo

¡Con esta configuración tendrás un entorno de desarrollo potente en macOS! 🚀
