# دليل إعداد استقبال المكالمات الواردة
## Incoming Calls Setup Guide

---

## ✅ التحديثات المطبقة

تم تطبيق التحديثات التالية على التطبيق:

### 1. Backend Updates ✅

#### `twilio.service.ts`
- ✅ تحديث دالة `createInboundCallTwiML()` لتوجيه المكالمات للموظف عبر WebRTC
- ✅ استخدام `dial.client(identity)` بدلاً من القائمة التفاعلية
- ✅ إضافة تسجيل تلقائي للمكالمات الواردة

#### `calls.controller.ts`
- ✅ تحديث webhook `/api/calls/webhook/inbound` لإرجاع TwiML المحدث
- ✅ توجيه المكالمات إلى `client:mobile-agent`

### 2. Frontend Updates ✅

#### `mobile-call/page.tsx`
- ✅ إضافة States للمكالمات الواردة: `isIncomingCall`, `incomingCallFrom`, `incomingCall`
- ✅ إضافة `useEffect` لتهيئة Twilio Device بـ Identity ثابت (`mobile-agent`)
- ✅ إضافة Event listener للمكالمات الواردة: `device.on('incoming')`
- ✅ إضافة دوال `handleAcceptIncomingCall()` و `handleRejectIncomingCall()`
- ✅ إضافة UI لنافذة استقبال المكالمة مع أزرار القبول/الرفض
- ✅ تسجيل المكالمات الواردة في Database

---

## 🔧 خطوات إعداد Twilio

### الخطوة 1: الوصول لإعدادات الرقم

1. افتح [Twilio Console](https://console.twilio.com/)
2. اذهب إلى **Phone Numbers** → **Manage** → **Active numbers**
3. اختر الرقم: **+1 (320) 433-6644**

### الخطوة 2: ضبط Voice Configuration

في قسم **Voice Configuration** للرقم:

#### عند استقبال مكالمة (A CALL COMES IN):

اختر: **Webhook**
- **URL**: 
  ```
  https://unacetic-nearly-tawanna.ngrok-free.dev/api/calls/webhook/inbound
  ```
  
- **HTTP Method**: `POST`

> ⚠️ **هام جداً**: تأكد من استخدام ngrok URL الصحيح (Backend URL)

#### طريقة بديلة - استخدام TwiML Bin:

إذا كنت تفضل استخدام TwiML Bin:

1. اذهب إلى **TwiML Bins** في Twilio Console
2. أنشئ TwiML Bin جديد باسم "Incoming Call to Agent"
3. أضف هذا الكود:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Zeina" language="ar-AE">
        مرحباً بك في لينك كول. جاري تحويلك للموظف المختص
    </Say>
    <Dial timeout="30" 
          record="record-from-answer-dual" 
          recordingStatusCallback="https://unacetic-nearly-tawanna.ngrok-free.dev/api/calls/webhook/recording"
          trim="trim-silence">
        <Client>mobile-agent</Client>
    </Dial>
    <Say voice="Polly.Zeina" language="ar-AE">
        عذراً، جميع الموظفين مشغولون حالياً. يرجى الاتصال لاحقاً
    </Say>
</Response>
```

### الخطوة 3: حفظ الإعدادات

- اضغط **Save** لحفظ التغييرات

---

## 🧪 اختبار استقبال المكالمات

### الطريقة 1: الاتصال من هاتفك

1. افتح التطبيق على [https://almasar-frontend.vercel.app/mobile-call](https://almasar-frontend.vercel.app/mobile-call)
2. سجل دخول كموظف
3. **انتظر 3-5 ثواني** حتى يتم تسجيل الـ Device (سترى في Console: "Device registered")
4. من هاتفك الشخصي، اتصل على الرقم: **+1 (320) 433-6644**
5. يجب أن تظهر نافذة "مكالمة واردة" في التطبيق
6. اضغط "قبول" لاستقبال المكالمة

### الطريقة 2: الاتصال من حساب Twilio آخر

1. استخدم Twilio CLI أو تطبيق آخر
2. اتصل على **+1 (320) 433-6644**

### الطريقة 3: اختبار داخلي (Call to Call)

1. افتح التطبيق في نافذتين (أو جهازين)
2. سجل دخول كموظفين مختلفين
3. من نافذة واحدة، اتصل على **+1 (320) 433-6644**
4. يجب أن تظهر المكالمة الواردة في النافذة الأخرى

---

## 📊 المراقبة والتشخيص

### في Browser Console (F12):

ابحث عن هذه الرسائل:

```
✅ Device registered and ready for incoming calls
📞 Incoming call from: +1234567890
✅ Accepting incoming call
✅ Incoming call accepted
📴 Incoming call disconnected
✅ Incoming call logged
```

### في Backend Logs:

```
📞 Incoming call webhook received
✅ Call saved: xxx
📤 Sending TwiML response - routing to mobile-agent
```

### في Twilio Console:

- اذهب إلى **Monitor** → **Logs** → **Calls**
- ابحث عن المكالمة الأخيرة
- تحقق من:
  - ✅ Status: `completed`
  - ✅ Direction: `inbound`
  - ✅ From: رقم المتصل
  - ✅ To: `client:mobile-agent`

---

## ❗ استكشاف المشاكل

### المشكلة: "تم إنهاء المكالمة" فوراً

**السبب المحتمل**: لم يتم تسجيل Device في Frontend

**الحل**:
1. تأكد من فتح التطبيق قبل الاتصال
2. انتظر 3-5 ثواني بعد تسجيل الدخول
3. تحقق من Console: يجب أن ترى "Device registered"

### المشكلة: لا تظهر نافذة المكالمة الواردة

**السبب المحتمل**: مشكلة في Voice Configuration

**الحل**:
1. تحقق من Webhook URL في Twilio Console
2. تأكد من أن ngrok يعمل ومتصل بالـ Backend
3. جرب استخدام TwiML Bin بدلاً من Webhook

### المشكلة: "جميع الموظفين مشغولون"

**السبب**: لم يتم تسجيل أي Device بـ Identity `mobile-agent`

**الحل**:
1. تأكد من فتح التطبيق قبل الاتصال
2. راجع Backend Logs للتأكد من إصدار Token صحيح
3. تحقق من Console: يجب أن ترى "Device registered"

### المشكلة: لا يصل صوت أثناء المكالمة

**السبب**: مشكلة في أذونات المتصفح

**الحل**:
1. تأكد من منح إذن Microphone للمتصفح
2. جرب في متصفح آخر (Chrome يعمل بشكل أفضل)
3. تحقق من إعدادات الصوت في جهازك

---

## 🔄 تطويرات مستقبلية

### 1. دعم موظفين متعددين

حالياً، جميع المكالمات تذهب لـ `mobile-agent` واحد.

**لتوزيع المكالمات على موظفين متعددين**:

```typescript
// في Backend - twilio.service.ts
createInboundCallTwiML(availableAgents: string[]) {
  const twiml = new twilio.twiml.VoiceResponse();
  
  twiml.say({ voice: 'Polly.Zeina', language: 'ar-AE' },
    'مرحباً بك في لينك كول');
  
  const dial = twiml.dial({ timeout: 20 });
  
  // الاتصال بجميع الموظفين المتاحين (أول واحد يرد)
  availableAgents.forEach(agent => {
    dial.client(agent);
  });
  
  return twiml.toString();
}
```

### 2. Queue System (نظام الطوابير)

لإضافة نظام انتظار:

```xml
<Response>
    <Say voice="Polly.Zeina" language="ar-AE">
        مرحباً بك. أنت الآن في قائمة الانتظار
    </Say>
    <Enqueue waitUrl="/api/calls/wait-music">support-queue</Enqueue>
</Response>
```

### 3. Call Forwarding (تحويل المكالمات)

```typescript
// في Frontend - أثناء المكالمة
const transferCall = async (targetAgent: string) => {
  const call = (window as any).activeCall;
  // استخدام Twilio Conference أو Transfer
};
```

---

## 📝 ملاحظات هامة

1. **Identity الثابت**: حالياً نستخدم `mobile-agent` كـ Identity ثابت. يجب تطويره لاحقاً لدعم موظفين متعددين.

2. **Device Registration**: يجب أن يكون التطبيق مفتوحاً ومسجلاً قبل استقبال المكالمات.

3. **Browser Permissions**: يجب منح إذن Microphone للمتصفح.

4. **Recording**: يتم تسجيل المكالمات تلقائياً ويتم حفظها في Twilio.

5. **Call Logging**: يتم حفظ جميع المكالمات (الواردة والصادرة) في Database.

---

## ✅ Checklist للتفعيل الكامل

- [ ] Backend يعمل على ngrok
- [ ] Frontend مفتوح على Vercel أو localhost
- [ ] تسجيل دخول كموظف
- [ ] Device مسجل (تحقق من Console)
- [ ] Twilio Voice Configuration محدث
- [ ] Webhook URL صحيح
- [ ] اختبار مكالمة واردة
- [ ] نافذة القبول/الرفض تظهر
- [ ] المكالمة تعمل بنجاح
- [ ] التسجيل يعمل
- [ ] المكالمة محفوظة في Database

---

## 📞 للدعم

إذا واجهت أي مشكلة:

1. تحقق من Console Logs (F12)
2. تحقق من Backend Logs
3. تحقق من Twilio Debugger: [https://console.twilio.com/us1/monitor/logs/debugger](https://console.twilio.com/us1/monitor/logs/debugger)
4. راجع `.env` للتأكد من صحة Credentials

---

**تم إنشاء هذا الدليل:** ديسمبر 2025  
**آخر تحديث:** بعد إضافة دعم المكالمات الواردة
