const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Manejar todas las rutas y devolver index.html (para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor SPA corriendo en http://localhost:${PORT}`);
  console.log('✅ Todas las rutas de React Router funcionarán correctamente');
});
