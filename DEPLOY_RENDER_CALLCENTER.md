# 🚀 دليل النشر على Render - لينك كول مركز الاتصالات

## الخطوات السريعة للنشر

### 1️⃣ إنشاء حساب على Render

1. اذهب إلى: https://render.com
2. سجل دخول بحساب GitHub الخاص بك
3. اربط repository: `akramabdelaziz1992-lgtm/social-media`

---

### 2️⃣ نشر Backend

#### الخطوة 1: إنشاء Web Service
```
Dashboard → New → Web Service
```

#### الخطوة 2: الإعدادات الأساسية
- **Name**: `linkcall-backend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: اتركه فارغاً
- **Runtime**: Node
- **Build Command**: 
  ```bash
  cd backend && npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  cd backend && npm run start:prod
  ```

#### الخطوة 3: Environment Variables
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=[سيتم إنشاؤه تلقائياً]
JWT_SECRET=[أدخل مفتاح سري قوي]
JWT_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=[أدخل من حساب Twilio]
TWILIO_AUTH_TOKEN=[أدخل من حساب Twilio]
TWILIO_API_KEY=[أدخل من حساب Twilio]
TWILIO_API_SECRET=[أدخل من حساب Twilio]
TWILIO_PHONE_NUMBER=+13204336644
TWILIO_CALLER_ID=+966555254915
```

#### الخطوة 4: النشر
- اضغط **Create Web Service**
- انتظر حتى يكتمل البناء (5-10 دقائق)

---

### 3️⃣ نشر Frontend

#### الخطوة 1: إنشاء Web Service جديد
```
Dashboard → New → Web Service
```

#### الخطوة 2: الإعدادات الأساسية
- **Name**: `linkcall-frontend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: اتركه فارغاً
- **Runtime**: Node
- **Build Command**: 
  ```bash
  cd frontend && npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  cd frontend && npm start
  ```

#### الخطوة 3: Environment Variables
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=[URL الـ Backend من الخطوة السابقة]
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=[أدخل من حساب Twilio]
```

**مثال على NEXT_PUBLIC_API_URL**:
```
https://linkcall-backend.onrender.com
```

#### الخطوة 4: النشر
- اضغط **Create Web Service**
- انتظر حتى يكتمل البناء (5-10 دقائق)

---

### 4️⃣ إنشاء قاعدة البيانات (اختياري)

إذا كنت تريد استخدام PostgreSQL بدلاً من SQLite:

#### الخطوة 1: إنشاء PostgreSQL Database
```
Dashboard → New → PostgreSQL
```

#### الخطوة 2: الإعدادات
- **Name**: `linkcall-db`
- **Database Name**: `linkcall_callcenter`
- **User**: `linkcall_user`
- **Region**: Oregon (US West)
- **Plan**: Free

#### الخطوة 3: ربط Backend بقاعدة البيانات
- انسخ **Internal Database URL**
- ضعه في `DATABASE_URL` في إعدادات Backend

---

## 🔧 إعدادات Twilio للنشر

### Webhooks Configuration

بعد نشر Backend، قم بتحديث Twilio Webhooks:

#### Voice Webhooks
```
Voice URL: https://linkcall-backend.onrender.com/api/calls/voice
Fallback URL: https://linkcall-backend.onrender.com/api/calls/fallback
Status Callback: https://linkcall-backend.onrender.com/api/calls/status
```

#### TwiML App
```
Voice Request URL: https://linkcall-backend.onrender.com/api/calls/twiml
Voice Fallback URL: https://linkcall-backend.onrender.com/api/calls/fallback
```

---

## ✅ التحقق من النشر

### 1. اختبر Backend API
```bash
curl https://linkcall-backend.onrender.com/api/health
```

يجب أن تحصل على:
```json
{
  "status": "ok",
  "timestamp": "2025-12-02T..."
}
```

### 2. اختبر Frontend
افتح في المتصفح:
```
https://linkcall-frontend.onrender.com
```

### 3. اختبر المكالمات
- اذهب لصفحة Call Center
- اضغط زر "اتصل"
- يجب أن تتمكن من إجراء مكالمة

---

## 📊 الروابط النهائية

بعد النشر الناجح، ستحصل على:

- **Frontend**: `https://linkcall-frontend.onrender.com`
- **Backend API**: `https://linkcall-backend.onrender.com`
- **API Docs**: `https://linkcall-backend.onrender.com/api`

---

## 🔄 التحديثات التلقائية

Render سيقوم تلقائياً بإعادة النشر عند:
- Push جديد على branch `main`
- تغيير في Environment Variables
- إعادة نشر يدوية

---

## 💰 الأسعار

### Free Plan (مجاني)
- ✅ 750 ساعة شهرياً
- ✅ SSL مجاني
- ✅ نطاق onrender.com
- ⚠️ قد ينام بعد 15 دقيقة من عدم النشاط

### Starter Plan ($7/شهر)
- ✅ 24/7 uptime
- ✅ نطاق مخصص
- ✅ أداء أفضل
- ✅ لا نوم

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: Build Failed
**الحل**: تحقق من:
- Build Command صحيح
- جميع الحزم مثبتة في package.json
- لا يوجد أخطاء في الكود

### المشكلة 2: Database Connection Error
**الحل**: تحقق من:
- DATABASE_URL صحيح
- قاعدة البيانات نشطة
- Migrations تم تشغيلها

### المشكلة 3: Twilio Not Working
**الحل**: تحقق من:
- جميع متغيرات Twilio موجودة
- Webhooks محدثة بالروابط الجديدة
- Account SID صحيح

### المشكلة 4: CORS Errors
**الحل**: تحقق من:
- NEXT_PUBLIC_API_URL صحيح في Frontend
- Backend يسمح بـ CORS من نطاق Frontend

---

## 📱 Custom Domain (اختياري)

لإضافة نطاق مخصص:

1. اذهب لإعدادات Service
2. اضغط **Add Custom Domain**
3. أدخل نطاقك: `callcenter.yourdomain.com`
4. أضف DNS Record:
   ```
   Type: CNAME
   Name: callcenter
   Value: linkcall-frontend.onrender.com
   ```

---

## 🎉 انتهى!

تطبيق **لينك كول - مركز الاتصالات** الآن على الإنترنت! 🚀

### الخطوات التالية:
1. ✅ اختبر جميع الميزات
2. ✅ أضف مستخدمين
3. ✅ اضبط إعدادات Twilio
4. ✅ ابدأ باستقبال المكالمات!

---

**💡 نصيحة**: احفظ جميع URLs و Environment Variables في مكان آمن!
