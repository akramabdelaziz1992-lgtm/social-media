const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Get DATABASE_URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/almasar';

const employees = [
  {
    email: 'saher',
    name: 'Saher',
    password: 'Aa123456',
    role: 'employee',
    department: 'Customer Service',
    permissions: JSON.stringify(['make_calls', 'receive_calls', 'listen_own_calls'])
  },
  {
    email: 'amira',
    name: 'Amira',
    password: 'Aa123456',
    role: 'employee',
    department: 'Customer Service',
    permissions: JSON.stringify(['make_calls', 'receive_calls', 'listen_own_calls'])
  },
  {
    email: 'tasneem',
    name: 'Tasneem',
    password: 'Aa123456',
    role: 'employee',
    department: 'Customer Service',
    permissions: JSON.stringify(['make_calls', 'receive_calls', 'listen_own_calls'])
  },
  {
    email: 'shaker',
    name: 'Shaker',
    password: 'Aa123456',
    role: 'employee',
    department: 'Customer Service',
    permissions: JSON.stringify(['make_calls', 'receive_calls', 'listen_own_calls'])
  },
  {
    email: 'Akram',
    name: 'Akram Admin',
    password: 'Aazxc',
    role: 'admin',
    department: 'Admin',
    permissions: JSON.stringify(['make_calls', 'receive_calls', 'listen_own_calls', 'listen_all_calls', 'manage_users', 'view_reports'])
  }
];

async function addEmployees() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Add permissions column if it doesn't exist
    try {
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT');
      console.log('✅ Permissions column ensured');
    } catch (err) {
      console.log('ℹ️  Permissions column already exists or error:', err.message);
    }

    // Delete old users
    await client.query(`DELETE FROM users WHERE email IN ('saher', 'amira', 'tasneem', 'shaker', 'Akram')`);
    console.log('🗑️  Removed old users if existed\n');

    // Insert new employees
    for (const emp of employees) {
      const hashedPassword = await bcrypt.hash(emp.password, 10);
      
      const query = `
        INSERT INTO users (email, name, "passwordHash", role, department, permissions, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING email, name, role
      `;
      
      const result = await client.query(query, [
        emp.email,
        emp.name,
        hashedPassword,
        emp.role,
        emp.department,
        emp.permissions,
        true
      ]);

      console.log(`✅ تم إضافة ${result.rows[0].name}`);
      console.log(`   Username: ${result.rows[0].email}`);
      console.log(`   Password: ${emp.password}`);
      console.log(`   Role: ${result.rows[0].role}`);
      console.log('');
    }

    console.log('━'.repeat(50));
    console.log('✅ تم إضافة جميع الموظفين بنجاح!\n');
    
    // Verify
    const result = await client.query(`SELECT email, name, role FROM users WHERE email IN ('saher', 'amira', 'tasneem', 'shaker', 'Akram')`);
    console.log('📋 المستخدمين في قاعدة البيانات:');
    result.rows.forEach(row => {
      console.log(`   ${row.name} (${row.email}) - ${row.role}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await client.end();
    console.log('\n✅ Connection closed');
  }
}

addEmployees();
