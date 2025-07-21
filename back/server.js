require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs').promises;
const path = require('path');

const app = express();
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas existentes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));

// Nueva ruta para componentes de hardware (versión estática)
app.get('/api/components', async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, 'data', 'componentes.json'),
      'utf-8'
    );
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error al leer componentes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cargar componentes' 
    });
  }
});

// Ruta para forzar actualización manual (opcional)
app.post('/api/components/update', async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }

  try {
    const { scrapeComponentes } = require('./services/componentes');
    const data = await scrapeComponentes();
    await fs.writeFile(
      path.join(__dirname, 'data', 'componentes.json'),
      JSON.stringify(data, null, 2)
    );
    res.json({ success: true, message: 'Componentes actualizados' });
  } catch (error) {
    console.error('Error al actualizar componentes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar componentes' 
    });
  }
});

// Resto de tu configuración...
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: ['users', 'games', 'components'],
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

// Manejo de errores...
// ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});