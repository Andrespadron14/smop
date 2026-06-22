const express = require('express');
const { getDb } = require('../database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/resumen', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const total = await db.exec("SELECT COUNT(*) as total FROM projects");
    const byStatus = await db.exec("SELECT status, COUNT(*) as count FROM projects GROUP BY status");
    const totalBudget = await db.exec("SELECT SUM(budget) as total FROM projects");
    const projects = await db.exec("SELECT id, COALESCE((SELECT MAX(percentage) FROM project_updates WHERE project_id = p.id), 0) as progress FROM projects p");
    let avgProgress = 0;
    if (projects.length && projects[0].values.length) {
      const sum = projects[0].values.reduce((a, row) => a + row[1], 0);
      avgProgress = Math.round(sum / projects[0].values.length);
    }
    const statusMap = { pending: 0, in_progress: 0, completed: 0, paused: 0 };
    if (byStatus.length && byStatus[0].values.length) {
      byStatus[0].values.forEach(row => {
        statusMap[row[0]] = row[1];
      });
    }
    res.json({
      total_projects: total[0].values[0][0],
      total_budget: totalBudget[0].values[0][0] || 0,
      avg_progress: avgProgress,
      by_status: statusMap
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/proyectos', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const { tipo } = req.query;
    let sql = "SELECT p.*, c.company_name as contractor_name, COALESCE((SELECT MAX(percentage) FROM project_updates WHERE project_id = p.id), 0) as progress FROM projects p LEFT JOIN contractors c ON p.contractor_id = c.id";
    const params = [];
    if (tipo && tipo !== 'todos') {
      sql += " WHERE p.status = $1";
      params.push(tipo);
    }
    sql += " ORDER BY p.created_at DESC";
    const r = await db.exec(sql, params.length ? params : undefined);
    if (!r.length) return res.json([]);
    const cols = r[0].columns;
    res.json(r[0].values.map(row => {
      const obj = {};
      cols.forEach((c, i) => { obj[c] = row[i]; });
      return obj;
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/reporte-completo', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const projects = await db.exec("SELECT p.*, c.company_name as contractor_name, COALESCE((SELECT MAX(percentage) FROM project_updates WHERE project_id = p.id), 0) as progress FROM projects p LEFT JOIN contractors c ON p.contractor_id = c.id ORDER BY p.created_at DESC");
    if (!projects.length) return res.json([]);
    const pcols = projects[0].columns;
    const data = await Promise.all(projects[0].values.map(async (row) => {
      const obj = {};
      pcols.forEach((c, i) => { obj[c] = row[i]; });
      const pid = obj.id;
      const updates = await db.exec("SELECT title, percentage, created_at FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC", [pid]);
      obj.updates_count = updates.length && updates[0].values.length ? updates[0].values.length : 0;
      obj.last_update = updates.length && updates[0].values.length ? updates[0].values[0][2] : 'N/A';
      obj.last_progress = updates.length && updates[0].values.length ? updates[0].values[0][1] : 0;
      const photos = await db.exec("SELECT COUNT(*) as count FROM project_photos WHERE project_id = $1", [pid]);
      obj.photos_count = photos[0].values[0][0];
      return obj;
    }));
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

