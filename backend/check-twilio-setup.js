#!/usr/bin/env node

/**
 * Script للتحقق من إعدادات Twilio Voice SDK
 * يتحقق من وجود جميع المتغيرات المطلوبة في .env
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 التحقق من إعدادات Twilio Voice SDK...\n');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ ملف .env غير موجود!');
  console.log('💡 قم بنسخ .env.example إلى .env أولاً:\n');
  console.log('   cp .env.example .env\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'TWILIO_API_KEY',
  'TWILIO_API_SECRET',
  'TWILIO_TWIML_APP_SID',
];

let allFound = true;
const found = {};
const missing = [];

requiredVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = envContent.match(regex);
  
  if (match && match[1] && match[1].trim() !== '' && !match[1].includes('your_')) {
    found[varName] = match[1].substring(0, 20) + '...';
    console.log(`✅ ${varName}: موجود`);
  } else {
    missing.push(varName);
    console.log(`❌ ${varName}: غير موجود أو غير مضبوط`);
    allFound = false;
  }
});

console.log('\n' + '='.repeat(60) + '\n');

if (allFound) {
  console.log('🎉 جميع المتغيرات المطلوبة موجودة!\n');
  console.log('📝 القيم المكتشفة:');
  Object.entries(found).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  console.log('\n✅ يمكنك الآن استخدام Twilio Voice SDK\n');
  process.exit(0);
} else {
  console.log('⚠️ يوجد متغيرات ناقصة!\n');
  console.log('❌ المتغيرات الناقصة:');
  missing.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  
  console.log('\n📖 لإعداد هذه المتغيرات، راجع الملف:\n');
  console.log('   TWILIO_VOICE_SDK_SETUP.md\n');
  
  console.log('💡 الخطوات السريعة:\n');
  console.log('1. إنشاء API Key:');
  console.log('   https://console.twilio.com/us1/develop/tools/api-keys\n');
  console.log('2. إنشاء TwiML App:');
  console.log('   https://console.twilio.com/us1/develop/voice/manage/twiml-apps\n');
  console.log('3. إضافة القيم في backend/.env\n');
  console.log('4. إعادة تشغيل Backend:\n');
  console.log('   npm run start:dev\n');
  
  process.exit(1);
}
