const express = require('express');
const { getDb, saveDb, markDirty } = require('../database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const r = await db.exec("SELECT p.*, c.company_name as contractor_name, COALESCE((SELECT MAX(percentage) FROM project_updates WHERE project_id = p.id), 0) as progress FROM projects p LEFT JOIN contractors c ON p.contractor_id = c.id ORDER BY p.created_at DESC");
    if (!r.length) return res.json([]);
    const cols = r[0].columns;
    let projects = r[0].values.map(row => {
      const obj = {};
      cols.forEach((c, i) => { obj[c] = row[i]; });
      return obj;
    });
    if (req.user.role === 'contractor') {
      const ctr = await db.exec("SELECT id FROM contractors WHERE user_id = $1", [req.user.id]);
      if (ctr.length && ctr[0].values.length) {
        const cid = ctr[0].values[0][0];
        return res.json(projects.filter(p => p.contractor_id === cid));
      }
      return res.json([]);
    }
    res.json(projects);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const r = await db.exec("SELECT p.*, c.company_name as contractor_name FROM projects p LEFT JOIN contractors c ON p.contractor_id = c.id WHERE p.id = $1", [req.params.id]);
    if (!r.length || !r[0].values.length) return res.status(404).json({ error: 'Proyecto no encontrado' });
    const cols = r[0].columns;
    const project = {};
    cols.forEach((c, i) => { project[c] = r[0].values[0][i]; });
    const resps = await db.exec("SELECT u.id, u.name, u.cargo as user_cargo, pr.cargo FROM project_responsibles pr JOIN users u ON pr.user_id = u.id WHERE pr.project_id = $1", [req.params.id]);
    project.responsibles = [];
    if (resps.length && resps[0].values.length) {
      const rcols = resps[0].columns;
      project.responsibles = resps[0].values.map(row => {
        const obj = {};
        rcols.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
      });
    }
    const updates = await db.exec("SELECT pu.*, u.name as user_name, u.role as user_role FROM project_updates pu JOIN users u ON pu.user_id = u.id WHERE pu.project_id = $1 ORDER BY pu.created_at DESC", [req.params.id]);
    project.updates = [];
    if (updates.length && updates[0].values.length) {
      const ucols = updates[0].columns;
      project.updates = updates[0].values.map(row => {
        const obj = {};
        ucols.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
      });
    }
    const photos = await db.exec("SELECT pp.*, u.name as user_name FROM project_photos pp JOIN users u ON pp.user_id = u.id WHERE pp.project_id = $1 ORDER BY pp.created_at DESC", [req.params.id]);
    project.photos = [];
    if (photos.length && photos[0].values.length) {
      const pcols = photos[0].columns;
      project.photos = photos[0].values.map(row => {
        const obj = {};
        pcols.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
      });
    }
    const comments = await db.exec("SELECT pc.*, u.name as user_name, u.role as user_role FROM project_comments pc JOIN users u ON pc.user_id = u.id WHERE pc.project_id = $1 ORDER BY pc.created_at DESC", [req.params.id]);
    project.comments = [];
    if (comments.length && comments[0].values.length) {
      const ccols = comments[0].columns;
      project.comments = comments[0].values.map(row => {
        const obj = {};
        ccols.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
      });
    }
    res.json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const { name, description, location, budget, start_date, end_date, status, contractor_id } = req.body;
    const result = await db.exec("INSERT INTO projects (name, description, location, budget, start_date, end_date, status, contractor_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id", [name, description || '', location || '', budget || 0, start_date || '', end_date || '', status || 'pending', contractor_id || null]);
    saveDb(); markDirty();
    res.json({ success: true, id: result[0].values[0][0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    const { name, description, location, budget, start_date, end_date, status, contractor_id } = req.body;
    await db.run("UPDATE projects SET name=$1, description=$2, location=$3, budget=$4, start_date=$5, end_date=$6, status=$7, contractor_id=$8 WHERE id=$9", [name, description, location, budget, start_date, end_date, status, contractor_id, req.params.id]);
    saveDb(); markDirty();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    await db.run("DELETE FROM project_comments WHERE project_id = $1", [req.params.id]);
    await db.run("DELETE FROM project_photos WHERE project_id = $1", [req.params.id]);
    await db.run("DELETE FROM project_updates WHERE project_id = $1", [req.params.id]);
    await db.run("DELETE FROM project_responsibles WHERE project_id = $1", [req.params.id]);
    await db.run("DELETE FROM projects WHERE id = $1", [req.params.id]);
    saveDb(); markDirty();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    const db = await getDb();
    await db.run("UPDATE projects SET status = $1 WHERE id = $2", [req.body.status, req.params.id]);
    saveDb(); markDirty();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const db = await getDb();
    await db.run("INSERT INTO project_comments (project_id, user_id, comment) VALUES ($1, $2, $3)", [req.params.id, req.user.id, req.body.comment]);
    saveDb(); markDirty();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/responsibles', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    await db.run("INSERT INTO project_responsibles (project_id, user_id, cargo) VALUES ($1, $2, $3)", [req.params.id, req.body.user_id, req.body.cargo]);
    saveDb(); markDirty();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

