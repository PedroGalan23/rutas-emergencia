require('dotenv').config();

const express   = require('express');
const path      = require('path');
const cron      = require('node-cron');
const syncAulas = require('./syncAulas');

const app = express();

// 1) Sirve build de React
app.use(express.static(path.join(__dirname, 'build')));

// 2) Sirve JSON dinámico en /data
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

// 3) Resto de rutas → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 4) Cron diario 03:00 (Europe/Madrid)
cron.schedule('0 3 * * *', () => {
  console.log('🔄 Ejecutando syncAulas()');
  syncAulas();
}, {
  timezone: 'Europe/Madrid'
});

// 5) Arranca servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
