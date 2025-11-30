# 🚀 خطوات سريعة للنشر على Production

## خطوة 1: نشر Backend على Render

### 1.1 إنشاء Web Service
1. اذهب إلى: https://render.com/dashboard
2. اضغط **"New +"** → **"Web Service"**
3. اختر Repository: `social-media`
4. اختر Branch: `main`

### 1.2 إعدادات Web Service
```
Name: almasar-backend
Region: Frankfurt
Root Directory: almasar-suite/backend
Build Command: npm install && npm run build
Start Command: npm run start:prod
Instance Type: Free
```

### 1.3 إضافة PostgreSQL
1. اضغط **"New +"** → **"PostgreSQL"**
2. Name: `almasar-database`
3. Region: Frankfurt
4. Plan: Free
5. انسخ **Internal Database URL**

### 1.4 Environment Variables
أضف على Render Dashboard:

**مهم جداً - انسخ هذه المتغيرات:**
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=<انسخ من PostgreSQL Internal URL>

# JWT - غيّر هذه للأمان!
JWT_SECRET=change-this-to-random-long-string-for-production
JWT_REFRESH_SECRET=change-this-to-another-random-long-string

# WhatsApp - نفس القيم من .env الحالي
WHATSAPP_PHONE_NUMBER_ID=931180146738368
WHATSAPP_PHONE_NUMBER=966555254915
WHATSAPP_ACCESS_TOKEN=EAAMObRfDmLgBQJ1jNSNt4ZCmZC6ZCpAa6xdCZCYpZCz2SoB4zgNIZCNDr4Vl5FFegU964WhQTJHhVvk9fRIsg1TBmGjz7Nmi184U3Ol0djMuZCZCyTHqhUBYcKwUGGRBn9NbOn0ZBZAraL345aTIiBdPoPSiPMPKV1Exq9sMD0ZAW177F5ux0bGf9ZAdvNAn5WZCZBh4qLPGZAQ8nIbkggDGSudMK7IRmi1WgsMcYe9xRrkxbMU1ZAnDvZBu9ZAvW4YUdyklHserDAs0bEfhCbNlbypAUN6ZC2cxeUWMQZDZD
WHATSAPP_VERIFY_TOKEN=almasar_webhook_secret_2024
WHATSAPP_API_VERSION=v21.0
WHATSAPP_BUSINESS_ACCOUNT_ID=1986298265488975

# Meta - نفس Access Token
META_PAGE_ACCESS_TOKEN=EAAMObRfDmLgBQJ1jNSNt4ZCmZC6ZCpAa6xdCZCYpZCz2SoB4zgNIZCNDr4Vl5FFegU964WhQTJHhVvk9fRIsg1TBmGjz7Nmi184U3Ol0djMuZCZCyTHqhUBYcKwUGGRBn9NbOn0ZBZAraL345aTIiBdPoPSiPMPKV1Exq9sMD0ZAW177F5ux0bGf9ZAdvNAn5WZCZBh4qLPGZAQ8nIbkggDGSudMK7IRmi1WgsMcYe9xRrkxbMU1ZAnDvZBu9ZAvW4YUdyklHserDAs0bEfhCbNlbypAUN6ZC2cxeUWMQZDZD
META_VERIFY_TOKEN=almasar_meta_webhook_2024
META_API_VERSION=v21.0

# Twilio (إذا موجود)
TWILIO_ACCOUNT_SID=<من .env>
TWILIO_API_KEY=<من .env>
TWILIO_API_SECRET=<من .env>
TWILIO_PHONE_NUMBER=+966555254915

# OpenAI (اختياري)
OPENAI_API_KEY=<إذا تستخدم AI>
```

---

## خطوة 2: تحديث Vercel

### 2.1 تحديث Environment Variables
1. اذهب إلى: https://vercel.com/dashboard
2. اختر: `almasar-frontend`
3. Settings → Environment Variables
4. أضف/عدّل:

```bash
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-URL.onrender.com/api
NEXT_PUBLIC_API_BASE_URL=https://YOUR-RENDER-URL.onrender.com
NEXT_PUBLIC_WS_URL=https://YOUR-RENDER-URL.onrender.com
NEXT_PUBLIC_APP_NAME=لينك كول - LinkCall
NEXT_PUBLIC_COMPANY_WEBSITE=https://www.elmasarelsa5en.com
```

**⚠️ مهم:** استبدل `YOUR-RENDER-URL` بالـ URL الفعلي من Render!

### 2.2 Redeploy
- اضغط Deployments → أحدث deployment → Redeploy

---

## خطوة 3: تحديث WhatsApp Webhook

### 3.1 على Meta Developer Console
1. اذهب إلى: https://developers.facebook.com/apps
2. اختر تطبيقك → WhatsApp → Configuration
3. Webhook Settings:
   ```
   Callback URL: https://YOUR-RENDER-URL.onrender.com/api/whatsapp/webhook
   Verify Token: almasar_webhook_secret_2024
   ```
4. Subscribe to: messages, messaging_postbacks

---

## ✅ اختبار النظام

### 1. اختبر Backend:
```
https://YOUR-RENDER-URL.onrender.com/api/health
```
يجب أن يرجع: `{"status":"ok"}`

### 2. اختبر Frontend:
```
https://almasar-frontend.vercel.app/whatsapp
```
يجب أن تظهر واجهة WhatsApp

### 3. اختبر WhatsApp:
- أرسل رسالة إلى: **+966555254915**
- افتح: https://almasar-frontend.vercel.app/whatsapp
- يجب أن تظهر الرسالة!

---

## 🎉 تم!

النظام الآن يعمل على:
- ✅ Backend: Render (مع PostgreSQL)
- ✅ Frontend: Vercel
- ✅ WhatsApp: متصل ويستقبل رسائل

**الخطوات التالية:**
1. احفظ URL الخاص بـ Render
2. غيّر JWT_SECRET و JWT_REFRESH_SECRET
3. اختبر إرسال رسالة
