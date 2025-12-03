# 🔧 إصلاح مشكلة تسجيل الدخول في Production

## ❌ المشكلة
عند محاولة تسجيل الدخول على https://almasar-frontend.vercel.app/login لا يعمل!

## 🔍 السبب
الـ Frontend على Vercel لا يعرف عنوان Backend على Render. 

المتغير `NEXT_PUBLIC_API_URL` في Vercel غير مضبوط أو يشير إلى URL خاطئ.

## ✅ الحل السريع

### الخطوة 1: احصل على Backend URL من Render

1. افتح https://dashboard.render.com/
2. اضغط على الـ Web Service الخاص بـ Backend
3. انسخ الـ URL من الأعلى (مثال: `https://almasar-backend-xxxx.onrender.com`)

### الخطوة 2: أضف المتغيرات في Vercel

1. افتح https://vercel.com/dashboard
2. اختر مشروع `almasar-frontend`
3. اذهب إلى **Settings** → **Environment Variables**
4. أضف المتغيرات التالية:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api` | Production, Preview, Development |
| `NEXT_PUBLIC_API_BASE_URL` | `https://YOUR-RENDER-URL.onrender.com` | Production, Preview, Development |

**⚠️ مهم:** استبدل `YOUR-RENDER-URL` بالـ URL الحقيقي من Render!

مثال:
```
NEXT_PUBLIC_API_URL=https://almasar-backend-abc123.onrender.com/api
NEXT_PUBLIC_API_BASE_URL=https://almasar-backend-abc123.onrender.com
```

### الخطوة 3: أعد Deploy للـ Frontend

بعد إضافة المتغيرات، لا بد من إعادة Deploy:

**طريقة 1: من Vercel Dashboard**
1. اذهب إلى **Deployments**
2. اضغط على آخر Deployment
3. اضغط على **Redeploy**

**طريقة 2: من Git (أسرع)**
```bash
cd "d:\social media\almasar-suite"
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

سيتم إعادة Deploy تلقائياً خلال 2-3 دقائق.

---

## 🧪 التحقق من النجاح

بعد إعادة Deploy، جرب:

1. افتح https://almasar-frontend.vercel.app/login
2. أدخل أحد الحسابات:
   - **saher** / **Aa123456**
   - **Akram** / **Aazxc**
3. يجب أن يدخلك مباشرة لصفحة Mobile Call

---

## 📝 ملاحظات مهمة

### 1. Backend يجب أن يكون شغال على Render
تحقق من أن Backend Service على Render **ليس متوقف** (Not sleeping).

افتح الـ Backend URL في المتصفح:
```
https://YOUR-RENDER-URL.onrender.com/api/health
```

يجب أن ترى:
```json
{"status":"ok"}
```

### 2. CORS يجب أن يكون مضبوط
تأكد أن Backend يسمح بطلبات من Vercel Frontend:

في `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://almasar-frontend.vercel.app',
    'https://*.vercel.app'  // لجميع Preview Deployments
  ],
  credentials: true,
});
```

### 3. Database على Render
تأكد أن قاعدة البيانات PostgreSQL تحتوي على الموظفين الخمسة.

للتحقق، شغل هذا السكريبت على Render أو locally مع PostgreSQL connection:
```sql
SELECT email, name, role FROM users;
```

---

## 🚨 استكشاف الأخطاء

### إذا ظهر خطأ CORS:
```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**الحل:**
- أضف Vercel domain في CORS origins بالـ Backend
- أعد Deploy للـ Backend

### إذا ظهر خطأ 502 Bad Gateway:
```
502: Bad Gateway
```

**الحل:**
- Render Service قد يكون sleeping (Free plan)
- انتظر 30-60 ثانية حتى يستيقظ
- أو upgrade إلى Paid plan

### إذا ظهر خطأ "خطأ في البريد الإلكتروني أو كلمة المرور":
**الحل:**
- تأكد أن الموظف موجود في قاعدة بيانات Production
- قد تكون قاعدة البيانات فارغة على Render
- شغل `create-employees.js` على Render

---

## 🎯 الخلاصة

1. ✅ احصل على Backend URL من Render
2. ✅ أضف `NEXT_PUBLIC_API_URL` في Vercel
3. ✅ أعد Deploy للـ Frontend
4. ✅ جرب تسجيل الدخول

**وقت الإصلاح المتوقع:** 5 دقائق ⏱️
