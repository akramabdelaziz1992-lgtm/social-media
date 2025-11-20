import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallStatus, CallDirection } from './entities/call.entity';
import { TwilioService } from './twilio.service';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    @InjectRepository(Call)
    private callsRepository: Repository<Call>,
    private twilioService: TwilioService,
  ) {}

  /**
   * إنشاء سجل مكالمة جديدة
   */
  async createCall(data: Partial<Call>): Promise<Call> {
    const call = this.callsRepository.create(data);
    return await this.callsRepository.save(call);
  }

  /**
   * تحديث حالة المكالمة
   */
  async updateCallStatus(
    twilioCallSid: string,
    status: CallStatus,
    additionalData?: Partial<Call>,
  ): Promise<Call> {
    const call = await this.callsRepository.findOne({
      where: { twilioCallSid },
    });

    if (!call) {
      throw new NotFoundException(`Call with SID ${twilioCallSid} not found`);
    }

    Object.assign(call, { status, ...additionalData });

    if (status === CallStatus.COMPLETED) {
      call.endedAt = new Date();
    }

    return await this.callsRepository.save(call);
  }

  /**
   * الحصول على جميع المكالمات
   */
  async getAllCalls(filters?: {
    direction?: CallDirection;
    status?: CallStatus;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<Call[]> {
    const query = this.callsRepository.createQueryBuilder('call');

    if (filters?.direction) {
      query.andWhere('call.direction = :direction', {
        direction: filters.direction,
      });
    }

    if (filters?.status) {
      query.andWhere('call.status = :status', { status: filters.status });
    }

    if (filters?.fromDate) {
      query.andWhere('call.createdAt >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }

    if (filters?.toDate) {
      query.andWhere('call.createdAt <= :toDate', { toDate: filters.toDate });
    }

    query.orderBy('call.createdAt', 'DESC');

    return await query.getMany();
  }

  /**
   * الحصول على مكالمة بواسطة ID
   */
  async getCallById(id: string): Promise<Call> {
    const call = await this.callsRepository.findOne({ where: { id } });

    if (!call) {
      throw new NotFoundException(`Call with ID ${id} not found`);
    }

    return call;
  }

  /**
   * إجراء مكالمة صادرة
   */
  async makeOutboundCall(
    to: string,
    agentId?: string,
    agentName?: string,
  ): Promise<Call> {
    try {
      // إجراء المكالمة عبر Twilio
      const twilioCall = await this.twilioService.makeCall(
        to,
        `${process.env.APP_URL}/api/calls/twiml/outbound`,
      );

      // حفظ سجل المكالمة في قاعدة البيانات
      const call = await this.createCall({
        twilioCallSid: twilioCall.sid,
        fromNumber: twilioCall.from,
        toNumber: twilioCall.to,
        direction: CallDirection.OUTBOUND,
        status: CallStatus.INITIATED,
        agentId,
        agentName,
      });

      this.logger.log(`📞 Outbound call created: ${call.id}`);
      return call;
    } catch (error) {
      this.logger.error(`❌ Failed to make outbound call: ${error.message}`);
      throw error;
    }
  }

  /**
   * معالجة المكالمة الواردة
   */
  async handleInboundCall(twilioData: any): Promise<Call> {
    try {
      // حفظ سجل المكالمة الواردة
      const call = await this.createCall({
        twilioCallSid: twilioData.CallSid,
        fromNumber: twilioData.From,
        toNumber: twilioData.To,
        direction: CallDirection.INBOUND,
        status: CallStatus.RINGING,
      });

      this.logger.log(`📱 Inbound call received: ${call.id}`);
      return call;
    } catch (error) {
      this.logger.error(`❌ Failed to handle inbound call: ${error.message}`);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات المكالمات
   */
  async getCallStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalCalls, todayCalls, inboundCalls, outboundCalls, activeCalls] =
      await Promise.all([
        this.callsRepository.count(),
        this.callsRepository.count({
          where: { createdAt: today as any },
        }),
        this.callsRepository.count({
          where: { direction: CallDirection.INBOUND },
        }),
        this.callsRepository.count({
          where: { direction: CallDirection.OUTBOUND },
        }),
        this.callsRepository.count({
          where: { status: CallStatus.IN_PROGRESS },
        }),
      ]);

    return {
      totalCalls,
      todayCalls,
      inboundCalls,
      outboundCalls,
      activeCalls,
    };
  }
}
