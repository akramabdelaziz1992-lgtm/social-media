# 🚀 نشر التطبيق على Railway (أسهل من Render)

## لماذا Railway؟
- ✅ واجهة أسهل بكتير
- ✅ PostgreSQL Database مدمج مع GUI
- ✅ Deploy تلقائي من GitHub
- ✅ مجاني للبداية ($5 كريديت مجاني شهرياً)
- ✅ أسرع من Render

---

## الخطوات (10 دقائق فقط!)

### 1️⃣ إنشاء حساب على Railway

1. افتح: https://railway.app
2. اضغط **Login** → اختر **Login with GitHub**
3. وافق على الصلاحيات

---

### 2️⃣ إنشاء Project جديد

1. اضغط **New Project**
2. اختر **Deploy from GitHub repo**
3. اختر الريبو: `akramabdelaziz1992-lgtm/social-media`
4. اختار المجلد: `backend`

---

### 3️⃣ إضافة PostgreSQL Database

1. في نفس الـ Project، اضغط **+ New**
2. اختر **Database** → **Add PostgreSQL**
3. انتظر حتى يتم إنشاء الـ Database (دقيقة واحدة)

---

### 4️⃣ ضبط Environment Variables

1. اضغط على **backend service**
2. اضغط على تاب **Variables**
3. أضف المتغيرات دي:

```env
NODE_ENV=production
PORT=4000

# Database (هيتملى تلقائياً من PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Frontend URL
FRONTEND_URL=https://almasar-frontend.vercel.app

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_REFRESH_EXPIRATION=7d

# Twilio (استبدل بقيمك الخاصة)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_SAUDI_CALLER_ID=+966xxxxxxxxx
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_twilio_api_secret_here

# OpenAI (اختياري)
OPENAI_API_KEY=sk-proj-your-openai-key-here
AI_MODEL=gpt-3.5-turbo
AI_ENABLED=false
```

4. اضغط **Add** بعد كل متغير

---

### 5️⃣ ضبط Build Command

1. في **Settings** → **Build**
2. **Root Directory**: `/backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `node dist/main.js`

---

### 6️⃣ الحصول على Backend URL

1. انتظر حتى ينتهي الـ Deploy (2-3 دقائق)
2. بعد النجاح، هتلاقي URL زي:
   ```
   https://almasar-backend-production.up.railway.app
   ```
3. انسخ الـ URL ده

---

### 7️⃣ تحديث Frontend على Vercel

1. افتح: https://vercel.com/dashboard
2. اختار: `almasar-frontend`
3. اضغط **Settings** → **Environment Variables**
4. غير `NEXT_PUBLIC_API_URL` لـ:
   ```
   https://almasar-backend-production.up.railway.app
   ```
5. اضغط **Save**
6. في تاب **Deployments**، اضغط **Redeploy**

---

### 8️⃣ إضافة الموظفين في Railway Database

1. في Railway Dashboard، اضغط على **Postgres**
2. اضغط على تاب **Data**
3. اضغط **Query** وشغل السكريبت ده:

```sql
-- إضافة الموظفين الـ 5
INSERT INTO users (id, name, username, email, "passwordHash", role, department, "isActive", permissions, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Saher', 'saher', 'saher@company.com', '$2b$10$rZ1X8JxGZqF9YK1jXnJ9/.vQNqXHZJ4xGZqF9YK1jXnJ9/.vQNqXH', 'employee', 'sales', true, '["make_calls","receive_calls","listen_own_calls"]', NOW(), NOW()),
  
  (gen_random_uuid(), 'Amira', 'amira', 'amira@company.com', '$2b$10$rZ1X8JxGZqF9YK1jXnJ9/.vQNqXHZJ4xGZqF9YK1jXnJ9/.vQNqXH', 'employee', 'sales', true, '["make_calls","receive_calls","listen_own_calls"]', NOW(), NOW()),
  
  (gen_random_uuid(), 'Tasneem', 'tasneem', 'tasneem@company.com', '$2b$10$rZ1X8JxGZqF9YK1jXnJ9/.vQNqXHZJ4xGZqF9YK1jXnJ9/.vQNqXH', 'employee', 'sales', true, '["make_calls","receive_calls","listen_own_calls"]', NOW(), NOW()),
  
  (gen_random_uuid(), 'Shaker', 'shaker', 'shaker@company.com', '$2b$10$rZ1X8JxGZqF9YK1jXnJ9/.vQNqXHZJ4xGZqF9YK1jXnJ9/.vQNqXH', 'employee', 'sales', true, '["make_calls","receive_calls","listen_own_calls"]', NOW(), NOW()),
  
  (gen_random_uuid(), 'Akram Admin', 'Akram', 'akram@company.com', '$2b$10$EwJ5cZ8QwHxGZqF9YK1jXnJ9/.vQNqXHZJ4xGZqF9YK1jXnJ9/.vQ', 'admin', 'management', true, '["make_calls","receive_calls","listen_own_calls","listen_all_calls","manage_users","view_reports"]', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
```

4. اضغط **Run Query**

---

### 9️⃣ تسجيل الدخول

افتح: https://almasar-frontend.vercel.app/login

**الموظفين:**
- Username: `saher` - Password: `Aa123456`
- Username: `amira` - Password: `Aa123456`
- Username: `tasneem` - Password: `Aa123456`
- Username: `shaker` - Password: `Aa123456`

**المدير:**
- Username: `Akram` - Password: `Aazxc`

---

## ✅ تم!

دلوقتي التطبيق شغال على:
- 🎯 Backend: Railway (أسرع وأسهل)
- 🌐 Frontend: Vercel
- 💾 Database: PostgreSQL على Railway

كل حاجة واضحة ومافيش تعقيد! 🚀

---

## 💡 مميزات Railway

1. **Database GUI** - تقدر تشوف وتعدل البيانات بسهولة
2. **Logs واضحة** - تشوف أي خطأ فوراً
3. **Deploy سريع** - أسرع من Render بكتير
4. **Metrics** - تشوف استهلاك السيرفر
5. **Variable References** - الـ Database URL بيتربط تلقائياً

---

## 🆘 لو حصلت مشكلة

1. **Backend مش شغال؟**
   - شوف الـ Logs في Railway Dashboard
   - تأكد إن `DATABASE_URL` مربوط صح

2. **Frontend مش بيتصل؟**
   - تأكد إن الـ URL صح في Vercel Environment Variables
   - عمل Redeploy للـ Frontend

3. **Login مش شغال؟**
   - تأكد إن السكريبت اتنفذ في Database
   - شوف الـ users table في Railway Data tab
