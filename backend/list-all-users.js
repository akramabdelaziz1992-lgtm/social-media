const sqlite3 = require('better-sqlite3');

const db = new sqlite3('almasar.db');

try {
  const users = db.prepare(`SELECT email, name, role, permissions FROM users`).all();
  
  console.log('\n📋 قائمة المستخدمين:\n');
  console.log('━'.repeat(80));
  
  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    
    let perms = [];
    if (user.permissions) {
      try {
        perms = JSON.parse(user.permissions);
      } catch (e) {
        perms = [user.permissions];
      }
    }
    
    console.log(`   Permissions: ${perms.join(', ')}`);
  });
  
  console.log('\n' + '━'.repeat(80));
  console.log(`\n✅ Total users: ${users.length}\n`);
  
} catch (err) {
  console.error('❌ خطأ:', err.message);
}

db.close();
