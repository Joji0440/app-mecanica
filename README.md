# 🔧 Mecánica Asistida

> Sistema integral de gestión para talleres mecánicos con interfaz moderna y API robusta.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![PHP](https://img.shields.io/badge/PHP-8.2%2B-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Laravel](https://img.shields.io/badge/Laravel-12-red)

## 📋 Descripción

**Mecánica Asistida** es una aplicación web fullstack diseñada para optimizar la gestión de talleres mecánicos. Combina un backend API RESTful desarrollado en Laravel con un frontend moderno en React + TypeScript, ofreciendo una experiencia de usuario fluida y funcionalidades completas para la administración de servicios automotrices.

### ✨ Características Principales

- 🔐 **Autenticación Segura** - Laravel Sanctum + JWT
- 👥 **Gestión de Usuarios** - Sistema de roles y permisos
- 🎨 **Interfaz Moderna** - React + TypeScript + TailwindCSS
- 🌙 **Modo Oscuro/Claro** - Toggle de tema integrado
- 📱 **Responsive Design** - Optimizado para todos los dispositivos
- 🔒 **HTTPS** - Certificados SSL integrados
- ⚡ **Alta Performance** - Optimización de build y caching
- 🛠 **API RESTful** - Endpoints bien documentados

## 🏗 Arquitectura

```
┌─────────────────┐    HTTPS    ┌─────────────────┐    API    ┌─────────────────┐
│   React SPA     │ ◄─────────► │     Nginx       │ ◄───────► │   Laravel API   │
│  (Frontend)     │             │ (Reverse Proxy) │           │   (Backend)     │
└─────────────────┘             └─────────────────┘           └─────────┬───────┘
                                                                        │
                                                               ┌─────────▼───────┐
                                                               │   PostgreSQL    │
                                                               │  (Base de Datos)│
                                                               └─────────────────┘
```

## 🚀 Stack Tecnológico

### Backend
- **Framework**: Laravel 12
- **Lenguaje**: PHP 8.2+
- **Base de Datos**: PostgreSQL 13+
- **Autenticación**: Laravel Sanctum
- **Autorización**: Spatie Laravel Permission
- **Servidor**: Nginx + PHP-FPM

### Frontend
- **Framework**: React 18
- **Lenguaje**: TypeScript 5
- **Build Tool**: Vite 5
- **Estilos**: TailwindCSS 3
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

### DevOps
- **Servidor Web**: Nginx
- **SSL/TLS**: Certificados auto-firmados
- **SO**: Ubuntu Server 20.04+
- **Proceso Manager**: SystemD

## 📦 Instalación Rápida

### Prerrequisitos

- Ubuntu Server 20.04+
- Docker (opcional)
- Git

### Opción 1: Instalación Automática

```bash
# Clonar repositorio
git clone https://github.com/Joji0440/app-mecanica.git
cd app-mecanica

# Ejecutar script de instalación
chmod +x install.sh
./install.sh
```

### Opción 2: Instalación Manual

Ver la [Guía de Instalación Completa](docs/installation.md) para instrucciones detalladas.

### Opción 3: Deploy en Producción

Ver la [Guía de Deploy](docs/deployment.md) para deployment en servidor.

## 🔧 Configuración

### Variables de Entorno

**Backend (.env):**
```env
APP_NAME="Mecánica Asistida"
APP_ENV=production
DB_CONNECTION=pgsql
DB_DATABASE=mecanica_production
SANCTUM_STATEFUL_DOMAINS=tu-dominio.com
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://tu-dominio.com/api
VITE_APP_URL=https://tu-dominio.com
```

## 📚 Documentación

| Guía | Descripción |
|------|-------------|
| [📖 Instalación](docs/installation.md) | Configuración paso a paso para desarrollo |
| [🚀 Deploy](docs/deployment.md) | Guía completa de deployment en producción |
| [🌐 Cambio de Red](docs/network-change.md) | Migración entre redes/IPs |
| [🏗 Arquitectura](docs/architecture.md) | Diseño técnico y componentes |
| [📝 Uso](docs/usage.md) | Manual de usuario |
| [🤝 Contribución](docs/contribution.md) | Guía para desarrolladores |

## 🎯 Uso Rápido

### 1. Acceder a la Aplicación

```
https://tu-ip-o-dominio
```

### 2. Credenciales por Defecto

```
Email: admin@mecanica.com
Password: admin123
```

### 3. Funcionalidades Principales

- **Dashboard**: Vista general del sistema
- **Usuarios**: Gestión completa de usuarios y roles
- **Configuración**: Personalización del sistema
- **Reportes**: Análisis y estadísticas

## 🛠 Desarrollo

### Configurar Entorno Local

```bash
# Backend
cd Mecanica
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Frontend
cd ../vistas
npm install
npm run dev
```

### Comandos Útiles

```bash
# Desarrollo del frontend
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build

# Backend Laravel
php artisan serve    # Servidor de desarrollo
php artisan migrate  # Ejecutar migraciones
php artisan test     # Ejecutar tests
```

### Testing

```bash
# Backend
php artisan test

# Frontend
npm test
```

## 📊 Estado del Proyecto

### Funcionalidades Completadas ✅

- [x] Sistema de autenticación completo
- [x] Gestión de usuarios y roles
- [x] Interfaz responsive con tema claro/oscuro
- [x] API RESTful funcional
- [x] Deploy automatizado con HTTPS
- [x] Documentación completa

### En Desarrollo 🚧

- [ ] Gestión de órdenes de trabajo
- [ ] Sistema de inventario
- [ ] Reportes avanzados
- [ ] Notificaciones en tiempo real

### Próximas Características 🔮

- [ ] App móvil
- [ ] Integración con sistemas de pago
- [ ] API pública
- [ ] Dashboard de analytics

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Ver [Guía de Contribución](docs/contribution.md).

### Proceso de Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Jorge** - [@Joji0440](https://github.com/Joji0440)

## 🙏 Agradecimientos

- Laravel Community
- React Team
- TailwindCSS
- Todas las librerías open source utilizadas

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/Joji0440/app-mecanica/issues)
- **Documentación**: [docs/](docs/)
- **Email**: soporte@mecanica.com

## 🔗 Enlaces Útiles

- [Demo en Vivo](https://demo.mecanica.com) (próximamente)
- [Documentación API](docs/api.md) (próximamente)
- [Roadmap](https://github.com/Joji0440/app-mecanica/projects) (próximamente)

---

<div align="center">

**🔧 Hecho con ❤️ para la comunidad automotriz**

[⬆ Volver arriba](#-mecánica-asistida)

</div>