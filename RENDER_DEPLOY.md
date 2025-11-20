# 🚀 Deploy على Render - دليل كامل

## 📋 المتطلبات
- ✅ حساب GitHub
- ✅ حساب Render (مجاني)
- ✅ Backend جاهز مع Twilio

---

## 🔧 الخطوة 1: تحضير المشروع

### 1.1 إضافة Health Check Endpoint
تأكد من وجود endpoint للـ health check في `main.ts`:

```typescript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### 1.2 تحديث TypeORM Config
تأكد من دعم PostgreSQL في `app.module.ts`:

```typescript
TypeOrmModule.forRoot({
  type: process.env.DATABASE_URL ? 'postgres' : 'better-sqlite3',
  url: process.env.DATABASE_URL,
  database: process.env.DATABASE_URL ? undefined : 'almasar.db',
  // ... rest of config
})
```

---

## 📦 الخطوة 2: رفع الكود على GitHub

### 2.1 إنشاء Repository جديد
```powershell
cd "d:\social media\almasar-suite"
git init
git add .
git commit -m "Initial commit - Ready for Render deployment"
```

### 2.2 رفع على GitHub
1. اذهب إلى https://github.com/new
2. أنشئ repository باسم `almasar-suite`
3. في Terminal:
```powershell
git remote add origin https://github.com/YOUR-USERNAME/almasar-suite.git
git branch -M main
git push -u origin main
```

---

## 🌐 الخطوة 3: Deploy على Render

### 3.1 إنشاء حساب Render
1. اذهب إلى https://render.com
2. سجل دخول بـ GitHub
3. اضغط **New +** → **Blueprint**

### 3.2 ربط GitHub Repository
1. اختر repository: `almasar-suite`
2. Render سيكتشف `render.yaml` تلقائياً
3. اضغط **Apply**

### 3.3 إضافة Environment Variables
بعد إنشاء الـ service، اذهب لـ **Environment**:

```env
TWILIO_ACCOUNT_SID=ACe3a1e872e57e08b887015860Se6432c3
TWILIO_AUTH_TOKEN=5dc25ef74fe16ccdb11224c8637c469
TWILIO_PHONE_NUMBER=+966555254915
```

**ملاحظة:** `DATABASE_URL` و `JWT_SECRET` يتم إنشاؤهم تلقائياً!

### 3.4 انتظر Deploy
- Render سيبني الـ Backend تلقائياً (3-5 دقائق)
- ستحصل على رابط مثل: `https://almasar-backend.onrender.com`

---

## 📞 الخطوة 4: ربط Twilio Webhook

### 4.1 نسخ Render URL
بعد اكتمال الـ Deploy:
```
https://almasar-backend.onrender.com
```

### 4.2 تحديث Twilio Console
1. اذهب إلى https://console.twilio.com
2. **Phone Numbers** → **Manage** → **Active numbers**
3. اضغط على رقمك `+966555254915`
4. في **Voice Configuration**:
   - **A CALL COMES IN**: `Webhook`
   - **URL**: `https://almasar-backend.onrender.com/api/calls/webhook/inbound`
   - **HTTP Method**: `POST`
5. في **Status Callback**:
   - **URL**: `https://almasar-backend.onrender.com/api/calls/webhook/status`
   - **Method**: `POST`
6. **Save**

---

## ✅ الخطوة 5: الاختبار

### 5.1 اختبار Health Check
```powershell
curl https://almasar-backend.onrender.com/api/health
```
يجب أن يرجع: `{"status":"ok"}`

### 5.2 اختبار Twilio Integration
اتصل على رقمك `0555254915`:
- ✅ يجب أن تسمع رسالة ترحيب بالعربية
- ✅ يتم توجيه المكالمة لموظف
- ✅ يتم حفظ المكالمة في قاعدة البيانات

### 5.3 التحقق من Database
```powershell
# Check call stats
curl https://almasar-backend.onrender.com/api/calls/stats
```

---

## 🎯 الخطوة 6: تحديث Frontend

في `frontend/lib/api.ts`، حدث الـ Base URL:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://almasar-backend.onrender.com/api'
  : 'http://localhost:4000/api';
```

---

## 🔄 التحديثات المستقبلية

عند عمل تغييرات:
```powershell
git add .
git commit -m "Update feature X"
git push
```

Render سيعمل **Auto Deploy** تلقائياً! 🚀

---

## 🆘 استكشاف الأخطاء

### Backend لا يشتغل؟
1. تحقق من Logs في Render Dashboard
2. تأكد من Environment Variables صحيحة
3. تحقق من DATABASE_URL متصل

### Twilio لا يستقبل مكالمات؟
1. تحقق من Webhook URL صحيح
2. تأكد من HTTPS (مش HTTP)
3. راجع Twilio Debugger: https://console.twilio.com/monitor/logs

### Database Connection Error؟
- انتظر دقيقة، Render PostgreSQL يحتاج وقت للبدء
- تحقق من DATABASE_URL في Environment Variables

---

## 💰 التكلفة

- **Render Free Tier**:
  - Backend: مجاني (ينام بعد 15 دقيقة عدم استخدام)
  - Database: مجاني (256MB)
  
- **Render Paid** (للإنتاج):
  - Backend: $7/شهر (24/7 active)
  - Database: $7/شهر (1GB)

---

## 📚 روابط مفيدة

- 📖 Render Docs: https://render.com/docs
- 📞 Twilio Webhooks: https://www.twilio.com/docs/usage/webhooks
- 🐘 PostgreSQL Guide: https://render.com/docs/databases

---

✅ **جاهز! نظام مركز الاتصالات أصبح على الإنترنت!** 🎉
