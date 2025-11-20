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

      // حفظ المكالمة في قاعدة البيانات
      const call = await this.callsService.handleInboundCall(twilioData);

      // إرجاع TwiML Response
      const twiml = this.twilioService.createInboundCallTwiML(
        'مرحباً بك في مركز اتصالات المسار الساخن. سيتم تحويلك للموظف المختص',
      );

      res.type('text/xml');
      res.send(twiml);
    } catch (error) {
      this.logger.error(`❌ Error handling inbound call: ${error.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error');
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
   * TwiML للمكالمات الصادرة
   */
  @Post('twiml/outbound')
  getTwiMLOutbound(@Res() res: Response) {
    const twiml = this.twilioService.createInboundCallTwiML(
      'جاري الاتصال بالعميل',
    );
    res.type('text/xml');
    res.send(twiml);
  }
}
