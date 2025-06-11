<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrar Usuarios</title>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>
<body>
    <header style="background-color: #333; color: #fff; padding: 20px; text-align: center;">
        <h1>Administrar Usuarios</h1>
    </header>

    <main style="padding: 20px; max-width: 800px; margin: auto;">
        @if(session('success'))
            <div style="background-color: #28A745; color: #fff; padding: 10px; margin-bottom: 20px;">
                {{ session('success') }}
            </div>
        @endif

        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #333; color: #fff;">
                    <th style="padding: 10px;">Nombre</th>
                    <th style="padding: 10px;">Correo Electrónico</th>
                    <th style="padding: 10px;">Acciones</th>
                </tr>
            </thead>
            <tbody>
                @foreach($users as $user)
                    <tr style="background-color: #f4f4f4;">
                        <td style="padding: 10px;">{{ $user->name }}</td>
                        <td style="padding: 10px;">{{ $user->email }}</td>
                        <td style="padding: 10px;">
                            <form action="{{ route('admin.users.update', $user) }}" method="POST" style="display: inline;">
                                @csrf
                                @method('PUT')
                                <button type="submit" style="background-color: #007BFF; color: #fff; padding: 5px 10px; border: none; border-radius: 5px;">Modificar</button>
                            </form>
                            <form action="{{ route('admin.users.destroy', $user) }}" method="POST" style="display: inline;">
                                @csrf
                                @method('DELETE')
                                <button type="submit" style="background-color: #FF0000; color: #fff; padding: 5px 10px; border: none; border-radius: 5px;">Eliminar</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </main>

    <footer style="background-color: #333; color: #fff; padding: 10px; text-align: center;">
        <p>&copy; 2025 Mecánica Asistida en Línea. Todos los derechos reservados.</p>
    </footer>
</body>
</html>