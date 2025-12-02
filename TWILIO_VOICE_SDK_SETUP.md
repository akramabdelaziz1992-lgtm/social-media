# إعداد Twilio Voice SDK (WebRTC Calling)

## المشكلة التي تم حلها
كانت هناك مشكلة في الـ Access Token مما يسبب الخطأ:
```
AccessTokenInvalid (20101): Twilio was unable to validate your Access Token
```

## السبب
- المتغيرات المطلوبة لإنشاء Twilio Access Token كانت غير موجودة في `.env`
- الـ API Key و API Secret و TwiML App SID مطلوبين لإنشاء token صحيح

---

## خطوات الإعداد الصحيحة

### 1️⃣ إنشاء API Key و Secret في Twilio Console

1. اذهب إلى: https://console.twilio.com/
2. افتح: **Account > API Keys & Tokens**
3. اضغط على: **Create API Key**
4. أدخل اسم للـ Key (مثل: `VoiceSDK-Key`)
5. اختر نوع: **Standard**
6. احفظ الـ **API Key SID** و **API Secret** (مهم جداً! ما يظهر مرة ثانية)

### 2️⃣ إنشاء TwiML App

1. اذهب إلى: https://console.twilio.com/us1/develop/voice/manage/twiml-apps
2. اضغط على: **Create new TwiML App**
3. أدخل اسم (مثل: `AlMasar Voice App`)
4. في **Voice Configuration**:
   - **Request URL**: `https://your-domain.com/api/calls/webhook/outbound`
   - **HTTP Method**: `POST`
5. احفظ وسجل الـ **TwiML App SID** (يبدأ بـ `AP...`)

### 3️⃣ تحديث ملف `.env` في Backend

أضف هذه المتغيرات في `backend/.env`:

```env
# Twilio Basic (موجود بالفعل)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+966xxxxxxxxx

# Twilio Voice SDK (WebRTC) - جديد ✅
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4️⃣ إعادة تشغيل Backend

```bash
cd backend
npm run start:dev
```

### 5️⃣ إعادة تشغيل Frontend

```bash
cd frontend
npm run dev
```

---

## التحقق من نجاح الإعداد

### في Backend Console يجب أن تشاهد:
```
🔑 Creating Access Token with:
  Account SID: ACxxx...
  API Key: SKxxx...
  API Secret: xxxxxxxx...
  TwiML App SID: APxxx...
  Identity: agent-xxx
✅ JWT Token generated successfully (xxx chars)
```

### في Frontend Console يجب أن تشاهد:
```
WebRTC Call started: CAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## كيفية الحصول على القيم المطلوبة

### TWILIO_ACCOUNT_SID
- من: https://console.twilio.com/
- أو من: Dashboard > Account Info

### TWILIO_AUTH_TOKEN
- من: https://console.twilio.com/
- أو من: Dashboard > Account Info

### TWILIO_API_KEY و TWILIO_API_SECRET
- من: https://console.twilio.com/us1/develop/tools/api-keys
- اضغط **Create API Key**
- ⚠️ **مهم**: احفظ الـ Secret فوراً (لن يظهر مرة أخرى)

### TWILIO_TWIML_APP_SID
- من: https://console.twilio.com/us1/develop/voice/manage/twiml-apps
- اضغط **Create new TwiML App**
- Voice Request URL: `https://your-domain.com/api/calls/webhook/outbound`

### TWILIO_PHONE_NUMBER
- من: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
- اختر رقمك المشترى من Twilio

---

## استكشاف الأخطاء

### ❌ Error: `Missing TWILIO_API_KEY`
**الحل**: تأكد من إضافة `TWILIO_API_KEY` في `backend/.env`

### ❌ Error: `Missing TWILIO_API_SECRET`
**الحل**: تأكد من إضافة `TWILIO_API_SECRET` في `backend/.env`

### ❌ Error: `Missing TWILIO_TWIML_APP_SID`
**الحل**: تأكد من إضافة `TWILIO_TWIML_APP_SID` في `backend/.env`

### ❌ Error: `AccessTokenInvalid (20101)`
**الأسباب المحتملة**:
1. الـ API Key أو Secret غير صحيح
2. الـ TwiML App SID غير صحيح
3. الـ Account SID غير صحيح
4. الـ API Key غير مفعّل في Twilio Console

**الحل**: تحقق من جميع القيم في `.env` وقارنها مع Twilio Console

### ❌ Error: `Call error: undefined`
**السبب**: الـ token request فشل قبل إنشاء الـ Device

**الحل**: 
1. افتح Network tab في Developer Tools
2. ابحث عن request `/api/calls/token`
3. شاهد الـ response للتأكد من وجود `{ token: "..." }`

---

## الكود المسؤول عن إنشاء Token

### Backend: `backend/src/modules/calls/twilio.service.ts`

```typescript
generateVoiceToken(identity: string = 'agent'): string {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const twimlAppSid = this.configService.get<string>('TWILIO_TWIML_APP_SID');
  const apiKey = this.configService.get<string>('TWILIO_API_KEY');
  const apiSecret = this.configService.get<string>('TWILIO_API_SECRET');

  // إنشاء Access Token
  const token = new AccessToken(
    this.accountSid,
    apiKey,
    apiSecret,
    { identity, ttl: 3600 }
  );

  // إضافة Voice Grant
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: true,
  });

  token.addGrant(voiceGrant);
  return token.toJwt();
}
```

### Frontend: `frontend/app/mobile-call/page.tsx`

```typescript
// الحصول على Token
const tokenResponse = await fetch(`${baseUrl}/api/calls/token?identity=${identity}`);
const { token } = await tokenResponse.json();

// إنشاء Twilio Device
const { Device } = await import('@twilio/voice-sdk');
const device = new Device(token, {
  logLevel: 1,
  codecPreferences: ['opus', 'pcmu']
});

// تسجيل Device
await device.register();

// بدء المكالمة
const call = await device.connect({
  params: { To: phoneNumber }
});
```

---

## الموارد المفيدة

- [Twilio Voice SDK Documentation](https://www.twilio.com/docs/voice/sdks/javascript)
- [Twilio Access Token Documentation](https://www.twilio.com/docs/iam/access-tokens)
- [TwiML Apps Documentation](https://www.twilio.com/docs/voice/twiml/applications)
- [Twilio API Keys Documentation](https://www.twilio.com/docs/iam/api-keys)

---

## ملخص التغييرات

### ✅ تم إضافة
1. متغيرات جديدة في `.env.example`:
   - `TWILIO_API_KEY`
   - `TWILIO_API_SECRET`
   - `TWILIO_TWIML_APP_SID`

2. تحسين error handling في `mobile-call/page.tsx`:
   - التعامل مع errors بشكل صحيح
   - تنظيف الـ Device عند حدوث خطأ
   - منع الـ undefined errors

### ⚠️ خطوات مطلوبة منك
1. إنشاء API Key في Twilio Console
2. إنشاء TwiML App في Twilio Console
3. إضافة القيم في `backend/.env`
4. إعادة تشغيل Backend و Frontend

---

**تم الإصلاح بنجاح! 🎉**
