const sqlite3 = require('better-sqlite3');

const db = new sqlite3('almasar.db');

try {
  // إضافة عمود permissions إلى جدول users
  db.prepare(`ALTER TABLE users ADD COLUMN permissions TEXT`).run();
  console.log('✅ تم إضافة عمود permissions بنجاح');
} catch (err) {
  if (err.message.includes('duplicate column name')) {
    console.log('ℹ️  عمود permissions موجود بالفعل');
  } else {
    console.error('❌ خطأ:', err.message);
  }
}

db.close();
