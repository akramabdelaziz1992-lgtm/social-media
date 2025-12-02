# ✅ متطلبات تشغيل المكالمات - Twilio Configuration

## المشكلة الحالية:
```
JWT is invalid
AccessTokenInvalid (20101): Twilio was unable to validate your Access Token
```

## السبب:
واحد أو أكثر من الـ Environment Variables التالية **ناقص أو غلط** على Render:

---

## ✅ الـ Environment Variables المطلوبة (Render Dashboard):

### 1. TWILIO_ACCOUNT_SID
- **الوصف**: Account SID الرئيسي
- **مكان الحصول عليه**: https://console.twilio.com → Account Info
- **مثال**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. TWILIO_AUTH_TOKEN
- **الوصف**: Auth Token للحساب
- **مكان الحصول عليه**: https://console.twilio.com → Account Info (اضغط "Show" جنب Auth Token)
- **مثال**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. TWILIO_API_KEY ⚠️ **مهم جداً**
- **الوصف**: API Key للـ Access Token
- **مكان الحصول عليه**: 
  1. روح https://console.twilio.com/us1/develop/api-keys
  2. اضغط **"Create API Key"**
  3. اختار Type: **Standard**
  4. احفظ الـ **SID** (SK...)
- **مثال**: `SKxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. TWILIO_API_SECRET ⚠️ **مهم جداً**
- **الوصف**: API Secret (بيظهر مرة واحدة وقت إنشاء الـ API Key)
- **تحذير**: لو مش محفوظ عندك، لازم تعمل API Key جديد
- **مثال**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 5. TWILIO_TWIML_APP_SID
- **الوصف**: TwiML App SID
- **مكان الحصول عليه**: 
  1. روح https://console.twilio.com/us1/develop/voice/manage/twiml-apps
  2. لو مفيش App، اعمل واحد جديد
  3. انسخ الـ **SID** (AP...)
- **مثال**: `APxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 6. TWILIO_PHONE_NUMBER أو TWILIO_SAUDI_CALLER_ID
- **الوصف**: رقم Twilio المشتري
- **مكان الحصول عليه**: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
- **مثال**: `+966xxxxxxxxx` أو `+1xxxxxxxxxx`

---

## 📋 خطوات الحل:

### الخطوة 1: تأكد من API Key
1. افتح: https://console.twilio.com/us1/develop/api-keys
2. شوف لو فيه API Key موجود
3. **لو مفيش**: اعمل واحد جديد واحفظ الـ SID والـ Secret

### الخطوة 2: حدّث Render Environment
1. افتح: https://dashboard.render.com
2. اختار Backend Service
3. روح **Environment** tab
4. تأكد من القيم دي **كلها موجودة وصحيحة**:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_API_KEY` ⚠️
   - `TWILIO_API_SECRET` ⚠️
   - `TWILIO_TWIML_APP_SID`
   - `TWILIO_PHONE_NUMBER`

### الخطوة 3: أعد تشغيل الـ Backend
بعد التعديل، Render هيعمل Auto-Restart

### الخطوة 4: اختبر المكالمات
- افتح: https://almasar-frontend.vercel.app/mobile-call
- جرب تعمل مكالمة
- المفروض تشتغل بدون JWT Error

---

## 🔍 للتأكد من المشكلة:

شوف الـ **Render Logs** وقت ما تحاول تعمل مكالمة:
- لو شفت: `❌ Missing TWILIO_API_KEY` → يبقى الـ Variable مش موجود
- لو شفت: `❌ Missing TWILIO_API_SECRET` → يبقى الـ Secret مش موجود
- لو شفت: `✅ JWT Token generated successfully` → يبقى تمام

---

## ⚠️ ملاحظات مهمة:

1. **API Secret بيظهر مرة واحدة فقط** وقت إنشاء API Key - لو ضاع لازم تعمل Key جديد
2. **TwiML App SID** لازم يكون موجود قبل ما تعمل مكالمات WebRTC
3. الـ **Auth Token** مختلف عن الـ **API Secret** - متخلطش بينهم
4. لو غيرت أي Variable، Render هيعمل Auto-Restart (انتظر 1-2 دقيقة)

---

## 💰 بخصوص الرصيد:

لو الـ Token اشتغل صح، والمكالمة فشلت، **ساعتها** ممكن تكون مشكلة رصيد. لكن دلوقتي المشكلة في الـ Token مش الرصيد.
