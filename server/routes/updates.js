const express = require('express');
const { getDb, saveDb, markDirty } = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/:projectId', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { title, description, technical_advance, percentage } = req.body;
    const check = await db.exec("SELECT id FROM projects WHERE id = $1", [req.params.projectId]);
    if (!check.length || !check[0].values.length) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (req.user.role === 'contractor') {
      const ctr = await db.exec("SELECT id FROM contractors WHERE user_id = $1", [req.user.id]);
      if (ctr.length && ctr[0].values.length) {
        const cid = ctr[0].values[0][0];
        const proj = await db.exec("SELECT contractor_id FROM projects WHERE id = $1", [req.params.projectId]);
        if (proj.length && proj[0].values.length && proj[0].values[0][0] !== cid) {
          return res.status(403).json({ error: 'No puedes actualizar este proyecto' });
        }
      }
    }
    const insertResult = await db.exec("INSERT INTO project_updates (project_id, user_id, title, description, technical_advance, percentage) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [req.params.projectId, req.user.id, title, description || '', technical_advance || '', percentage || 0]);
    if (percentage && percentage > 0) {
      await db.run("UPDATE projects SET status = 'in_progress' WHERE id = $1 AND status = 'pending'", [req.params.projectId]);
    }
    if (percentage && percentage >= 100) {
      await db.run("UPDATE projects SET status = 'completed' WHERE id = $1", [req.params.projectId]);
    }
    saveDb(); markDirty();
    res.json({ success: true, id: insertResult[0].values[0][0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:projectId', auth, async (req, res) => {
  try {
    const db = await getDb();
    const r = await db.exec("SELECT pu.*, u.name as user_name FROM project_updates pu JOIN users u ON pu.user_id = u.id WHERE pu.project_id = $1 ORDER BY pu.created_at DESC", [req.params.projectId]);
    if (!r.length) return res.json([]);
    const cols = r[0].columns;
    res.json(r[0].values.map(row => {
      const obj = {};
      cols.forEach((c, i) => { obj[c] = row[i]; });
      return obj;
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

