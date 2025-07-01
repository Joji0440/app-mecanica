# 🚀 Guía Rápida para el Equipo

## Configuración Inicial (Solo la primera vez)

### 1. Clonar el Repositorio
```bash
git clone [URL-DEL-REPOSITORIO]
cd app-mecanica
```

### 2. Configuración Automática

**Para Windows:**
```powershell
.\setup.ps1
```

**Para Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configuración Manual (Alternativa)

**Backend:**
```bash
cd Mecanica
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

**Frontend:**
```bash
cd vistas
npm install
cp .env.example .env
```

## Desarrollo Diario

### Iniciar Servidores de Desarrollo

**Terminal 1 - Backend:**
```bash
cd Mecanica
php artisan serve
```
→ Backend disponible en: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd vistas
npm run dev
```
→ Frontend disponible en: http://localhost:5173

### Comandos Útiles

**Backend (Laravel):**
```bash
php artisan migrate              # Ejecutar migraciones
php artisan db:seed             # Poblar base de datos
php artisan make:controller X   # Crear controlador
php artisan make:model X        # Crear modelo
php artisan route:list          # Ver todas las rutas
php artisan test               # Ejecutar tests
```

**Frontend (React):**
```bash
npm run dev                    # Servidor de desarrollo
npm run build                 # Build para producción
npm run lint                  # Linter
npm run lint:fix             # Corregir errores de lint
npm run type-check           # Verificar tipos TypeScript
```

## Flujo de Trabajo Git

### 1. Antes de Empezar
```bash
git checkout develop
git pull origin develop
```

### 2. Crear Nueva Rama
```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b bugfix/descripcion-error
```

### 3. Desarrollo
- Hacer cambios
- Probar localmente
- Hacer commits frecuentes

### 4. Commits
```bash
git add .
git commit -m "tipo(alcance): descripción

- Detalle 1
- Detalle 2"
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de error
- `docs`: Documentación
- `style`: Formateo de código
- `refactor`: Refactorización
- `test`: Tests

### 5. Push y Pull Request
```bash
git push origin feature/nombre-descriptivo
```
Luego crear Pull Request en GitHub.

## Estructura del Proyecto

```
app-mecanica/
├── Mecanica/              # Backend Laravel
│   ├── app/              # Lógica de aplicación
│   ├── routes/api.php    # Rutas de API
│   ├── database/         # Migraciones y seeders
│   └── config/           # Configuraciones
├── vistas/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas
│   │   ├── context/      # Estado global
│   │   ├── services/     # Servicios de API
│   │   └── types/        # Tipos TypeScript
│   └── public/
└── .github/              # Templates y workflows
```

## APIs Disponibles

**Base URL:** `http://localhost:8000/api`

- `POST /login` - Iniciar sesión
- `POST /register` - Registrarse
- `GET /user` - Usuario actual (requiere auth)
- `POST /logout` - Cerrar sesión (requiere auth)
- `GET /health` - Estado del servidor

## Troubleshooting

### Backend no inicia
1. Verificar que MySQL/PostgreSQL esté corriendo
2. Verificar configuración en `.env`
3. Ejecutar `composer install`
4. Ejecutar `php artisan key:generate`

### Frontend no inicia
1. Verificar versión de Node.js (≥18)
2. Ejecutar `npm install`
3. Verificar que el backend esté corriendo

### Error de CORS
1. Verificar que ambos servidores estén corriendo
2. Verificar configuración en `config/cors.php`

### Error de autenticación
1. Verificar que el token esté siendo enviado
2. Verificar que el backend esté generando tokens correctamente

## Contacto

Para dudas:
1. Crear issue en GitHub
2. Preguntar en el chat del equipo
3. Revisar la documentación en `README.md` y `CONTRIBUTING.md`
