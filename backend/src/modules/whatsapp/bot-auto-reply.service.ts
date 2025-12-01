import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { botQuestionsTree, botKeywords, UserSession, BotQuestion } from './bot-questions-tree';

@Injectable()
export class BotAutoReplyService implements OnModuleInit {
  private readonly logger = new Logger(BotAutoReplyService.name);
  private userSessions: Map<string, UserSession> = new Map();
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 دقيقة
  private readonly maxSessions = 100; // حد أقصى 100 جلسة
  private cleanupInterval: NodeJS.Timeout;

  /**
   * تشغيل التنظيف التلقائي عند بدء الخدمة
   */
  onModuleInit() {
    // تنظيف الجلسات المنتهية كل 5 دقائق
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredSessions();
    }, 5 * 60 * 1000);
    
    this.logger.log('✅ Auto cleanup started - runs every 5 minutes');
  }

  /**
   * معالجة رسالة واردة وإرجاع الرد التلقائي
   */
  async processMessage(phoneNumber: string, message: string): Promise<string | null> {
    const cleanMessage = message.trim().toLowerCase();

    // التحقق من الكلمات المفتاحية للبداية أو المساعدة
    if (this.isGreeting(cleanMessage) || this.isHelpRequest(cleanMessage)) {
      this.startNewSession(phoneNumber);
      return botQuestionsTree.welcome.text;
    }

    if (this.isRestartRequest(cleanMessage)) {
      this.startNewSession(phoneNumber);
      return botQuestionsTree.welcome.text;
    }

    // الحصول على جلسة المستخدم أو إنشاء جلسة جديدة
    let session = this.getUserSession(phoneNumber);
    if (!session) {
      // بدء جلسة جديدة
      this.startNewSession(phoneNumber);
      return botQuestionsTree.welcome.text;
    }

    // تحديث وقت آخر نشاط
    session.lastActivityTime = new Date();

    // إضافة الرسالة لسجل المحادثة
    session.conversationHistory.push({
      role: 'user',
      text: message,
      timestamp: new Date(),
    });

    // الحصول على السؤال الحالي
    const currentQuestion = botQuestionsTree[session.currentQuestionId];
    if (!currentQuestion) {
      // خطأ: سؤال غير موجود، إعادة تعيين
      this.startNewSession(phoneNumber);
      return 'عذرًا، حدث خطأ. دعنا نبدأ من جديد.\n\n' + botQuestionsTree.welcome.text;
    }

    // معالجة الرد بناءً على نوع السؤال
    const response = await this.handleUserResponse(session, currentQuestion, message);
    
    // حفظ رد البوت في السجل
    if (response) {
      session.conversationHistory.push({
        role: 'bot',
        text: response,
        timestamp: new Date(),
      });
    }

    return response;
  }

  /**
   * معالجة رد المستخدم
   */
  private async handleUserResponse(
    session: UserSession,
    currentQuestion: BotQuestion,
    userMessage: string,
  ): Promise<string> {
    const cleanMessage = userMessage.trim();

    // إذا كان السؤال يتطلب إدخال حر
    if (currentQuestion.requiresInput) {
      // حفظ البيانات المدخلة
      this.saveUserInput(session, currentQuestion.id, cleanMessage);

      // الانتقال للخطوة التالية
      if (currentQuestion.nextStep) {
        const nextQuestion = botQuestionsTree[currentQuestion.nextStep];
        if (nextQuestion) {
          session.currentQuestionId = currentQuestion.nextStep;
          return nextQuestion.text;
        }
      }

      // إذا لم يكن هناك خطوة تالية، إنهاء
      return 'شكرًا لك! تم حفظ بياناتك. ✅';
    }

    // البحث عن الخيار المطابق
    const selectedOption = currentQuestion.options.find(
      (opt) => opt.id === cleanMessage || opt.label.toLowerCase().includes(cleanMessage.toLowerCase()),
    );

    if (!selectedOption) {
      // الرد غير صحيح
      return `❌ من فضلك اختر رقمًا من الخيارات المتاحة.\n\n${currentQuestion.text}`;
    }

    // الانتقال للسؤال التالي
    if (selectedOption.nextQuestionId) {
      const nextQuestion = botQuestionsTree[selectedOption.nextQuestionId];
      if (nextQuestion) {
        session.currentQuestionId = selectedOption.nextQuestionId;
        
        // إضافة رد اختياري قبل السؤال التالي
        let response = '';
        if (selectedOption.responseText) {
          response = selectedOption.responseText + '\n\n';
        }
        
        return response + nextQuestion.text;
      }
    }

    return 'شكرًا لك! ✅';
  }

  /**
   * حفظ البيانات المدخلة من المستخدم
   */
  private saveUserInput(session: UserSession, questionId: string, input: string) {
    let assignedStaff = '';
    
    // حفظ البيانات بناءً على السؤال
    if (questionId === 'units_booking') {
      session.collectedData.notes = input;
      session.collectedData.service = 'حجز وحدات سكنية';
      assignedStaff = 'تسنيم - قسم الحجوزات';
    } else if (questionId === 'car_details') {
      session.collectedData.notes = input;
      session.collectedData.service = 'حجز سيارات';
      assignedStaff = 'تسنيم - قسم الحجوزات';
    } else if (questionId === 'package_details') {
      session.collectedData.notes = input;
      session.collectedData.service = 'باقة سياحية';
      assignedStaff = 'تسنيم - قسم الحجوزات';
    } else if (questionId === 'event_details') {
      session.collectedData.notes = input;
      session.collectedData.service = 'تنظيم حفلات خارجية';
      assignedStaff = 'م. أكرم - الدعم الفني';
    } else if (questionId.includes('inquiry')) {
      session.collectedData.notes = input;
      session.collectedData.service = 'استفسار';
      assignedStaff = 'ساهر - قسم المبيعات';
    } else if (questionId.includes('complaint')) {
      session.collectedData.notes = input;
      session.collectedData.service = 'شكوى';
      assignedStaff = 'م. أكرم - خدمة العملاء';
    } else if (questionId === 'get_contact_info' || questionId === 'get_contact_info_sales' || questionId === 'get_contact_info_support') {
      // محاولة استخراج الاسم ورقم الهاتف
      const parts = input.split(/[،,]/);
      if (parts.length >= 1) session.collectedData.customerName = parts[0].trim();
      if (parts.length >= 2) session.collectedData.customerPhone = parts[1].trim();
      
      // تحديد الموظف المسؤول حسب نوع الخدمة
      if (questionId === 'get_contact_info_sales') {
        assignedStaff = 'ساهر - قسم المبيعات';
      } else if (questionId === 'get_contact_info_support') {
        assignedStaff = 'م. أكرم - الدعم الفني وخدمة العملاء';
      } else {
        assignedStaff = 'تسنيم - قسم الحجوزات';
      }
      
      // Log collected data for staff notification
      this.logger.log(`\n🔔 ═══════════════════════════════════════`);
      this.logger.log(`📋 طلب جديد من ${session.collectedData.customerName}`);
      this.logger.log(`📱 الهاتف: ${session.collectedData.customerPhone}`);
      this.logger.log(`🔖 الخدمة: ${session.collectedData.service}`);
      this.logger.log(`📝 التفاصيل: ${session.collectedData.notes || 'لا يوجد'}`);
      this.logger.log(`👤 تحويل إلى: ${assignedStaff}`);
      this.logger.log(`═══════════════════════════════════════\n`);
    }

    this.logger.log(`💾 Saved data for ${session.phoneNumber}: ${questionId} = ${input}`);
  }

  /**
   * بدء جلسة جديدة
   */
  private startNewSession(phoneNumber: string) {
    // تنظيف إذا تجاوز الحد الأقصى
    if (this.userSessions.size >= this.maxSessions) {
      this.cleanExpiredSessions();
      
      // لو لسه كبير، امسح الأقدم
      if (this.userSessions.size >= this.maxSessions) {
        const oldestKey = Array.from(this.userSessions.keys())[0];
        this.userSessions.delete(oldestKey);
        this.logger.warn(`⚠️ Max sessions reached, removed oldest: ${oldestKey}`);
      }
    }

    const session: UserSession = {
      phoneNumber,
      currentQuestionId: 'welcome',
      collectedData: {},
      conversationHistory: [],
      lastActivityTime: new Date(),
    };

    this.userSessions.set(phoneNumber, session);
    this.logger.log(`🆕 New session started for ${phoneNumber} (Total: ${this.userSessions.size})`);
  }

  /**
   * الحصول على جلسة المستخدم
   */
  private getUserSession(phoneNumber: string): UserSession | undefined {
    const session = this.userSessions.get(phoneNumber);
    
    // التحقق من انتهاء الجلسة
    if (session) {
      const now = new Date().getTime();
      const lastActivity = session.lastActivityTime.getTime();
      
      if (now - lastActivity > this.sessionTimeout) {
        // الجلسة منتهية
        this.userSessions.delete(phoneNumber);
        this.logger.log(`⏰ Session expired for ${phoneNumber}`);
        return undefined;
      }
    }

    return session;
  }

  /**
   * التحقق من رسالة الترحيب
   */
  private isGreeting(message: string): boolean {
    return botKeywords.greetings.some((keyword) => message.includes(keyword));
  }

  /**
   * التحقق من طلب المساعدة
   */
  private isHelpRequest(message: string): boolean {
    return botKeywords.help.some((keyword) => message.includes(keyword));
  }

  /**
   * التحقق من طلب إعادة البدء
   */
  private isRestartRequest(message: string): boolean {
    return botKeywords.restart.some((keyword) => message.includes(keyword));
  }

  /**
   * الحصول على بيانات المستخدم المجمعة
   */
  getUserData(phoneNumber: string) {
    const session = this.getUserSession(phoneNumber);
    return session ? session.collectedData : null;
  }

  /**
   * تنظيف الجلسات المنتهية (يتم استدعاؤها دوريًا)
   */
  cleanExpiredSessions() {
    const now = new Date().getTime();
    let cleaned = 0;

    this.userSessions.forEach((session, phoneNumber) => {
      const lastActivity = session.lastActivityTime.getTime();
      if (now - lastActivity > this.sessionTimeout) {
        this.userSessions.delete(phoneNumber);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      this.logger.log(`🧹 Cleaned ${cleaned} expired sessions`);
    }
  }
}
