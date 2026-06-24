const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('../database');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();
    const result = await db.exec("SELECT * FROM users WHERE email = $1", [email]);
    if (!result.length || !result[0].values.length) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const row = result[0].values[0];
    const cols = result[0].columns;
    const user = {};
    cols.forEach((c, i) => { user[c] = row[i]; });
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales invalidas' });
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, cargo: user.cargo },
      SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, cargo: user.cargo } });
  } catch (e) {
    console.log('LOGIN_ERROR:', JSON.stringify({ message: e.message, stack: e.stack?.split('\n')[0], code: e.code }));
    res.status(500).json({ error: e.message || 'Error interno', detail: e.code || '' });
  }
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autorizado' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], SECRET);
    const db = await getDb();
    const r = await db.exec("SELECT id, name, email, role, cargo FROM users WHERE id = $1", [decoded.id]);
    if (!r.length || !r[0].values.length) return res.status(401).json({ error: 'Usuario no encontrado' });
    const row = r[0].values[0];
    const cols = r[0].columns;
    const user = {};
    cols.forEach((c, i) => { user[c] = row[i]; });
    res.json(user);
  } catch (e) {
    res.status(401).json({ error: 'Token invalido' });
  }
});

module.exports = router;

