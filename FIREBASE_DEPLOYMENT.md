# 🔥 نشر Backend على Firebase Functions

## خطوات النشر السريع

### 1️⃣ تثبيت Firebase CLI (إذا لم يكن مثبتاً)

```powershell
npm install -g firebase-tools
```

### 2️⃣ تسجيل الدخول إلى Firebase

```powershell
firebase login
```

### 3️⃣ إنشاء مشروع Firebase

1. اذهب إلى: https://console.firebase.google.com/
2. اضغط **"Add project"** أو **"إضافة مشروع"**
3. اسم المشروع: **almasar-suite**
4. اتبع الخطوات حتى النهاية

### 4️⃣ ربط المشروع المحلي بـ Firebase

```powershell
cd "d:\social media\almasar-suite"
firebase use --add
# اختار almasar-suite من القائمة
```

### 5️⃣ تثبيت Dependencies

```powershell
cd backend
npm install firebase-functions firebase-admin
```

### 6️⃣ رفع Environment Variables إلى Firebase

```powershell
# كل متغير على حدة - استخدم بياناتك من ملف .env
firebase functions:config:set \
  twilio.account_sid="YOUR_TWILIO_ACCOUNT_SID" \
  twilio.auth_token="YOUR_TWILIO_AUTH_TOKEN" \
  twilio.phone_number="YOUR_TWILIO_PHONE" \
  twilio.saudi_caller_id="YOUR_SAUDI_CALLER_ID" \
  twilio.twiml_app_sid="YOUR_TWIML_APP_SID" \
  twilio.api_key="YOUR_API_KEY" \
  twilio.api_secret="YOUR_API_SECRET"

firebase functions:config:set \
  database.url="YOUR_DATABASE_URL"

firebase functions:config:set \
  frontend.url="YOUR_FRONTEND_URL"

firebase functions:config:set \
  whatsapp.phone_number_id="YOUR_PHONE_NUMBER_ID" \
  whatsapp.phone_number="YOUR_PHONE_NUMBER" \
  whatsapp.access_token="YOUR_ACCESS_TOKEN" \
  whatsapp.verify_token="YOUR_VERIFY_TOKEN" \
  whatsapp.api_version="v21.0" \
  whatsapp.business_account_id="YOUR_BUSINESS_ACCOUNT_ID"
```

### 7️⃣ بناء المشروع

```powershell
cd backend
npm run build
```

### 8️⃣ النشر على Firebase

```powershell
cd ..
firebase deploy --only functions
```

---

## 🔗 بعد النشر

سيظهر لك URL مثل:

```
https://us-central1-almasar-suite.cloudfunctions.net/api
```

### اختبار الـ Token:

```
https://us-central1-almasar-suite.cloudfunctions.net/api/calls/token?identity=agent
```

---

## 📝 ملاحظات مهمة

### ✅ مميزات Firebase:
- ✅ **مجاني** حتى مليون طلب شهرياً
- ✅ **سريع جداً** (Google Infrastructure)
- ✅ **Auto-scaling** تلقائي
- ✅ **SSL** مجاني
- ✅ **Logs** مفصلة

### ⚠️ تحديثات مطلوبة في Frontend:

غيّر الـ Backend URL في Frontend:

من:
```
https://your-backend.onrender.com
```

إلى:
```
https://us-central1-almasar-suite.cloudfunctions.net/api
```

---

## 🔍 عرض الـ Logs

```powershell
firebase functions:log
```

---

## 🚀 إعادة النشر بعد التعديلات

```powershell
cd backend
npm run build
cd ..
firebase deploy --only functions
```

---

**تم! 🎉** Firebase أسرع وأقوى من Render!
