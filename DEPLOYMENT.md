نشر المشروع — Vercel (Frontend) + Render (Backend + Postgres)
===============================================

الخُلاصة السريعة:
- نستخدم Vercel لاستضافة الواجهة (Next.js) وRender لخدمة الـ API (NestJS) مع قاعدة Postgres مُدارة.
- التعديلات في المستودع تُمكّن الـ backend من استخدام `DATABASE_URL` (Postgres) إن وُجد، وإلا يبقى على SQLite محليًا.

الخطوات المفصّلة:

1) تحضير حسابات الاستضافة
  - Vercel: https://vercel.com
  - Render: https://render.com

2) إنشاء قاعدة بيانات Postgres على Render
  - اذهب إلى Dashboard → New → PostgreSQL
  - اختَر خطة (hobby أو managed) ثم أنشئ الخدمة
  - انسخ قيمة `DATABASE_URL` من إعدادات DB (مثال: `postgres://user:pass@host:5432/dbname`)

3) إعداد المتغيرات البيئية على Render (Service for backend)
  - في لوحة Render، اضف Service جديد من نوع Web Service أو استخدم Deploy from GitHub
  - اضبط Environment to `Docker` (أو Node) واستخدم Dockerfile الموجود في `backend/Dockerfile`.
  - أضف متغيرات البيئة:
    - `DATABASE_URL` = (قيمة الـ Postgres)
    - `JWT_SECRET` = قيمة سرية طويلة
    - `NODE_ENV` = production
    - أي متغيرات أخرى يحتاجها مشروعك (REDIS_*، SMTP، الخ.)

4) إعداد Vercel للواجهة
  - في Vercel، انشئ مشروع جديد وربطه بالمستودع GitHub
  - أضف متغير بيئة في إعدادات المشروع:
    - `NEXT_PUBLIC_API_URL` = `https://your-backend-render-url` (عنوان خدمة الـ API بعد نشرها)

5) (اختياري) GitHub Actions — نشر تلقائي
  - يمكنك إعداد Actions لبناء ودفع التطبيقات، لكن Render وVercel يدعمان الربط المباشر مع GitHub وتلقّي Pushs لتفعيل النشر.

اختبار محلي سريع:
  - Backend (دون Postgres): سيعمل محلياً باستخدام SQLite كما كان سابقًا.
  - إن أردت تجربة Postgres محلياً، شغّل Postgres (Docker) ثم ضبط `.env`:
    - `DATABASE_URL=postgres://postgres:postgres@localhost:5432/almasar`

أوامر مفيدة محلياً:
```powershell
# بناء الواجهة
cd "d:\social media\almasar-suite\frontend"
npm run build

# بناء وتشغيل الخادم (Production)
cd "d:\social media\almasar-suite\backend"
npm run build
NODE_ENV=production node dist/main
```

ملاحظات أمنية وإجرائية:
- لا تضع `DATABASE_URL` أو `JWT_SECRET` في الريبو.
- في الإنتاج وضع `synchronize=false` (الكود يضبط ذلك تلقائياً طبقاً لـ `NODE_ENV`). استخدم migration scripts لإدارة تغييرات الـ schema.

إذا تريد، أطبّق هذه التعديلات الآن في المستودع وأنشئ ملف إعداد جاهز لـ Render (render.yaml) و/أو GitHub Actions تلقائي. قلّ لي أبدأ بـ "طبق الآن" وسأكمل التهيئة، ثم أطلب منك فقط لصق `DATABASE_URL` في إعدادات Render بعد الإنشاء.
