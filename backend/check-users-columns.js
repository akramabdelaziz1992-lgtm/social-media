const sqlite3 = require('better-sqlite3');

const db = new sqlite3('almasar.db');

try {
  const columns = db.prepare(`PRAGMA table_info(users)`).all();
  console.log('Columns in users table:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
} catch (err) {
  console.error('Error:', err.message);
}

db.close();
