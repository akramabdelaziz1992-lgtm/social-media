# 🚀 تفعيل WhatsApp على الموقع الرسمي

## الهدف
تشغيل WhatsApp على الموقع الرسمي: https://almasar-frontend.vercel.app/whatsapp

---

## ✅ الخطوات المطلوبة

### 🔷 الخطوة 1: نشر Backend على Render (20 دقيقة)

#### 1. إنشاء Web Service
1. افتح: https://render.com/dashboard
2. اضغط **"New +"** → **"Web Service"**
3. اختر Repository من GitHub
4. الإعدادات:
   ```
   Name: almasar-backend
   Region: Frankfurt (الأقرب للسعودية)
   Branch: main
   Root Directory: almasar-suite/backend
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   Instance Type: Free
   ```

#### 2. إضافة PostgreSQL Database
1. اضغط **"New +"** → **"PostgreSQL"**
2. الإعدادات:
   ```
   Name: almasar-database
   Region: Frankfurt (نفس region الـ Web Service)
   PostgreSQL Version: 15
   Plan: Free
   ```
3. انتظر حتى يصبح جاهز
4. انسخ **"Internal Database URL"** (سنحتاجه في الخطوة التالية)

#### 3. إضافة Environment Variables
في صفحة Web Service، اضغط **"Environment"** → **"Add Environment Variable"**

انسخ والصق كل متغير من القائمة التالية:

```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://almasar-frontend.vercel.app

# Database (الصق Internal URL من PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/db

# JWT (⚠️ غيّر هذه للأمان!)
JWT_SECRET=غير_هذا_إلى_نص_عشوائي_طويل_للأمان
JWT_REFRESH_SECRET=غير_هذا_أيضاً_إلى_نص_عشوائي_آخر

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=931180146738368
WHATSAPP_PHONE_NUMBER=966555254915
WHATSAPP_ACCESS_TOKEN=EAAMObRfDmLgBQJ1jNSNt4ZCmZC6ZCpAa6xdCZCYpZCz2SoB4zgNIZCNDr4Vl5FFegU964WhQTJHhVvk9fRIsg1TBmGjz7Nmi184U3Ol0djMuZCZCyTHqhUBYcKwUGGRBn9NbOn0ZBZAraL345aTIiBdPoPSiPMPKV1Exq9sMD0ZAW177F5ux0bGf9ZAdvNAn5WZCZBh4qLPGZAQ8nIbkggDGSudMK7IRmi1WgsMcYe9xRrkxbMU1ZAnDvZBu9ZAvW4YUdyklHserDAs0bEfhCbNlbypAUN6ZC2cxeUWMQZDZD
WHATSAPP_VERIFY_TOKEN=almasar_webhook_secret_2024
WHATSAPP_API_VERSION=v21.0
WHATSAPP_BUSINESS_ACCOUNT_ID=1986298265488975

# Meta/Facebook
META_PAGE_ACCESS_TOKEN=EAAMObRfDmLgBQJ1jNSNt4ZCmZC6ZCpAa6xdCZCYpZCz2SoB4zgNIZCNDr4Vl5FFegU964WhQTJHhVvk9fRIsg1TBmGjz7Nmi184U3Ol0djMuZCZCyTHqhUBYcKwUGGRBn9NbOn0ZBZAraL345aTIiBdPoPSiPMPKV1Exq9sMD0ZAW177F5ux0bGf9ZAdvNAn5WZCZBh4qLPGZAQ8nIbkggDGSudMK7IRmi1WgsMcYe9xRrkxbMU1ZAnDvZBu9ZAvW4YUdyklHserDAs0bEfhCbNlbypAUN6ZC2cxeUWMQZDZD
META_VERIFY_TOKEN=almasar_meta_webhook_2024
META_API_VERSION=v21.0

# Twilio (اختياري - إذا تستخدم المكالمات)
TWILIO_ACCOUNT_SID=<من .env المحلي>
TWILIO_API_KEY=<من .env المحلي>
TWILIO_API_SECRET=<من .env المحلي>
TWILIO_PHONE_NUMBER=+966555254915
```

#### 4. Deploy!
1. اضغط **"Create Web Service"** أو **"Manual Deploy"**
2. انتظر 5-10 دقائق
3. بعد انتهاء الـ Deploy، ستحصل على URL مثل:
   ```
   https://almasar-backend-xxxx.onrender.com
   ```
4. **احفظ هذا الـ URL** - سنحتاجه في الخطوات التالية!

#### 5. اختبار Backend
افتح في المتصفح:
```
https://almasar-backend-xxxx.onrender.com/api/health
```

يجب أن يظهر:
```json
{"status":"ok","timestamp":"2024-11-30T..."}
```

✅ إذا ظهرت هذه الرسالة، Backend جاهز!

---

### 🔷 الخطوة 2: تحديث Frontend على Vercel (5 دقائق)

#### 1. تحديث Environment Variables
1. افتح: https://vercel.com/dashboard
2. اختر المشروع: `almasar-frontend`
3. اذهب إلى: **Settings** → **Environment Variables**
4. أضف/عدّل المتغيرات التالية:

**⚠️ مهم جداً:** استبدل `YOUR-RENDER-URL` بالـ URL الفعلي من Render!

```bash
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-URL.onrender.com/api
NEXT_PUBLIC_API_BASE_URL=https://YOUR-RENDER-URL.onrender.com
NEXT_PUBLIC_WS_URL=https://YOUR-RENDER-URL.onrender.com
NEXT_PUBLIC_APP_NAME=لينك كول - LinkCall
NEXT_PUBLIC_COMPANY_WEBSITE=https://www.elmasarelsa5en.com
```

مثال (إذا كان Render URL هو: `https://almasar-backend-abc123.onrender.com`):
```bash
NEXT_PUBLIC_API_URL=https://almasar-backend-abc123.onrender.com/api
NEXT_PUBLIC_API_BASE_URL=https://almasar-backend-abc123.onrender.com
NEXT_PUBLIC_WS_URL=https://almasar-backend-abc123.onrender.com
```

#### 2. Redeploy Frontend
- في Vercel Dashboard → **Deployments**
- اضغط على آخر deployment
- اضغط **"Redeploy"**
- انتظر 2-3 دقائق

#### 3. اختبار Frontend
افتح:
```
https://almasar-frontend.vercel.app/whatsapp
```

✅ يجب أن تظهر واجهة WhatsApp

---

### 🔷 الخطوة 3: تحديث WhatsApp Webhook على Meta (5 دقائق)

#### 1. فتح Meta Developer Console
1. افتح: https://developers.facebook.com/apps
2. اختر تطبيقك
3. من القائمة الجانبية: **WhatsApp** → **Configuration**

#### 2. تحديث Webhook
في قسم **"Webhook"**:

1. **Callback URL**: 
   ```
   https://YOUR-RENDER-URL.onrender.com/api/whatsapp/webhook
   ```
   (استبدل بـ URL الفعلي من Render)

2. **Verify Token**:
   ```
   almasar_webhook_secret_2024
   ```

3. اضغط **"Verify and Save"**

#### 3. Subscribe to Webhook Events
تأكد من تفعيل:
- ☑️ **messages**
- ☑️ **messaging_postbacks**

اضغط **"Subscribe"**

✅ إذا ظهر ✓ أخضر، Webhook جاهز!

---

## 🧪 اختبار النظام الكامل

### الاختبار 1: Backend Health
```bash
curl https://YOUR-RENDER-URL.onrender.com/api/health
```
**النتيجة المتوقعة:** `{"status":"ok"}`

### الاختبار 2: WhatsApp Settings API
```bash
curl https://YOUR-RENDER-URL.onrender.com/api/whatsapp/settings
```
**النتيجة المتوقعة:** يعرض إعدادات WhatsApp

### الاختبار 3: Frontend WhatsApp Page
افتح: https://almasar-frontend.vercel.app/whatsapp
**النتيجة المتوقعة:** تظهر واجهة WhatsApp

### الاختبار 4: إرسال رسالة حقيقية ✨
1. من هاتفك، افتح WhatsApp
2. أرسل رسالة إلى: **+966555254915**
3. انتظر 2-3 ثواني
4. افتح: https://almasar-frontend.vercel.app/whatsapp
5. **يجب أن تظهر رسالتك!** 🎉

---

## ✅ النظام جاهز!

الآن WhatsApp يعمل بالكامل على:
- ✅ **Frontend**: https://almasar-frontend.vercel.app/whatsapp
- ✅ **Backend**: https://YOUR-RENDER-URL.onrender.com
- ✅ **WhatsApp**: متصل ويستقبل رسائل على +966555254915
- ✅ **Database**: PostgreSQL على Render
- ✅ **SSL/HTTPS**: مفعل تلقائياً

---

## ⚠️ ملاحظات مهمة

### Render Free Plan
- الخدمة المجانية "تنام" بعد 15 دقيقة من عدم النشاط
- أول request بعد النوم يستغرق 30-60 ثانية
- **الحل**: استخدم UptimeRobot (مجاني) لإبقاء الخدمة مستيقظة:
  1. سجل على: https://uptimerobot.com
  2. أضف Monitor جديد
  3. URL: `https://YOUR-RENDER-URL.onrender.com/api/health`
  4. Check Interval: كل 5 دقائق

### تحديثات مستقبلية
عند تعديل الكود:
```powershell
git add .
git commit -m "Update code"
git push
```
- Render سيعيد deploy Backend تلقائياً
- Vercel سيعيد deploy Frontend تلقائياً

### الدعم الفني
إذا واجهتك مشكلة:
1. تحقق من Render Logs: Dashboard → Logs
2. تحقق من Vercel Logs: Dashboard → Deployments → View Function Logs
3. تحقق من Meta Webhook: Webhooks → Recent Deliveries

---

## 🎯 الخطوات التالية (اختياري)

1. **Custom Domain**: أضف domain خاص بك على Vercel
2. **Upgrade Plan**: إذا احتجت خدمة 24/7 بدون نوم
3. **Monitoring**: أضف monitoring للأخطاء والأداء
4. **Backup**: اعمل backup دوري للـ Database

---

**تهانينا! 🎉 WhatsApp الآن يعمل على موقعك الرسمي!**
