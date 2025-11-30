# 🚀 دليل نشر النظام على Production

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر النظام الكامل على Production:
- **Backend** على Render.com (مجاني مع PostgreSQL)
- **Frontend** على Vercel (موجود بالفعل على https://almasar-frontend.vercel.app)
- **WhatsApp Business API** متصل بالموقع الرسمي

---

## 🔧 الجزء الأول: نشر Backend على Render

### الخطوة 1: إنشاء حساب على Render
1. اذهب إلى https://render.com
2. سجل باستخدام GitHub
3. اضغط "New +" → "Web Service"

### الخطوة 2: ربط GitHub Repository
1. اختر repository: `social-media` (أو الاسم الخاص بك)
2. اختر branch: `main`
3. Root Directory: `almasar-suite/backend`

### الخطوة 3: إعدادات Web Service

**Basic Settings:**
- **Name**: `almasar-backend` (أو أي اسم تريده)
- **Region**: Frankfurt (الأقرب للسعودية)
- **Branch**: `main`
- **Root Directory**: `almasar-suite/backend`

**Build & Deploy:**
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

**Instance Type:**
- اختر **Free** (مجاني)

### الخطوة 4: إضافة Environment Variables

اضغط "Advanced" → "Add Environment Variable" وأضف:

```bash
NODE_ENV=production
PORT=10000

# JWT
JWT_SECRET=اكتب_نص_عشوائي_طويل_هنا_للامان
JWT_REFRESH_SECRET=اكتب_نص_عشوائي_اخر_طويل_هنا

# OpenAI (إذا كنت تستخدم AI)
OPENAI_API_KEY=sk-your-openai-key

# Twilio (نسخ من .env الحالي)
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_API_KEY=SKxxxx
TWILIO_API_SECRET=xxxx
TWILIO_TWIML_APP_SID=APxxxx
TWILIO_PHONE_NUMBER=+966555254915
TWILIO_SAUDI_CALLER_ID=+966555254915

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=931180146738368
WHATSAPP_PHONE_NUMBER=966555254915
WHATSAPP_ACCESS_TOKEN=EAAMObRfDmLgBQJ1jNSNt4ZCmZC6ZCpAa6xdCZCYpZCz2SoB4zgNIZCNDr4Vl5FFegU964WhQTJHhVvk9fRIsg1TBmGjz7Nmi184U3Ol0djMuZCZCyTHqhUBYcKwUGGRBn9NbOn0ZBZAraL345aTIiBdPoPSiPMPKV1Exq9sMD0ZAW177F5ux0bGf9ZAdvNAn5WZCZBh4qLPGZAQ8nIbkggDGSudMK7IRmi1WgsMcYe9xRrkxbMU1ZAnDvZBu9ZAvW4YUdyklHserDAs0bEfhCbNlbypAUN6ZC2cxeUWMQZDZD
WHATSAPP_VERIFY_TOKEN=almasar_webhook_secret_2024
WHATSAPP_API_VERSION=v21.0
WHATSAPP_BUSINESS_ACCOUNT_ID=1986298265488975

# Meta/Facebook
META_PAGE_ACCESS_TOKEN=نفس_الـWHATSAPP_ACCESS_TOKEN
META_VERIFY_TOKEN=almasar_meta_webhook_2024
META_API_VERSION=v21.0

# AWS S3 (إذا كنت تستخدم S3)
S3_REGION=us-east-1
S3_BUCKET_NAME=almasar-media
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_PUBLIC_URL=https://media.elmasarelsa5en.com
```

### الخطوة 5: إضافة PostgreSQL Database

1. في Render Dashboard، اضغط "New +" → "PostgreSQL"
2. **Name**: `almasar-database`
3. **Region**: نفس region الـ Backend (Frankfurt)
4. **PostgreSQL Version**: 15
5. **Plan**: Free
6. اضغط "Create Database"
7. انتظر حتى يصبح الـ Database جاهز (حوالي دقيقة)
8. انسخ **Internal Database URL**
9. ارجع للـ Web Service → Environment Variables
10. أضف:
    ```
    DATABASE_URL=postgresql://user:pass@host/db
    ```
    (استبدلها بـ Internal Database URL المنسوخ)

### الخطوة 6: Deploy!

1. اضغط "Create Web Service"
2. انتظر حوالي 5-10 دقائق للـ build والـ deploy
3. بعد انتهاء الـ deploy، ستحصل على URL مثل:
   ```
   https://almasar-backend.onrender.com
   ```
4. اختبر الـ Backend:
   ```
   https://almasar-backend.onrender.com/api/health
   ```
   يجب أن يرجع: `{"status":"ok","timestamp":"..."}`

---

## 🌐 الجزء الثاني: تحديث Frontend على Vercel

### الخطوة 1: تحديث Environment Variables على Vercel

1. اذهب إلى https://vercel.com/dashboard
2. اختر المشروع: `almasar-frontend`
3. اذهب إلى "Settings" → "Environment Variables"
4. أضف/عدل المتغيرات التالية:

```bash
NEXT_PUBLIC_API_URL=https://almasar-backend.onrender.com/api
NEXT_PUBLIC_API_BASE_URL=https://almasar-backend.onrender.com
NEXT_PUBLIC_WS_URL=https://almasar-backend.onrender.com
NEXT_PUBLIC_APP_NAME=لينك كول - LinkCall
NEXT_PUBLIC_COMPANY_WEBSITE=https://www.elmasarelsa5en.com
```

**ملاحظة مهمة:** استبدل `almasar-backend.onrender.com` بالـ URL الفعلي من Render!

### الخطوة 2: Redeploy على Vercel

1. في Vercel Dashboard → Deployments
2. اضغط على آخر deployment → "Redeploy"
3. أو ببساطة قم بعمل Git Push:
   ```powershell
   cd "d:\social media\almasar-suite"
   git add .
   git commit -m "Update production environment variables"
   git push
   ```

### الخطوة 3: اختبار Frontend

1. افتح: https://almasar-frontend.vercel.app
2. اذهب إلى صفحة WhatsApp: https://almasar-frontend.vercel.app/whatsapp
3. يجب أن يظهر واجهة WhatsApp

---

## 📱 الجزء الثالث: تحديث WhatsApp Webhook على Meta

### الخطوة 1: تحديث Webhook URL

1. اذهب إلى https://developers.facebook.com/apps
2. اختر تطبيقك → WhatsApp → Configuration
3. في قسم **Webhook**:
   - **Callback URL**: 
     ```
     https://almasar-backend.onrender.com/api/whatsapp/webhook
     ```
   - **Verify Token**: 
     ```
     almasar_webhook_secret_2024
     ```
4. اضغط "Verify and Save"

### الخطوة 2: Subscribe to Webhook Fields

تأكد من الاشتراك في:
- ☑️ `messages`
- ☑️ `messaging_postbacks`

### الخطوة 3: اختبار Webhook

1. في Meta Dashboard → WhatsApp → API Setup
2. أرسل رسالة تجريبية
3. أو أرسل رسالة من هاتفك إلى: **+966555254915**
4. افتح https://almasar-frontend.vercel.app/whatsapp
5. يجب أن تظهر الرسالة!

---

## ✅ التحقق من النظام الكامل

### 1. Backend Health Check
```bash
curl https://almasar-backend.onrender.com/api/health
```
**Expected:** `{"status":"ok"}`

### 2. WhatsApp Settings API
```bash
curl https://almasar-backend.onrender.com/api/whatsapp/settings
```
**Expected:** يعرض إعدادات WhatsApp

### 3. Frontend WhatsApp Page
افتح: https://almasar-frontend.vercel.app/whatsapp
**Expected:** يعرض واجهة WhatsApp مع المحادثات

### 4. إرسال رسالة تجريبية
1. أرسل رسالة WhatsApp إلى: +966555254915
2. انتظر 2-3 ثواني
3. يجب أن تظهر في صفحة الـ WhatsApp على الموقع

---

## 🔧 استكشاف الأخطاء

### مشكلة: Backend لا يعمل
- تحقق من Render Logs: Dashboard → Logs
- تأكد من Environment Variables صحيحة
- تأكد من DATABASE_URL موجود

### مشكلة: Frontend لا يتصل بـ Backend
- تحقق من Environment Variables على Vercel
- تأكد من CORS enabled في Backend
- افتح Browser Console لرؤية الأخطاء

### مشكلة: WhatsApp Webhook لا يستقبل رسائل
- تحقق من Webhook URL صحيح على Meta
- تحقق من Verify Token = `almasar_webhook_secret_2024`
- تحقق من Render Logs لرؤية incoming webhooks

### مشكلة: Render Free Plan يتوقف بعد 15 دقيقة
- Render Free Plan ينام بعد 15 دقيقة من عدم النشاط
- أول request بعد النوم سيستغرق 30-60 ثانية
- الحل: استخدم خدمة Ping مثل UptimeRobot (مجاني) لإبقاء الخدمة مستيقظة

---

## 📊 تحديثات مستقبلية

عندما تحتاج تحديث الكود:

### تحديث Backend:
1. عدل الكود محلياً
2. Push إلى GitHub:
   ```powershell
   git add .
   git commit -m "Update backend"
   git push
   ```
3. Render سيعيد الـ deploy تلقائياً

### تحديث Frontend:
1. عدل الكود محلياً
2. Push إلى GitHub
3. Vercel سيعيد الـ deploy تلقائياً

---

## 🎉 النظام جاهز للاستخدام!

الآن النظام يعمل بالكامل على:
- ✅ Frontend: https://almasar-frontend.vercel.app
- ✅ Backend: https://almasar-backend.onrender.com
- ✅ WhatsApp متصل ويستقبل الرسائل
- ✅ Database على PostgreSQL
- ✅ SSL/HTTPS مفعل تلقائياً

**للدعم والأسئلة:**
افتح Issue على GitHub أو راسلني!
