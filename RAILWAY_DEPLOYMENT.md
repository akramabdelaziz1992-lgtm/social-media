# 🚂 دليل الرفع على Railway.app

## ✅ المميزات
- 💰 **$5/شهر فقط** (أول 500 ساعة مجاناً)
- 🔒 **Session ثابت** - WhatsApp مش هيقطع
- 👥 **Multi-user جاهز** - كل موظف يفتح من أي مكان
- 📦 **Database مجاني** - PostgreSQL + Redis
- ⚡ **سريع** - Deploy في دقائق
- 🌐 **Domain مجاني** - railway.app subdomain

---

## 📋 الخطوات

### 1️⃣ إنشاء حساب على Railway

1. افتح: https://railway.app
2. اضغط **Start a New Project**
3. سجل دخول بـ GitHub
4. اربط حساب GitHub بـ Railway

---

### 2️⃣ رفع الكود على GitHub (إذا لم تفعل)

```powershell
# في مجلد المشروع
cd "D:\social media\almasar-suite"

# Initialize Git (إذا لم يكن موجود)
git init

# إضافة الملفات
git add .
git commit -m "Initial commit for Railway deployment"

# إنشاء repository على GitHub
# افتح: https://github.com/new
# اسم المشروع: almasar-suite

# ربط بـ GitHub
git remote add origin https://github.com/YOUR_USERNAME/almasar-suite.git
git branch -M main
git push -u origin main
```

---

### 3️⃣ Deploy Backend على Railway

#### أ. إنشاء مشروع جديد:
1. في Railway Dashboard، اضغط **New Project**
2. اختر **Deploy from GitHub repo**
3. اختر repository: `almasar-suite`

#### ب. إضافة PostgreSQL Database:
1. اضغط **+ New** في المشروع
2. اختر **Database** → **PostgreSQL**
3. Railway سيُنشئ Database تلقائياً

#### ج. إضافة Redis (اختياري - لتحسين الأداء):
1. اضغط **+ New**
2. اختر **Database** → **Redis**

#### د. إعداد Backend Service:
1. في الـ Service اللي اتعمل، اضغط **Settings**
2. في **Root Directory**، اكتب: `backend`
3. في **Build Command**، اكتب: `npm install && npm run build`
4. في **Start Command**، اكتب: `npm run start:prod`

#### هـ. إضافة Environment Variables:
في **Variables** tab، أضف:

```bash
# Database (من PostgreSQL Service)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-production-2024
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-production-2024
JWT_REFRESH_EXPIRATION=30d

# Server
PORT=4000
NODE_ENV=production

# WhatsApp
WHATSAPP_SESSION_PATH=./.wwebjs_auth
WHATSAPP_WEBHOOK_URL=${{RAILWAY_PUBLIC_DOMAIN}}/webhooks/whatsapp

# OpenAI (إذا كان عندك)
OPENAI_API_KEY=your-openai-key-here

# Redis (إذا أضفت Redis)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}

# Multi-User Department Settings
ENABLE_DEPARTMENTS=true
DEPARTMENTS=حجوزات,مبيعات,محاسبة
DEFAULT_DEPARTMENT=مبيعات
```

#### و. تفعيل Public Domain:
1. في **Settings** → **Networking**
2. اضغط **Generate Domain**
3. احفظ الرابط (مثل: `backend-production-xxxx.up.railway.app`)

---

### 4️⃣ Deploy Frontend على Railway

#### أ. إنشاء Service جديد:
1. في نفس المشروع، اضغط **+ New**
2. اختر **GitHub Repo** → نفس الـ repo: `almasar-suite`

#### ب. إعداد Frontend Service:
1. في **Settings** → **Root Directory**: `frontend`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`

#### ج. إضافة Environment Variables:
```bash
# Backend URL (من Backend Service)
NEXT_PUBLIC_API_URL=${{backend.RAILWAY_PUBLIC_DOMAIN}}

NODE_ENV=production
```

#### د. تفعيل Public Domain:
1. **Settings** → **Networking** → **Generate Domain**
2. احفظ الرابط (مثل: `frontend-production-xxxx.up.railway.app`)

---

### 5️⃣ إنشاء المستخدمين الافتراضيين

بعد Deploy، نفّذ الأوامر دي في Railway CLI:

```bash
# تثبيت Railway CLI
npm install -g @railway/cli

# تسجيل دخول
railway login

# ربط بالمشروع
railway link

# تشغيل create-admin.js
railway run node backend/create-admin.js
```

أو استخدم Railway Web Terminal:
1. افتح Backend Service
2. اضغط على **Terminal** tab (أعلى اليمين)
3. شغّل الأمر:
```bash
node create-admin.js
```

---

## 👥 نظام توزيع الرسائل على الأقسام

النظام جاهز تلقائياً! كل موظف عنده:
- **القسم** (حجوزات / مبيعات / محاسبة)
- **الصلاحيات** (admin / supervisor / agent)
- **رسائله الخاصة** - بيشوف الرسائل اللي لقسمه بس

### الحسابات الافتراضية:

| البريد الإلكتروني | كلمة المرور | القسم | الدور |
|---|---|---|---|
| admin@elmasarelsa5en.com | Admin@123 | إدارة | مدير |
| sales@elmasarelsa5en.com | Sales@123 | مبيعات | موظف |
| reservations@elmasarelsa5en.com | Reserve@123 | حجوزات | موظف |
| accounting@elmasarelsa5en.com | Account@123 | محاسبة | موظف |

### إضافة موظفين جدد:
1. سجل دخول كـ **admin**
2. اذهب إلى **الموظفين** (`/employees`)
3. اضغط **+ إضافة موظف**
4. املأ البيانات:
   - الاسم
   - البريد الإلكتروني
   - الهاتف
   - **القسم**: حجوزات / مبيعات / محاسبة
   - **الدور**: مدير / مشرف / موظف
5. اضغط **حفظ**

---

## 🔗 WhatsApp Web Setup

بعد Deploy، لربط WhatsApp:

1. **افتح Frontend URL**:
   ```
   https://frontend-production-xxxx.up.railway.app/inbox
   ```

2. **امسح QR Code** من WhatsApp على موبايلك:
   - افتح WhatsApp
   - اذهب إلى **الإعدادات** → **الأجهزة المرتبطة**
   - اضغط **ربط جهاز**
   - امسح الـ QR Code

3. **خلاص!** WhatsApp شغال على Railway 24/7 ✅

---

## 🔧 إعدادات إضافية

### تفعيل Auto-Restart (في حالة توقف):
في Backend Service → **Settings** → **Deploy**:
```
Restart Policy: Always
Restart Policy Max Retries: 10
```

### إضافة Volume للـ Sessions (مهم جداً):
1. في Backend Service → **Settings** → **Volumes**
2. اضغط **+ Add Volume**
3. Mount Path: `/.wwebjs_auth`
4. Size: `1GB`

هذا يضمن أن WhatsApp Session مش هيتمسح أبداً!

---

## 💰 التكلفة

### Free Plan (أول 5 دولار مجاناً):
- ✅ 500 ساعة execution
- ✅ Database PostgreSQL مجاني
- ✅ Redis مجاني
- ✅ Domain مجاني

### Developer Plan ($5/شهر):
- ✅ Unlimited execution hours
- ✅ 8GB RAM
- ✅ 8vCPU
- ✅ Persistent Storage (لـ WhatsApp Sessions)

**التوصية**: استخدم Free Plan للتجربة، ثم Developer Plan للاستخدام الدائم.

---

## 🆘 حل المشاكل الشائعة

### 1. WhatsApp Session بيتمسح كل فترة
**الحل**: أضف Volume للـ `.wwebjs_auth` زي ما شرحنا فوق ☝️

### 2. Database Connection Error
**الحل**: تأكد من المتغيرات البيئية صح:
```bash
railway variables
```

### 3. Frontend مش بيتصل بـ Backend
**الحل**: تأكد من `NEXT_PUBLIC_API_URL` فيه رابط Backend الصحيح.

### 4. Build Failed
**الحل**: تأكد من:
- `Root Directory` صحيح (`backend` أو `frontend`)
- `package.json` موجود
- Dependencies كلها موجودة

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. افتح Railway Logs: في Service → **Deployments** → اضغط على آخر deployment → **View Logs**
2. تواصل مع Railway Support: https://railway.app/help
3. شيك الـ Documentation: https://docs.railway.app

---

## ✅ Checklist قبل الإطلاق

- [ ] Backend Service شغال
- [ ] Frontend Service شغال
- [ ] PostgreSQL Database متصل
- [ ] Environment Variables كلها موجودة
- [ ] Domain مفعّل للـ Backend و Frontend
- [ ] WhatsApp QR Code ممسوح
- [ ] Volume مضاف للـ `.wwebjs_auth`
- [ ] المستخدمين الافتراضيين اتعملوا
- [ ] Multi-user system شغال (اختبر بحساب حجوزات و مبيعات)

---

## 🎉 النتيجة

بعد ما تخلص الخطوات دي، هيكون عندك:

✅ **نظام AlMasar شغال على Railway 24/7**
✅ **WhatsApp متصل** بدون قطع
✅ **كل موظف يقدر يفتح من أي مكان** (مصر أو أي مكان)
✅ **تقسيم الرسائل حسب القسم** (حجوزات / مبيعات / محاسبة)
✅ **Database ثابت** - البيانات محفوظة
✅ **$5/شهر فقط** - أرخص من أي استضافة تانية

---

**جاهز للانطلاق! 🚀**
