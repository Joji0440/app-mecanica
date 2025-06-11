<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario</title>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>
<body>
    <header style="background-color: #333; color: #fff; padding: 20px; text-align: center;">
        <h1>Registro de Usuario</h1>
    </header>

    <main style="padding: 20px; max-width: 600px; margin: auto;">
        @if(session('success'))
            <div style="background-color: #28A745; color: #fff; padding: 10px; margin-bottom: 20px;">
                {{ session('success') }}
            </div>
        @endif

        <form action="{{ route('register') }}" method="POST">
            @csrf
            <div style="margin-bottom: 15px;">
                <label for="name">Nombre:</label>
                <input type="text" id="name" name="name" required style="width: 100%; padding: 10px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="email">Correo Electrónico:</label>
                <input type="email" id="email" name="email" required style="width: 100%; padding: 10px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="password">Contraseña:</label>
                <input type="password" id="password" name="password" required style="width: 100%; padding: 10px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="password_confirmation">Confirmar Contraseña:</label>
                <input type="password" id="password_confirmation" name="password_confirmation" required style="width: 100%; padding: 10px;">
            </div>
            <button type="submit" style="padding: 10px 20px; background-color: #007BFF; color: #fff; border: none; border-radius: 5px;">Registrarse</button>
        </form>
    </main>

    <footer style="background-color: #333; color: #fff; padding: 10px; text-align: center;">
        <p>&copy; 2025 Mecánica Asistida en Línea. Todos los derechos reservados.</p>
    </footer>
</body>
</html>