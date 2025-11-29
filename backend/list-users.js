const Database = require('better-sqlite3');
const db = new Database('almasar.db');

try {
  const users = db.prepare('SELECT email, role, name FROM users').all();
  
  console.log('\n✅ الحسابات المتاحة:\n');
  users.forEach(u => {
    console.log(`   👤 ${u.role.padEnd(10)} | ${u.email} | ${u.name}`);
  });
  console.log(`\n📊 إجمالي: ${users.length} حسابات\n`);
} catch (err) {
  console.error('❌ خطأ:', err.message);
} finally {
  db.close();
}
