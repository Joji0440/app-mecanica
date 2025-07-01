# Guía de Contribución

Gracias por tu interés en contribuir al proyecto Mecánica Asistida en Línea. Esta guía te ayudará a entender cómo participar efectivamente en el desarrollo.

## 🎯 Antes de Empezar

1. **Fork** el repositorio
2. **Clone** tu fork localmente
3. **Configura** el proyecto siguiendo el README.md
4. **Crea** una rama para tu contribución

## 🌿 Estructura de Ramas

- `main` - Rama principal (solo releases)
- `develop` - Rama de desarrollo principal
- `feature/nombre-feature` - Nuevas características
- `bugfix/nombre-bug` - Corrección de errores
- `hotfix/nombre-hotfix` - Correcciones urgentes

## 📝 Convención de Commits

Usa mensajes de commit descriptivos siguiendo el formato:

```
tipo(alcance): descripción breve

Descripción más detallada si es necesaria.

- Cambio específico 1
- Cambio específico 2
```

### Tipos de Commit
- `feat`: Nueva característica
- `fix`: Corrección de error
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan funcionalidad)
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos
```bash
feat(auth): implementar login con JWT
fix(api): corregir validación de email en registro
docs(readme): actualizar instrucciones de instalación
style(frontend): aplicar formato consistent en componentes
```

## 🔄 Flujo de Trabajo

### Para Nuevas Características

1. **Crear rama desde develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-descriptivo
   ```

2. **Desarrollar la funcionalidad**
   - Escribe código limpio y documentado
   - Añade tests si es necesario
   - Mantén commits pequeños y específicos

3. **Verificar tu código**
   ```bash
   # Backend
   cd Mecanica
   php artisan test
   composer run-script cs-check
   
   # Frontend
   cd vistas
   npm run lint
   npm run type-check
   npm run test
   ```

4. **Crear Pull Request**
   - Título descriptivo
   - Descripción clara de los cambios
   - Screenshots si hay cambios visuales
   - Referencias a issues relacionados

### Para Corrección de Errores

1. **Crear rama desde develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b bugfix/descripcion-error
   ```

2. **Seguir el mismo proceso** que para características

## 🧪 Testing

### Backend (Laravel)
```bash
cd Mecanica
php artisan test
```

### Frontend (React)
```bash
cd vistas
npm run test
```

## 📋 Code Review

Todos los PRs deben pasar por code review:

### ✅ Checklist para Reviewers
- [ ] El código sigue las convenciones del proyecto
- [ ] Los tests pasan
- [ ] La funcionalidad funciona según lo esperado
- [ ] El código es legible y está documentado
- [ ] No hay problemas de seguridad
- [ ] Los cambios no rompen funcionalidad existente

### ✅ Checklist para Contributors
- [ ] He probado mi código localmente
- [ ] He añadido tests para nuevas funcionalidades
- [ ] He actualizado la documentación si es necesario
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He hecho squash de commits innecesarios

## 🎨 Estándares de Código

### Backend (Laravel/PHP)
- Seguir PSR-12
- Usar type hints
- Documentar métodos públicos
- Usar nombres descriptivos para variables y métodos

### Frontend (React/TypeScript)
- Usar TypeScript estricto
- Componentes funcionales con hooks
- Nombres de componentes en PascalCase
- Usar interfaces para props y estados

## 🐛 Reportar Errores

Al reportar un error, incluye:

1. **Descripción clara** del problema
2. **Pasos para reproducir** el error
3. **Comportamiento esperado** vs comportamiento actual
4. **Información del entorno** (OS, versiones, navegador)
5. **Screenshots o logs** si son relevantes

## 💡 Sugerir Mejoras

Para nuevas características:

1. **Crea un issue** describiendo la mejora
2. **Explica el caso de uso** y beneficios
3. **Considera el impacto** en el rendimiento
4. **Espera feedback** antes de empezar a desarrollar

## 🤝 Código de Conducta

- Sé respetuoso y profesional
- Acepta críticas constructivas
- Ayuda a otros desarrolladores
- Mantén un ambiente de trabajo positivo

## 📞 Contacto

Para dudas sobre contribuciones:
- Crea un issue con la etiqueta `question`
- Contacta a los maintainers del proyecto

¡Gracias por contribuir! 🎉
