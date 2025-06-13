<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Usuario</title>
</head>
<body>
    <h1>Editar Usuario</h1>

    @if(session('success'))
        <div style="background-color: #28A745; color: white; padding: 10px; margin-bottom: 20px;">
            {{ session('success') }}
        </div>
    @endif

    @if($errors->any())
        <div style="background-color: #DC3545; color: white; padding: 10px; margin-bottom: 20px;">
            @foreach($errors->all() as $error)
                <p>{{ $error }}</p>
            @endforeach
        </div>
    @endif

    <form action="{{ route('admin.users.update', $user->id) }}" method="POST">
        @csrf
        @method('PUT')
        <div>
            <label for="name">Nombre:</label>
            <input type="text" id="name" name="name" value="{{ $user->name }}" required>
        </div>
        <div>
            <label for="email">Correo Electrónico:</label>
            <input type="email" id="email" name="email" value="{{ $user->email }}" required>
        </div>
        <div>
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password">
        </div>
        @if(auth()->user()->hasRole('moderator'))
            <div class="form-group">
                <label for="role">Rol</label>
                <select name="role" id="role" class="form-control">
                    <option value="user" {{ $user->hasRole('user') ? 'selected' : '' }}>Usuario</option>
                    <option value="admin" {{ $user->hasRole('admin') ? 'selected' : '' }}>Administrador</option>
                    <option value="moderator" {{ $user->hasRole('moderator') ? 'selected' : '' }}>Moderador</option>
                </select>
            </div>
        @endif
        <button type="submit" style="background-color: #007BFF; color: white; border: none; padding: 5px 10px; cursor: pointer;">
            Guardar Cambios
        </button>
    </form>
</body>
</html>