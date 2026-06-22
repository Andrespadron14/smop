const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, saveDb, markDirty } = require('../database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const r = await db.exec("SELECT id, name, email, role, cargo, created_at FROM users ORDER BY created_at DESC");
    if (!r.length) return res.json([]);
    const cols = r[0].columns;
    res.json(r[0].values.map(row => {
      const obj = {};
      cols.forEach((c, i) => { obj[c] = row[i]; });
      return obj;
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, password, role, cargo } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const result = await db.exec("INSERT INTO users (name, email, password, role, cargo) VALUES ($1, $2, $3, $4, $5) RETURNING id", [name, email, hash, role, cargo || '']);
    saveDb(); markDirty();
    res.json({ success: true, id: result[0].values[0][0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, role, cargo, password } = req.body;
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      await db.run("UPDATE users SET name=$1, email=$2, role=$3, cargo=$4, password=$5 WHERE id=$6", [name, email, role, cargo || '', hash, req.params.id]);
    } else {
      await db.run("UPDATE users SET name=$1, email=$2, role=$3, cargo=$4 WHERE id=$5", [name, email, role, cargo || '', req.params.id]);
    }
    saveDb(); markDirty();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    await db.run("DELETE FROM project_comments WHERE user_id = $1", [req.params.id]);
    await db.run("DELETE FROM project_photos WHERE user_id = $1", [req.params.id]);
    await db.run("DELETE FROM project_updates WHERE user_id = $1", [req.params.id]);
    await db.run("DELETE FROM project_responsibles WHERE user_id = $1", [req.params.id]);
    await db.run("DELETE FROM contractors WHERE user_id = $1", [req.params.id]);
    await db.run("DELETE FROM users WHERE id = $1", [req.params.id]);
    saveDb(); markDirty();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/contractors', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const r = await db.exec("SELECT c.*, u.name as user_name, u.email as user_email FROM contractors c JOIN users u ON c.user_id = u.id ORDER BY c.company_name");
    if (!r.length) return res.json([]);
    const cols = r[0].columns;
    res.json(r[0].values.map(row => {
      const obj = {};
      cols.forEach((c, i) => { obj[c] = row[i]; });
      return obj;
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/contractors', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const { user_id, company_name, rif, phone, address, contact_name, contact_email } = req.body;
    await db.run("INSERT INTO contractors (user_id, company_name, rif, phone, address, contact_name, contact_email) VALUES ($1, $2, $3, $4, $5, $6, $7)", [user_id, company_name, rif, phone || '', address || '', contact_name || '', contact_email || '']);
    saveDb(); markDirty();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

