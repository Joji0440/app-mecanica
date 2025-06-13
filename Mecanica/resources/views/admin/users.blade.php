<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrar Usuarios</title>
</head>
<body>
    <h1>Administrar Usuarios</h1>
    <p>Bienvenido al panel de administración.</p>

    @if(session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="GET" action="{{ route('admin.users') }}">
        <input type="text" name="search" placeholder="Buscar usuarios..." value="{{ request('search') }}">
        <button type="submit">Buscar</button>
    </form>

    <table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo Electrónico</th>
                <th>Rol</th> <!-- Nueva columna para mostrar el rol -->
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach($users as $user): ?>
                <tr>
                    <td>{{ $user->id }}</td>
                    <td>{{ $user->name }}</td>
                    <td>{{ $user->email }}</td>
                    <td>{{ $user->roles->pluck('name')->join(', ') }}</td> <!-- Mostrar roles -->
                    <td>
                        <a href="{{ route('admin.users.edit', $user->id) }}" style="background-color: #007BFF; color: white; border: none; padding: 5px 10px; text-decoration: none; cursor: pointer;">
                            Editar
                        </a>
                        <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" style="display: inline;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" style="background-color: #DC3545; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                                Eliminar
                            </button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div>
        {{ $users->links() }} <!-- Muestra los enlaces de paginación -->
    </div>
</body>
</html>