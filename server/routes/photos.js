const express = require('express');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { getDb, markDirty } = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const useSupabase = !!(supabaseUrl && supabaseKey);
const supabase = useSupabase ? createClient(supabaseUrl, supabaseKey) : null;

router.post('/:projectId', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subio ninguna foto' });
    const db = await getDb();
    const check = await db.exec("SELECT id FROM projects WHERE id = $1", [req.params.projectId]);
    if (!check.length || !check[0].values.length) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (req.user.role === 'contractor') {
      const ctr = await db.exec("SELECT id FROM contractors WHERE user_id = $1", [req.user.id]);
      if (ctr.length && ctr[0].values.length) {
        const cid = ctr[0].values[0][0];
        const proj = await db.exec("SELECT contractor_id FROM projects WHERE id = $1", [req.params.projectId]);
        if (proj.length && proj[0].values.length && proj[0].values[0][0] !== cid) {
          return res.status(403).json({ error: 'No puedes subir fotos a este proyecto' });
        }
      }
    }
    let filename = req.file.originalname;
    if (useSupabase && supabase) {
      const ext = path.extname(req.file.originalname);
      filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('smop-fotos')
        .upload(filename, req.file.buffer, { contentType: req.file.mimetype });
      if (uploadError) return res.status(500).json({ error: 'Error al subir foto a Supabase: ' + uploadError.message });
    } else {
      const ext = path.extname(req.file.originalname);
      filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const fs = require('fs');
      fs.writeFileSync(path.join(__dirname, '..', 'uploads', filename), req.file.buffer);
    }
    await db.run("INSERT INTO project_photos (project_id, user_id, caption, filename) VALUES ($1, $2, $3, $4)", [req.params.projectId, req.user.id, req.body.caption || '', filename]);
    markDirty();
    res.json({ success: true, filename });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
