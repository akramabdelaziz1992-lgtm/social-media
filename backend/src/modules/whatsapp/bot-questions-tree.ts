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
  department?: string;
  collectData?: boolean;
}

export interface UserSession {
  phoneNumber: string;
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
  lastActivityTime: Date;
}

// شجرة الأسئلة الكاملة
export const botQuestionsTree: { [key: string]: BotQuestion } = {
  // القائمة الرئيسية
  welcome: {
    id: 'welcome',
    text: 'مرحبًا بك في شركة المسار الساخن للسفر والسياحة 🌍✨\n\nيسعدنا خدمتك وتلبية جميع احتياجاتك السياحية واللوجستية.\nمن فضلك اختر الخدمة المطلوبة:\n\n1️⃣ حجوزات\n2️⃣ استفسارات\n3️⃣ شكاوى\n\nأرسل رقم الخيار المطلوب',
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
    text: 'من فضلك اختر نوع الحجز:\n\n1️⃣ حجز وحدات (شقق / فلل)\n2️⃣ حجز سيارات\n3️⃣ حجز باقة سياحية داخل المملكة\n4️⃣ تعاقدات حفلات خارجية\n0️⃣ رجوع للقائمة الرئيسية\n\nأرسل رقم الخيار المطلوب',
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
    text: '🏠 حجز الوحدات السكنية\n\nمن فضلك زودنا بالتفاصيل التالية:\n\n📍 المدينة المطلوبة\n🌙 عدد الليالي\n👥 عدد النزلاء\n\nمثال: الرياض، 3 ليالي، 4 أشخاص',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'get_contact_info'
  },

  // حجز السيارات
  cars_booking: {
    id: 'cars_booking',
    text: '🚗 حجز السيارات\n\nمن فضلك اختر نوع السيارة:\n\n1️⃣ سيارة عائلية\n2️⃣ سيارة VIP\n3️⃣ باص سياحي\n4️⃣ سيارة صغيرة\n0️⃣ رجوع\n\nأرسل رقم الخيار',
    options: [
      { id: '1', label: 'سيارة عائلية', nextQuestionId: 'car_details' },
      { id: '2', label: 'سيارة VIP', nextQuestionId: 'car_details' },
      { id: '3', label: 'باص سياحي', nextQuestionId: 'car_details' },
      { id: '4', label: 'سيارة صغيرة', nextQuestionId: 'car_details' },
      { id: '0', label: 'رجوع', nextQuestionId: 'bookings_menu' },
    ],
  },

  car_details: {
    id: 'car_details',
    text: '📅 من فضلك أخبرنا بـ:\n\n📍 المدينة\n📆 تاريخ الاستلام\n⏱️ المدة المطلوبة\n\nمثال: جدة، 15/12/2025، 5 أيام',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'get_contact_info'
  },

  // حجز الباقات السياحية
  tourism_packages: {
    id: 'tourism_packages',
    text: '🇸🇦 الباقات السياحية داخل المملكة\n\nاختر الوجهة:\n\n1️⃣ الرياض\n2️⃣ جدة ومكة\n3️⃣ المدينة المنورة\n4️⃣ الشرقية (الدمام، الخبر)\n5️⃣ أبها وجازان\n6️⃣ تبوك ونيوم\n7️⃣ العلا والطائف\n0️⃣ رجوع\n\nأرسل رقم الخيار',
    options: [
      { id: '1', label: 'الرياض', nextQuestionId: 'package_details' },
      { id: '2', label: 'جدة ومكة', nextQuestionId: 'package_details' },
      { id: '3', label: 'المدينة المنورة', nextQuestionId: 'package_details' },
      { id: '4', label: 'الشرقية', nextQuestionId: 'package_details' },
      { id: '5', label: 'أبها وجازان', nextQuestionId: 'package_details' },
      { id: '6', label: 'تبوك ونيوم', nextQuestionId: 'package_details' },
      { id: '7', label: 'العلا والطائف', nextQuestionId: 'package_details' },
      { id: '0', label: 'رجوع', nextQuestionId: 'bookings_menu' },
    ],
  },

  package_details: {
    id: 'package_details',
    text: '📋 تفاصيل الباقة\n\nمن فضلك أخبرنا بـ:\n\n📆 التاريخ المطلوب\n🌙 عدد الأيام\n👥 عدد الأشخاص\n\nمثال: 20/12/2025، 4 أيام، 2 أشخاص',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'get_contact_info'
  },

  // حجز الحفلات
  events_booking: {
    id: 'events_booking',
    text: '🎉 تعاقدات الحفلات الخارجية\n\nاختر نوع الحفل:\n\n1️⃣ حفل زفاف\n2️⃣ حفل تخرج\n3️⃣ مؤتمر أو ورشة عمل\n4️⃣ حفل عيد ميلاد\n5️⃣ مناسبة أخرى\n0️⃣ رجوع\n\nأرسل رقم الخيار',
    options: [
      { id: '1', label: 'حفل زفاف', nextQuestionId: 'event_details' },
      { id: '2', label: 'حفل تخرج', nextQuestionId: 'event_details' },
      { id: '3', label: 'مؤتمر أو ورشة', nextQuestionId: 'event_details' },
      { id: '4', label: 'عيد ميلاد', nextQuestionId: 'event_details' },
      { id: '5', label: 'مناسبة أخرى', nextQuestionId: 'event_details' },
      { id: '0', label: 'رجوع', nextQuestionId: 'bookings_menu' },
    ],
  },

  event_details: {
    id: 'event_details',
    text: '📝 تفاصيل الحفل\n\nمن فضلك أخبرنا بـ:\n\n📍 المكان (المدينة)\n📆 التاريخ\n👥 عدد الحضور المتوقع\n\nمثال: الرياض، 25/12/2025، 150 شخص',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'get_contact_info'
  },

  // قائمة الاستفسارات
  inquiries_menu: {
    id: 'inquiries_menu',
    text: 'ℹ️ الاستفسارات\n\nاختر نوع الاستفسار:\n\n1️⃣ عن أسعار الخدمات\n2️⃣ عن الباقات المتاحة\n3️⃣ عن طرق الدفع\n4️⃣ استفسار آخر\n0️⃣ رجوع للقائمة الرئيسية\n\nأرسل رقم الخيار',
    options: [
      { id: '1', label: 'أسعار الخدمات', nextQuestionId: 'pricing_inquiry' },
      { id: '2', label: 'الباقات المتاحة', nextQuestionId: 'packages_inquiry' },
      { id: '3', label: 'طرق الدفع', nextQuestionId: 'payment_inquiry' },
      { id: '4', label: 'استفسار آخر', nextQuestionId: 'other_inquiry' },
      { id: '0', label: 'رجوع', nextQuestionId: 'welcome' },
    ],
  },

  pricing_inquiry: {
    id: 'pricing_inquiry',
    text: '💰 الأسعار تختلف حسب:\n\n• نوع الخدمة\n• الموسم\n• المدة\n• عدد الأشخاص\n\nمن فضلك حدد الخدمة المطلوبة وسيتم التواصل معك بالأسعار التفصيلية.\n\nاكتب تفاصيل استفسارك أو:\n0️⃣ للرجوع',
    requiresInput: true,
    inputType: 'text',
    options: [
      { id: '0', label: 'رجوع', nextQuestionId: 'inquiries_menu' },
    ],
    nextStep: 'get_contact_info'
  },

  packages_inquiry: {
    id: 'packages_inquiry',
    text: '📦 باقاتنا المتاحة:\n\n🏠 وحدات سكنية (شقق/فلل)\n🚗 تأجير سيارات\n🇸🇦 رحلات داخل المملكة\n🎉 تنظيم الحفلات\n\nلمعرفة تفاصيل أي باقة، اكتب رقمها أو:\n1️⃣ لحجز الآن\n0️⃣ للرجوع',
    options: [
      { id: '1', label: 'حجز الآن', nextQuestionId: 'bookings_menu' },
      { id: '0', label: 'رجوع', nextQuestionId: 'inquiries_menu' },
    ],
  },

  payment_inquiry: {
    id: 'payment_inquiry',
    text: '💳 طرق الدفع المتاحة:\n\n✅ تحويل بنكي\n✅ دفع إلكتروني (مدى/فيزا/ماستركارد)\n✅ الدفع عند الاستلام (حسب الخدمة)\n✅ التقسيط (للحجوزات الكبيرة)\n\nللمزيد من التفاصيل:\n1️⃣ تحدث مع موظف\n0️⃣ رجوع',
    options: [
      { id: '1', label: 'تحدث مع موظف', nextQuestionId: 'get_contact_info' },
      { id: '0', label: 'رجوع', nextQuestionId: 'inquiries_menu' },
    ],
  },

  other_inquiry: {
    id: 'other_inquiry',
    text: '❓ استفسار آخر\n\nمن فضلك اكتب استفسارك وسيتم الرد عليك في أقرب وقت.\n\nأو:\n0️⃣ للرجوع',
    requiresInput: true,
    inputType: 'text',
    options: [
      { id: '0', label: 'رجوع', nextQuestionId: 'inquiries_menu' },
    ],
    nextStep: 'get_contact_info'
  },

  // قائمة الشكاوى
  complaints_menu: {
    id: 'complaints_menu',
    text: '⚠️ الشكاوى والملاحظات\n\nنعتذر عن أي إزعاج. اختر نوع الشكوى:\n\n1️⃣ شكوى من خدمة\n2️⃣ مشكلة في الحجز\n3️⃣ تأخير في التنفيذ\n4️⃣ شكوى أخرى\n0️⃣ رجوع\n\nأرسل رقم الخيار',
    options: [
      { id: '1', label: 'شكوى من خدمة', nextQuestionId: 'complaint_details' },
      { id: '2', label: 'مشكلة في الحجز', nextQuestionId: 'complaint_details' },
      { id: '3', label: 'تأخير في التنفيذ', nextQuestionId: 'complaint_details' },
      { id: '4', label: 'شكوى أخرى', nextQuestionId: 'complaint_details' },
      { id: '0', label: 'رجوع', nextQuestionId: 'welcome' },
    ],
  },

  complaint_details: {
    id: 'complaint_details',
    text: '📝 من فضلك اكتب تفاصيل الشكوى:\n\n• رقم الحجز (إن وُجد)\n• تفاصيل المشكلة\n• ملاحظاتك\n\nسيتم التواصل معك فورًا من قسم خدمة العملاء.',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'get_contact_info'
  },

  // جمع معلومات الاتصال
  get_contact_info: {
    id: 'get_contact_info',
    text: '📞 للمتابعة معك، من فضلك أرسل:\n\n• الاسم الكامل\n• رقم الجوال للتواصل\n\nمثال: أحمد محمد، 0501234567',
    requiresInput: true,
    inputType: 'text',
    options: [],
    nextStep: 'confirmation'
  },

  // تأكيد الطلب
  confirmation: {
    id: 'confirmation',
    text: '✅ تم تسجيل طلبك بنجاح!\n\n🔄 سيتم تحويلك للقسم المختص\n⏱️ سيتواصل معك موظفنا خلال دقائق\n\n📱 يمكنك أيضًا الاتصال بنا على:\n0555254915\n\nشكرًا لثقتك في المسار الساخن 🌍✨\n\nهل تحتاج لخدمة أخرى؟\n1️⃣ نعم\n0️⃣ لا، شكرًا',
    options: [
      { id: '1', label: 'نعم', nextQuestionId: 'welcome' },
      { id: '0', label: 'لا، شكرًا', nextQuestionId: 'thank_you' },
    ],
  },

  thank_you: {
    id: 'thank_you',
    text: '🙏 شكرًا لتواصلك معنا\n\nنتطلع لخدمتك دائمًا 🌟\n\nللعودة للقائمة الرئيسية أرسل: 0',
    options: [
      { id: '0', label: 'القائمة الرئيسية', nextQuestionId: 'welcome' },
    ],
  },
};

// Keywords للرد التلقائي
export const botKeywords = {
  greetings: ['مرحبا', 'السلام عليكم', 'صباح الخير', 'مساء الخير', 'هلا', 'اهلين', 'هاي', 'hello', 'hi'],
  help: ['مساعدة', 'ساعدني', 'help', 'قائمة', 'خيارات'],
  restart: ['بداية', 'restart', 'إعادة', 'reset', 'start', '0'],
};
