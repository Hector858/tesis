const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());

// Configura el puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos desde la carpeta "build" de tu aplicación React
app.use(express.static(path.join(__dirname, 'client/dist')));

// Ruta para servir la aplicación React
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './client', 'index.html'));
});

app.use(express.json());

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
