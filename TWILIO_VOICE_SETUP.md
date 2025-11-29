# 🎯 إصلاح مشكلة المكالمات - Twilio Voice Setup

## ❌ المشكلة
المكالمات بتبدأ لكن بتنقطع فورًا (HANGUP) قبل ما تتصل.

**السبب**: Twilio Application مش معمول Setup على Backend URL الصحيح.

---

## ✅ الحل (5 دقائق)

### 📍 Step 1: افتح Twilio Console
1. اذهب إلى: https://console.twilio.com/us1/develop/voice/manage/twiml-apps
2. ابحث عن Application SID: `AP1774964f1009f2f8430d50b78a9afb0c`
3. اضغط عليه للتعديل

---

### 📍 Step 2: ضبط URLs
في صفحة TwiML App Configuration:

#### 🔹 Voice Configuration:

**Request URL (معالج المكالمات الصادرة):**
```
https://almasar-backend2025.onrender.com/api/calls/twiml/outbound
```
✅ اختر: `HTTP POST`

**Status Callback URL (تحديث حالة المكالمة):**
```
https://almasar-backend2025.onrender.com/api/calls/webhook/status
```
✅ اختر: `HTTP POST`

#### 🔹 Recording Configuration:

**Recording Status Callback URL:**
```
https://almasar-backend2025.onrender.com/api/calls/webhook/recording
```
✅ اختر: `HTTP POST`

---

### 📍 Step 3: احفظ التغييرات
1. اضغط **Save** في أسفل الصفحة
2. انتظر 10 ثواني للتحديث

---

### 📍 Step 4: اختبر المكالمات
1. افتح: http://localhost:3001/mobile-call
2. جرّب الاتصال بالرقم: `0569705616`
3. **المفروض دلوقتي**:
   - ✅ المكالمة تبدأ بدون قطع
   - ✅ يدق على الرقم
   - ✅ لو ما ردش، ينتظر ويقفل
   - ✅ لو رد، المكالمة تشتغل عادي

---

## 🔍 كيف تتأكد إن الإعدادات صح؟

### ✅ من Logs المتصفح:
```
[TwilioVoice][Call] #ringing        ← الرقم بيدق ✅
[TwilioVoice][Call] #audio          ← المكالمة متصلة ✅
[TwilioVoice][PeerConnection] pc.connectionState is "connected" ← شغالة ✅
```

### ❌ قبل الإصلاح (كان بيظهر):
```
[TwilioVoice][WSTransport] Received: {"type":"hangup"}  ← قطع فوري ❌
Call disconnected by customer ← العميل قطع (لكن الحقيقة: مفيش TwiML) ❌
```

---

## 📞 لو عاوز تختبر محلياً (Local Development)

### Option 1: استخدم ngrok
```powershell
cd "d:\social media\almasar-suite\backend"
ngrok http 4000
```

بعدين غيّر الـ URLs في Twilio إلى:
```
https://YOUR-NGROK-URL.ngrok-free.app/api/calls/twiml/outbound
https://YOUR-NGROK-URL.ngrok-free.app/api/calls/webhook/status
https://YOUR-NGROK-URL.ngrok-free.app/api/calls/webhook/recording
```

### Option 2: استخدم Production (Render) - الأسهل ✅
خليها زي ما هي:
```
https://almasar-backend2025.onrender.com/api/calls/...
```

---

## 🎙️ Recordings (التسجيلات)

### لماذا التسجيلات مهمة؟
- ✅ جودة الخدمة
- ✅ حل النزاعات
- ✅ تدريب الموظفين
- ✅ الامتثال القانوني

### كيف تشتغل؟
1. **أثناء المكالمة**: Twilio بيسجل الصوت من الطرفين
2. **بعد انتهاء المكالمة (60 ثانية)**: Twilio بيبعت webhook لـ `/webhook/recording`
3. **Backend بيحفظ URL**: Recording URL بيتحفظ في Database
4. **الموظف يقدر يسمعه**: من Call History في `/mobile-call`

### لو التسجيل مش ظاهر؟
انتظر دقيقة وضغط **Fetch Recordings** (الزرار الأخضر في Call History).

---

## 🧪 Test Checklist

| ✅ | الخطوة | النتيجة المتوقعة |
|---|--------|-----------------|
| [ ] | TwiML App URLs محدّثة | Request URL صحيح |
| [ ] | مكالمة تجريبية من mobile-call | بيدق على الرقم ✅ |
| [ ] | المكالمة متصلة | لو رد العميل، الصوت يشتغل ✅ |
| [ ] | Status Callback يشتغل | حالة المكالمة بتتحدث (initiated → ringing → completed) |
| [ ] | Recording Callback يشتغل | بعد دقيقة، Recording URL يظهر في Database |
| [ ] | Call History يعرض المكالمات | كل المكالمات تظهر في القائمة |
| [ ] | Recording يشتغل | Audio Player يشتغل لو ضغطت Play |

---

## 🚨 إذا استمرت المشكلة

### 1. تحقق من Render Logs:
```bash
# افتح: https://dashboard.render.com
# اذهب إلى: almasar-backend2025 → Logs
# ابحث عن:
📞 WebRTC Direct Call to: +966569705616
📤 Sending TwiML for WebRTC direct call
```

### 2. تحقق من Twilio Logs:
```
https://console.twilio.com/us1/monitor/logs/calls
```
افتح Call SID وشوف:
- ✅ **Request** راح لـ Backend URL صح؟
- ✅ **Response** رجع 200 OK؟
- ❌ **Error**: لو فيه 404 أو 500، معناه Backend مش شغال

### 3. تحقق من CORS:
لو شفت في Render Logs:
```
CORS error from origin...
```

معناه Frontend URL مش مضاف في CORS. افتح `.env.production`:
```env
FRONTEND_URL=https://almasar-frontend.vercel.app
```

وأعد Deploy الـ Backend.

---

## 📚 ملفات مهمة للرجوع إليها

1. **Backend Controller**: `backend/src/modules/calls/calls.controller.ts`
   - `/twiml/outbound` ← معالج المكالمات
   - `/webhook/status` ← تحديث الحالة
   - `/webhook/recording` ← حفظ التسجيلات

2. **Twilio Service**: `backend/src/modules/calls/twilio.service.ts`
   - `generateAccessToken()` ← Token للمتصفح
   - `makeCall()` ← إجراء مكالمة صادرة

3. **Frontend Hook**: `frontend/lib/hooks/useVoiceCall.ts`
   - `makeCall()` ← بداية المكالمة
   - Twilio Device setup

---

## ✅ بعد الإصلاح

المكالمات هتشتغل كالآتي:
1. ✅ اضغط Call من `mobile-call`
2. ✅ Twilio بيتصل بالرقم
3. ✅ لو رد: المكالمة بتشتغل عادي
4. ✅ لو ما ردش: بينتظر وبعدين يقفل (No Answer)
5. ✅ بعد المكالمة: Recording URL بيتحفظ تلقائياً
6. ✅ Call History بيعرض كل التفاصيل

---

**🎯 الخلاصة:**
- المشكلة: Twilio Application URL قديم
- الحل: غيّر Request URL إلى `https://almasar-backend2025.onrender.com/api/calls/twiml/outbound`
- الوقت: 2 دقيقة فقط
- النتيجة: المكالمات تشتغل 100% ✅

---

**📞 أي استفسار؟** ابعت screenshot من:
1. Twilio TwiML App Configuration page
2. Browser Console logs (F12)
3. Render Backend Logs
