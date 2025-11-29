import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: twilio.Twilio;
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly phoneNumber: string;

  constructor(private configService: ConfigService) {
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    // استخدام الرقم السعودي كـ Caller ID الافتراضي
    this.phoneNumber = this.configService.get<string>('TWILIO_SAUDI_CALLER_ID') || this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (this.accountSid && this.authToken) {
      this.twilioClient = twilio(this.accountSid, this.authToken);
      this.logger.log('✅ Twilio client initialized successfully');
      this.logger.log(`📱 Default Caller ID: ${this.phoneNumber}`);
    } else {
      this.logger.warn('⚠️ Twilio credentials not configured');
    }
  }

  /**
   * إجراء مكالمة صادرة
   */
  async makeCall(to: string, from: string = this.phoneNumber, url?: string): Promise<any> {
    try {
      // استخدام BACKEND_URL (ngrok) بدلاً من APP_URL (localhost)
      const backendUrl = this.configService.get('BACKEND_URL') || this.configService.get('APP_URL') || 'https://unacetic-nearly-tawanna.ngrok-free.dev';
      const twimlUrl = url || `${backendUrl}/api/calls/twiml/outbound`;
      
      this.logger.log(`📞 Using TwiML URL: ${twimlUrl}`);
      
      const call = await this.twilioClient.calls.create({
        to,
        from: from || this.phoneNumber,
        url: twimlUrl, // TwiML URL
        statusCallback: `${backendUrl}/api/calls/webhook/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true, // تسجيل المكالمة
      });

      this.logger.log(`📞 Outbound call initiated: ${call.sid} from ${from} to ${to}`);
      return call;
    } catch (error) {
      this.logger.error(`❌ Failed to make call: ${error.message}`);
      throw error;
    }
  }

  /**
   * إنهاء مكالمة
   */
  async endCall(callSid: string): Promise<any> {
    try {
      const call = await this.twilioClient.calls(callSid).update({
        status: 'completed',
      });

      this.logger.log(`📴 Call ended: ${callSid}`);
      return call;
    } catch (error) {
      this.logger.error(`❌ Failed to end call: ${error.message}`);
      throw error;
    }
  }

  /**
   * الحصول على تفاصيل المكالمة
   */
  async getCallDetails(callSid: string): Promise<any> {
    try {
      const call = await this.twilioClient.calls(callSid).fetch();
      return call;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch call details: ${error.message}`);
      throw error;
    }
  }

  /**
   * الحصول على تسجيل المكالمة
   */
  async getRecordings(callSid: string): Promise<any[]> {
    try {
      const recordings = await this.twilioClient.recordings.list({
        callSid,
        limit: 20,
      });

      return recordings.map((recording) => ({
        sid: recording.sid,
        duration: recording.duration,
        url: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`,
        dateCreated: recording.dateCreated,
      }));
    } catch (error) {
      this.logger.error(`❌ Failed to fetch recordings: ${error.message}`);
      throw error;
    }
  }

  /**
   * إنشاء TwiML Response للمكالمات الواردة
   */
  createInboundCallTwiML(message: string = 'مرحباً بك في مركز الاتصالات'): string {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // رسالة الترحيب
    twiml.say(
      {
        voice: 'Polly.Zeina', // صوت عربي
        language: 'ar-AE', // عربي إماراتي (الأقرب للسعودي)
      },
      message,
    );

    // قائمة الخيارات
    const gather = twiml.gather({
      input: ['dtmf'], // استقبال أرقام من لوحة المفاتيح
      numDigits: 1,
      action: '/api/calls/webhook/menu', // URL لمعالجة الاختيار
      timeout: 10,
    });

    gather.say(
      {
        voice: 'Polly.Zeina',
        language: 'ar-AE',
      },
      'للتحدث مع خدمة العملاء اضغط واحد. لترك رسالة صوتية اضغط اثنين',
    );

    // إذا لم يضغط شيء - نعيد القائمة
    twiml.redirect('/api/calls/webhook/inbound');

    return twiml.toString();
  }

  /**
   * التحقق من صحة Webhook Request من Twilio
   */
  validateRequest(signature: string, url: string, params: any): boolean {
    return twilio.validateRequest(
      this.authToken,
      signature,
      url,
      params,
    );
  }

  /**
   * توليد Twilio Access Token للاتصال من المتصفح (WebRTC)
   */
  generateVoiceToken(identity: string = 'agent'): string {
    try {
      const AccessToken = twilio.jwt.AccessToken;
      const VoiceGrant = AccessToken.VoiceGrant;

      const twimlAppSid = this.configService.get<string>('TWILIO_TWIML_APP_SID');
      const apiKey = this.configService.get<string>('TWILIO_API_KEY');
      const apiSecret = this.configService.get<string>('TWILIO_API_SECRET');

      // التحقق من وجود المتطلبات
      if (!twimlAppSid) {
        this.logger.error('❌ Missing TWILIO_TWIML_APP_SID');
        throw new Error('Missing TWILIO_TWIML_APP_SID');
      }
      if (!apiKey) {
        this.logger.error('❌ Missing TWILIO_API_KEY');
        throw new Error('Missing TWILIO_API_KEY');
      }
      if (!apiSecret) {
        this.logger.error('❌ Missing TWILIO_API_SECRET');
        throw new Error('Missing TWILIO_API_SECRET');
      }

      this.logger.log('🔑 Creating Access Token with:');
      this.logger.log(`  Account SID: ${this.accountSid}`);
      this.logger.log(`  API Key: ${apiKey}`);
      this.logger.log(`  API Secret: ${apiSecret.substring(0, 8)}...`);
      this.logger.log(`  TwiML App SID: ${twimlAppSid}`);
      this.logger.log(`  Identity: ${identity}`);

      // إنشاء Access Token باستخدام API Key و Secret (الطريقة الصحيحة)
      const token = new AccessToken(
        this.accountSid,
        apiKey,      // ✅ استخدام API Key الصحيح
        apiSecret,   // ✅ استخدام API Secret الصحيح
        { identity, ttl: 3600 }, // صالح لمدة ساعة
      );

      // إضافة Voice Grant
      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true,
      });

      token.addGrant(voiceGrant);

      const jwt = token.toJwt();
      this.logger.log(`✅ JWT Token generated successfully (${jwt.length} chars)`);
      
      return jwt;
    } catch (error) {
      this.logger.error(`❌ Failed to generate voice token: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  /**
   * الحصول على جميع تسجيلات المكالمات
   */
  async getAllRecordings(limit: number = 50, callSid?: string): Promise<any[]> {
    try {
      const options: any = { limit };
      if (callSid) {
        options.callSid = callSid;
      }

      const recordings = await this.twilioClient.recordings.list(options);

      return recordings.map((recording) => ({
        sid: recording.sid,
        callSid: recording.callSid,
        duration: recording.duration,
        url: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`,
        dateCreated: recording.dateCreated,
        status: recording.status,
      }));
    } catch (error) {
      this.logger.error(`❌ Failed to fetch all recordings: ${error.message}`);
      throw error;
    }
  }
}
