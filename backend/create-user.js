const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new sqlite3('almasar.db');

try {
  const hashedPassword = bcrypt.hashSync('Admin@123', 10);
  
  const stmt = db.prepare(`
    INSERT INTO "user" ("email", "name", "passwordHash", "role", "department", "isActive", "createdAt", "updatedAt") 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    'admin@elmasarelsa5en.com',
    'Admin User',
    hashedPassword,
    'admin',
    'Admin',
    1,
    new Date().toISOString(),
    new Date().toISOString()
  );
  
  console.log('✅ User created successfully!');
  console.log('Email: admin@elmasarelsa5en.com');
  console.log('Password: Admin@123');
} catch (err) {
  console.log('User might already exist. Error:', err.message);
}

db.close();
