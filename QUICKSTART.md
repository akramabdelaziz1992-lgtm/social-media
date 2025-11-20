# 🚀 دليل التشغيل السريع - المسار الساخن

## المتطلبات الأساسية

تأكد من تثبيت:
- ✅ Node.js 20 أو أحدث
- ✅ Docker & Docker Compose (للتشغيل الكامل)
- ✅ npm أو yarn

---

## ⚡ التشغيل السريع مع Docker (موصى به)

### 1. نسخ ملفات البيئة
```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env.local
cd ..
```

### 2. تشغيل جميع الخدمات
```bash
docker-compose up -d
```

### 3. الوصول للتطبيق
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **API Docs:** http://localhost:4000/api/docs

### 4. إيقاف الخدمات
```bash
docker-compose down
```

---

## 💻 التشغيل المحلي (للتطوير)

### تشغيل قاعدة البيانات

#### Windows (PowerShell)
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

#### Linux/Mac (Bash)
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

### تشغيل Backend
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

### تشغيل Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 👤 حسابات التجربة

| البريد الإلكتروني | كلمة المرور | الدور |
|-------------------|-------------|--------|
| admin@elmasarelsa5en.com | Admin@123 | مدير النظام |
| sales@elmasarelsa5en.com | Sales@123 | مبيعات |
| reservations@elmasarelsa5en.com | Reserve@123 | حجوزات |
| accounting@elmasarelsa5en.com | Account@123 | محاسبة |

---

## 🔧 إعداد تيليجرام (للاختبار السريع)

### 1. إنشاء Bot
1. افتح [@BotFather](https://t.me/botfather) على تيليجرام
2. أرسل `/newbot`
3. اتبع التعليمات واحصل على الـ Token

### 2. تفعيل Webhook (Windows PowerShell)
```powershell
$TOKEN = "YOUR_BOT_TOKEN"
$URL = "https://your-domain.com/api/webhooks/telegram"

Invoke-RestMethod -Uri "https://api.telegram.org/bot$TOKEN/setWebhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{url=$URL} | ConvertTo-Json)
```

### 3. إضافة في النظام
1. سجل دخول كمدير
2. اذهب إلى "إدارة القنوات"
3. أضف قناة جديدة من نوع Telegram
4. أدخل الـ Token

---

## 📋 الاختبار

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🐛 حل المشاكل الشائعة

### مشكلة: Backend لا يتصل بقاعدة البيانات
**الحل:**
```bash
# تأكد من تشغيل PostgreSQL
docker ps | grep postgres

# إعادة تشغيل الحاوية
docker restart almasar-postgres
```

### مشكلة: Frontend يعرض خطأ API
**الحل:**
1. تأكد من تشغيل Backend على http://localhost:4000
2. تحقق من `.env.local` أن `NEXT_PUBLIC_API_URL` صحيح
3. افتح http://localhost:4000/api/docs للتأكد من عمل API

### مشكلة: لا يمكن تسجيل الدخول
**الحل:**
1. تأكد من إنشاء المستخدمين الافتراضيين
2. استخدم البريد `admin@elmasarelsa5en.com` وكلمة المرور `Admin@123`
3. تحقق من logs الـ Backend:
```bash
docker logs almasar-backend
```

---

## 📚 الوثائق الإضافية

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](http://localhost:4000/api/docs) (بعد التشغيل)

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء فرع للميزة
3. Commit التغييرات
4. فتح Pull Request

---

## 📞 الدعم

- **الموقع:** [www.elmasarelsa5en.com](https://www.elmasarelsa5en.com)
- **البريد:** support@elmasarelsa5en.com

---

**صُنع بـ 💜 من فريق المسار الساخن**
