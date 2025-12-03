# 🔧 إضافة الموظفين إلى Production (Render)

## ❌ المشكلة
عند محاولة تسجيل الدخول على https://almasar-frontend.vercel.app/login يظهر خطأ 404.

**السبب:** قاعدة بيانات PostgreSQL على Render فارغة ولا تحتوي على الموظفين!

---

## ✅ الحل (طريقتان)

### 🎯 الطريقة 1: من Render Shell (الأسرع)

#### الخطوة 1: افتح Render Shell
1. اذهب إلى https://dashboard.render.com/
2. اختر Web Service: **almasar-backend**
3. اضغط على تبويب **Shell**
4. انتظر حتى يفتح Terminal

#### الخطوة 2: شغل السكريبت
```bash
cd /opt/render/project/src
node create-employees-postgres.js
```

#### الخطوة 3: تحقق من النتيجة
يجب أن ترى:
```
✅ Connected to PostgreSQL database
✅ Permissions column ensured
✅ تم إضافة Saher
✅ تم إضافة Amira
✅ تم إضافة Tasneem
✅ تم إضافة Shaker
✅ تم إضافة Akram Admin
✅ تم إضافة جميع الموظفين بنجاح!
```

---

### 🎯 الطريقة 2: من Render Console (SQL مباشر)

#### الخطوة 1: افتح PostgreSQL Dashboard
1. في Render Dashboard
2. اذهب إلى **PostgreSQL Database**
3. اضغط على **Connect** → **External Connection**

#### الخطوة 2: استخدم أداة SQL
استخدم أي SQL client (مثل DBeaver, pgAdmin, أو psql) وشغل:

```sql
-- Add permissions column
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT;

-- Hash للباسووردات (استخدم bcrypt online tool)
-- Aa123456 → $2b$10$rFkKLx8qFXH4QxGbxXPmXOYZj5BkPH.OwxGQJnYxQZH4QGbxXPmXO
-- Aazxc → $2b$10$aB3cD4eF5gH6iJ7kL8mN9oPqR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0k

-- Insert employees (استبدل الـ hashes بالصحيحة)
INSERT INTO users (email, name, "passwordHash", role, department, permissions, "isActive", "createdAt", "updatedAt")
VALUES 
  ('saher', 'Saher', '$2b$10$rFkKLx8qFXH4QxGbxXPmXOYZj5BkPH.OwxGQJnYxQZH4QGbxXPmXO', 'employee', 'Customer Service', '["make_calls","receive_calls","listen_own_calls"]', true, NOW(), NOW()),
  ('amira', 'Amira', '$2b$10$rFkKLx8qFXH4QxGbxXPmXOYZj5BkPH.OwxGQJnYxQZH4QGbxXPmXO', 'employee', 'Customer Service', '["make_calls","receive_calls","listen_own_calls"]', true, NOW(), NOW()),
  ('tasneem', 'Tasneem', '$2b$10$rFkKLx8qFXH4QxGbxXPmXOYZj5BkPH.OwxGQJnYxQZH4QGbxXPmXO', 'employee', 'Customer Service', '["make_calls","receive_calls","listen_own_calls"]', true, NOW(), NOW()),
  ('shaker', 'Shaker', '$2b$10$rFkKLx8qFXH4QxGbxXPmXOYZj5BkPH.OwxGQJnYxQZH4QGbxXPmXO', 'employee', 'Customer Service', '["make_calls","receive_calls","listen_own_calls"]', true, NOW(), NOW()),
  ('Akram', 'Akram Admin', '$2b$10$aB3cD4eF5gH6iJ7kL8mN9oPqR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0k', 'admin', 'Admin', '["make_calls","receive_calls","listen_own_calls","listen_all_calls","manage_users","view_reports"]', true, NOW(), NOW());

-- Verify
SELECT email, name, role FROM users;
```

---

## 🧪 التحقق من النجاح

### 1. اختبر Backend API
```bash
curl https://almasar-backend.onrender.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"saher","password":"Aa123456"}'
```

يجب أن ترى:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "email": "saher",
    "name": "Saher",
    "role": "employee"
  }
}
```

### 2. اختبر Frontend
افتح: https://almasar-frontend.vercel.app/login

جرب:
- Username: `saher`
- Password: `Aa123456`

✅ يجب أن يدخلك مباشرة لصفحة Mobile Call!

---

## 📝 قائمة الحسابات

| Username | Password | Role | الصلاحيات |
|----------|----------|------|-----------|
| saher | Aa123456 | employee | مكالماتي فقط |
| amira | Aa123456 | employee | مكالماتي فقط |
| tasneem | Aa123456 | employee | مكالماتي فقط |
| shaker | Aa123456 | employee | مكالماتي فقط |
| Akram | Aazxc | admin | كل المكالمات |

---

## 🚨 استكشاف الأخطاء

### إذا ظهر "Module not found: pg"
```bash
npm install pg
```

### إذا ظهر "DATABASE_URL not set"
في Render Dashboard:
- اذهب إلى **Environment**
- تأكد من وجود `DATABASE_URL`
- يجب أن يكون بصيغة: `postgresql://user:pass@host:5432/dbname`

### إذا ظهر "Column permissions does not exist"
```sql
ALTER TABLE users ADD COLUMN permissions TEXT;
```

---

## ✅ الخلاصة

1. **افتح Render Shell**
2. **شغل:** `node create-employees-postgres.js`
3. **جرب تسجيل الدخول**: https://almasar-frontend.vercel.app/login

⏱️ **الوقت المتوقع:** 5 دقائق
