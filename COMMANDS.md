# ⚡ أوامر سريعة - المسار الساخن

## 🚀 التشغيل السريع (خطوة واحدة)

### Windows PowerShell
```powershell
# نسخ ملفات البيئة وتشغيل Docker
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
docker-compose up -d

# متابعة السجلات
docker-compose logs -f
```

### Linux/Mac
```bash
# نسخ ملفات البيئة وتشغيل Docker
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker-compose up -d

# متابعة السجلات
docker-compose logs -f
```

---

## 🛠️ أوامر Docker

```bash
# تشغيل جميع الخدمات
docker-compose up -d

# إيقاف جميع الخدمات
docker-compose down

# إعادة تشغيل
docker-compose restart

# عرض السجلات
docker-compose logs -f

# عرض حالة الخدمات
docker-compose ps

# إيقاف وحذف الـ volumes (حذف البيانات)
docker-compose down -v

# إعادة بناء الصور
docker-compose build --no-cache
docker-compose up -d
```

---

## 💻 التشغيل المحلي

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### قواعد البيانات فقط (Windows PowerShell)
```powershell
# PostgreSQL
docker run -d `
  --name almasar-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=almasar `
  -p 5432:5432 `
  postgres:15-alpine

# Redis
docker run -d `
  --name almasar-redis `
  -p 6379:6379 `
  redis:7-alpine
```

### قواعد البيانات فقط (Linux/Mac)
```bash
# PostgreSQL
docker run -d \
  --name almasar-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=almasar \
  -p 5432:5432 \
  postgres:15-alpine

# Redis
docker run -d \
  --name almasar-redis \
  -p 6379:6379 \
  redis:7-alpine
```

---

## 🔍 فحص الخدمات

```bash
# التأكد من تشغيل PostgreSQL
docker exec -it almasar-postgres psql -U postgres -d almasar -c "SELECT version();"

# التأكد من تشغيل Redis
docker exec -it almasar-redis redis-cli ping

# التأكد من Backend
curl http://localhost:4000/api/users/me

# التأكد من Frontend
curl http://localhost:3000
```

---

## 🧪 اختبار API

### تسجيل دخول
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@elmasarelsa5en.com", "password": "Admin@123"}'
```

### الحصول على المستخدم الحالي
```bash
# استبدل YOUR_TOKEN بالـ token من الاستجابة أعلاه
curl http://localhost:4000/api/auth/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🗄️ إدارة قاعدة البيانات

### الدخول إلى PostgreSQL
```bash
docker exec -it almasar-postgres psql -U postgres -d almasar
```

### أوامر SQL مفيدة
```sql
-- عرض جميع الجداول
\dt

-- عرض المستخدمين
SELECT id, name, email, role FROM users;

-- عرض القنوات
SELECT id, type, name, status FROM channels;

-- عرض المحادثات
SELECT id, "externalThreadId", department, status FROM conversations;

-- الخروج
\q
```

### نسخ احتياطي للبيانات
```bash
docker exec almasar-postgres pg_dump -U postgres almasar > backup.sql
```

### استعادة من نسخة احتياطية
```bash
docker exec -i almasar-postgres psql -U postgres almasar < backup.sql
```

---

## 🧹 التنظيف

### حذف الحاويات والبيانات
```bash
docker-compose down -v
docker rm -f almasar-postgres almasar-redis
docker volume prune -f
```

### حذف الصور
```bash
docker rmi almasar-suite-backend almasar-suite-frontend
```

### تنظيف node_modules
```bash
# Windows PowerShell
Remove-Item -Recurse -Force backend/node_modules, frontend/node_modules

# Linux/Mac
rm -rf backend/node_modules frontend/node_modules
```

---

## 📱 إعداد تيليجرام للاختبار

### 1. إنشاء Bot
1. افتح [@BotFather](https://t.me/botfather)
2. أرسل `/newbot`
3. اتبع التعليمات واحصل على Token

### 2. تفعيل Webhook (Windows PowerShell)
```powershell
$TOKEN = "YOUR_BOT_TOKEN_HERE"
$URL = "https://your-domain.com/api/webhooks/telegram"

$body = @{url=$URL} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://api.telegram.org/bot$TOKEN/setWebhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### 2. تفعيل Webhook (Linux/Mac)
```bash
TOKEN="YOUR_BOT_TOKEN_HERE"
URL="https://your-domain.com/api/webhooks/telegram"

curl -X POST "https://api.telegram.org/bot$TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$URL\"}"
```

### 3. فحص الـ Webhook
```bash
curl "https://api.telegram.org/bot$TOKEN/getWebhookInfo"
```

---

## 🔐 تغيير Secrets (Production)

### 1. توليد JWT Secrets جديدة
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid))

# Linux/Mac
openssl rand -base64 32
```

### 2. تحديث .env
```bash
JWT_SECRET=YOUR_NEW_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_NEW_REFRESH_SECRET_HERE
```

---

## 📊 مراقبة الأداء

### عرض استخدام الموارد
```bash
docker stats
```

### عرض logs بفلاتر
```bash
# Backend فقط
docker-compose logs -f backend

# Frontend فقط
docker-compose logs -f frontend

# آخر 100 سطر
docker-compose logs --tail=100

# منذ وقت محدد
docker-compose logs --since="2024-01-01T00:00:00"
```

---

## 🌐 الوصول

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **API Docs (Swagger):** http://localhost:4000/api/docs
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

---

## 📞 حسابات الاختبار

```
البريد: admin@elmasarelsa5en.com
كلمة المرور: Admin@123
الدور: مدير النظام

البريد: sales@elmasarelsa5en.com
كلمة المرور: Sales@123
الدور: مبيعات

البريد: reservations@elmasarelsa5en.com
كلمة المرور: Reserve@123
الدور: حجوزات

البريد: accounting@elmasarelsa5en.com
كلمة المرور: Account@123
الدور: محاسبة
```

---

**💡 نصيحة:** احفظ هذا الملف في مكان سهل الوصول للرجوع إليه بسرعة!
