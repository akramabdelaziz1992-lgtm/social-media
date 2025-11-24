# إعداد WebRTC للاتصال من المتصفح مباشرة

## المشكلة الحالية
- المكالمات تتصل بتليفونك الأول (Click-to-Call)
- عاوزين نتكلم من المتصفح مباشرة بدون ما التليفون يرن

---

## خطوات الإعداد في Twilio Console

### 1️⃣ إنشاء TwiML App

1. اذهب إلى: https://console.twilio.com/us1/develop/voice/manage/twiml-apps
2. اضغط على **"Create new TwiML App"**
3. املأ البيانات:
   - **Friendly Name**: `AlMasar Voice App`
   - **Voice Request URL**: `https://unacetic-nearly-tawanna.ngrok-free.dev/api/calls/twiml/outbound`
   - **Voice Method**: `HTTP POST`
   - **Status Callback URL**: `https://unacetic-nearly-tawanna.ngrok-free.dev/api/calls/webhook/status`
   - **Status Method**: `HTTP POST`

4. احفظ الـ **TwiML App SID** (يبدأ بـ `AP...`)

---

### 2️⃣ إنشاء API Key & Secret (اختياري - للأمان)

**ملاحظة**: يمكن استخدام Account SID & Auth Token بدلاً منهم، لكن API Key أكثر أماناً

1. اذهب إلى: https://console.twilio.com/us1/develop/api-keys
2. اضغط **"Create API Key"**
3. املأ البيانات:
   - **Friendly Name**: `AlMasar API Key`
   - **Key Type**: `Standard`
4. احفظ:
   - **API Key SID** (يبدأ بـ `SK...`)
   - **API Secret** (سر طويل - **احفظه! مش هيظهر تاني**)

---

### 3️⃣ تحديث ملف `.env`

افتح ملف `backend/.env` وأضف:

```env
# Twilio WebRTC Settings
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
```

**إذا لم تنشئ API Key**، استخدم الإعدادات الموجودة:
```env
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# سيستخدم النظام Account SID & Auth Token تلقائياً
```

---

### 4️⃣ إعادة تشغيل Backend

```powershell
cd backend
npm run start:dev
```

---

## كيف يعمل WebRTC؟

### قبل (Click-to-Call):
```
Frontend → Backend → Twilio → Your Phone 📱 → Customer Phone 📱
```

### بعد (WebRTC):
```
Frontend (Browser 🎧) → Twilio → Customer Phone 📱
```

---

## الفرق بين الطريقتين

| الميزة | Click-to-Call | WebRTC |
|--------|--------------|--------|
| **يتصل بتليفونك أولاً** | ✅ نعم | ❌ لا |
| **التكلم من المتصفح** | ❌ لا | ✅ نعم |
| **يحتاج رقم متحقق منه** | ✅ نعم | ❌ لا |
| **جودة الصوت** | عالية | متوسطة (حسب الإنترنت) |
| **التسجيل التلقائي** | ✅ يعمل | ✅ يعمل |

---

## بعد الإعداد

1. افتح الواجهة: http://localhost:3000/call-center
2. اضغط على رقم أي عميل
3. المكالمة ستبدأ مباشرة من المتصفح 🎧
4. التسجيل سيظهر في **سجل المكالمات** بعد انتهاء المكالمة

---

## إذا واجهت مشكلة

### 1. "Token generation failed"
- تأكد من TwiML App SID صحيح في `.env`
- تأكد من API Key & Secret صحيحين

### 2. "No microphone access"
- المتصفح يطلب إذن المايكروفون
- اسمح بالوصول للمايكروفون

### 3. "Call failed to connect"
- تأكد من ngrok شغال
- تأكد من Voice Request URL في TwiML App صحيح
- تأكد من الرقم المُراد الاتصال به صحيح

---

## ملاحظات مهمة

⚠️ **WebRTC يحتاج HTTPS أو localhost فقط**  
✅ ngrok يوفر HTTPS تلقائياً

⚠️ **المتصفح يطلب إذن المايكروفون**  
✅ اضغط "Allow" عند ظهور الرسالة

⚠️ **التكلفة نفس Click-to-Call**  
✅ Twilio يحسب الدقائق بنفس السعر

---

## خطوات سريعة (TL;DR)

```bash
# 1. إنشاء TwiML App في Console
# 2. انسخ TwiML App SID
# 3. أضفه لـ .env
echo "TWILIO_TWIML_APP_SID=APxxxxx" >> backend/.env

# 4. أعد تشغيل Backend
cd backend
npm run start:dev

# 5. جرّب المكالمة من المتصفح
# http://localhost:3000/call-center
```

---

🎉 **بعد كده هتقدر تتكلم من المتصفح مباشرة!**
