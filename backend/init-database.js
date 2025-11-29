#!/usr/bin/env node

const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Create/open database
const db = new Database('almasar.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : [
    crypto.randomBytes(4).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(2).toString('hex'),
    crypto.randomBytes(6).toString('hex')
  ].join('-');
}

function initDatabase() {
  try {
    console.log('🔧 Initializing Almasar database...');

    // Check if admin user exists
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@elmasarelsa5en.com');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists. Skipping initialization.');
      db.close();
      return;
    }

    console.log('📝 Creating admin and employee accounts...');

    const users = [
      {
        id: generateUUID(),
        name: 'مدير النظام',
        email: 'admin@elmasarelsa5en.com',
        password: 'Admin@123',
        role: 'admin',
        department: 'management',
        phone: '+966555254915'
      },
      {
        id: generateUUID(),
        name: 'موظف المبيعات',
        email: 'sales@elmasarelsa5en.com',
        password: 'Sales@123',
        role: 'employee',
        department: 'sales',
        phone: '+966501234567'
      },
      {
        id: generateUUID(),
        name: 'موظف الحجوزات',
        email: 'reservations@elmasarelsa5en.com',
        password: 'Reservations@123',
        role: 'employee',
        department: 'reservations',
        phone: '+966509876543'
      },
      {
        id: generateUUID(),
        name: 'موظف المحاسبة',
        email: 'accounting@elmasarelsa5en.com',
        password: 'Accounting@123',
        role: 'employee',
        department: 'accounting',
        phone: '+966551234567'
      },
      {
        id: generateUUID(),
        name: 'أكرم عبدالعزيز',
        email: 'akram@elmasarelsa5en.com',
        password: 'Aazxc',
        role: 'developer',
        department: 'IT',
        phone: '+966559902557'
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, department, isActive, phone, avatar, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    for (const user of users) {
      const passwordHash = bcrypt.hashSync(user.password, 10);
      
      stmt.run(
        user.id,
        user.name,
        user.email,
        passwordHash,
        user.role,
        user.department,
        1, // isActive
        user.phone,
        null, // avatar
        now,
        now
      );

      console.log(`✅ Created: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 Database initialized successfully!');
    console.log('\n📋 Available accounts:');
    console.log('   👨‍💼 Admin: admin@elmasarelsa5en.com / Admin@123');
    console.log('   💰 Sales: sales@elmasarelsa5en.com / Sales@123');
    console.log('   🏨 Reservations: reservations@elmasarelsa5en.com / Reservations@123');
    console.log('   📊 Accounting: accounting@elmasarelsa5en.com / Accounting@123');
    console.log('   💻 Developer: akram@elmasarelsa5en.com / Aazxc');

  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

initDatabase();
