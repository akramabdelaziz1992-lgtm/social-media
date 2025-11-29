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
    status: CallStatus | null,
    additionalData?: Partial<Call>,
  ): Promise<Call> {
    const call = await this.callsRepository.findOne({
      where: { twilioCallSid },
    });

    if (!call) {
      throw new NotFoundException(`Call with SID ${twilioCallSid} not found`);
    }

    // لو status موجود، نحدّثه
    if (status) {
      Object.assign(call, { status, ...additionalData });
      
      if (status === CallStatus.COMPLETED) {
        call.endedAt = new Date();
      }
    } else {
      // لو status = null، نحدّث additionalData بس (زي Recording URL)
      Object.assign(call, additionalData);
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

  /**
   * الحصول على إحصائيات مفصلة للمكالمات
   */
  async getDetailedStats(period: 'today' | 'week' | 'month' | 'all' = 'today') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        startDate = weekStart;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    const query = this.callsRepository.createQueryBuilder('call')
      .where('call.createdAt >= :startDate', { startDate });

    const calls = await query.getMany();

    const inbound = calls.filter(c => c.direction === CallDirection.INBOUND);
    const outbound = calls.filter(c => c.direction === CallDirection.OUTBOUND);
    const completed = calls.filter(c => c.status === CallStatus.COMPLETED);
    const missed = calls.filter(c => c.status === CallStatus.NO_ANSWER || c.status === CallStatus.FAILED);

    const totalDuration = completed.reduce((sum, call) => sum + (call.durationSeconds || 0), 0);
    const avgDuration = completed.length > 0 ? Math.round(totalDuration / completed.length) : 0;

    // Get today, week, month counts
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const today = calls.filter(c => new Date(c.createdAt) >= todayStart).length;
    const thisWeek = calls.filter(c => new Date(c.createdAt) >= weekStart).length;
    const thisMonth = calls.filter(c => new Date(c.createdAt) >= monthStart).length;

    return {
      total: calls.length,
      inbound: inbound.length,
      outbound: outbound.length,
      missed: missed.length,
      avgDuration,
      today,
      thisWeek,
      thisMonth,
    };
  }

  /**
   * الحصول على آخر المكالمات
   */
  async getRecentCalls(limit: number = 10): Promise<Call[]> {
    return await this.callsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * جلب التسجيلات من Twilio وربطها بالمكالمات
   */
  async syncRecordingsWithCalls(): Promise<void> {
    try {
      // جلب جميع التسجيلات من Twilio
      const recordings = await this.twilioService.getAllRecordings(100);
      
      this.logger.log(`🎙️ Syncing ${recordings.length} recordings with calls`);
      
      // ربط كل تسجيل بمكالمته
      for (const recording of recordings) {
        const call = await this.callsRepository.findOne({
          where: { twilioCallSid: recording.callSid },
        });
        
        if (call && !call.recordingUrl) {
          // حفظ رابط التسجيل
          call.recordingUrl = recording.url;
          await this.callsRepository.save(call);
          this.logger.log(`✅ Recording linked to call ${call.id}`);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Failed to sync recordings: ${error.message}`);
    }
  }

  /**
   * جلب تسجيل مكالمة محددة
   */
  async getCallRecording(callId: string): Promise<string | null> {
    const call = await this.getCallById(callId);
    
    if (call.recordingUrl) {
      return call.recordingUrl;
    }
    
    // محاولة جلب التسجيل من Twilio
    if (call.twilioCallSid) {
      const recordings = await this.twilioService.getRecordings(call.twilioCallSid);
      if (recordings.length > 0) {
        call.recordingUrl = recordings[0].url;
        await this.callsRepository.save(call);
        return call.recordingUrl;
      }
    }
    
    return null;
  }
}
