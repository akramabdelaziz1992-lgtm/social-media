const sqlite3 = require('better-sqlite3');

const db = new sqlite3('almasar.db');

try {
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
  console.log('Tables:', tables.map(t => t.name).join(', '));
} catch (err) {
  console.error('Error:', err.message);
}

db.close();
