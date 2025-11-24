import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CallsService } from './calls.service';
import { TwilioService } from './twilio.service';
import { CallDirection, CallStatus } from './entities/call.entity';

@Controller('calls')
export class CallsController {
  private readonly logger = new Logger(CallsController.name);

  constructor(
    private readonly callsService: CallsService,
    private readonly twilioService: TwilioService,
  ) {}

  /**
   * الحصول على جميع المكالمات
   */
  @Get()
  async getAllCalls(
    @Query('direction') direction?: CallDirection,
    @Query('status') status?: CallStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const filters: any = {};

    if (direction) filters.direction = direction;
    if (status) filters.status = status;
    if (fromDate) filters.fromDate = new Date(fromDate);
    if (toDate) filters.toDate = new Date(toDate);

    return await this.callsService.getAllCalls(filters);
  }

  /**
   * الحصول على إحصائيات المكالمات
   */
  @Get('stats')
  async getCallStats() {
    return await this.callsService.getCallStats();
  }

  /**
   * الحصول على Twilio Access Token للاتصال من المتصفح (WebRTC)
   */
  @Get('token')
  async getVoiceToken(@Query('identity') identity: string = 'agent', @Res() res) {
    try {
      const token = await this.twilioService.generateVoiceToken(identity);
      this.logger.log(`🎫 Voice token generated for: ${identity}`);
      
      // منع الـ cache للـ token
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      return res.json({ token });
    } catch (error) {
      this.logger.error(`❌ Error generating token: ${error.message}`);
      throw error;
    }
  }

  /**
   * الحصول على جميع تسجيلات المكالمات
   */
  @Get('recordings')
  async getAllRecordings(
    @Query('limit') limit: string = '50',
    @Query('callSid') callSid?: string,
  ) {
    try {
      const recordings = await this.twilioService.getAllRecordings(
        parseInt(limit, 10),
        callSid,
      );
      this.logger.log(`🎙️ Retrieved ${recordings.length} recordings`);
      return recordings;
    } catch (error) {
      this.logger.error(`❌ Error fetching recordings: ${error.message}`);
      throw error;
    }
  }

  /**
   * الحصول على تسجيلات مكالمة معينة
   */
  @Get('recordings/:callSid')
  async getCallRecordings(@Param('callSid') callSid: string) {
    try {
      const recordings = await this.twilioService.getRecordings(callSid);
      this.logger.log(
        `🎙️ Retrieved ${recordings.length} recordings for call ${callSid}`,
      );
      return recordings;
    } catch (error) {
      this.logger.error(`❌ Error fetching recordings: ${error.message}`);
      throw error;
    }
  }

  /**
   * الحصول على مكالمة محددة
   */
  @Get(':id')
  async getCallById(@Param('id') id: string) {
    return await this.callsService.getCallById(id);
  }

  /**
   * إجراء مكالمة صادرة
   */
  @Post('outbound')
  async makeOutboundCall(
    @Body()
    body: {
      to: string;
      agentId?: string;
      agentName?: string;
    },
  ) {
    return await this.callsService.makeOutboundCall(
      body.to,
      body.agentId,
      body.agentName,
    );
  }

  /**
   * إجراء مكالمة Click-to-Call (يتصل بالموظف أولاً ثم بالعميل)
   */
  @Post('make-call')
  async makeCall(
    @Body()
    body: {
      to: string; // رقم العميل
      from: string; // رقم Twilio
      agentPhone?: string; // رقم الموظف
    },
  ) {
    try {
      this.logger.log(`📞 Click-to-Call: Agent will receive call first, then connecting to ${body.to}`);
      
      // رقم الموظف - يفضل يكون من الواجهة، لو مش موجود نستخدم الرقم المتحقق منه
      const agentPhone = body.agentPhone || '+966559902557';
      
      // Twilio هيتصل بالموظف أولاً
      const call = await this.twilioService.makeCall(
        agentPhone, // الموظف
        body.from, // رقم Twilio
        `${process.env.BACKEND_URL || 'https://unacetic-nearly-tawanna.ngrok-free.dev'}/api/calls/twiml/connect?customerPhone=${encodeURIComponent(body.to)}`,
      );
      
      this.logger.log(`✅ Call initiated to agent first: ${call.sid}`);
      
      return {
        success: true,
        callSid: call.sid,
        status: call.status,
        message: 'سيتم الاتصال بك أولاً، ثم توصيلك بالعميل',
      };
    } catch (error) {
      this.logger.error(`❌ Error making call: ${error.message}`);
      this.logger.error(error.stack);
      return {
        success: false,
        error: error.message,
        details: error.toString(),
        message: 'فشل بدء المكالمة',
      };
    }
  }

  /**
   * Webhook لاستقبال المكالمات الواردة من Twilio
   */
  @Post('webhook/inbound')
  async handleInboundCall(
    @Body() twilioData: any,
    @Headers('x-twilio-signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('📞 Incoming call webhook received');
      this.logger.log(`Twilio Data: ${JSON.stringify(twilioData)}`);

      // حفظ المكالمة في قاعدة البيانات
      const call = await this.callsService.handleInboundCall(twilioData);
      this.logger.log(`✅ Call saved: ${call.id}`);

      // إرجاع TwiML Response
      const twiml = this.twilioService.createInboundCallTwiML(
        'مرحباً بك في مركز اتصالات المسار الساخن. سيتم تحويلك للموظف المختص',
      );

      this.logger.log('📤 Sending TwiML response');
      res.type('text/xml');
      res.send(twiml);
    } catch (error) {
      this.logger.error(`❌ Error handling inbound call: ${error.message}`);
      this.logger.error(error.stack);
      
      // إرجاع TwiML بسيط حتى لو فيه خطأ
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Zeina" language="ar-AE">عذراً، حدث خطأ في النظام</Say>
  <Hangup/>
</Response>`;
      
      res.type('text/xml');
      res.status(HttpStatus.OK).send(errorTwiml);
    }
  }

  /**
   * Webhook لتحديث حالة المكالمة
   */
  @Post('webhook/status')
  async handleStatusCallback(@Body() twilioData: any) {
    try {
      this.logger.log(
        `📊 Call status update: ${twilioData.CallSid} - ${twilioData.CallStatus}`,
      );

      const statusMap: Record<string, CallStatus> = {
        initiated: CallStatus.INITIATED,
        ringing: CallStatus.RINGING,
        'in-progress': CallStatus.IN_PROGRESS,
        completed: CallStatus.COMPLETED,
        busy: CallStatus.BUSY,
        failed: CallStatus.FAILED,
        'no-answer': CallStatus.NO_ANSWER,
        canceled: CallStatus.CANCELLED,
      };

      const status = statusMap[twilioData.CallStatus] || CallStatus.FAILED;

      await this.callsService.updateCallStatus(twilioData.CallSid, status, {
        durationSeconds: parseInt(twilioData.CallDuration || '0', 10),
        recordingUrl: twilioData.RecordingUrl,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Error updating call status: ${error.message}`);
      throw error;
    }
  }

  /**
   * TwiML للمكالمات الصادرة من المتصفح (WebRTC) - مباشرة بدون رن على التليفون
   */
  @Post('twiml/outbound')
  async handleOutboundCall(
    @Body() twilioData: any,
    @Res() res: Response,
  ) {
    try {
      const toNumber = twilioData.To;
      this.logger.log(`📞 WebRTC outbound call to: ${toNumber}`);
      
      const twiml = new (require('twilio').twiml.VoiceResponse)();
      
      // الاتصال مباشرة بالعميل
      const dial = twiml.dial({
        callerId: process.env.TWILIO_PHONE_NUMBER || '+18154860356',
        timeout: 30,
        record: 'record-from-answer', // تسجيل من لحظة الرد
        recordingStatusCallback: `${process.env.BACKEND_URL || 'https://unacetic-nearly-tawanna.ngrok-free.dev'}/api/calls/webhook/recording`,
      });
      
      dial.number(toNumber);
      
      // لو محدش رد
      twiml.say(
        {
          voice: 'Polly.Zeina',
          language: 'ar-AE',
        },
        'لم يتم الرد على المكالمة',
      );
      
      res.type('text/xml');
      res.send(twiml.toString());
      
    } catch (error) {
      this.logger.error(`❌ Error in outbound TwiML: ${error.message}`);
      
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Zeina" language="ar-AE">حدث خطأ في الاتصال</Say>
  <Hangup/>
</Response>`;
      
      res.type('text/xml');
      res.status(HttpStatus.OK).send(errorTwiml);
    }
  }

  /**
   * TwiML للاتصال بالموظف ثم توصيله بالعميل (Click-to-Call)
   */
  @Post('twiml/connect')
  async connectToCustomer(
    @Query('customerPhone') customerPhone: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`🔗 Connecting agent to customer: ${customerPhone}`);
      
      const twiml = new (require('twilio').twiml.VoiceResponse)();
      
      // رسالة واضحة للموظف
      twiml.say(
        {
          voice: 'Polly.Zeina',
          language: 'ar-AE',
        },
        'مرحباً. الآن جاري الاتصال بالعميل. من فضلك انتظر',
      );
      
      // الاتصال بالعميل مع التسجيل
      const dial = twiml.dial({
        callerId: '+966555254915', // رقم الشركة السعودي
        timeout: 60, // الانتظار 60 ثانية (دقيقة كاملة)
        record: 'record-from-answer', // تسجيل من لحظة رد العميل
        recordingStatusCallback: `${process.env.BACKEND_URL || 'https://unacetic-nearly-tawanna.ngrok-free.dev'}/api/calls/webhook/recording`,
        recordingStatusCallbackEvent: ['completed'],
        trim: 'trim-silence', // إزالة الصمت من البداية والنهاية
      });
      
      dial.number(customerPhone);
      
      // لو العميل مردش
      twiml.say(
        {
          voice: 'Polly.Zeina',
          language: 'ar-AE',
        },
        'عذراً، العميل لم يرد على المكالمة. شكراً لك',
      );
      
      res.type('text/xml');
      res.send(twiml.toString());
      
    } catch (error) {
      this.logger.error(`❌ Error in connect TwiML: ${error.message}`);
      
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Zeina" language="ar-AE">حدث خطأ</Say>
  <Hangup/>
</Response>`;
      
      res.type('text/xml');
      res.status(HttpStatus.OK).send(errorTwiml);
    }
  }

  /**
   * معالجة اختيار المستخدم من القائمة
   */
  @Post('webhook/menu')
  async handleMenuChoice(@Body() twilioData: any, @Res() res: Response) {
    try {
      this.logger.log(`📋 Menu choice received: ${twilioData.Digits}`);
      
      const twiml = new (require('twilio').twiml.VoiceResponse)();
      
      const choice = twilioData.Digits;
      
      if (choice === '1') {
        // التحدث مع خدمة العملاء
        twiml.say(
          {
            voice: 'Polly.Zeina',
            language: 'ar-AE',
          },
          'جاري تحويلك لخدمة العملاء. يرجى الانتظار',
        );
        
        // موسيقى انتظار
        twiml.play('http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');
        
        twiml.say(
          {
            voice: 'Polly.Zeina',
            language: 'ar-AE',
          },
          'نعتذر، جميع موظفينا مشغولون حالياً. شكراً لاتصالك',
        );
        
      } else if (choice === '2') {
        // ترك رسالة صوتية
        twiml.say(
          {
            voice: 'Polly.Zeina',
            language: 'ar-AE',
          },
          'يرجى ترك رسالتك بعد سماع الإشارة الصوتية',
        );
        
        twiml.record({
          maxLength: 120, // دقيقتين كحد أقصى
          playBeep: true,
          transcribe: false,
          recordingStatusCallback: '/api/calls/webhook/recording',
        });
        
        twiml.say(
          {
            voice: 'Polly.Zeina',
            language: 'ar-AE',
          },
          'شكراً لرسالتك. سنتواصل معك قريباً',
        );
        
      } else {
        twiml.say(
          {
            voice: 'Polly.Zeina',
            language: 'ar-AE',
          },
          'اختيار غير صحيح. شكراً لاتصالك',
        );
      }
      
      twiml.hangup();
      
      res.type('text/xml');
      res.send(twiml.toString());
      
    } catch (error) {
      this.logger.error(`❌ Error handling menu choice: ${error.message}`);
      
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Zeina" language="ar-AE">عذراً، حدث خطأ</Say>
  <Hangup/>
</Response>`;
      
      res.type('text/xml');
      res.status(HttpStatus.OK).send(errorTwiml);
    }
  }

  /**
   * Webhook لاستقبال التسجيل الصوتي
   */
  @Post('webhook/recording')
  async handleRecording(@Body() twilioData: any) {
    try {
      this.logger.log(`🎙️ Recording received: ${twilioData.RecordingUrl}`);
      
      // TODO: حفظ التسجيل في قاعدة البيانات
      
      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Error handling recording: ${error.message}`);
      throw error;
    }
  }
}
