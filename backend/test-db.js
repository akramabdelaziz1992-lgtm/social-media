const Database = require('better-sqlite3');

try {
  const db = new Database('almasar.db');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  
  console.log('\n=== Database Tables ===');
  if (tables.length === 0) {
    console.log('❌ NO TABLES FOUND');
  } else {
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(t => {
      const columns = db.prepare(`PRAGMA table_info(${t.name})`).all();
      console.log(`\n  📋 ${t.name} (${columns.length} columns)`);
      columns.forEach(c => console.log(`     - ${c.name}: ${c.type}`));
    });
  }
  
  db.close();
} catch (err) {
  console.error('ERROR:', err.message);
}
