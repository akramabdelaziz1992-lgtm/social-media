const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

// البحث عن ملف قاعدة البيانات في مواقع مختلفة
const dbLocations = [
  'almasar.db',                    // في الـ root
  'backend/almasar.db',            // في مجلد backend
  path.join(__dirname, 'almasar.db'),
  path.join(__dirname, 'backend', 'almasar.db'),
];

let db;
let dbPath;

for (const location of dbLocations) {
  try {
    db = new sqlite3(location);
    dbPath = location;
    console.log(`📂 Database found at: ${location}`);
    break;
  } catch (err) {
    // جرب الموقع التالي
  }
}

if (!db) {
  console.error('❌ Database not found! Tried locations:', dbLocations);
  process.exit(1);
}

try {
  const hashedPassword = bcrypt.hashSync('Aazxc', 10);
  
  const stmt = db.prepare(`
    INSERT INTO "user" ("email", "name", "passwordHash", "role", "department", "isActive", "createdAt", "updatedAt") 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    'akram',
    'Akram Admin',
    hashedPassword,
    'admin',
    'Admin',
    1,
    new Date().toISOString(),
    new Date().toISOString()
  );
  
  console.log('\n✅ User created successfully!');
  console.log('═══════════════════════════════════');
  console.log('👤 Username: akram');
  console.log('🔑 Password: Aazxc');
  console.log('═══════════════════════════════════');
  console.log('\n🌐 You can now login at:');
  console.log('https://almasar-frontend.vercel.app/call-center/login\n');
} catch (err) {
  if (err.message.includes('UNIQUE constraint')) {
    console.log('\n⚠️  User already exists!');
    console.log('═══════════════════════════════════');
    console.log('👤 Username: akram');
    console.log('🔑 Password: Aazxc');
    console.log('═══════════════════════════════════');
    console.log('\n🌐 You can login at:');
    console.log('https://almasar-frontend.vercel.app/call-center/login\n');
  } else {
    console.error('❌ Error:', err.message);
  }
}

db.close();
