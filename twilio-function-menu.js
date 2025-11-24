/**
 * Twilio Function لمعالجة اختيار القائمة
 * 
 * Path: /menu-choice
 */

exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const choice = event.Digits;
  
  if (choice === '1') {
    // خيار 1: التحويل لخدمة العملاء
    twiml.say({
      voice: 'Polly.Zeina',
      language: 'ar-AE'
    }, 'جاري التحويل لخدمة العملاء. برجاء الانتظار');
    
    // موسيقى انتظار (اختياري)
    twiml.play('http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');
    
    // رسالة الانتظار
    twiml.say({
      voice: 'Polly.Zeina',
      language: 'ar-AE'
    }, 'نعتذر، جميع موظفينا مشغولون حالياً. يرجى المحاولة لاحقاً');
    
  } else if (choice === '2') {
    // خيار 2: تسجيل رسالة صوتية
    twiml.say({
      voice: 'Polly.Zeina',
      language: 'ar-AE'
    }, 'يرجى ترك رسالتك بعد سماع الإشارة الصوتية. اضغط المربع عند الانتهاء');
    
    twiml.record({
      maxLength: 60,  // 60 ثانية كحد أقصى
      transcribe: false,
      playBeep: true,
      recordingStatusCallback: '/recording-complete',  // سنضيف هذه لاحقاً
      action: '/recording-done'
    });
    
  } else {
    // لم يختر خيار صحيح
    twiml.say({
      voice: 'Polly.Zeina',
      language: 'ar-AE'
    }, 'عذراً، الخيار غير صحيح. شكراً لاتصالك');
  }
  
  twiml.hangup();
  callback(null, twiml);
};
