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
    this.phoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (this.accountSid && this.authToken) {
      this.twilioClient = twilio(this.accountSid, this.authToken);
      this.logger.log('✅ Twilio client initialized successfully');
    } else {
      this.logger.warn('⚠️ Twilio credentials not configured');
    }
  }

  /**
   * إجراء مكالمة صادرة
   */
  async makeCall(to: string, url: string): Promise<any> {
    try {
      const call = await this.twilioClient.calls.create({
        to,
        from: this.phoneNumber,
        url, // TwiML URL
        statusCallback: `${this.configService.get('APP_URL')}/api/calls/webhook/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true, // تسجيل المكالمة
      });

      this.logger.log(`📞 Outbound call initiated: ${call.sid}`);
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

    // تحويل المكالمة للموظف المتاح
    twiml.dial({
      timeout: 30,
      record: 'record-from-answer', // تسجيل من بداية الرد
    }, '+966xxxxxxxxx'); // رقم الموظف

    // إذا لم يرد أحد
    twiml.say(
      {
        voice: 'Polly.Zeina',
        language: 'ar-AE',
      },
      'نعتذر، جميع الموظفين مشغولون حالياً. يرجى المحاولة لاحقاً',
    );

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
}
