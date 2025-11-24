// نظام البوت الذكي للمحادثات
// Bot AI System with Conversation Scenarios

export interface ConversationState {
  stage: 'welcome' | 'main_menu' | 'residential' | 'hotel' | 'events' | 'booking' | 'confirmation' | 'completed';
  selectedService?: string;
  bookingData?: {
    serviceType?: string;
    unitType?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    name?: string;
    phone?: string;
    specialRequests?: string;
  };
  lastMessageAt?: Date;
  messageHistory?: Array<{ role: 'user' | 'bot'; text: string; timestamp: Date }>;
}

export class BotConversationManager {
  private conversationStates: Map<string, ConversationState> = new Map();

  // الرسائل الترحيبية
  private welcomeMessages = [
    'مرحباً بك في المسار الساخن! 🏡✨',
    'أهلاً وسهلاً! يسعدنا خدمتك 😊',
    'مرحباً! نحن هنا لمساعدتك 🌟',
  ];

  // قائمة الخدمات الرئيسية
  private mainMenuOptions = {
    residential: {
      emoji: '🏘️',
      title: 'حجز وحدات سكنية',
      description: 'شقق، فيلات، وشاليهات فاخرة',
    },
    hotel: {
      emoji: '🏨',
      title: 'حجز فنادق',
      description: 'غرف فندقية وأجنحة مميزة',
    },
    events: {
      emoji: '🎉',
      title: 'حجز قاعات أفراح',
      description: 'قاعات فاخرة للمناسبات والحفلات',
    },
    inquiry: {
      emoji: '💬',
      title: 'استفسار عام',
      description: 'تحدث مع أحد ممثلي خدمة العملاء',
    },
  };

  // أنواع الوحدات السكنية
  private residentialUnits = {
    apartment: { emoji: '🏢', title: 'شقة', price: 'من 150 ريال/ليلة' },
    villa: { emoji: '🏰', title: 'فيلا', price: 'من 500 ريال/ليلة' },
    chalet: { emoji: '🏖️', title: 'شاليه', price: 'من 300 ريال/ليلة' },
    studio: { emoji: '🛏️', title: 'استوديو', price: 'من 100 ريال/ليلة' },
  };

  // أنواع الغرف الفندقية
  private hotelRooms = {
    standard: { emoji: '🛏️', title: 'غرفة قياسية', price: 'من 200 ريال/ليلة' },
    deluxe: { emoji: '✨', title: 'غرفة ديلوكس', price: 'من 350 ريال/ليلة' },
    suite: { emoji: '👑', title: 'جناح ملكي', price: 'من 800 ريال/ليلة' },
    family: { emoji: '👨‍👩‍👧‍👦', title: 'غرفة عائلية', price: 'من 450 ريال/ليلة' },
  };

  // أنواع قاعات الأفراح
  private eventHalls = {
    small: { emoji: '🎪', title: 'قاعة صغيرة', capacity: '50-100 شخص', price: 'من 3000 ريال' },
    medium: { emoji: '🏛️', title: 'قاعة متوسطة', capacity: '100-200 شخص', price: 'من 5000 ريال' },
    large: { emoji: '🏰', title: 'قاعة كبيرة', capacity: '200-500 شخص', price: 'من 10000 ريال' },
    vip: { emoji: '👑', title: 'قاعة VIP', capacity: 'حتى 1000 شخص', price: 'من 20000 ريال' },
  };

  // الحصول على حالة المحادثة
  getConversationState(conversationId: string): ConversationState {
    if (!this.conversationStates.has(conversationId)) {
      this.conversationStates.set(conversationId, {
        stage: 'welcome',
        bookingData: {},
        messageHistory: [],
      });
    }
    return this.conversationStates.get(conversationId)!;
  }

  // تحديث حالة المحادثة
  updateConversationState(conversationId: string, updates: Partial<ConversationState>) {
    const currentState = this.getConversationState(conversationId);
    this.conversationStates.set(conversationId, {
      ...currentState,
      ...updates,
      lastMessageAt: new Date(),
    });
  }

  // إضافة رسالة للتاريخ
  addMessageToHistory(conversationId: string, role: 'user' | 'bot', text: string) {
    const state = this.getConversationState(conversationId);
    state.messageHistory = state.messageHistory || [];
    state.messageHistory.push({
      role,
      text,
      timestamp: new Date(),
    });
  }

  // توليد الرد التلقائي
  async generateBotResponse(conversationId: string, userMessage: string): Promise<string> {
    const state = this.getConversationState(conversationId);
    this.addMessageToHistory(conversationId, 'user', userMessage);

    let response = '';

    // تحليل الرسالة
    const messageLower = userMessage.toLowerCase().trim();

    switch (state.stage) {
      case 'welcome':
        response = this.handleWelcomeStage(conversationId, messageLower);
        break;
      case 'main_menu':
        response = this.handleMainMenuStage(conversationId, messageLower);
        break;
      case 'residential':
        response = this.handleResidentialStage(conversationId, messageLower);
        break;
      case 'hotel':
        response = this.handleHotelStage(conversationId, messageLower);
        break;
      case 'events':
        response = this.handleEventsStage(conversationId, messageLower);
        break;
      case 'booking':
        response = await this.handleBookingStage(conversationId, messageLower);
        break;
      case 'confirmation':
        response = this.handleConfirmationStage(conversationId, messageLower);
        break;
      default:
        response = this.handleDefaultStage(conversationId, messageLower);
    }

    this.addMessageToHistory(conversationId, 'bot', response);
    return response;
  }

  // مرحلة الترحيب
  private handleWelcomeStage(conversationId: string, message: string): string {
    const welcomeMsg = this.welcomeMessages[Math.floor(Math.random() * this.welcomeMessages.length)];
    this.updateConversationState(conversationId, { stage: 'main_menu' });

    return `${welcomeMsg}\n\nكيف يمكنني مساعدتك اليوم؟\n\n` +
      `${this.mainMenuOptions.residential.emoji} *1* - ${this.mainMenuOptions.residential.title}\n` +
      `   ${this.mainMenuOptions.residential.description}\n\n` +
      `${this.mainMenuOptions.hotel.emoji} *2* - ${this.mainMenuOptions.hotel.title}\n` +
      `   ${this.mainMenuOptions.hotel.description}\n\n` +
      `${this.mainMenuOptions.events.emoji} *3* - ${this.mainMenuOptions.events.title}\n` +
      `   ${this.mainMenuOptions.events.description}\n\n` +
      `${this.mainMenuOptions.inquiry.emoji} *4* - ${this.mainMenuOptions.inquiry.title}\n` +
      `   ${this.mainMenuOptions.inquiry.description}\n\n` +
      `_اختر رقم الخدمة أو اكتب ما تحتاجه_ 😊`;
  }

  // مرحلة القائمة الرئيسية
  private handleMainMenuStage(conversationId: string, message: string): string {
    if (message.includes('1') || message.includes('سكن') || message.includes('شقة') || message.includes('فيلا')) {
      this.updateConversationState(conversationId, { 
        stage: 'residential',
        bookingData: { serviceType: 'residential' }
      });
      return `رائع! 🏘️✨\n\nلدينا مجموعة متنوعة من الوحدات السكنية:\n\n` +
        `${this.residentialUnits.apartment.emoji} *1* - ${this.residentialUnits.apartment.title} - ${this.residentialUnits.apartment.price}\n` +
        `${this.residentialUnits.villa.emoji} *2* - ${this.residentialUnits.villa.title} - ${this.residentialUnits.villa.price}\n` +
        `${this.residentialUnits.chalet.emoji} *3* - ${this.residentialUnits.chalet.title} - ${this.residentialUnits.chalet.price}\n` +
        `${this.residentialUnits.studio.emoji} *4* - ${this.residentialUnits.studio.title} - ${this.residentialUnits.studio.price}\n\n` +
        `_ما نوع الوحدة التي تفضلها؟_ 🏡`;
    }

    if (message.includes('2') || message.includes('فندق') || message.includes('غرفة')) {
      this.updateConversationState(conversationId, { 
        stage: 'hotel',
        bookingData: { serviceType: 'hotel' }
      });
      return `ممتاز! 🏨✨\n\nنوفر لك أفضل الغرف الفندقية:\n\n` +
        `${this.hotelRooms.standard.emoji} *1* - ${this.hotelRooms.standard.title} - ${this.hotelRooms.standard.price}\n` +
        `${this.hotelRooms.deluxe.emoji} *2* - ${this.hotelRooms.deluxe.title} - ${this.hotelRooms.deluxe.price}\n` +
        `${this.hotelRooms.suite.emoji} *3* - ${this.hotelRooms.suite.title} - ${this.hotelRooms.suite.price}\n` +
        `${this.hotelRooms.family.emoji} *4* - ${this.hotelRooms.family.title} - ${this.hotelRooms.family.price}\n\n` +
        `_ما نوع الغرفة المناسبة لك؟_ 🛏️`;
    }

    if (message.includes('3') || message.includes('قاعة') || message.includes('فرح') || message.includes('حفلة')) {
      this.updateConversationState(conversationId, { 
        stage: 'events',
        bookingData: { serviceType: 'events' }
      });
      return `رائع! 🎉✨\n\nلدينا قاعات فخمة للمناسبات:\n\n` +
        `${this.eventHalls.small.emoji} *1* - ${this.eventHalls.small.title}\n` +
        `   ${this.eventHalls.small.capacity} - ${this.eventHalls.small.price}\n\n` +
        `${this.eventHalls.medium.emoji} *2* - ${this.eventHalls.medium.title}\n` +
        `   ${this.eventHalls.medium.capacity} - ${this.eventHalls.medium.price}\n\n` +
        `${this.eventHalls.large.emoji} *3* - ${this.eventHalls.large.title}\n` +
        `   ${this.eventHalls.large.capacity} - ${this.eventHalls.large.price}\n\n` +
        `${this.eventHalls.vip.emoji} *4* - ${this.eventHalls.vip.title}\n` +
        `   ${this.eventHalls.vip.capacity} - ${this.eventHalls.vip.price}\n\n` +
        `_ما حجم القاعة المناسب لمناسبتك؟_ 🎪`;
    }

    if (message.includes('4') || message.includes('استفسار') || message.includes('سؤال')) {
      return `بالتأكيد! 💬\n\nسيتم تحويلك إلى أحد ممثلي خدمة العملاء خلال دقائق...\n\n` +
        `أو يمكنك إرسال استفسارك الآن وسنرد عليك في أقرب وقت. 😊`;
    }

    return `عذراً، لم أفهم اختيارك. 🤔\n\nيرجى اختيار رقم من 1 إلى 4، أو اكتب الخدمة التي تحتاجها.`;
  }

  // مرحلة الوحدات السكنية
  private handleResidentialStage(conversationId: string, message: string): string {
    const state = this.getConversationState(conversationId);
    let unitType = '';

    if (message.includes('1') || message.includes('شقة')) unitType = 'apartment';
    else if (message.includes('2') || message.includes('فيلا')) unitType = 'villa';
    else if (message.includes('3') || message.includes('شاليه')) unitType = 'chalet';
    else if (message.includes('4') || message.includes('استوديو')) unitType = 'studio';

    if (unitType) {
      const unit = this.residentialUnits[unitType as keyof typeof this.residentialUnits];
      this.updateConversationState(conversationId, {
        stage: 'booking',
        bookingData: { ...state.bookingData, unitType }
      });
      return `اختيار رائع! ${unit.emoji}\n\n*${unit.title}* - ${unit.price}\n\n` +
        `للمتابعة مع الحجز، أحتاج بعض التفاصيل:\n\n` +
        `📅 *ما هو تاريخ الوصول؟*\n` +
        `_مثال: 2025-12-25 أو 25/12/2025_`;
    }

    return `يرجى اختيار رقم من 1 إلى 4 لنوع الوحدة التي تفضلها. 🏡`;
  }

  // مرحلة الفنادق
  private handleHotelStage(conversationId: string, message: string): string {
    const state = this.getConversationState(conversationId);
    let roomType = '';

    if (message.includes('1') || message.includes('قياسية')) roomType = 'standard';
    else if (message.includes('2') || message.includes('ديلوكس')) roomType = 'deluxe';
    else if (message.includes('3') || message.includes('جناح')) roomType = 'suite';
    else if (message.includes('4') || message.includes('عائلية')) roomType = 'family';

    if (roomType) {
      const room = this.hotelRooms[roomType as keyof typeof this.hotelRooms];
      this.updateConversationState(conversationId, {
        stage: 'booking',
        bookingData: { ...state.bookingData, unitType: roomType }
      });
      return `اختيار ممتاز! ${room.emoji}\n\n*${room.title}* - ${room.price}\n\n` +
        `للمتابعة مع الحجز:\n\n` +
        `📅 *ما هو تاريخ تسجيل الوصول؟*\n` +
        `_مثال: 2025-12-25_`;
    }

    return `يرجى اختيار رقم من 1 إلى 4 لنوع الغرفة. 🛏️`;
  }

  // مرحلة قاعات الأفراح
  private handleEventsStage(conversationId: string, message: string): string {
    const state = this.getConversationState(conversationId);
    let hallType = '';

    if (message.includes('1') || message.includes('صغيرة')) hallType = 'small';
    else if (message.includes('2') || message.includes('متوسطة')) hallType = 'medium';
    else if (message.includes('3') || message.includes('كبيرة')) hallType = 'large';
    else if (message.includes('4') || message.includes('vip')) hallType = 'vip';

    if (hallType) {
      const hall = this.eventHalls[hallType as keyof typeof this.eventHalls];
      this.updateConversationState(conversationId, {
        stage: 'booking',
        bookingData: { ...state.bookingData, unitType: hallType }
      });
      return `اختيار رائع! ${hall.emoji}\n\n*${hall.title}*\n` +
        `السعة: ${hall.capacity}\n` +
        `السعر: ${hall.price}\n\n` +
        `للمتابعة مع الحجز:\n\n` +
        `📅 *ما هو تاريخ المناسبة؟*\n` +
        `_مثال: 2025-12-25_`;
    }

    return `يرجى اختيار رقم من 1 إلى 4 لحجم القاعة. 🎪`;
  }

  // مرحلة الحجز
  private async handleBookingStage(conversationId: string, message: string): Promise<string> {
    const state = this.getConversationState(conversationId);
    const bookingData = state.bookingData || {};

    // تاريخ الوصول
    if (!bookingData.checkIn && this.isDateFormat(message)) {
      this.updateConversationState(conversationId, {
        bookingData: { ...bookingData, checkIn: message }
      });
      return `تمام! ✅\n\n📅 تاريخ الوصول: *${message}*\n\n` +
        `🔄 *ما هو تاريخ المغادرة؟*\n` +
        `_مثال: 2025-12-30_`;
    }

    // تاريخ المغادرة
    if (bookingData.checkIn && !bookingData.checkOut && this.isDateFormat(message)) {
      this.updateConversationState(conversationId, {
        bookingData: { ...bookingData, checkOut: message }
      });
      return `ممتاز! ✅\n\n` +
        `📅 من: *${bookingData.checkIn}*\n` +
        `📅 إلى: *${message}*\n\n` +
        `👥 *كم عدد الأشخاص؟*\n` +
        `_مثال: 2 أشخاص_`;
    }

    // عدد الأشخاص
    if (bookingData.checkIn && bookingData.checkOut && !bookingData.guests) {
      const guests = parseInt(message);
      if (!isNaN(guests)) {
        this.updateConversationState(conversationId, {
          bookingData: { ...bookingData, guests }
        });
        return `رائع! ✅\n\n` +
          `👥 عدد الأشخاص: *${guests}*\n\n` +
          `📝 *ما اسمك الكريم؟*`;
      }
    }

    // الاسم
    if (bookingData.guests && !bookingData.name) {
      this.updateConversationState(conversationId, {
        bookingData: { ...bookingData, name: message }
      });
      return `أهلاً وسهلاً ${message}! 😊\n\n` +
        `📱 *ما رقم هاتفك للتواصل؟*\n` +
        `_مثال: 0501234567_`;
    }

    // رقم الهاتف
    if (bookingData.name && !bookingData.phone && this.isPhoneFormat(message)) {
      this.updateConversationState(conversationId, {
        stage: 'confirmation',
        bookingData: { ...bookingData, phone: message }
      });
      return this.generateConfirmationMessage(conversationId);
    }

    return `عذراً، لم أستطع فهم الرد. يرجى المحاولة مرة أخرى. 🤔`;
  }

  // مرحلة التأكيد
  private handleConfirmationStage(conversationId: string, message: string): string {
    if (message.includes('تأكيد') || message.includes('نعم') || message.includes('موافق')) {
      this.updateConversationState(conversationId, { stage: 'completed' });
      return `🎉 *تم تأكيد الحجز بنجاح!*\n\n` +
        `✅ سيتم التواصل معك قريباً لتأكيد جميع التفاصيل\n` +
        `✅ ستصلك رسالة تأكيد على رقم هاتفك\n\n` +
        `شكراً لثقتك بنا! 😊\n` +
        `رقم الحجز: #${Date.now().toString().slice(-6)}\n\n` +
        `_اكتب "قائمة" للعودة للقائمة الرئيسية_`;
    }

    if (message.includes('تعديل') || message.includes('لا')) {
      this.updateConversationState(conversationId, { stage: 'main_menu', bookingData: {} });
      return `لا مشكلة! 😊\n\nسأعيدك للقائمة الرئيسية...\n\n` +
        this.handleWelcomeStage(conversationId, '');
    }

    return `يرجى الرد بـ "تأكيد" لإتمام الحجز أو "تعديل" لتعديل البيانات. ✅`;
  }

  // المرحلة الافتراضية
  private handleDefaultStage(conversationId: string, message: string): string {
    if (message.includes('قائمة') || message.includes('بداية') || message.includes('رجوع')) {
      this.updateConversationState(conversationId, { stage: 'main_menu', bookingData: {} });
      return this.handleWelcomeStage(conversationId, '');
    }

    return `عذراً، لم أفهم طلبك. 🤔\n\nاكتب "قائمة" للعودة للقائمة الرئيسية.`;
  }

  // توليد رسالة التأكيد
  private generateConfirmationMessage(conversationId: string): string {
    const state = this.getConversationState(conversationId);
    const data = state.bookingData!;

    let serviceInfo = '';
    if (data.serviceType === 'residential') {
      const unit = this.residentialUnits[data.unitType as keyof typeof this.residentialUnits];
      serviceInfo = `🏡 ${unit.emoji} ${unit.title}`;
    } else if (data.serviceType === 'hotel') {
      const room = this.hotelRooms[data.unitType as keyof typeof this.hotelRooms];
      serviceInfo = `🏨 ${room.emoji} ${room.title}`;
    } else if (data.serviceType === 'events') {
      const hall = this.eventHalls[data.unitType as keyof typeof this.eventHalls];
      serviceInfo = `🎉 ${hall.emoji} ${hall.title}`;
    }

    return `📋 *ملخص الحجز*\n\n` +
      `${serviceInfo}\n\n` +
      `📅 من: ${data.checkIn}\n` +
      `📅 إلى: ${data.checkOut}\n` +
      `👥 عدد الأشخاص: ${data.guests}\n` +
      `📝 الاسم: ${data.name}\n` +
      `📱 الهاتف: ${data.phone}\n\n` +
      `✅ *للتأكيد، اكتب: تأكيد*\n` +
      `✏️ *للتعديل، اكتب: تعديل*`;
  }

  // التحقق من صيغة التاريخ
  private isDateFormat(text: string): boolean {
    return /\d{4}-\d{2}-\d{2}/.test(text) || /\d{2}\/\d{2}\/\d{4}/.test(text);
  }

  // التحقق من صيغة رقم الهاتف
  private isPhoneFormat(text: string): boolean {
    return /^(05|5)\d{8}$/.test(text.replace(/\s/g, ''));
  }

  // إعادة تعيين المحادثة
  resetConversation(conversationId: string) {
    this.conversationStates.delete(conversationId);
  }
}

// إنشاء instance واحد للاستخدام العام
export const botManager = new BotConversationManager();
