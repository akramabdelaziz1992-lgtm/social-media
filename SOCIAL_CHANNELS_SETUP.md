# 📱 دليل ربط قنوات التواصل الاجتماعي

## ✅ القنوات المتاحة

### 1. واتساب (WhatsApp) ✅ **مفعّل**
- **الحالة**: متصل ويعمل
- **الميزات**: 
  - إرسال واستقبال الرسائل
  - قراءة المحادثات
  - الرد التلقائي
- **الرسائل تظهر في**: http://localhost:3000/inbox

---

### 2. ماسنجر فيسبوك (Facebook Messenger) 🔄 **قيد الإعداد**

#### الخطوات المطلوبة:

**أ. إنشاء تطبيق Facebook**
1. افتح [Facebook Developers](https://developers.facebook.com/)
2. اضغط "My Apps" ← "Create App"
3. اختر "Business" ← املأ البيانات
4. اسم التطبيق: "Almasar Social Suite"

**ب. إضافة Messenger Product**
1. من Dashboard ← اضغط "Add Product"
2. ابحث عن "Messenger" واضغط "Set Up"
3. اذهب لـ "Messenger" ← "Settings"

**ج. إنشاء Page Access Token**
1. في Messenger Settings
2. تحت "Access Tokens"
3. اضغط "Add or Remove Pages"
4. اختر صفحة الفيسبوك الخاصة بك
5. انسخ "Page Access Token"

**د. إعداد Webhooks**
1. في Messenger Settings ← Webhooks
2. اضغط "Add Callback URL"
3. Callback URL: `https://your-domain.com/api/messenger/webhook`
4. Verify Token: `almasar_messenger_verify_token_2024`
5. اختر الـ Subscription Fields:
   - messages
   - messaging_postbacks
   - messaging_optins
   - message_deliveries
   - message_reads

**هـ. تحديث Backend .env**
```env
# Facebook Messenger
MESSENGER_PAGE_ACCESS_TOKEN=your_page_access_token_here
MESSENGER_VERIFY_TOKEN=almasar_messenger_verify_token_2024
MESSENGER_APP_SECRET=your_app_secret_here
```

**و. اختبار التكامل**
1. أرسل رسالة لصفحة الفيسبوك
2. تحقق من Backend Logs
3. الرسائل ستظهر في http://localhost:3000/inbox

---

### 3. تيليجرام (Telegram) 🔄 **قيد الإعداد**

#### الخطوات المطلوبة:

**أ. إنشاء Bot في Telegram**
1. افتح Telegram وابحث عن `@BotFather`
2. أرسل `/newbot`
3. أدخل اسم البوت: "Almasar Support Bot"
4. أدخل username: "almasar_support_bot"
5. انسخ **Bot Token** (مثل: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

**ب. تفعيل Group Privacy**
1. أرسل `/setprivacy` لـ @BotFather
2. اختر البوت
3. اختار "Disable" (علشان البوت يقرأ كل الرسائل)

**ج. الحصول على Chat ID**
1. أضف البوت لمجموعة أو قناة
2. أرسل رسالة في المجموعة
3. افتح: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. ابحث عن `"chat":{"id":-1001234567890}`
5. انسخ الـ Chat ID

**د. تحديث Backend .env**
```env
# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

**هـ. إعداد Webhook (اختياري)**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

**و. اختبار التكامل**
1. أرسل رسالة للبوت أو في المجموعة
2. تحقق من Backend Logs
3. الرسائل ستظهر في http://localhost:3000/inbox

---

## 🎯 الكود المطلوب لتفعيل القنوات

### إضافة Messenger Module

**backend/src/modules/messenger/messenger.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';

@Module({
  controllers: [MessengerController],
  providers: [MessengerService],
  exports: [MessengerService],
})
export class MessengerModule {}
```

### إضافة Telegram Module

**backend/src/modules/telegram/telegram.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
```

---

## 📊 حالة القنوات

| القناة | الحالة | الميزات المتاحة |
|--------|--------|-----------------|
| واتساب | ✅ متصل | إرسال/استقبال، QR Code، ردود تلقائية |
| ماسنجر | ⏳ قيد الإعداد | يحتاج Page Access Token |
| تيليجرام | ⏳ قيد الإعداد | يحتاج Bot Token |

---

## 🔗 روابط مفيدة

- [Facebook Developers](https://developers.facebook.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [WhatsApp Web.js Documentation](https://wwebjs.dev/)

---

## 📝 ملاحظات هامة

1. **WhatsApp**: يعمل بنظام QR Code - يجب مسح الـ QR كل فترة
2. **Messenger**: يحتاج موافقة Facebook على التطبيق للاستخدام العام
3. **Telegram**: البوت يمكنه العمل في المجموعات والقنوات
4. **جميع الرسائل**: تظهر في صندوق وارد موحد في `/inbox`

---

## 🚀 البدء السريع

بعد إعداد أي قناة:
1. شغّل Backend: `npm run start:dev`
2. افتح Inbox: http://localhost:3000/inbox
3. الرسائل من جميع القنوات ستظهر تلقائياً!

---

**تم الإنشاء**: 23 نوفمبر 2025
**الإصدار**: 1.0.0
