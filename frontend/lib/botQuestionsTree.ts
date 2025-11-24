// نظام شجرة الأسئلة والإجابات للبوت
// Bot Q&A Tree System - Almasar Hot Line

export interface BotQuestion {
  id: string;
  text: string;
  emoji?: string;
  options: BotOption[];
  requiresInput?: boolean;
  inputType?: 'text' | 'number' | 'date' | 'phone';
  nextStep?: string;
}

export interface BotOption {
  id: string;
  label: string;
  emoji?: string;
  nextQuestionId?: string;
  responseText?: string;
  department?: string; // للتحويل لقسم معين
  collectData?: boolean; // هل يحتاج جمع بيانات
}

export interface BotFlowData {
  currentQuestionId: string;
  collectedData: {
    service?: string;
    subService?: string;
    city?: string;
    nights?: number;
    guests?: number;
    carType?: string;
    duration?: string;
    location?: string;
    eventType?: string;
    attendees?: number;
    date?: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  };
  conversationHistory: Array<{ role: 'bot' | 'user'; text: string; timestamp: Date }>;
}

// شجرة الأسئلة الكاملة
export const botQuestionsTree: { [key: string]: BotQuestion } = {
  // القائمة الرئيسية
  welcome: {
    id: 'welcome',
    text: 'مرحبًا بك في شركة المسار الساخن للسفر والسياحة 🌍✨\n\nيسعدنا خدمتك وتلبية جميع احتياجاتك السياحية واللوجستية.\nمن فضلك اختر الخدمة المطلوبة:',
    options: [
      { 
        id: '1', 
        label: 'حجوزات', 
        emoji: '✈️',
        nextQuestionId: 'bookings_menu',
        responseText: 'شكرًا لاختيارك قسم الحجوزات ✈️'
      },
      { 
        id: '2', 
        label: 'استفسارات', 
        emoji: 'ℹ️',
        nextQuestionId: 'inquiries_menu',
        responseText: 'شكرًا لاختيارك قسم الاستفسارات ℹ️'
      },
      { 
        id: '3', 
        label: 'شكاوى', 
        emoji: '⚠️',
        nextQuestionId: 'complaints_menu',
        responseText: 'نعتذر عن أي إزعاج حدث لك 🙏'
      },
    ],
  },

  // قائمة الحجوزات
  bookings_menu: {
    id: 'bookings_menu',
    text: 'من فضلك اختر نوع الحجز:',
    options: [
      { 
        id: '1', 
        label: 'حجز وحدات (شقق / فلل)', 
        emoji: '🏠',
        nextQuestionId: 'units_booking',
        collectData: true
      },
      { 
        id: '2', 
        label: 'حجز سيارات', 
        emoji: '🚗',
        nextQuestionId: 'cars_booking',
        collectData: true
      },
      { 
        id: '3', 
        label: 'حجز باقة سياحية داخل المملكة', 
        emoji: '🇸🇦',
        nextQuestionId: 'tourism_packages',
        collectData: true
      },
      { 
        id: '4', 
        label: 'تعاقدات حفلات خارجية', 
        emoji: '🎉',
        nextQuestionId: 'events_booking',
        collectData: true
      },
      { 
        id: '0', 
        label: 'رجوع للقائمة الرئيسية', 
        emoji: '🔙',
        nextQuestionId: 'welcome'
      },
    ],
  },

  // حجز الوحدات
  units_booking: {
    id: 'units_booking',
    text: 'من فضلك زودنا بالتفاصيل التالية:\n\n📍 المدينة المطلوبة\n🌙 عدد الليالي\n👥 عدد النزلاء\n\n_يمكنك كتابة التفاصيل بهذا الشكل:_\n*المدينة: الرياض، الليالي: 3، النزلاء: 4*',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'units_confirmation'
  },

  units_confirmation: {
    id: 'units_confirmation',
    text: '✅ تم تسجيل طلبك بنجاح!\n\n📋 ملخص الحجز:\n{booking_details}\n\n🔄 سيتم تحويلك لقسم الوحدات السكنية للتأكيد.\n⏱️ سيقوم موظفنا المختص بالتواصل معك خلال دقائق قليلة.',
    options: [
      { 
        id: '1', 
        label: 'حجز آخر', 
        emoji: '➕',
        nextQuestionId: 'bookings_menu'
      },
      { 
        id: '0', 
        label: 'الصفحة الرئيسية', 
        emoji: '🏠',
        nextQuestionId: 'welcome'
      },
    ],
  },

  // حجز السيارات
  cars_booking: {
    id: 'cars_booking',
    text: 'من فضلك اختر نوع السيارة:',
    options: [
      { 
        id: '1', 
        label: 'اقتصادية', 
        emoji: '🚗',
        nextQuestionId: 'cars_details'
      },
      { 
        id: '2', 
        label: 'فاخرة', 
        emoji: '🚙',
        nextQuestionId: 'cars_details'
      },
      { 
        id: '3', 
        label: 'عائلية', 
        emoji: '🚐',
        nextQuestionId: 'cars_details'
      },
      { 
        id: '0', 
        label: 'رجوع', 
        emoji: '🔙',
        nextQuestionId: 'bookings_menu'
      },
    ],
  },

  cars_details: {
    id: 'cars_details',
    text: 'من فضلك زودنا بالتفاصيل التالية:\n\n⏳ مدة الحجز (أيام)\n📍 مكان الاستلام\n📍 مكان التسليم\n\n_مثال: 5 أيام، الاستلام من مطار الملك خالد، التسليم في الرياض_',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'cars_confirmation'
  },

  cars_confirmation: {
    id: 'cars_confirmation',
    text: '✅ تم تسجيل طلبك بنجاح!\n\n📋 ملخص حجز السيارة:\n{booking_details}\n\n🔄 سيتم تحويلك لقسم السيارات للتأكيد.\n⏱️ سيقوم موظفنا المختص بالتواصل معك خلال دقائق قليلة.',
    options: [
      { 
        id: '1', 
        label: 'حجز آخر', 
        emoji: '➕',
        nextQuestionId: 'bookings_menu'
      },
      { 
        id: '0', 
        label: 'الصفحة الرئيسية', 
        emoji: '🏠',
        nextQuestionId: 'welcome'
      },
    ],
  },

  // الباقات السياحية
  tourism_packages: {
    id: 'tourism_packages',
    text: 'من فضلك اختر الباقة السياحية:',
    options: [
      { 
        id: '1', 
        label: 'الرياض', 
        emoji: '🏙️',
        nextQuestionId: 'tourism_details',
        responseText: '✨ اختيار رائع! الرياض عاصمة المملكة'
      },
      { 
        id: '2', 
        label: 'جدة', 
        emoji: '🌊',
        nextQuestionId: 'tourism_details',
        responseText: '🌊 عروس البحر الأحمر! لدينا عرض خاص على باقة جدة لمدة 3 ليالي'
      },
      { 
        id: '3', 
        label: 'مكة المكرمة', 
        emoji: '🕋',
        nextQuestionId: 'tourism_details',
        responseText: '🕋 اختيار مبارك'
      },
      { 
        id: '4', 
        label: 'المدينة المنورة', 
        emoji: '🌿',
        nextQuestionId: 'tourism_details',
        responseText: '🌿 المدينة المنورة - على ساكنها أفضل الصلاة والسلام'
      },
      { 
        id: '5', 
        label: 'أبها', 
        emoji: '⛰️',
        nextQuestionId: 'tourism_details',
        responseText: '⛰️ عروس الجبل! طقس رائع ومناظر خلابة'
      },
      { 
        id: '6', 
        label: 'الطائف', 
        emoji: '🌸',
        nextQuestionId: 'tourism_details',
        responseText: '🌸 مدينة الورود والفواكه'
      },
      { 
        id: '7', 
        label: 'أخرى', 
        emoji: '📍',
        nextQuestionId: 'tourism_custom',
        responseText: 'من فضلك اكتب اسم المدينة المطلوبة'
      },
      { 
        id: '0', 
        label: 'رجوع', 
        emoji: '🔙',
        nextQuestionId: 'bookings_menu'
      },
    ],
  },

  tourism_custom: {
    id: 'tourism_custom',
    text: '📍 من فضلك اكتب اسم المدينة أو الوجهة السياحية المطلوبة داخل المملكة:',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'tourism_details'
  },

  tourism_details: {
    id: 'tourism_details',
    text: 'من فضلك زودنا بالتفاصيل التالية:\n\n📅 تاريخ البداية\n🌙 عدد الليالي\n👥 عدد الأشخاص\n\n_مثال: 2025-12-20، 4 ليالي، 3 أشخاص_',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'tourism_confirmation'
  },

  tourism_confirmation: {
    id: 'tourism_confirmation',
    text: '✅ تم تسجيل طلبك بنجاح!\n\n📋 ملخص الباقة السياحية:\n{booking_details}\n\n🔄 سيتم تحويلك لقسم الباقات السياحية للتأكيد.\n⏱️ سيقوم موظفنا المختص بالتواصل معك خلال دقائق قليلة.\n\n💡 نصيحة: لا تنسى الاطلاع على عروضنا الخاصة!',
    options: [
      { 
        id: '1', 
        label: 'حجز آخر', 
        emoji: '➕',
        nextQuestionId: 'bookings_menu'
      },
      { 
        id: '0', 
        label: 'الصفحة الرئيسية', 
        emoji: '🏠',
        nextQuestionId: 'welcome'
      },
    ],
  },

  // الحفلات الخارجية
  events_booking: {
    id: 'events_booking',
    text: 'من فضلك زودنا بالتفاصيل التالية:\n\n🎊 نوع المناسبة (زفاف / مؤتمر / حفلة خاصة)\n👥 عدد الحضور\n📍 المكان المطلوب\n📅 التاريخ\n\n_مثال: زفاف، 300 شخص، الرياض، 2025-12-25_',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'events_confirmation'
  },

  events_confirmation: {
    id: 'events_confirmation',
    text: '✅ تم تسجيل طلبك بنجاح!\n\n📋 ملخص الحفلة:\n{booking_details}\n\n🔄 سيتم تحويلك لقسم الحفلات الخارجية للتأكيد.\n⏱️ سيقوم موظفنا المختص بالتواصل معك خلال دقائق قليلة.\n\n🎉 نضمن لك تنظيم مناسبة لا تُنسى!',
    options: [
      { 
        id: '1', 
        label: 'حجز آخر', 
        emoji: '➕',
        nextQuestionId: 'bookings_menu'
      },
      { 
        id: '0', 
        label: 'الصفحة الرئيسية', 
        emoji: '🏠',
        nextQuestionId: 'welcome'
      },
    ],
  },

  // قائمة الاستفسارات
  inquiries_menu: {
    id: 'inquiries_menu',
    text: 'من فضلك اختر نوع الاستفسار:',
    options: [
      { 
        id: '1', 
        label: 'أسعار الرحلات', 
        emoji: '✈️',
        nextQuestionId: 'inquiry_prices',
        department: 'pricing'
      },
      { 
        id: '2', 
        label: 'مواعيد الرحلات', 
        emoji: '🕒',
        nextQuestionId: 'inquiry_schedule',
        department: 'scheduling'
      },
      { 
        id: '3', 
        label: 'خدمات إضافية (تأشيرات، تأمين سفر)', 
        emoji: '🛡️',
        nextQuestionId: 'inquiry_services',
        department: 'services'
      },
      { 
        id: '0', 
        label: 'رجوع', 
        emoji: '🔙',
        nextQuestionId: 'welcome'
      },
    ],
  },

  inquiry_prices: {
    id: 'inquiry_prices',
    text: '💰 استفسار عن الأسعار\n\nمن فضلك اكتب استفسارك بالتفصيل، وسنقوم بالرد عليك في أقرب وقت.\n\n_مثال: كم سعر باقة جدة لشخصين لمدة 3 ليالي؟_',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'inquiry_confirmation'
  },

  inquiry_schedule: {
    id: 'inquiry_schedule',
    text: '🕒 استفسار عن المواعيد\n\nمن فضلك اكتب استفسارك بالتفصيل، وسنقوم بالرد عليك في أقرب وقت.\n\n_مثال: ما هي مواعيد الرحلات المتاحة لأبها في شهر ديسمبر؟_',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'inquiry_confirmation'
  },

  inquiry_services: {
    id: 'inquiry_services',
    text: '🛡️ استفسار عن الخدمات الإضافية\n\nمن فضلك اكتب استفسارك بالتفصيل، وسنقوم بالرد عليك في أقرب وقت.\n\n_مثال: هل تساعدون في استخراج تأشيرات الزيارة؟_',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'inquiry_confirmation'
  },

  inquiry_confirmation: {
    id: 'inquiry_confirmation',
    text: '✅ تم تسجيل استفسارك بنجاح!\n\n🔄 سيتم تحويلك لقسم خدمة العملاء للرد على استفسارك.\n⏱️ سيقوم موظفنا المختص بالتواصل معك خلال دقائق قليلة.\n\n📞 يمكنك أيضًا التواصل معنا مباشرة على: 920012345',
    options: [
      { 
        id: '1', 
        label: 'استفسار آخر', 
        emoji: '➕',
        nextQuestionId: 'inquiries_menu'
      },
      { 
        id: '0', 
        label: 'الصفحة الرئيسية', 
        emoji: '🏠',
        nextQuestionId: 'welcome'
      },
    ],
  },

  // قائمة الشكاوى
  complaints_menu: {
    id: 'complaints_menu',
    text: 'من فضلك اختر نوع الشكوى:',
    options: [
      { 
        id: '1', 
        label: 'مشكلة في الحجز', 
        emoji: '📝',
        nextQuestionId: 'complaint_booking',
        department: 'complaints'
      },
      { 
        id: '2', 
        label: 'مشكلة في الدفع', 
        emoji: '💳',
        nextQuestionId: 'complaint_payment',
        department: 'complaints'
      },
      { 
        id: '3', 
        label: 'مشكلة في الخدمة', 
        emoji: '🛎️',
        nextQuestionId: 'complaint_service',
        department: 'complaints'
      },
      { 
        id: '0', 
        label: 'رجوع', 
        emoji: '🔙',
        nextQuestionId: 'welcome'
      },
    ],
  },

  complaint_booking: {
    id: 'complaint_booking',
    text: '📝 مشكلة في الحجز\n\nنعتذر بشدة عن هذه المشكلة 🙏\n\nمن فضلك اشرح المشكلة بالتفصيل:\n- رقم الحجز (إن وجد)\n- تفاصيل المشكلة\n- أي معلومات إضافية تساعدنا',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'complaint_confirmation'
  },

  complaint_payment: {
    id: 'complaint_payment',
    text: '💳 مشكلة في الدفع\n\nنعتذر بشدة عن هذه المشكلة 🙏\n\nمن فضلك اشرح المشكلة بالتفصيل:\n- رقم العملية\n- المبلغ\n- تفاصيل المشكلة',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'complaint_confirmation'
  },

  complaint_service: {
    id: 'complaint_service',
    text: '🛎️ مشكلة في الخدمة\n\nنعتذر بشدة عن هذه المشكلة 🙏\n\nمن فضلك اشرح المشكلة بالتفصيل لنتمكن من خدمتك بشكل أفضل.',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'complaint_confirmation'
  },

  complaint_confirmation: {
    id: 'complaint_confirmation',
    text: '✅ تم تسجيل شكواك برقم: #{complaint_number}\n\n🔄 سيتم تحويلك لقسم المتابعة فورًا.\n⏱️ سيقوم مسؤول الشكاوى بالتواصل معك خلال دقائق قليلة.\n\n🙏 نعتذر مجددًا ونعدك بحل المشكلة في أسرع وقت.\n\n⭐ رضاك يهمنا',
    options: [
      { 
        id: '0', 
        label: 'الصفحة الرئيسية', 
        emoji: '🏠',
        nextQuestionId: 'welcome'
      },
    ],
  },
};

// دالة مساعدة لإيجاد السؤال التالي
export function getNextQuestion(currentQuestionId: string, selectedOptionId: string): BotQuestion | null {
  const currentQuestion = botQuestionsTree[currentQuestionId];
  if (!currentQuestion) return null;

  const selectedOption = currentQuestion.options.find(opt => opt.id === selectedOptionId);
  if (!selectedOption || !selectedOption.nextQuestionId) return null;

  return botQuestionsTree[selectedOption.nextQuestionId];
}

// دالة لتنسيق النص مع البيانات المجمعة
export function formatResponseText(text: string, data: any): string {
  let formatted = text;
  
  // استبدال {booking_details} بالبيانات الفعلية
  if (text.includes('{booking_details}')) {
    const details = Object.entries(data)
      .filter(([key, value]) => value)
      .map(([key, value]) => `• ${key}: ${value}`)
      .join('\n');
    formatted = formatted.replace('{booking_details}', details || 'لا توجد بيانات');
  }
  
  // استبدال {complaint_number} برقم عشوائي
  if (text.includes('{complaint_number}')) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    formatted = formatted.replace('{complaint_number}', randomNum.toString());
  }
  
  return formatted;
}
