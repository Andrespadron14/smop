const path = require('path');
const fs = require('fs');

const usePostgres = !!process.env.DATABASE_URL;

let pgPool = null;
let sqliteDb = null;

function convertPlaceholders(sql) {
  return sql.replace(/\$(\d+)/g, () => '?');
}

async function getDb() {
  if (usePostgres) {
    if (pgPool) return { exec: pgExec, run: pgRun };
    const { Pool } = require('pg');
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 10000, family: 4 });
    return { exec: pgExec, run: pgRun };
  } else {
    if (sqliteDb) return { exec: sqliteExec, run: sqliteRun };
    const initSqlJs = require('sql.js');
    const DB_PATH = path.join(__dirname, 'database.sqlite');
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      sqliteDb = new SQL.Database(fs.readFileSync(DB_PATH));
    } else {
      sqliteDb = new SQL.Database();
    }
    return { exec: sqliteExec, run: sqliteRun };
  }
}

async function pgExec(sql, params) {
  const r = await pgPool.query(sql, params || []);
  if (!r.fields || !r.fields.length) return [];
  const cols = r.fields.map(f => f.name);
  const vals = r.rows.map(row => cols.map(c => row[c]));
  return [{ columns: cols, values: vals }];
}

async function pgRun(sql, params) {
  await pgPool.query(sql, params || []);
}

function sqliteExec(sql, params) {
  const s = convertPlaceholders(sql);
  const r = sqliteDb.exec(s, params || []);
  return r.length ? r : [];
}

function sqliteRun(sql, params) {
  const s = convertPlaceholders(sql);
  sqliteDb.run(s, params || []);
}

function sqliteSaveDb() {
  if (!sqliteDb) return;
  const DB_PATH = path.join(__dirname, 'database.sqlite');
  fs.writeFileSync(DB_PATH, Buffer.from(sqliteDb.export()));
}

async function initDb() {
  if (usePostgres) {
    const { Pool } = require('pg');
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 10000, family: 4 });
    try {
      const sql = fs.readFileSync(path.join(__dirname, 'migrate.sql'), 'utf8');
      await pgRun(sql);
    } catch (e) {
      console.log('initDb ERROR:', e.constructor.name, e.message, e.code);
      throw e;
    }
  } else {
    const DB_PATH = path.join(__dirname, 'database.sqlite');
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      sqliteDb = new SQL.Database(fs.readFileSync(DB_PATH));
    } else {
      sqliteDb = new SQL.Database();
    }
    const sql = [
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','contractor','viewer')), cargo TEXT DEFAULT '', created_at DATETIME DEFAULT (datetime('now','localtime')))",
      "CREATE TABLE IF NOT EXISTS contractors (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE NOT NULL, company_name TEXT NOT NULL, rif TEXT NOT NULL, phone TEXT DEFAULT '', address TEXT DEFAULT '', contact_name TEXT DEFAULT '', contact_email TEXT DEFAULT '', created_at DATETIME DEFAULT (datetime('now','localtime')), FOREIGN KEY (user_id) REFERENCES users(id))",
      "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT '', location TEXT DEFAULT '', budget REAL DEFAULT 0, start_date TEXT DEFAULT '', end_date TEXT DEFAULT '', status TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','paused')), contractor_id INTEGER, created_at DATETIME DEFAULT (datetime('now','localtime')), FOREIGN KEY (contractor_id) REFERENCES contractors(id))",
      "CREATE TABLE IF NOT EXISTS project_responsibles (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, user_id INTEGER NOT NULL, cargo TEXT NOT NULL, created_at DATETIME DEFAULT (datetime('now','localtime')), FOREIGN KEY (project_id) REFERENCES projects(id), FOREIGN KEY (user_id) REFERENCES users(id))",
      "CREATE TABLE IF NOT EXISTS project_updates (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, user_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '', technical_advance TEXT DEFAULT '', percentage INTEGER DEFAULT 0, created_at DATETIME DEFAULT (datetime('now','localtime')), FOREIGN KEY (project_id) REFERENCES projects(id), FOREIGN KEY (user_id) REFERENCES users(id))",
      "CREATE TABLE IF NOT EXISTS project_photos (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, user_id INTEGER NOT NULL, caption TEXT DEFAULT '', filename TEXT NOT NULL, created_at DATETIME DEFAULT (datetime('now','localtime')), FOREIGN KEY (project_id) REFERENCES projects(id), FOREIGN KEY (user_id) REFERENCES users(id))",
      "CREATE TABLE IF NOT EXISTS project_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, user_id INTEGER NOT NULL, comment TEXT NOT NULL, created_at DATETIME DEFAULT (datetime('now','localtime')), FOREIGN KEY (project_id) REFERENCES projects(id), FOREIGN KEY (user_id) REFERENCES users(id))"
    ];
    sql.forEach(s => sqliteDb.run(s));
    sqliteSaveDb();
  }
  console.log(usePostgres ? 'Base de datos: PostgreSQL' : 'Base de datos: SQLite');
}

function saveDb() {
  if (!usePostgres) sqliteSaveDb();
}

function markDirty() {
  if (!usePostgres) sqliteSaveDb();
}

module.exports = { getDb, saveDb, markDirty, initDb };
