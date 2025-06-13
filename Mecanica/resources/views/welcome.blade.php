<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mecánica Asistida en Línea</title>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>
<body>
    <header style="background-color: #333; color: #fff; padding: 20px; text-align: center;">
        <h1>Mecánica Asistida en Línea</h1>
        <p>Tu solución para problemas mecánicos desde la comodidad de tu hogar.</p>
        @auth
            <p style="margin-top: 10px;">Bienvenido, {{ Auth::user()->name }}.</p>
            @if(Auth::user()->hasAnyRole(['admin', 'moderator']))
                <a href="{{ route('dashboard') }}" style="padding: 10px 20px; background-color: #28A745; color: #fff; text-decoration: none; border-radius: 5px; margin-right: 10px;">Dashboard</a>
                @if(Auth::user()->hasRole('admin'))
                    <a href="{{ route('admin.users') }}" style="padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Administrar Usuarios</a>
                @elseif(Auth::user()->hasRole('moderator'))
                    <a href="{{ route('manage.users') }}" style="padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Gestionar Roles</a>
                @endif
            @endif
            <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                @csrf
                <button type="submit" style="padding: 10px 20px; background-color: #FF0000; color: #fff; border: none; border-radius: 5px;">Cerrar Sesión</button>
            </form>
        @else
            <div style="margin-top: 20px;">
                <a href="{{ url('/register') }}" style="margin-right: 10px; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Registrarse</a>
                <a href="{{ url('/login') }}" style="padding: 10px 20px; background-color: #28A745; color: #fff; text-decoration: none; border-radius: 5px;">Iniciar Sesión</a>
            </div>
        @endauth
    </header>

    <main style="padding: 20px; text-align: center;">
        <h2>Bienvenido</h2>
        <p>Ofrecemos asistencia mecánica en línea para ayudarte con tus problemas de vehículos.</p>
        <p>Regístrate o inicia sesión para acceder a nuestros servicios.</p>
    </main>

    <footer style="background-color: #333; color: #fff; padding: 10px; text-align: center;">
        <p>&copy; 2025 Mecánica Asistida en Línea. Todos los derechos reservados.</p>
    </footer>
</body>
</html>