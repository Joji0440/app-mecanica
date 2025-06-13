<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
</head>
<body>
    <h1>Dashboard</h1>
    <p>Estadísticas generales de la aplicación:</p>
    <ul>
        <li>Total de usuarios registrados: {{ $totalUsers }}</li>
        <li>Administradores: {{ $admins }}</li>
        <li>Moderadores: {{ $moderators }}</li>
        <li>Usuarios: {{ $users }}</li>
    </ul>
</body>
</html>
