# 🚀 دليل تطبيق WhatsApp Business API

## ✅ الخطوة 1: التسجيل في Meta for Developers

### 1.1 إنشاء حساب
1. اذهب إلى: https://developers.facebook.com
2. سجل دخول بحساب Facebook الخاص بك
3. إذا لم يكن لديك حساب، أنشئ واحداً جديداً

### 1.2 إنشاء تطبيق جديد
1. من الصفحة الرئيسية، اضغط على **"My Apps"**
2. اضغط **"Create App"**
3. اختر نوع التطبيق: **"Business"**
4. املأ التفاصيل:
   - **App Name**: `Almasar Suite`
   - **App Contact Email**: بريدك الإلكتروني
   - **Business Account**: اختر أو أنشئ حساب أعمال
5. اضغط **"Create App"**

### 1.3 إضافة WhatsApp Product
1. من لوحة التطبيق، ابحث عن **"Add Product"**
2. اختر **"WhatsApp"**
3. اضغط **"Set Up"**

---

## 📱 الخطوة 2: إعداد WhatsApp

### 2.1 الحصول على Test Number
- Meta تعطيك **رقم تجريبي مجاناً**
- يمكنك إرسال رسائل لـ **5 أرقام** للاختبار
- الرقم التجريبي يظهر في صفحة WhatsApp Setup

### 2.2 إضافة أرقام للاختبار
1. في صفحة **"WhatsApp" > "Getting Started"**
2. في قسم **"To"**، اضغط **"Add phone number"**
3. أضف رقم هاتفك (مع كود الدولة)
4. ستصلك رسالة تحقق على WhatsApp

### 2.3 نسخ المفاتيح المهمة
احفظ هذه القيم (ستحتاجها لاحقاً):

```
Phone Number ID: 1234567890123456
Access Token: EAAxxxxxxxxxxxxxxxxxx (Temporary)
WhatsApp Business Account ID: 9876543210
```

---

## 🔑 الخطوة 3: الحصول على Permanent Access Token

### 3.1 لماذا تحتاجه؟
- الـ Token المؤقت ينتهي بعد 24 ساعة
- Permanent Token يستمر بدون انتهاء

### 3.2 كيفية إنشائه
1. من لوحة التطبيق، اذهب إلى **"WhatsApp" > "Configuration"**
2. في قسم **"Permanent Token"**, اضغط **"Generate Token"**
3. اختر الصلاحيات:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
4. انسخ الـ Token وخزنه بأمان

---

## ⚙️ الخطوة 4: تعديل Backend

### 4.1 تثبيت المكتبات المطلوبة
```powershell
cd "d:\social media\almasar-suite\backend"
npm install @nestjs/axios axios
```

### 4.2 إضافة Environment Variables
أضف في ملف `.env`:

```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=1234567890123456
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=my_secret_verify_token_123
```

### 4.3 تحديث whatsapp.module.ts
```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppBusinessService } from './whatsapp-business.service';
import { WhatsAppBusinessController } from './whatsapp-business.controller';
import { WhatsAppGateway } from './whatsapp.gateway';

@Module({
  imports: [HttpModule],
  controllers: [WhatsAppBusinessController],
  providers: [WhatsAppBusinessService, WhatsAppGateway],
  exports: [WhatsAppBusinessService],
})
export class WhatsAppModule {}
```

---

## 🌐 الخطوة 5: إعداد Webhook

### 5.1 ما هو Webhook؟
- Webhook هو URL يستقبل الرسائل الواردة من WhatsApp
- Meta ترسل الرسائل إلى Backend الخاص بك

### 5.2 إعداد Webhook على Render
1. ارفع Backend على Render أولاً
2. احصل على URL مثل: `https://almasar-backend.onrender.com`

### 5.3 تسجيل Webhook في Meta
1. اذهب إلى **"WhatsApp" > "Configuration"**
2. في قسم **"Webhook"**, اضغط **"Configure"**
3. املأ:
   - **Callback URL**: `https://almasar-backend.onrender.com/api/whatsapp-business/webhook`
   - **Verify Token**: `my_secret_verify_token_123` (نفس القيمة في .env)
4. اضغط **"Verify and Save"**

### 5.4 الاشتراك في الأحداث (Webhook Fields)
اختر الأحداث التي تريد استقبالها:
- ✅ `messages` (الرسائل الواردة)
- ✅ `message_status` (حالة الرسالة)

---

## 🧪 الخطوة 6: الاختبار

### 6.1 اختبار إرسال رسالة
استخدم Postman أو Thunder Client:

```http
POST http://localhost:4000/api/whatsapp-business/send
Content-Type: application/json

{
  "to": "966555123456",
  "message": "مرحباً! هذه رسالة تجريبية من Almasar Suite"
}
```

### 6.2 اختبار استقبال رسالة
1. أرسل رسالة من هاتفك إلى رقم Test Number
2. تحقق من Backend logs
3. يجب أن تظهر الرسالة في Console

### 6.3 اختبار الأزرار التفاعلية
```http
POST http://localhost:4000/api/whatsapp-business/send-interactive-buttons
Content-Type: application/json

{
  "to": "966555123456",
  "bodyText": "كيف يمكنني مساعدتك؟",
  "buttons": [
    { "id": "1", "title": "حجز موعد" },
    { "id": "2", "title": "استفسار" },
    { "id": "3", "title": "دعم فني" }
  ]
}
```

---

## 📊 الخطوة 7: الترقية للإنتاج (Production)

### 7.1 متطلبات الترقية
- ✅ Business Account تم التحقق منه
- ✅ Facebook Business Manager
- ✅ رقم هاتف تجاري مملوك

### 7.2 خطوات الترقية
1. اذهب إلى **"WhatsApp" > "Getting Started"**
2. اضغط **"Add Phone Number"**
3. اختر **"Use your own number"**
4. اتبع خطوات التحقق

### 7.3 التسعير (بعد 1000 محادثة مجانية)
- محادثات المستخدم → الأعمال: مجاناً
- محادثات الأعمال → المستخدم:
  - رسائل الخدمة: $0.0042 - $0.0160
  - رسائل تسويقية: $0.0080 - $0.0300

---

## 🔧 الخطوة 8: تحديث Frontend

### 8.1 تغيير API URL
في `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://almasar-backend.onrender.com
NEXT_PUBLIC_WHATSAPP_TYPE=business-api
```

### 8.2 صفحة Inbox ستعمل تلقائياً
- لا حاجة لـ QR Code
- الرسائل تصل عبر Webhook
- إرسال الرسائل يعمل مباشرة

---

## ✅ Checklist نهائي

- [ ] تسجيل في Meta for Developers
- [ ] إنشاء تطبيق Business
- [ ] إضافة WhatsApp Product
- [ ] نسخ Phone Number ID و Access Token
- [ ] إضافة Environment Variables
- [ ] تثبيت @nestjs/axios
- [ ] تحديث whatsapp.module.ts
- [ ] رفع Backend على Render
- [ ] إعداد Webhook على Meta
- [ ] اختبار إرسال واستقبال الرسائل
- [ ] الترقية للإنتاج (اختياري)

---

## 🆘 المساعدة

### مشاكل شائعة:

**1. "Invalid access token"**
- تأكد من نسخ Token الصحيح
- تأكد من عدم انتهاء صلاحية Token

**2. "Webhook verification failed"**
- تأكد من أن Verify Token في .env يطابق Meta
- تأكد من أن Backend يعمل ويمكن الوصول إليه

**3. "Cannot send message to this phone"**
- تأكد من إضافة الرقم في Test Numbers
- تأكد من صيغة الرقم الصحيحة (966555123456)

### روابط مفيدة:
- 📖 WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp
- 🎓 Getting Started Guide: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- 💬 Developer Community: https://www.facebook.com/groups/DevCWhatsApp

---

## 🎉 تم!

الآن WhatsApp Business API جاهز للعمل على الاستضافة السحابية بدون مشاكل Session!
