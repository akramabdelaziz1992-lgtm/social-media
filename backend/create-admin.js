const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const db = new Database('almasar.db');

function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : [
    crypto.randomBytes(4).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(6).toString('hex')
  ].join('-');
}

function createAdminUser() {
  try {
    // Hash the password
    const password = 'Admin@123';
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const uuid = generateUUID();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, department, isActive, phone, avatar, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    
    stmt.run(
      uuid,
      'مدير النظام',  // System Administrator in Arabic
      'admin@elmasarelsa5en.com',
      passwordHash,
      'admin',
      'management',
      1,
      '+966-123-456-7890',
      null,
      now,
      now
    );
    
    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: admin@elmasarelsa5en.com`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 User ID: ${uuid}`);
    
    // Verify user was created
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE email = ?').get('admin@elmasarelsa5en.com');
    if (user) {
      console.log('\n✅ Verification successful - user found in database:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    }
    
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
  } finally {
    db.close();
  }
}

createAdminUser();
