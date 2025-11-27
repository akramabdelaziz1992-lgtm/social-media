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
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;

    return {
      accountSid: accountSid ? `${accountSid.substring(0, 10)}...` : '❌ مفقود',
      authToken: authToken ? `${authToken.substring(0, 10)}... ✅` : '❌ مفقود',
      phoneNumber: phoneNumber || '❌ مفقود',
      twimlAppSid: twimlAppSid ? `${twimlAppSid.substring(0, 10)}...` : '❌ مفقود',
      apiKey: apiKey ? `${apiKey.substring(0, 10)}... ✅` : '❌ مفقود',
      apiSecret: apiSecret ? `${apiSecret.substring(0, 10)}... ✅` : '❌ مفقود',
      allConfigured: !!(accountSid && authToken && phoneNumber && twimlAppSid && apiKey && apiSecret),
    };
  }

  /**
   * اختبار توليد Token وفحص صحته
   */
  @Get('test-token')
  async testToken() {
    try {
      this.logger.log('🔑 Testing token generation...');
      
      // توليد Token
      const token = this.twilioService.generateVoiceToken('test-agent');
      
      this.logger.log(`✅ Token generated: ${token.substring(0, 50)}...`);
      
      // فك تشفير Token للتحقق من محتواه
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return {
          success: false,
          error: 'Invalid JWT format',
        };
      }
      
      // فك Base64 للـ payload
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString()
      );
      
      this.logger.log(`📦 Token payload: ${JSON.stringify(payload, null, 2)}`);
      
      return {
        success: true,
        token: token,
        tokenLength: token.length,
        payload: payload,
        message: 'Token generated successfully',
        note: 'استخدم هذا Token في المتصفح للاختبار',
      };
    } catch (error) {
      this.logger.error(`❌ Error: ${error.message}`);
      this.logger.error(error.stack);
      
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  /**
   * التحقق من صحة الـ API Key عن طريق استدعاء Twilio API
   */
  @Get('verify-api-key')
  async verifyApiKey() {
    try {
      this.logger.log('🔍 Verifying Twilio API Key...');
      
      const twilio = require('twilio');
      
      // استخدام API Key للاتصال بـ Twilio
      const client = twilio(
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET,
        { accountSid: process.env.TWILIO_ACCOUNT_SID }
      );
      
      // محاولة جلب معلومات الحساب
      const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      
      this.logger.log(`✅ API Key is valid!`);
      this.logger.log(`Account: ${account.friendlyName}`);
      this.logger.log(`Status: ${account.status}`);
      
      return {
        success: true,
        message: 'API Key is valid and working',
        accountInfo: {
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type,
        },
      };
    } catch (error) {
      this.logger.error(`❌ API Key verification failed: ${error.message}`);
      this.logger.error(`Error code: ${error.code}`);
      this.logger.error(`More info: ${error.moreInfo}`);
      
      return {
        success: false,
        error: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
        message: 'API Key is invalid or expired',
        solution: 'يجب إنشاء API Key جديد من Twilio Console',
      };
    }
  }
}
