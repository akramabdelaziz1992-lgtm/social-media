/**
 * Twilio Function للمكالمات الواردة - IVR بالعربي
 * 
 * كيفية الاستخدام:
 * 1. افتح: https://console.twilio.com/us1/develop/functions/services
 * 2. اضغط "Create Service" -> سمّيه "AlMasar IVR"
 * 3. اضغط "Add" -> "Add Function"
 * 4. Path: /inbound-call
 * 5. انسخ الكود ده كله والصقه هناك
 * 6. اضغط "Deploy All"
 * 7. انسخ الـ URL وحطه في Phone Numbers -> +1 (815) 486-0356 -> A call comes in
 */

exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  
  // رسالة ترحيب بسيطة وواضحة
  twiml.say({
    voice: 'Polly.Zeina',
    language: 'ar-AE'
  }, 'مرحباً بك في مركز اتصالات المسار الساخن');
  
  // رسالة شكر
  twiml.say({
    voice: 'Polly.Zeina',
    language: 'ar-AE'
  }, 'شكراً لاتصالك');
  
  // إنهاء المكالمة
  twiml.hangup();
  
  // إرجاع TwiML
  return callback(null, twiml);
};
