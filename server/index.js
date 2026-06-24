const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/updates', require('./routes/updates'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));

app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ mensaje: 'SMOP API corriendo. Frontend no disponible en este modo.' });
  }
});

async function start() {
  try {
    console.log('SMOP starting...');
    await initDb();
    const { seed } = require('./seed');
    await seed();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n  SMOP - Sistema de Monitoreo de Obras Publicas`);
      console.log(`  Alcaldia del Municipio Plaza`);
      console.log(`  Servidor corriendo en: http://0.0.0.0:${PORT}\n`);
    });
  } catch (e) {
    console.error('Error al iniciar:', e.message);
    console.log(e.stack);
    process.exit(1);
  }
}

start();
