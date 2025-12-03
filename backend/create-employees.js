const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new sqlite3('almasar.db');

// تعريف الموظفين
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

try {
  // حذف المستخدمين القدامى إن وجدوا
  const deleteStmt = db.prepare('DELETE FROM "users" WHERE email IN (?, ?, ?, ?, ?)');
  deleteStmt.run('saher', 'amira', 'tasneem', 'shaker', 'Akram');
  
  const stmt = db.prepare(`
    INSERT INTO "users" ("id", "email", "name", "passwordHash", "role", "department", "permissions", "isActive", "createdAt", "updatedAt") 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  employees.forEach((emp, index) => {
    const hashedPassword = bcrypt.hashSync(emp.password, 10);
    const userId = `user-${Date.now()}-${index}`;
    
    stmt.run(
      userId,
      emp.email,
      emp.name,
      hashedPassword,
      emp.role,
      emp.department,
      emp.permissions,
      1,
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    console.log(`✅ تم إضافة ${emp.name}`);
    console.log(`   Username: ${emp.email}`);
    console.log(`   Password: ${emp.password}`);
    console.log(`   Role: ${emp.role}`);
    console.log(`   Permissions: ${emp.permissions}`);
    console.log('');
  });
  
  console.log('\n✅ تم إضافة جميع الموظفين بنجاح!');
  console.log('\n📝 ملخص الحسابات:');
  console.log('━'.repeat(50));
  console.log('\nالموظفين (يسمعون مكالماتهم فقط):');
  console.log('1. saher / Aa123456');
  console.log('2. amira / Aa123456');
  console.log('3. tasneem / Aa123456');
  console.log('4. shaker / Aa123456');
  console.log('\nالأدمن (يرى كل شيء):');
  console.log('5. Akram / Aazxc');
  console.log('\n⚠️  تنبيه: يجب تسجيل الدخول من صفحة Mobile Call فقط:');
  console.log('   http://localhost:3000/mobile-call');
  
} catch (err) {
  console.error('❌ خطأ:', err.message);
}

db.close();
