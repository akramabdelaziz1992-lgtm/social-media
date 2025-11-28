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

function createDeveloperUser() {
  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('akram');
    if (existingUser) {
      console.log('⚠️  Developer user already exists. Updating password...');
      const passwordHash = bcrypt.hashSync('Aazxc', 10);
      const stmt = db.prepare(`
        UPDATE users 
        SET passwordHash = ?, updatedAt = ?
        WHERE email = ?
      `);
      stmt.run(passwordHash, new Date().toISOString(), 'akram');
      console.log('✅ Developer password updated!');
      return;
    }

    // Hash the password
    const password = 'Aazxc';
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const uuid = generateUUID();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, department, isActive, phone, avatar, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    
    stmt.run(
      uuid,
      'Akram - Developer',
      'akram',
      passwordHash,
      'admin',
      'development',
      1,
      null,
      null,
      now,
      now
    );
    
    console.log('\n✅ Developer user created successfully!');
    console.log(`👤 Username: akram`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 User ID: ${uuid}`);
    
    // Verify user was created
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE email = ?').get('akram');
    if (user) {
      console.log('\n✅ Verification successful - user found in database:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Username: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    }
    
  } catch (err) {
    console.error('❌ Error creating developer user:', err.message);
  } finally {
    db.close();
  }
}

createDeveloperUser();
