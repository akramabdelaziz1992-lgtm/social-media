# 🔧 حل مشكلة إضافة الموظفين (401 & 404)

## المشكلة

```
401 Unauthorized - Token غير صالح أو منتهي
404 Not Found - Endpoint /api/users غير موجود
```

---

## ✅ الحلول

### 1️⃣ إعادة Deploy Backend على Render

**السبب**: Render Backend قديم ولا يحتوي على آخر التحديثات

**الخطوات**:

1. اذهب إلى: https://dashboard.render.com/
2. اختر الـ **Backend Service**: `almasar-backend`
3. اضغط **Manual Deploy** → **Deploy latest commit**
4. انتظر 3-5 دقائق حتى ينتهي الـ Deploy
5. تحقق من الـ Logs: يجب أن ترى:
   ```
   [Nest] INFO [RoutesResolver] UsersController {/api/users}
   ```

---

### 2️⃣ التأكد من صلاحيات Admin

**المشكلة**: لازم تكون مسجل دخول كـ **Admin** علشان تقدر تضيف موظفين

**الحل**:

#### الطريقة 1: استخدام Admin موجود
1. سجل دخول بحساب Admin
2. البيانات الافتراضية:
   - **Email**: `admin@almasar.com`
   - **Password**: `Admin@123`

#### الطريقة 2: إنشاء Admin جديد
إذا لم يكن لديك حساب Admin، استخدم هذا الكود:

**Backend على localhost**:
```powershell
cd "d:\social media\almasar-suite\backend"
npm run start:dev
```

ثم في terminal آخر:
```powershell
cd "d:\social media\almasar-suite\backend"
node create-admin.js
```

أو يدوياً عبر SQL:
```sql
-- على Render Dashboard → Database → Query
UPDATE users 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL@example.com';
```

---

### 3️⃣ تحديث Token

**المشكلة**: الـ Token قد يكون منتهي

**الحل**:
1. **سجل خروج** من التطبيق
2. **سجل دخول مرة أخرى**
3. جرب إضافة موظف

---

### 4️⃣ التحقق من Environment Variables على Render

تأكد من وجود:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

---

## 🧪 اختبار الحل

بعد إعادة Deploy:

### 1. اختبر الـ Backend مباشرة:

```bash
curl https://almasar-backend.onrender.com/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. من التطبيق:

1. اذهب إلى: https://almasar-frontend.vercel.app/employees
2. سجل دخول كـ Admin
3. اضغط **+ إضافة موظف**
4. أدخل البيانات:
   - **الاسم**: أحمد محمد
   - **البريد**: ahmad@test.com
   - **كلمة المرور**: Test@123
   - **الهاتف**: +966501234567
   - **القسم**: مبيعات
   - **الدور**: موظف
5. اختر **الصلاحيات**:
   - ✅ عرض المحادثات
   - ✅ 🎧 سماع مكالماتي
6. اضغط **إضافة**

---

## 📊 Render Logs - ما تبحث عنه

**Logs الصحيحة** (بعد Deploy):

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] UsersModule dependencies initialized
[Nest] INFO [RoutesResolver] UsersController {/api/users}:
[Nest] INFO [RouterExplorer] Mapped {/api/users, POST} route
[Nest] INFO [RouterExplorer] Mapped {/api/users, GET} route
[Nest] INFO [RouterExplorer] Mapped {/api/users/:id, PUT} route
[Nest] INFO [RouterExplorer] Mapped {/api/users/:id, DELETE} route
```

**Logs خاطئة** (Backend قديم):

```
[Nest] ERROR [RoutesResolver] Cannot find module 'UsersModule'
```

---

## 🔄 خطوات الحل السريعة

```bash
# 1. Push آخر تحديثات (done already ✅)
git push origin main

# 2. Re-deploy على Render
# اذهب لـ Render Dashboard → Manual Deploy

# 3. Wait للـ Deploy (3-5 دقائق)

# 4. Test
# سجل دخول كـ Admin → Employees → Add
```

---

## ✅ Checklist

- [ ] Backend re-deployed على Render
- [ ] Logs تظهر `UsersController {/api/users}`
- [ ] مسجل دخول كـ **Admin**
- [ ] Token جديد (سجل خروج ودخول)
- [ ] جرب إضافة موظف

---

## 💡 ملاحظة مهمة

**Render Free Tier** قد يأخذ وقت أطول في أول request بعد Deploy (cold start).

إذا استمرت المشكلة، جرب:
1. انتظر 30 ثانية بعد Deploy
2. افتح Backend URL مباشرة: https://almasar-backend.onrender.com
3. ثم جرب إضافة موظف

---

**آخر تحديث**: ديسمبر 2025  
**Commit**: 9dddf32
