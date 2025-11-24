# 🚀 خطوات النشر - جاهزة للتنفيذ الآن

## ✅ الكود جاهز ومحفوظ في Git

تم حفظ جميع التغييرات بنجاح! الآن بقي فقط رفعها على GitHub والنشر.

---

## 🔑 الخطوة 1: إنشاء GitHub Personal Access Token جديد

الـ token القديم منتهي، محتاج واحد جديد:

1. **افتح:** https://github.com/settings/tokens
2. اضغط **Generate new token** → **Generate new token (classic)**
3. **Note:** `almasar-deployment`
4. **Expiration:** 90 days
5. **Select scopes:**
   - ✅ `repo` (كل الصلاحيات)
   - ✅ `workflow`
6. اضغط **Generate token**
7. **انسخ الـ Token** (مثال: `ghp_xxxxxxxxxxxxx`)

### تحديث Git Remote:

افتح PowerShell واكتب:

```powershell
cd "d:\social media\almasar-suite"

# استبدل YOUR_NEW_TOKEN بالـ token الجديد
git remote set-url origin https://akramabdelaziz1992-lgtm:YOUR_NEW_TOKEN@github.com/akramabdelaziz1992-lgtm/social-media.git

# رفع الكود
git push origin main
```

**مثال:**
```powershell
git remote set-url origin https://akramabdelaziz1992-lgtm:ghp_abcd1234xyz@github.com/akramabdelaziz1992-lgtm/social-media.git
git push origin main
```

---

## 🎯 الخطوة 2: نشر Backend على Render.com

### أ) إنشاء PostgreSQL Database:

1. **افتح:** https://dashboard.render.com
2. اضغط **New +** → **PostgreSQL**
3. **Name:** `almasar-db`
4. **Database:** `almasar`
5. **User:** `almasar_user`
6. **Region:** `Singapore`
7. **Plan:** `Free`
8. اضغط **Create Database**
9. **⚠️ IMPORTANT:** بعد الإنشاء، انسخ **Internal Database URL** من الصفحة:
   ```
   postgresql://almasar_user:xxxxx@dpg-xxxxx-a.singapore-postgres.render.com/almasar
   ```

---

### ب) إنشاء Backend Web Service:

1. **في نفس الصفحة** → **New +** → **Web Service**
2. اضغط **Connect Repository** → اختر GitHub
3. اختر repo: `social-media`
4. **الإعدادات:**

| Setting | Value |
|---------|-------|
| **Name** | `almasar-backend` |
| **Region** | `Singapore` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | `Free` |

5. اضغط **Advanced** → **Add Environment Variable**

### Environment Variables للـ Backend:

انسخ كل واحدة من دي والصقها:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://almasar_user:xxxxx@dpg-xxxxx-a.singapore-postgres.render.com/almasar
JWT_SECRET=almasar-super-secret-jwt-key-2024-production
TWILIO_ACCOUNT_SID=<from_your_env_file>
TWILIO_AUTH_TOKEN=<from_your_env_file>
TWILIO_PHONE_NUMBER=<from_your_env_file>
TWILIO_TWIML_APP_SID=<from_your_env_file>
TWILIO_API_KEY=<from_your_env_file>
TWILIO_API_SECRET=<from_your_env_file>
```

**⚠️ مهم:** بدّل `DATABASE_URL` بالـ URL اللي نسخته من الخطوة السابقة!

6. اضغط **Create Web Service**
7. **انتظر 5-10 دقائق** حتى يكتمل الـ deployment
8. **احفظ الـ URL:** `https://almasar-backend.onrender.com`

---

## 🎨 الخطوة 3: نشر Frontend على Vercel.com

1. **افتح:** https://vercel.com/dashboard
2. اضغط **Add New...** → **Project**
3. **Import Git Repository:**
   - اضغط **Continue with GitHub**
   - اختر repo: `akramabdelaziz1992-lgtm/social-media`
4. **Configure Project:**

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

5. **Environment Variables:**

اضغط على **Environment Variables** وأضف:

```bash
NEXT_PUBLIC_API_URL=https://almasar-backend.onrender.com
```

**⚠️ مهم:** بدّل `almasar-backend` باسم الـ Backend service اللي عملته في Render!

6. اضغط **Deploy**
7. **انتظر 3-5 دقائق**
8. **احفظ الـ URL:** `https://almasar-suite.vercel.app` (أو حسب الاسم اللي اختاره)

---

## 📞 الخطوة 4: تحديث Twilio Webhooks

بعد ما الـ Backend يشتغل، حدّث الـ webhooks:

1. **افتح:** https://console.twilio.com/us1/develop/phone-numbers/manage/active
2. اضغط على رقمك: **+1 815 486 0356**
3. **في Voice Configuration:**

```
A CALL COMES IN: https://almasar-backend.onrender.com/api/calls/webhook/inbound
```
*(اختر HTTP POST)*

4. اضغط **Save**

### تحديث TwiML App:

1. **افتح:** https://console.twilio.com/us1/develop/voice/manage/twiml-apps
2. اضغط على App: `AP1774964f1009f2f8430d50b78a9afb0c`
3. **Voice Configuration:**

```
Voice Request URL: https://almasar-backend.onrender.com/api/calls/twiml/outbound
Voice Status Callback URL: https://almasar-backend.onrender.com/api/calls/webhook/status
```

4. اضغط **Save**

---

## ✅ الخطوة 5: اختبار التطبيق

### اختبار Backend:

```powershell
# افتح PowerShell واكتب:
curl https://almasar-backend.onrender.com/api/calls/stats
```

يجب أن يرجع JSON بدون أخطاء.

### اختبار Frontend:

1. افتح: `https://your-app.vercel.app`
2. سجل دخول
3. اذهب إلى **الرقم الموحد**
4. اضغط **اتصال جديد**
5. جرب مكالمة

---

## 📊 معلومات النشر النهائية

| الخدمة | الرابط | التكلفة |
|--------|--------|---------|
| **Backend** | `https://almasar-backend.onrender.com` | مجاني |
| **Frontend** | `https://your-app.vercel.app` | مجاني |
| **Database** | Render PostgreSQL | مجاني |
| **Twilio Calls** | حسب الاستخدام | ~$0.0085/دقيقة |

---

## 🔄 التحديثات المستقبلية

أي تعديل في الكود:

```powershell
cd "d:\social media\almasar-suite"
git add .
git commit -m "your update message"
git push origin main
```

**Render و Vercel** سيحدثوا تلقائياً! 🎉

---

## 🆘 إذا واجهت مشاكل

### Backend لا يشتغل:
1. افتح Render Dashboard → Service → **Logs**
2. شوف الأخطاء
3. تأكد من `DATABASE_URL` صحيح

### Frontend لا يتصل بـ Backend:
1. افتح Browser Console (F12)
2. شوف الأخطاء
3. تأكد من `NEXT_PUBLIC_API_URL` صحيح في Vercel

### المكالمات لا تشتغل:
1. افتح: https://console.twilio.com/us1/monitor/logs/debugger
2. شوف آخر محاولات المكالمات
3. تأكد من Webhooks URLs صحيحة

---

## 📱 ملاحظة عن تطبيق موبايل كول

تطبيق **موبايل كول** (Electron) **لا يمكن رفعه** على استضافة لأنه تطبيق سطح مكتب.

### الحلول:

#### ✅ الحل 1: استخدام الويب فقط
المستخدمون يستخدمون `https://your-app.vercel.app/unified-number` مباشرة

#### ✅ الحل 2: بناء ملف تنفيذي
```powershell
cd "d:\social media\almasar-suite\softphone"
npm install
npm run build:win
# سيُنشئ ملف .exe في dist/
```

يمكنك رفع الـ `.exe` على Google Drive أو Dropbox ومشاركته

---

🎉 **جاهز للنشر!** ابدأ من الخطوة 1 ⬆️
