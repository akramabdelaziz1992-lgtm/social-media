# ✅ Production Deployment Checklist

## المرحلة 1: الإعداد (5 دقائق)

- [ ] قرأت `WHATSAPP_PRODUCTION_SETUP.md`
- [ ] عندي حساب على Render.com
- [ ] عندي حساب على Vercel.com ✅ (موجود)
- [ ] عندي Access Token من Meta ✅ (موجود)
- [ ] نسخت محتويات `backend/.env.production`

---

## المرحلة 2: Backend على Render (15 دقيقة)

### PostgreSQL Database
- [ ] أنشأت PostgreSQL Database على Render
- [ ] Database Name: `almasar-database`
- [ ] Region: Frankfurt
- [ ] Plan: Free
- [ ] نسخت Internal Database URL

### Web Service
- [ ] أنشأت Web Service على Render
- [ ] Name: `almasar-backend`
- [ ] Region: Frankfurt
- [ ] Root Directory: `almasar-suite/backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:prod`

### Environment Variables
- [ ] NODE_ENV=production
- [ ] PORT=10000
- [ ] DATABASE_URL=<من PostgreSQL>
- [ ] JWT_SECRET=<غيّرته>
- [ ] JWT_REFRESH_SECRET=<غيّرته>
- [ ] WHATSAPP_PHONE_NUMBER_ID=931180146738368
- [ ] WHATSAPP_PHONE_NUMBER=966555254915
- [ ] WHATSAPP_ACCESS_TOKEN=<من .env>
- [ ] WHATSAPP_VERIFY_TOKEN=almasar_webhook_secret_2024
- [ ] WHATSAPP_API_VERSION=v21.0
- [ ] WHATSAPP_BUSINESS_ACCOUNT_ID=1986298265488975
- [ ] META_PAGE_ACCESS_TOKEN=<نفس WhatsApp Token>
- [ ] META_VERIFY_TOKEN=almasar_meta_webhook_2024
- [ ] META_API_VERSION=v21.0

### Deploy & Test
- [ ] Deploy نجح بدون أخطاء
- [ ] حصلت على Render URL: `https://________.onrender.com`
- [ ] Health Check يعمل: `/api/health` يرجع `{"status":"ok"}`
- [ ] WhatsApp Settings API يعمل: `/api/whatsapp/settings`

---

## المرحلة 3: Frontend على Vercel (5 دقائق)

### Environment Variables
- [ ] فتحت Vercel Dashboard
- [ ] فتحت المشروع: `almasar-frontend`
- [ ] ذهبت إلى Settings → Environment Variables
- [ ] أضفت NEXT_PUBLIC_API_URL=<Render URL>/api
- [ ] أضفت NEXT_PUBLIC_API_BASE_URL=<Render URL>
- [ ] أضفت NEXT_PUBLIC_WS_URL=<Render URL>
- [ ] أضفت NEXT_PUBLIC_APP_NAME=لينك كول - LinkCall
- [ ] أضفت NEXT_PUBLIC_COMPANY_WEBSITE=https://www.elmasarelsa5en.com

### Redeploy
- [ ] عملت Redeploy للـ Frontend
- [ ] Deploy نجح بدون أخطاء
- [ ] فتحت https://almasar-frontend.vercel.app/whatsapp
- [ ] الصفحة تحمل بدون أخطاء في Console

---

## المرحلة 4: Meta Webhook (5 دقائق)

### Webhook Configuration
- [ ] فتحت https://developers.facebook.com/apps
- [ ] اخترت التطبيق → WhatsApp → Configuration
- [ ] حدّثت Callback URL: `<Render URL>/api/whatsapp/webhook`
- [ ] تأكدت من Verify Token: `almasar_webhook_secret_2024`
- [ ] ضغطت "Verify and Save"
- [ ] Webhook Verified ✅ (علامة خضراء)

### Webhook Events
- [ ] اشتركت في `messages`
- [ ] اشتركت في `messaging_postbacks`
- [ ] ضغطت Subscribe

---

## المرحلة 5: الاختبار النهائي (5 دقائق)

### Backend Tests
- [ ] `curl https://<Render URL>/api/health` → `{"status":"ok"}`
- [ ] `curl https://<Render URL>/api/whatsapp/settings` → يعرض Settings

### Frontend Test
- [ ] https://almasar-frontend.vercel.app/whatsapp يفتح
- [ ] لا توجد أخطاء في Browser Console
- [ ] الواجهة تظهر بشكل صحيح

### WhatsApp Test 🎉
- [ ] أرسلت رسالة WhatsApp إلى: +966555254915
- [ ] رفرشت صفحة https://almasar-frontend.vercel.app/whatsapp
- [ ] الرسالة ظهرت في الواجهة! ✅

---

## ✅ النظام يعمل!

إذا كل الـ Checkboxes محددة، تهانينا! 🎉

WhatsApp الآن يعمل بالكامل على:
- Frontend: https://almasar-frontend.vercel.app/whatsapp
- Backend: https://<your-render-url>.onrender.com
- WhatsApp Number: +966555254915

---

## 📝 ملاحظات بعد النشر

### احفظ هذه المعلومات:
```
Render Backend URL: https://________________.onrender.com
Vercel Frontend URL: https://almasar-frontend.vercel.app
WhatsApp Number: +966555254915
Webhook Verify Token: almasar_webhook_secret_2024
```

### الخطوات التالية (اختياري):
- [ ] سجلت على UptimeRobot لإبقاء Backend مستيقظ
- [ ] عملت Backup للـ Database
- [ ] غيّرت synchronize: false في app.module.ts بعد أول deployment

---

## 🆘 إذا حصلت مشكلة

ارجع إلى: `WHATSAPP_PRODUCTION_SETUP.md` - قسم "استكشاف الأخطاء"

**بالتوفيق! 🚀**
