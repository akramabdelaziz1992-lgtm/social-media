const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('almasar.db');

console.log('\n=== فحص المكالمات الأخيرة ===\n');

db.all(
  'SELECT * FROM calls ORDER BY createdAt DESC LIMIT 5',
  [],
  (err, rows) => {
    if (err) {
      console.error('خطأ:', err);
      return;
    }

    if (rows.length === 0) {
      console.log('❌ لا توجد مكالمات في قاعدة البيانات!');
    } else {
      rows.forEach((call, index) => {
        console.log(`\n📞 مكالمة ${index + 1}:`);
        console.log(`   ID: ${call.id}`);
        console.log(`   Twilio SID: ${call.twilioCallSid}`);
        console.log(`   الرقم: ${call.callerNumber}`);
        console.log(`   الاتجاه: ${call.direction}`);
        console.log(`   الحالة: ${call.status}`);
        console.log(`   المدة: ${call.durationSeconds || 0} ثانية`);
        console.log(`   التسجيل: ${call.recordingUrl || 'لا يوجد'}`);
        console.log(`   التاريخ: ${call.createdAt}`);
        console.log('   ---');
      });
    }

    db.close();
  }
);
