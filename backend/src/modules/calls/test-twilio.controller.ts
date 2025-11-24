import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('test-twilio')
export class TestTwilioController {
  private readonly logger = new Logger(TestTwilioController.name);

  constructor(private readonly twilioService: TwilioService) {}

  /**
   * اختبار بسيط للاتصال
   */
  @Post('call')
  async testCall(@Body() body: { to: string }) {
    try {
      this.logger.log(`📞 Testing call to: ${body.to}`);

      // الاتصال المباشر بالرقم المستهدف
      const call = await this.twilioService.makeCall(
        body.to, // الرقم المراد الاتصال به
        '+18154860356', // رقم Twilio
        'http://demo.twilio.com/docs/voice.xml' // TwiML بسيط للاختبار
      );

      this.logger.log(`✅ Call created: ${call.sid}`);
      this.logger.log(`📊 Status: ${call.status}`);
      this.logger.log(`📱 To: ${call.to}`);
      this.logger.log(`📱 From: ${call.from}`);

      return {
        success: true,
        callSid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from,
        message: 'تم إنشاء المكالمة في Twilio',
        note: 'تحقق من Console Twilio للتفاصيل',
      };
    } catch (error) {
      this.logger.error(`❌ Error: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);

      return {
        success: false,
        error: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
        details: error.toString(),
      };
    }
  }

  /**
   * الحصول على آخر 5 مكالمات من Twilio
   */
  @Get('recent-calls')
  async getRecentCalls() {
    try {
      this.logger.log('📋 Fetching recent calls from Twilio...');

      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const calls = await client.calls.list({ limit: 5 });

      const callsData = calls.map(call => ({
        sid: call.sid,
        from: call.from,
        to: call.to,
        status: call.status,
        direction: call.direction,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
      }));

      this.logger.log(`✅ Found ${callsData.length} calls`);

      return {
        success: true,
        count: callsData.length,
        calls: callsData,
      };
    } catch (error) {
      this.logger.error(`❌ Error: ${error.message}`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * فحص صحة الإعدادات
   */
  @Get('check-config')
  checkConfig() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    return {
      accountSid: accountSid ? `${accountSid.substring(0, 10)}...` : '❌ مفقود',
      authToken: authToken ? `${authToken.substring(0, 10)}... ✅` : '❌ مفقود',
      phoneNumber: phoneNumber || '❌ مفقود',
      twimlAppSid: twimlAppSid ? `${twimlAppSid.substring(0, 10)}...` : '❌ مفقود',
      allConfigured: !!(accountSid && authToken && phoneNumber),
    };
  }
}
