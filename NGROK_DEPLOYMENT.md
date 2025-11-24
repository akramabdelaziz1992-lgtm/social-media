# 🚀 AlMasar Backend - ngrok Deployment

## ✅ تم الـ Deployment بنجاح!

### 🌐 معلومات الـ Deployment

**Backend URL:**
```
https://unacetic-nearly-tawanna.ngrok-free.dev
```

**Health Check:**
```
https://unacetic-nearly-tawanna.ngrok-free.dev/api/health
```

**Swagger API Docs:**
```
https://unacetic-nearly-tawanna.ngrok-free.dev/api/docs
```

---

## 📞 ربط Twilio Webhook

### الخطوات:

1. **افتح Twilio Console:**
   ```
   https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   ```

2. **اختار رقمك:** `+966555254915`

3. **في Voice Configuration، حط:**
   
   **A CALL COMES IN:**
   - Type: `Webhook`
   - URL: `https://unacetic-nearly-tawanna.ngrok-free.dev/api/calls/webhook/inbound`
   - HTTP: `POST`

   **STATUS CALLBACK URL:**
   - URL: `https://unacetic-nearly-tawanna.ngrok-free.dev/api/calls/webhook/status`
   - HTTP: `POST`

4. **اضغط Save**

---

## 🧪 اختبار النظام

### 1. Health Check
```bash
curl https://unacetic-nearly-tawanna.ngrok-free.dev/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T...",
  "service": "almasar-backend"
}
```

### 2. Test Inbound Call
- اتصل على: `+966555254915`
- المفروض تسمع الـ IVR بالعربي
- المكالمة تتسجل في الـ Database

### 3. Check Call Stats
```bash
curl https://unacetic-nearly-tawanna.ngrok-free.dev/api/calls/stats
```

---

## 📝 ملاحظات مهمة

### ✅ المميزات:
- ✅ Deployment فوري (5 دقائق)
- ✅ HTTPS مجاني
- ✅ مش محتاج server hosting
- ✅ سهل في التجربة والتطوير

### ⚠️ القيود:
- ⚠️ الـ URL بيتغير كل ما تعيد تشغيل ngrok (لو مش مشترك في Premium)
- ⚠️ لازم الكمبيوتر يفضل شغال
- ⚠️ لازم Backend يكون شغال على port 4000

---

## 🔄 إعادة التشغيل

إذا أعدت تشغيل الكمبيوتر:

1. **شغل Backend:**
   ```bash
   cd "d:\social media\almasar-suite\backend"
   npm run start:dev
   ```

2. **شغل ngrok:**
   ```bash
   ngrok http 4000
   ```

3. **حدّث Twilio Webhook** بالـ URL الجديد

---

## 📊 مراقبة الـ Requests

**ngrok Web Interface:**
```
http://localhost:4040
```

هنا تقدر تشوف:
- كل الـ requests اللي جاية من Twilio
- الـ response اللي راح
- الـ headers والـ body
- الأخطاء إن وجدت

---

## 🎯 الخطوات التالية

1. ✅ ~~Deploy Backend~~ **تم بنجاح!**
2. ⏳ **ربط Twilio Webhook** (الخطوة الحالية)
3. ⏳ اختبار المكالمات الواردة
4. ⏳ اختبار المكالمات الصادرة
5. ⏳ Deploy Frontend على Vercel

---

## 💪 للترقية لـ Production

عندك 3 خيارات:

### Option 1: ngrok Premium ($8/month)
- URL ثابت (مش بيتغير)
- Custom domain
- أسرع وأكثر استقرار

### Option 2: Render.com (Free/Paid)
- Hosting دائم
- مش محتاج تخلي الكمبيوتر شغال
- PostgreSQL database مجاني

### Option 3: Railway.app (Free $5 credit)
- Deploy سهل من GitHub
- Database مدمج
- Auto-deployment

---

**تاريخ الإنشاء:** 2025-11-21  
**Backend Port:** 4000  
**ngrok Version:** Latest
