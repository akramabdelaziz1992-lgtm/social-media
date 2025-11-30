# 📱 إعداد Webhook لواتساب - رقم 0555254915

## المعلومات المحدثة ✅

### بيانات WhatsApp Business API
- **رقم الواتساب**: +966 55 525 4915
- **Phone Number ID**: `946543245198666`
- **Business Account ID**: `829226516635919`
- **Access Token**: تم التحديث ✅
- **Verify Token**: `almasar_webhook_secret_2024`

---

## الخطوات المطلوبة

### ⚠️ مهم جداً: يجب رفع الـ Backend على الإنترنت أولاً

قبل إعداد الـ Webhook، محتاجين URL عام (public) للـ Backend.

**الخيارات المتاحة:**

#### 1️⃣ **استخدام Ngrok (للتجربة السريعة)**
```bash
# شغل الـ Backend أولاً
cd backend
npm run start:dev

# في terminal تاني، شغل ngrok
ngrok http 4000
```

هيديك URL زي: `https://xyz123.ngrok-free.app`

#### 2️⃣ **Deploy على Render (Production)**
اتبع الملف: `WHATSAPP_PRODUCTION_SETUP.md`

---

## إعداد Webhook في Meta Console

بعد ما يكون عندك URL للـ Backend:

### الخطوات في Meta for Developers:

1. **روح لـ Meta for Developers**
   - https://developers.facebook.com/apps
   - اختار التطبيق بتاعك

2. **اضغط على WhatsApp → Configuration**

3. **في قسم "Webhooks":**
   - اضغط **"Edit"** أو **"Configure"**

4. **أدخل البيانات دي:**
   ```
   Callback URL: https://your-backend-url.com/webhooks/whatsapp
   Verify Token: almasar_webhook_secret_2024
   ```
   
   **مثال لو بتستخدم Ngrok:**
   ```
   Callback URL: https://abc123.ngrok-free.app/webhooks/whatsapp
   Verify Token: almasar_webhook_secret_2024
   ```

5. **اضغط "Verify and Save"**
   - Meta هيبعت طلب للـ Backend للتحقق
   - لو كل حاجة صح، هيظهر ✅

6. **Subscribe to webhook fields:**
   اختار الحقول دي:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `message_deliveries` (optional)
   - ✅ `message_reads` (optional)

---

## اختبار الـ Webhook

بعد إعداد الـ Webhook:

1. **ابعت رسالة على الواتساب:**
   - ابعت رسالة لرقم: **+966 55 525 4915**
   - من أي رقم واتساب تاني

2. **شوف الرسالة في النظام:**
   - افتح: http://localhost:3001/whatsapp
   - أو: https://almasar-frontend.vercel.app/whatsapp
   - المفروض الرسالة تظهر في قائمة المحادثات

3. **لو مش شغال:**
   - شوف الـ logs في Backend
   - تأكد من الـ Webhook URL صحيح
   - تأكد من الـ Verify Token مطابق

---

## Webhook URL Examples

### Local Development (Ngrok):
```
https://abc123.ngrok-free.app/webhooks/whatsapp
```

### Production (Render):
```
https://almasar-backend.onrender.com/webhooks/whatsapp
```

### Production (Custom Domain):
```
https://api.elmasarelsa5en.com/webhooks/whatsapp
```

---

## Verify Token

استخدم التوكن ده في كل الحالات:
```
almasar_webhook_secret_2024
```

---

## استكشاف الأخطاء

### المشكلة: Webhook Verification Failed
**الحل:**
- تأكد من الـ Backend شغال
- تأكد من الـ URL صحيح
- تأكد من الـ Verify Token مطابق للـ .env

### المشكلة: الرسائل مش بتوصل
**الحل:**
- تأكد من Subscribe to webhooks
- شوف الـ Backend logs
- تأكد من الـ Access Token صحيح

### المشكلة: Ngrok بيفصل
**الحل:**
- Ngrok المجاني بيفصل كل ساعتين
- هتحتاج تعمل Setup للـ Webhook تاني
- أو Deploy على Render للـ Production

---

## الخطوة الجاية

**محتاج تعمل واحد من الاختيارات دي:**

### Option 1: تجربة سريعة بـ Ngrok
1. شغل Backend: `cd backend && npm run start:dev`
2. شغل Ngrok: `ngrok http 4000`
3. خد الـ URL وحط الـ Webhook في Meta
4. جرب بعت رسالة

### Option 2: Production Deploy على Render
1. اتبع ملف: `WHATSAPP_PRODUCTION_SETUP.md`
2. Deploy Backend على Render
3. خد الـ Production URL
4. حط الـ Webhook في Meta
5. جرب بعت رسالة

---

## ملاحظات مهمة

- ⚠️ الـ Access Token بيexpire، ممكن تحتاج تجدده
- 🔒 الـ Verify Token ثابت ومش بيتغير
- 🌐 Webhook URL لازم يكون HTTPS (مش HTTP)
- 📱 رقم الواتساب: +966 55 525 4915
- 🆔 Phone Number ID: 946543245198666

---

## Test Message Example

جرب بعت الرسالة دي على +966 55 525 4915:
```
مرحبا
```

المفروض تشوف:
1. الرسالة في Backend logs
2. الرسالة في Frontend (/whatsapp)
3. رد تلقائي من البوت (لو مفعل)

---

**تم التحديث:** 30 نوفمبر 2025
**الحالة:** جاهز للإعداد ✅
