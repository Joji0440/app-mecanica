<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Mecánica Asistida en Línea - Frontend React

Este es un proyecto React + TypeScript + Vite para el frontend de una aplicación de mecánica asistida en línea.

## Contexto del Proyecto

- **Backend**: Laravel API en `http://localhost:8000/api`
- **Frontend**: React con TypeScript, Tailwind CSS, React Router
- **Autenticación**: JWT tokens con Laravel Sanctum
- **Comunicación**: Axios para llamadas HTTP

## Instrucciones para Copilot

### Estructura del Proyecto
- Usar TypeScript para todos los componentes
- Implementar autenticación basada en tokens
- Usar Tailwind CSS para todos los estilos
- Seguir patrones de React funcional con hooks
- Implementar manejo de estado con Context API

### API Integration
- Base URL: `http://localhost:8000/api`
- Endpoints principales:
  - `POST /login` - Autenticación
  - `POST /register` - Registro
  - `GET /user` - Usuario actual
  - `POST /logout` - Cerrar sesión
  - `GET /health` - Estado del API

### Estilo y UI
- Usar Tailwind CSS para todos los estilos
- Crear una interfaz moderna y responsive
- Usar componentes reutilizables
- Implementar navegación intuitiva

### Buenas Prácticas
- Validar todos los formularios
- Manejar estados de carga y errores
- Implementar feedback visual para el usuario
- Usar TypeScript interfaces para tipado
- Crear hooks personalizados para lógica reutilizable
