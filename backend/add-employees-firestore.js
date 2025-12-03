// Script to add 5 employees to Firebase Firestore
// Run this script ONCE to initialize the database with employees

const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'almasar-callcenter',
    // ستحتاج لإضافة Service Account Key هنا
    // أو استخدام GOOGLE_APPLICATION_CREDENTIALS environment variable
  }),
});

const firestore = admin.firestore();

const employees = [
  {
    username: 'saher',
    name: 'ساهر',
    email: 'saher@almasar.com',
    password: 'Aa123456',
    role: 'employee',
    department: 'support',
    phone: '+966500000001',
    permissions: ['listen_own_calls'],
  },
  {
    username: 'amira',
    name: 'أميرة',
    email: 'amira@almasar.com',
    password: 'Aa123456',
    role: 'employee',
    department: 'support',
    phone: '+966500000002',
    permissions: ['listen_own_calls'],
  },
  {
    username: 'tasneem',
    name: 'تسنيم',
    email: 'tasneem@almasar.com',
    password: 'Aa123456',
    role: 'employee',
    department: 'support',
    phone: '+966500000003',
    permissions: ['listen_own_calls'],
  },
  {
    username: 'shaker',
    name: 'شاكر',
    email: 'shaker@almasar.com',
    password: 'Aa123456',
    role: 'employee',
    department: 'support',
    phone: '+966500000004',
    permissions: ['listen_own_calls'],
  },
  {
    username: 'Akram',
    name: 'أكرم',
    email: 'akram@almasar.com',
    password: 'Aa123456',
    role: 'admin',
    department: 'management',
    phone: '+966500000005',
    permissions: [
      'listen_own_calls',
      'listen_all_calls',
      'manage_users',
      'update_passwords',
      'update_permissions',
      'view_all_users',
      'create_users',
      'delete_users',
    ],
  },
];

async function addEmployees() {
  console.log('🔥 بدء إضافة الموظفين إلى Firestore...\n');

  try {
    for (const employee of employees) {
      // Hash كلمة المرور
      const hashedPassword = await bcrypt.hash(employee.password, 10);

      // التحقق من عدم وجود الموظف مسبقاً
      const existingUser = await firestore
        .collection('users')
        .where('username', '==', employee.username)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        console.log(`⚠️  ${employee.name} (${employee.username}) موجود بالفعل - تم التخطي`);
        continue;
      }

      // إضافة الموظف
      const userRef = await firestore.collection('users').add({
        username: employee.username,
        name: employee.name,
        email: employee.email,
        passwordHash: hashedPassword,
        role: employee.role,
        department: employee.department,
        phone: employee.phone,
        avatar: '',
        permissions: employee.permissions,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ تمت إضافة ${employee.name} (${employee.username}) - ID: ${userRef.id}`);
    }

    console.log('\n🎉 تمت إضافة جميع الموظفين بنجاح!\n');
    console.log('📋 ملخص الصلاحيات:');
    console.log('   - ساهر، أميرة، تسنيم، شاكر: موظفين (listen_own_calls فقط)');
    console.log('   - أكرم: Admin كامل (جميع الصلاحيات)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ أثناء إضافة الموظفين:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
addEmployees();
