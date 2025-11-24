# نشر التطبيق على استضافة مجانية 🚀

## 📋 الخيارات المتاحة للاستضافة المجانية

### 1️⃣ Render.com (الأفضل - مُوصى به)
- ✅ مجاني 100%
- ✅ يدعم Node.js + PostgreSQL
- ✅ SSL مجاني
- ✅ سهل الاستخدام
- ⚠️ ينام بعد 15 دقيقة من عدم الاستخدام (يستيقظ تلقائياً)

### 2️⃣ Railway.app
- ✅ مجاني لأول 500 ساعة/شهر
- ✅ يدعم Node.js + PostgreSQL
- ✅ SSL مجاني

### 3️⃣ Vercel (للـ Frontend فقط)
- ✅ مجاني بلا حدود
- ✅ سريع جداً
- ❌ لا يدعم Backend (يحتاج Serverless)

---

## 🎯 الطريقة الموصى بها: Render.com

### خطوة 1: تجهيز المشروع

#### 1.1 إنشاء ملف `render.yaml` (موجود مسبقاً)
الملف موجود في المجلد الرئيسي ويحتوي على جميع الإعدادات.

#### 1.2 تحديث متغيرات البيئة
أنشئ ملف `.env.production` في مجلد `backend`:

```env
# Database (سيتم إنشاؤها تلقائياً في Render)
DATABASE_URL=postgresql://...

# Twilio (استخدم البيانات من ملف .env الخاص بك)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
TWILIO_TWIML_APP_SID=your_twiml_app_sid
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your-secret-key-here

# URLs (سيتم تحديثها بعد النشر)
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-app.onrender.com

# OpenAI (اختياري)
OPENAI_API_KEY=your-openai-key
```

---

### خطوة 2: رفع الكود على GitHub

إذا لم يكن الكود على GitHub بعد:

```powershell
cd "d:\social media\almasar-suite"

# Initialize git (إذا لم يكن موجود)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create repo on GitHub and push
# اذهب إلى github.com → New Repository
# ثم:
git remote add origin https://github.com/YOUR_USERNAME/almasar-suite.git
git branch -M main
git push -u origin main
```

---

### خطوة 3: نشر Backend على Render

#### 3.1 إنشاء حساب
1. اذهب إلى [render.com](https://render.com)
2. سجل دخول بحساب GitHub
3. اضغط **New +** → **Web Service**

#### 3.2 ربط GitHub Repo
1. اختر repo: `almasar-suite`
2. اسم الخدمة: `almasar-backend`
3. Region: **Singapore** (الأقرب للسعودية)
4. Branch: `main`
5. Root Directory: `backend`
6. Runtime: **Node**
7. Build Command: `npm install && npm run build`
8. Start Command: `npm run start:prod`

#### 3.3 إعداد Environment Variables
في Render Dashboard → Environment:
```
NODE_ENV=production
DATABASE_URL=[Auto from Render]
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
TWILIO_TWIML_APP_SID=your_twiml_app_sid
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
JWT_SECRET=your-random-secret-here
PORT=4000
```

#### 3.4 إضافة PostgreSQL Database
1. في Render Dashboard → **New +** → **PostgreSQL**
2. اسم: `almasar-db`
3. انسخ **Internal Database URL**
4. ألصقه في `DATABASE_URL` في Backend Environment Variables

#### 3.5 Deploy
اضغط **Create Web Service** وانتظر 5-10 دقائق

---

### خطوة 4: نشر Frontend على Vercel

#### 4.1 إنشاء حساب
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول بحساب GitHub
3. اضغط **Add New** → **Project**

#### 4.2 Import Project
1. اختر repo: `almasar-suite`
2. Framework Preset: **Next.js**
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `.next`

#### 4.3 Environment Variables
```
NEXT_PUBLIC_API_URL=https://almasar-backend.onrender.com
```

#### 4.4 Deploy
اضغط **Deploy** وانتظر 2-3 دقائق

---

### خطوة 5: تحديث Twilio Webhooks

بعد النشر، حدّث Webhooks في Twilio Console:

1. اذهب إلى [Twilio Console](https://console.twilio.com)
2. Phone Numbers → Manage → Active Numbers
3. اختر رقمك (+18154860356)
4. في **Voice & Fax**:
   - **A CALL COMES IN**: `https://your-backend.onrender.com/api/calls/webhook/inbound`
   - **Method**: `HTTP POST`

5. في **TwiML App** (AP1774964f...):
   - **Voice Request URL**: `https://your-backend.onrender.com/api/calls/twiml/outbound`
   - **Voice Status Callback URL**: `https://your-backend.onrender.com/api/calls/webhook/status`

---

## 📱 تطبيق موبايل كول (Electron)

### لا يمكن رفعه على استضافة!
تطبيق موبايل كول هو **تطبيق سطح مكتب** (Electron) ولا يمكن رفعه على استضافة ويب.

### الحلول:

#### ✅ الحل 1: توزيع كملف تنفيذي
```powershell
cd "d:\social media\almasar-suite\softphone"

# Build للـ Windows
npm run build:win

# سيُنشئ ملف .exe في مجلد dist/
# يمكنك مشاركته مع المستخدمين
```

#### ✅ الحل 2: استخدام الواجهة الويب فقط
- المستخدمون يستخدمون `https://your-app.vercel.app/unified-number`
- المكالمات تتم عبر المتصفح مباشرة (لا يحتاجون تطبيق منفصل)

#### ✅ الحل 3: Electron Forge + GitHub Releases
```powershell
# في مجلد softphone
npm install --save-dev @electron-forge/cli

# Initialize
npx electron-forge import

# Create installer
npm run make
```

---

## 🔄 التحديثات التلقائية

### بعد الربط بـ GitHub:

1. **Vercel**: يُحدّث تلقائياً عند `git push`
2. **Render**: يُحدّث تلقائياً عند `git push`

---

## ✅ الخطوات النهائية

### 1. اختبار Backend
```bash
curl https://your-backend.onrender.com/api/calls/stats
```

### 2. اختبار Frontend
افتح: `https://your-app.vercel.app`

### 3. اختبار المكالمات
1. اذهب إلى `https://your-app.vercel.app/unified-number`
2. اضغط "اتصال جديد"
3. أدخل رقم اختبار
4. اضغط "اتصال" ✅

---

## 📊 التكاليف

| الخدمة | التكلفة |
|--------|---------|
| **Render** (Backend) | مجاني (ينام بعد 15 دقيقة) |
| **Render** (PostgreSQL) | مجاني |
| **Vercel** (Frontend) | مجاني بلا حدود |
| **Twilio** | حسب الاستخدام (~$0.0085/دقيقة للسعودية) |
| **المجموع** | مجاني + تكلفة المكالمات فقط |

---

## 🎯 خطة النشر السريعة

```powershell
# 1. Push to GitHub
cd "d:\social media\almasar-suite"
git add .
git commit -m "Ready for deployment"
git push

# 2. Deploy Backend on Render
# → render.com → New Web Service → Connect GitHub

# 3. Deploy Frontend on Vercel
# → vercel.com → New Project → Import from GitHub

# 4. Update URLs
# في Backend .env: FRONTEND_URL=https://your-app.vercel.app
# في Frontend .env: NEXT_PUBLIC_API_URL=https://backend.onrender.com

# 5. Update Twilio Webhooks
# → console.twilio.com → Phone Numbers → Configure

# ✅ تم! 🎉
```

---

## 🆘 استكشاف الأخطاء

### Backend لا يعمل؟
- تحقق من Logs في Render Dashboard
- تأكد من DATABASE_URL صحيح
- تأكد من جميع Environment Variables موجودة

### Frontend لا يتصل بـ Backend؟
- تحقق من CORS في Backend (`main.ts`)
- تأكد من `NEXT_PUBLIC_API_URL` صحيح
- افتح Browser Console للأخطاء

### المكالمات لا تعمل؟
- تحقق من Twilio Webhooks
- تأكد من BACKEND_URL في Twilio يشير للـ production URL
- راجع Twilio Debugger في Console

---

🎉 **جاهز للنشر!** هل تريد المساعدة في أي خطوة محددة؟
