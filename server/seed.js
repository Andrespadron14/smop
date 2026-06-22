const bcrypt = require('bcryptjs');
const { getDb, markDirty } = require('./database');

async function seed() {
  const db = await getDb();
  const existing = await db.exec("SELECT COUNT(*) as c FROM users");
  if (existing[0].values[0][0] > 0) {
    console.log('Base de datos ya contiene datos. Omitiendo seed.');
    return;
  }
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  await db.run("INSERT INTO users (name, email, password, role, cargo) VALUES ($1, $2, $3, $4, $5)", ['Dr. Jose Martinez', 'admin@municipioplaza.gob.ve', hash('admin123'), 'admin', 'Alcalde del Municipio Plaza']);
  await db.run("INSERT INTO users (name, email, password, role, cargo) VALUES ($1, $2, $3, $4, $5)", ['Ing. Maria Rodriguez', 'obras@municipioplaza.gob.ve', hash('admin123'), 'admin', 'Directora de Obras Publicas']);
  await db.run("INSERT INTO users (name, email, password, role, cargo) VALUES ($1, $2, $3, $4, $5)", ['Carlos Mendoza', 'contratista1@email.com', hash('contrato123'), 'contractor', 'Representante Legal']);
  await db.run("INSERT INTO users (name, email, password, role, cargo) VALUES ($1, $2, $3, $4, $5)", ['Ana Garcia', 'contratista2@email.com', hash('contrato123'), 'contractor', 'Gerente de Proyectos']);
  await db.run("INSERT INTO users (name, email, password, role, cargo) VALUES ($1, $2, $3, $4, $5)", ['Pedro Hernandez', 'visitante@email.com', hash('visitante123'), 'viewer', 'Ciudadano']);
  if (!!process.env.DATABASE_URL) {
    await db.run("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
  }
  // Contractors
  await db.run("INSERT INTO contractors (user_id, company_name, rif, phone, address, contact_name, contact_email) VALUES ($1, $2, $3, $4, $5, $6, $7)", [3, 'Constructora Bolivar C.A.', 'J-12345678-9', '0212-5550101', 'Av. Libertador, Caracas', 'Carlos Mendoza', 'contratista1@email.com']);
  await db.run("INSERT INTO contractors (user_id, company_name, rif, phone, address, contact_name, contact_email) VALUES ($1, $2, $3, $4, $5, $6, $7)", [4, 'Vialca C.A.', 'J-87654321-0', '0212-5550202', 'Urb. Industrial, Los Teques', 'Ana Garcia', 'contratista2@email.com']);
  if (!!process.env.DATABASE_URL) { await db.run("SELECT setval('contractors_id_seq', (SELECT MAX(id) FROM contractors))"); }
  // Projects
  await db.run("INSERT INTO projects (name, description, location, budget, start_date, end_date, status, contractor_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", ['Pavimentacion Av. Bolivar', 'Pavimentacion y rehabilitacion de 5 km de la Avenida Bolivar.', 'Av. Bolivar, Municipio Plaza', 2500000.00, '2026-01-15', '2026-07-15', 'in_progress', 1]);
  await db.run("INSERT INTO projects (name, description, location, budget, start_date, end_date, status, contractor_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", ['Reparacion Sistema de Agua Potable', 'Reparacion integral del sistema de distribucion de agua potable.', 'Sector Centro, Municipio Plaza', 1800000.00, '2026-02-01', '2026-08-30', 'in_progress', 2]);
  await db.run("INSERT INTO projects (name, description, location, budget, start_date, end_date, status, contractor_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", ['Construccion Parque Central', 'Construccion de parque recreativo con areas verdes.', 'Zona Central, Municipio Plaza', 3200000.00, '2026-03-01', '2026-12-15', 'pending', 1]);
  await db.run("INSERT INTO projects (name, description, location, budget, start_date, end_date, status, contractor_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", ['Iluminacion Vial Sector Norte', 'Instalacion de 200 luminarias LED.', 'Sector Norte, Municipio Plaza', 950000.00, '2026-04-01', '2026-06-30', 'pending', 2]);
  if (!!process.env.DATABASE_URL) { await db.run("SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects))"); }
  // Responsibles
  await db.run("INSERT INTO project_responsibles (project_id, user_id, cargo) VALUES ($1, $2, $3)", [1, 2, 'Directora de Obras']);
  await db.run("INSERT INTO project_responsibles (project_id, user_id, cargo) VALUES ($1, $2, $3)", [1, 1, 'Alcalde']);
  await db.run("INSERT INTO project_responsibles (project_id, user_id, cargo) VALUES ($1, $2, $3)", [1, 3, 'Contratista - Representante Legal']);
  await db.run("INSERT INTO project_responsibles (project_id, user_id, cargo) VALUES ($1, $2, $3)", [2, 2, 'Directora de Obras']);
  await db.run("INSERT INTO project_responsibles (project_id, user_id, cargo) VALUES ($1, $2, $3)", [2, 4, 'Contratista - Gerente de Proyectos']);
  await db.run("INSERT INTO project_responsibles (project_id, user_id, cargo) VALUES ($1, $2, $3)", [3, 2, 'Directora de Obras']);
  await db.run("INSERT INTO project_responsibles (project_id, user_id, cargo) VALUES ($1, $2, $3)", [3, 1, 'Alcalde']);
  // Updates
  await db.run("INSERT INTO project_updates (project_id, user_id, title, description, technical_advance, percentage) VALUES ($1, $2, $3, $4, $5, $6)", [1, 3, 'Inicio de obras', 'Se iniciaron los trabajos de excavacion.', 'Maquinaria pesada movilizada.', 15]);
  await db.run("INSERT INTO project_updates (project_id, user_id, title, description, technical_advance, percentage) VALUES ($1, $2, $3, $4, $5, $6)", [1, 3, 'Avance de excavacion', 'Completada excavacion de 2 km.', '30 tuberias de drenaje instaladas.', 30]);
  await db.run("INSERT INTO project_updates (project_id, user_id, title, description, technical_advance, percentage) VALUES ($1, $2, $3, $4, $5, $6)", [1, 2, 'Inspeccion de obra', 'Inspeccion tecnica aprobada.', 'Compactacion 95% Proctor.', 30]);
  await db.run("INSERT INTO project_updates (project_id, user_id, title, description, technical_advance, percentage) VALUES ($1, $2, $3, $4, $5, $6)", [2, 4, 'Diagnostico inicial', 'Diagnostico completo de la red.', '12 puntos criticos identificados.', 10]);
  await db.run("INSERT INTO project_updates (project_id, user_id, title, description, technical_advance, percentage) VALUES ($1, $2, $3, $4, $5, $6)", [2, 4, 'Inicio de sustitucion', 'Comienza sustitucion de tuberias.', '150 m de tuberia sustituidos.', 25]);
  // Comments
  await db.run("INSERT INTO project_comments (project_id, user_id, comment) VALUES ($1, $2, $3)", [1, 1, 'Excelente avance. Felicitaciones al equipo.']);
  await db.run("INSERT INTO project_comments (project_id, user_id, comment) VALUES ($1, $2, $3)", [1, 2, 'Mantener medidas de seguridad.']);
  await db.run("INSERT INTO project_comments (project_id, user_id, comment) VALUES ($1, $2, $3)", [2, 4, 'Solicitamos autorizacion para extender horario.']);
  await db.run("INSERT INTO project_comments (project_id, user_id, comment) VALUES ($1, $2, $3)", [2, 2, 'Autorizado. Coordinar con Planeamiento Urbano.']);
  // Photos
  await db.run("INSERT INTO project_photos (project_id, user_id, caption, filename) VALUES ($1, $2, $3, $4)", [1, 3, 'Excavacion inicial', 'placeholder-1.jpg']);
  await db.run("INSERT INTO project_photos (project_id, user_id, caption, filename) VALUES ($1, $2, $3, $4)", [1, 3, 'Instalacion de drenaje', 'placeholder-2.jpg']);
  await db.run("INSERT INTO project_photos (project_id, user_id, caption, filename) VALUES ($1, $2, $3, $4)", [2, 4, 'Diagnostico de tuberias', 'placeholder-3.jpg']);
  markDirty();
  console.log('');
  console.log('=== CREDENCIALES DE ACCESO ===');
  console.log('Admin: admin@municipioplaza.gob.ve / admin123 (Alcalde)');
  console.log('Admin 2: obras@municipioplaza.gob.ve / admin123 (Directora)');
  console.log('Contratista 1: contratista1@email.com / contrato123');
  console.log('Contratista 2: contratista2@email.com / contrato123');
  console.log('Visitante: visitante@email.com / visitante123');
  console.log('==============================');
}

if (require.main === module) {
  seed().catch(console.error);
}

module.exports = { seed };
