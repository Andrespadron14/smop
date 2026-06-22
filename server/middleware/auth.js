const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'smop-municipio-plaza-secret-key-2024';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autorizado' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  next();
}

function contractorOnly(req, res, next) {
  if (req.user.role !== 'contractor') return res.status(403).json({ error: 'Acceso denegado' });
  next();
}

module.exports = { auth, adminOnly, contractorOnly, SECRET };
