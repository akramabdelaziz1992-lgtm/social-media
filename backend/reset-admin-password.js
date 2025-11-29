const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('almasar.db');

try {
  // Reset admin password
  const newPassword = 'Admin@123';
  const passwordHash = bcrypt.hashSync(newPassword, 10);
  
  const stmt = db.prepare('UPDATE users SET passwordHash = ? WHERE email = ?');
  const result = stmt.run(passwordHash, 'admin@elmasarelsa5en.com');
  
  if (result.changes > 0) {
    console.log('\n✅ تم تحديث كلمة المرور بنجاح!');
    console.log('\n📧 البريد: admin@elmasarelsa5en.com');
    console.log('🔐 كلمة المرور: Admin@123');
    console.log('\n✅ جرب تسجيل الدخول الآن!');
  } else {
    console.log('❌ لم يتم العثور على المستخدم');
  }
} catch (err) {
  console.error('❌ خطأ:', err.message);
} finally {
  db.close();
}
