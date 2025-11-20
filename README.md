# المسار الساخن - مركز المحادثات الموحد

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 نظرة عامة

**المسار الساخن** هو منصة ويب احترافية لإدارة محادثات الأقسام عبر صندوق وارد موحد يدمج:
- 📱 واتساب (WhatsApp Business Cloud API)
- 💬 ماسنجر وإنستغرام (Facebook Graph API)
- ✈️ تيليجرام (Telegram Bot API)

### المزايا الرئيسية
- ✅ صندوق وارد موحد لجميع القنوات
- ✅ إدارة ذكية للمحادثات مع خصوصية كاملة لكل موظف
- ✅ ردود تلقائية ذكية حسب القواعد
- ✅ قوالب رسائل جاهزة مع وسائط
- ✅ كتالوج وسائط قابل للإدارة والإرسال
- ✅ تكامل مباشر مع الموقع الرسمي
- ✅ تقارير وتحليلات شاملة
- ✅ نظام صلاحيات متقدم (RBAC)

---

## 🏗️ البنية التقنية

### Frontend ✅
- **Next.js 16** (App Router) مع TypeScript ✅
- **Tailwind CSS** للتصميم مع الهوية البصرية الكاملة ✅
- **Zustand** لإدارة الحالة ✅
- **Socket.io Client** للتحديثات اللحظية (جاهز للتكامل) ✅
- **API Client** كامل مع جميع الـ endpoints ✅

### Backend ✅
- **NestJS** مع TypeScript ✅
- **TypeORM** + **PostgreSQL** لقاعدة البيانات ✅
- **Redis** + **BullMQ** للطوابير ✅
- **Socket.io** للاتصال الفوري (جاهز) ✅
- **JWT** + **RBAC** للمصادقة والصلاحيات ✅
- **Swagger/OpenAPI** للوثائق ✅

### Infrastructure ✅
- **Docker** و**Docker Compose** ✅
- **Dockerfile** للـ Frontend والـ Backend ✅
- **PostgreSQL 15** + **Redis 7** ✅
- **Environment configurations** جاهزة ✅

---

## ✨ ما تم إنجازه

### Backend (مكتمل بنسبة 80%)
- ✅ **Entities كاملة:** Users, Channels, Conversations, Messages, Templates, AutoReplyRules, AuditLogs
- ✅ **Auth Module:** تسجيل دخول، JWT، Refresh Tokens، RBAC
- ✅ **Users Module:** إدارة المستخدمين والصلاحيات
- ✅ **API Structure:** جاهزة لـ Conversations, Messages, Channels, Templates
- ⏳ **Webhooks:** بنية جاهزة (يحتاج تنفيذ WhatsApp/Telegram/Meta)
- ⏳ **Socket.io Gateway:** بنية جاهزة (يحتاج تكامل)
- ⏳ **Storage Service:** جاهز للتكامل مع S3

### Frontend (مكتمل بنسبة 70%)
- ✅ **صفحة Login:** تصميم كامل مع الهوية البصرية
- ✅ **صفحة Inbox:** صندوق وارد موحد مع قائمة المحادثات
- ✅ **Tailwind + RTL:** تصميم عربي كامل
- ✅ **API Client:** جاهز مع جميع الـ endpoints
- ✅ **Zustand Store:** إدارة حالة المصادقة
- ⏳ **صفحة Admin:** لوحة التحكم (قريبًا)
- ⏳ **صفحة Catalog:** إدارة الوسائط (قريبًا)
- ⏳ **Socket.io Integration:** للتحديثات الفورية (قريبًا)

### Infrastructure (مكتمل 100%)
- ✅ **Docker Compose:** جاهز للتشغيل الفوري
- ✅ **Environment Files:** نماذج كاملة
- ✅ **Documentation:** README لكل جزء

---

## 🚀 التشغيل السريع

### المتطلبات الأساسية
- Node.js 20+
- Docker & Docker Compose
- npm أو yarn

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd almasar-suite
```

### 2. إعداد المتغيرات البيئية

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# قم بتعديل القيم حسب بيئتك
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
# قم بتعديل القيم حسب بيئتك
```

### 3. التشغيل باستخدام Docker Compose (موصى به)
```bash
# من المجلد الجذري
docker-compose up -d

# تتبع السجلات
docker-compose logs -f
```

الآن يمكنك الوصول إلى:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api

### 4. التشغيل المحلي (للتطوير)

#### تشغيل Backend
```bash
cd backend
npm install
npm run start:dev
```

#### تشغيل Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 المستخدمون الافتراضيون

| البريد الإلكتروني | كلمة المرور | الدور |
|---|---|---|
| admin@elmasarelsa5en.com | Admin@123 | admin |
| sales@elmasarelsa5en.com | Sales@123 | sales |
| reservations@elmasarelsa5en.com | Reserve@123 | reservations |
| accounting@elmasarelsa5en.com | Account@123 | accounting |

---

## 📡 إعداد القنوات

### تيليجرام (للبدء السريع)

1. **إنشاء Bot:**
   - تحدث مع [@BotFather](https://t.me/botfather) على تيليجرام
   - أرسل `/newbot` واتبع الإرشادات
   - احفظ الـ Token

2. **تفعيل Webhook:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhooks/telegram"}'
```

3. **إضافة في النظام:**
   - سجل دخول كمدير
   - اذهب إلى "إدارة القنوات"
   - أضف قناة جديدة من نوع Telegram
   - أدخل الـ Token

### واتساب (WhatsApp Business Cloud API)

1. **إنشاء حساب Facebook Developer:**
   - اذهب إلى [developers.facebook.com](https://developers.facebook.com)
   - أنشئ تطبيقًا جديدًا من نوع "Business"

2. **إعداد WhatsApp:**
   - فعّل منتج WhatsApp
   - احصل على Phone Number ID و Access Token
   - أضف Webhook URL: `https://your-domain.com/webhooks/whatsapp`

3. **التكوين:**
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
```

### ماسنجر وإنستغرام

1. **ربط صفحة Facebook:**
   - في Facebook Developer Console
   - فعّل Messenger API
   - اشترك في صفحتك
   - احصل على Page Access Token

2. **Webhook Subscription:**
```
URL: https://your-domain.com/webhooks/meta
Verify Token: <YOUR_VERIFY_TOKEN>
```

---

## 📊 هيكل المشروع

```
almasar-suite/
├── frontend/                 # تطبيق Next.js
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── inbox/
│   │   ├── admin/
│   │   └── catalog/
│   ├── components/
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── store/
│   └── styles/
├── backend/                  # تطبيق NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── channels/
│   │   │   ├── conversations/
│   │   │   ├── messages/
│   │   │   ├── templates/
│   │   │   ├── auto-reply/
│   │   │   └── webhooks/
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   └── config/
│   └── test/
├── infra/
│   ├── docker-compose.yml
│   └── nginx.conf
└── README.md
```

---

## 🔄 دورة عمل المحادثة

1. **الاستقبال:** رسالة واردة من أي قناة → Webhook
2. **المعالجة:** إنشاء/تحديث Conversation وإضافة Message
3. **التوجيه:** تعيين تلقائي حسب القسم أو يدوي
4. **الرد الذكي:** تحقق من قواعد الرد التلقائي
5. **التفاعل:** الموظف يتلقى إشعارًا فوريًا ويرد
6. **الإرسال:** تحويل الرد إلى تنسيق القناة → API الخارجي
7. **التحديث:** Socket.io ينقل الحالة لجميع العملاء

---

## 🛡️ الأمان

- ✅ JWT مع Refresh Tokens
- ✅ RBAC على مستوى المحادثات
- ✅ Audit Logs لكل إجراء
- ✅ تشفير كلمات المرور (bcrypt)
- ✅ CORS محدود
- ✅ Rate Limiting
- ✅ Validation على جميع المدخلات

---

## 📈 التقارير المتاحة

- عدد المحادثات لكل موظف/قسم
- زمن الرد الأول (First Response Time)
- معدلات التحويل بين الأقسام
- إحصائيات القنوات
- تقارير الرسائل التلقائية

---

## 🧪 الاختبار

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e
npm run test:cov

# Frontend tests
cd frontend
npm run test
```

---

## 📦 النشر (Production)

### باستخدام Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### على خادم VPS
1. تثبيت المتطلبات (Node.js, PostgreSQL, Redis, Nginx)
2. بناء التطبيقات:
```bash
cd backend && npm run build
cd frontend && npm run build
```
3. إعداد PM2 للـ backend
4. إعداد Nginx كوكيل عكسي
5. تفعيل SSL (Let's Encrypt)

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License.

---

## 📞 الدعم والتواصل

- **الموقع الرسمي:** [www.elmasarelsa5en.com](https://www.elmasarelsa5en.com)
- **البريد الإلكتروني:** support@elmasarelsa5en.com

---

## 🙏 شكر وتقدير

تم بناء هذا النظام باستخدام أفضل الممارسات والتقنيات الحديثة لضمان:
- الأداء العالي
- قابلية التوسع
- سهولة الصيانة
- تجربة مستخدم ممتازة

---

**صُنع بـ 💜 من فريق المسار الساخن**
