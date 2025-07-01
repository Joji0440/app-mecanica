# Mecánica Asistida en Línea

Sistema completo de mecánica asistida con backend Laravel y frontend React.

## 🏗️ Arquitectura del Proyecto

```
app-mecanica/
├── Mecanica/          # Backend Laravel (API)
├── vistas/            # Frontend React + TypeScript
└── README.md          # Este archivo
```

## 🚀 Inicio Rápido

### 📖 Guías de Instalación por Sistema Operativo

**¿Primera vez configurando el proyecto?** Sigue la guía específica para tu sistema:

- 🪟 **Windows**: [Guía Completa Windows](docs/WINDOWS_SETUP.md)
- 🍎 **macOS**: [Guía Completa macOS](docs/MACOS_SETUP.md)  
- 🐧 **Linux**: [Guía Completa Linux](docs/LINUX_SETUP.md)
- 📋 **Instalación Detallada**: [Guía Completa](INSTALLATION_GUIDE.md)
- 🛠️ **Problemas?**: [Solución de Problemas](TROUBLESHOOTING.md)

### ⚡ Configuración Rápida

Si ya tienes todas las dependencias instaladas:

1. **Clonar el repositorio**
```bash
git clone [URL-DEL-REPOSITORIO]
cd app-mecanica
```

2. **Configuración automática**
```bash
# Windows
.\setup.ps1

# Linux/macOS  
chmod +x setup.sh && ./setup.sh
```

3. **Configuración manual**
```bash
# Backend
cd Mecanica
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed

# Frontend
cd ../vistas
npm install
cp .env.example .env
```

## 🔧 Desarrollo

### Backend (Laravel API)
- **Puerto**: `http://localhost:8000`
- **API Base**: `http://localhost:8000/api`
- **Documentación**: Ver `Mecanica/README.md`

### Frontend (React)
- **Puerto**: `http://localhost:5173`
- **Documentación**: Ver `vistas/README.md`

## 👥 Trabajo en Equipo

### Estructura de Ramas
- `main` - Rama principal (protegida)
- `develop` - Rama de desarrollo
- `feature/nombre-feature` - Nuevas características
- `hotfix/nombre-fix` - Correcciones urgentes

### Flujo de Trabajo
1. Crear rama desde `develop`
2. Desarrollar la funcionalidad
3. Hacer commit con mensajes descriptivos
4. Push y crear Pull Request
5. Code Review y merge

### Comandos Útiles

```bash
# Iniciar ambos servidores simultáneamente (desde raíz)
# Terminal 1 - Backend
cd Mecanica && php artisan serve

# Terminal 2 - Frontend  
cd vistas && npm run dev

# Build para producción
cd vistas && npm run build
```

## 📁 Estructura Detallada

### Backend (`/Mecanica`)
- `app/` - Lógica de la aplicación
- `routes/api.php` - Rutas de la API
- `database/` - Migraciones y seeders
- `config/` - Configuraciones

### Frontend (`/vistas`)
- `src/components/` - Componentes reutilizables
- `src/pages/` - Páginas de la aplicación
- `src/context/` - Context API (estado global)
- `src/services/` - Servicios de API
- `src/types/` - Tipos TypeScript

## 🌐 Variables de Entorno

### Backend (.env)
```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mecanica_db
DB_USERNAME=root
DB_PASSWORD=
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## 🔐 Autenticación

El sistema usa JWT tokens con Laravel Sanctum:
- Login: `POST /api/login`
- Register: `POST /api/register`
- Logout: `POST /api/logout`
- User: `GET /api/user`

## 📚 Documentación

- 📖 **[Guía de Instalación Completa](INSTALLATION_GUIDE.md)** - Instalación paso a paso
- 🚀 **[Inicio Rápido](QUICK_START.md)** - Para desarrolladores experimentados
- 🛠️ **[Solución de Problemas](TROUBLESHOOTING.md)** - Errores comunes y soluciones
- 🤝 **[Guía de Contribución](CONTRIBUTING.md)** - Cómo contribuir al proyecto

### Guías por Sistema Operativo
- 🪟 **[Windows Setup](docs/WINDOWS_SETUP.md)** - Configuración específica para Windows
- 🍎 **[macOS Setup](docs/MACOS_SETUP.md)** - Configuración específica para macOS  
- 🐧 **[Linux Setup](docs/LINUX_SETUP.md)** - Configuración específica para Linux

### Documentación de Componentes
- **Backend**: Ver `Mecanica/README.md` - API Laravel
- **Frontend**: Ver `vistas/README.md` - React App

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crear rama** de feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir Pull Request**

Ver **[Guía de Contribución](CONTRIBUTING.md)** para más detalles.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Contacto

Para dudas o sugerencias, crear un issue en el repositorio.
