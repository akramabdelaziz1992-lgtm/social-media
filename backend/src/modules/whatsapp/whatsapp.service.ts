import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { WhatsAppGateway } from './whatsapp.gateway';
import { AIService } from '../ai/ai.service';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: Client;
  private isReady = false;
  private qrCode: string = '';
  private conversationHistory: Map<string, string[]> = new Map();
  private userBotState: Map<string, { currentStep: string; data: any }> = new Map();
  private isInitializing = false;

  constructor(
    private whatsappGateway: WhatsAppGateway,
    private aiService: AIService,
  ) {}

  async onModuleInit() {
    // تهيئة WhatsApp عند بدء التطبيق
    this.logger.log('🚀 WhatsApp Module initialized, starting client...');
    await this.initialize();
  }

  async initialize() {
    // منع تهيئة متعددة
    if (this.isInitializing || this.client) {
      this.logger.warn('⚠️ WhatsApp Client already initializing or initialized');
      return;
    }

    this.isInitializing = true;
    this.logger.log('🔧 Initializing WhatsApp Client...');

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: '.wwebjs_auth',
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        },
      });
    } catch (error) {
      this.logger.error('❌ Failed to create WhatsApp Client:', error);
      this.isInitializing = false;
      throw error;
    }

    // QR Code Event
    this.client.on('qr', (qr) => {
      this.logger.log('📱 QR Code received!');
      this.qrCode = qr;
      
      // إرسال QR Code للواجهة عبر WebSocket
      this.whatsappGateway.sendQRCode(qr);
    });

    // Ready Event
    this.client.on('ready', () => {
      this.isReady = true;
      this.logger.log('✅ WhatsApp Client is ready!');
      
      // إخبار الواجهة أن الاتصال تم بنجاح
      this.whatsappGateway.sendConnectionStatus('connected');
    });

    // Authenticated Event
    this.client.on('authenticated', () => {
      this.logger.log('🔐 WhatsApp authenticated successfully!');
    });

    // Auth Failure Event
    this.client.on('auth_failure', (msg) => {
      this.logger.error('❌ Authentication failed:', msg);
      this.whatsappGateway.sendConnectionStatus('failed');
    });

    // Disconnected Event
    this.client.on('disconnected', (reason) => {
      this.logger.warn('⚠️ WhatsApp disconnected:', reason);
      this.isReady = false;
      this.whatsappGateway.sendConnectionStatus('disconnected');
    });

    // Message Event
    this.client.on('message', async (message) => {
      // تجاهل الرسائل المرسلة منا
      if (message.fromMe) return;

      this.logger.log(`📩 New message from ${message.from}: ${message.body}`);
      
      // إرسال الرسالة للواجهة عبر WebSocket
      const contact = await message.getContact();
      this.whatsappGateway.sendMessage('new-message', {
        id: message.id._serialized,
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
        contactName: contact.pushname || contact.number,
        type: message.type,
      });
      
      // حفظ سياق المحادثة
      const chatId = message.from;
      if (!this.conversationHistory.has(chatId)) {
        this.conversationHistory.set(chatId, []);
        
        // إرسال رسالة الترحيب للعملاء الجدد
        await this.sendWelcomeMessage(chatId);
      }
      
      const history = this.conversationHistory.get(chatId)!;
      history.push(message.body);
      
      // الاحتفاظ بآخر 10 رسائل فقط
      if (history.length > 10) {
        history.shift();
      }
      
      // معالجة الردود التلقائية بناءً على اختيار العميل
      await this.handleBotResponse(chatId, message.body);
      
      this.logger.log(`📨 Message received and stored from ${contact.pushname || contact.number}`);
    });

    // بدء الاتصال
    try {
      await this.client.initialize();
      this.logger.log('✅ WhatsApp Client initialization started successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize WhatsApp Client:', error);
      this.isInitializing = false;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  getConnectionStatus() {
    return {
      isReady: this.isReady,
      hasQR: !!this.qrCode,
    };
  }

  getCurrentQRCode() {
    return this.qrCode;
  }

  async sendMessage(to: string, message: string) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      // تنسيق رقم الهاتف (إزالة + و 00 واستبدالها بـ @c.us)
      const chatId = to.replace(/[^0-9]/g, '') + '@c.us';
      
      await this.client.sendMessage(chatId, message);
      this.logger.log(`✅ Message sent to ${to}`);
      
      return { success: true, message: 'تم إرسال الرسالة بنجاح' };
    } catch (error) {
      this.logger.error(`❌ Error sending message: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      this.qrCode = '';
      this.client = null;
      this.logger.log('🔌 WhatsApp client disconnected');
      this.whatsappGateway.sendConnectionStatus('disconnected');
    }
  }

  async logout() {
    try {
      if (this.client) {
        await this.client.logout();
        this.logger.log('👋 WhatsApp client logged out');
      }
      
      // حذف session files
      const fs = require('fs');
      const path = require('path');
      const sessionPath = path.join(process.cwd(), '.wwebjs_auth');
      
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        this.logger.log('🗑️ Session files deleted');
      }
      
      this.isReady = false;
      this.qrCode = '';
      this.client = null;
      this.isInitializing = false;
      
      this.whatsappGateway.sendConnectionStatus('disconnected');
      
      return { success: true, message: 'تم تسجيل الخروج وحذف الجلسة' };
    } catch (error) {
      this.logger.error('❌ Error during logout:', error);
      throw error;
    }
  }

  async getChats() {
    if (!this.isReady || !this.client) {
      this.logger.warn('⚠️ WhatsApp client is not ready yet, returning empty array');
      return [];
    }

    try {
      const chats = await this.client.getChats();
      return chats.map(chat => ({
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        lastMessage: chat.lastMessage?.body || '',
        timestamp: chat.timestamp,
      }));
    } catch (error) {
      this.logger.error(`❌ Error fetching chats: ${error.message}`);
      return [];
    }
  }

  async getChatMessages(chatId: string) {
    if (!this.isReady || !this.client) {
      this.logger.warn('⚠️ WhatsApp client is not ready yet, returning empty array');
      return [];
    }

    try {
      const chat = await this.client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 50 });
      
      return messages.map(msg => ({
        id: msg.id._serialized,
        body: msg.body,
        from: msg.from,
        to: msg.to,
        timestamp: msg.timestamp,
        type: msg.type,
        fromMe: msg.fromMe,
        hasMedia: msg.hasMedia,
      }));
    } catch (error) {
      this.logger.error(`❌ Error fetching messages: ${error.message}`);
      return [];
    }
  }

  // إرسال رسالة الترحيب مع الخيارات
  private async sendWelcomeMessage(chatId: string) {
    const welcomeMessage = `🌍✨ *شكراً لتواصلك معنا* 🙏

مرحباً بك في *شركة المسار الساخن للسفر والسياحية* 🌟

يسعدنا خدمتك وتلبية جميع احتياجاتك السياحية واللوجستية.

━━━━━━━━━━━━━━━━━━━━━
📋 *القائمة الرئيسية:*
━━━━━━━━━━━━━━━━━━━━━

*1️⃣ حجوزات* ✈️
   حجز الوحدات، السيارات، والباقات السياحية

*2️⃣ استفسارات* ℹ️
   الأسعار، المواعيد، والخدمات الإضافية

*3️⃣ شكاوى* ⚠️
   تقديم الشكاوى ومتابعتها

━━━━━━━━━━━━━━━━━━━━━

💡 _أرسل رقم الخيار (1، 2، أو 3) للمتابعة_`;

    try {
      await this.client.sendMessage(chatId, welcomeMessage);
      
      // تعيين الحالة الابتدائية للمستخدم
      this.userBotState.set(chatId, {
        currentStep: 'welcome',
        data: {}
      });
      
      this.logger.log(`✅ Welcome message sent to ${chatId}`);
    } catch (error) {
      this.logger.error(`❌ Error sending welcome message: ${error.message}`);
    }
  }

  // معالجة ردود البوت التلقائية
  private async handleBotResponse(chatId: string, userMessage: string) {
    const userState = this.userBotState.get(chatId);
    
    if (!userState) {
      return; // رسالة الترحيب تم إرسالها بالفعل
    }

    const currentStep = userState.currentStep;
    const choice = userMessage.trim();

    // إذا كتب المستخدم "هلا" أو "مرحبا"، نرجعه للقائمة الرئيسية
    if (choice.toLowerCase() === 'هلا' || choice.toLowerCase() === 'مرحبا' || choice.toLowerCase() === 'السلام عليكم') {
      await this.sendWelcomeMessage(chatId);
      return;
    }

    try {
      // القائمة الرئيسية
      if (currentStep === 'welcome') {
        if (choice === '1') {
          await this.sendBookingsMenu(chatId);
          userState.currentStep = 'bookings_menu';
        } else if (choice === '2') {
          await this.sendInquiriesMenu(chatId);
          userState.currentStep = 'inquiries_menu';
        } else if (choice === '3') {
          await this.sendComplaintsMenu(chatId);
          userState.currentStep = 'complaints_menu';
        } else {
          await this.sendInvalidChoiceMessage(chatId);
        }
      }
      // قائمة الحجوزات
      else if (currentStep === 'bookings_menu') {
        if (choice === '1') {
          await this.sendUnitsBookingForm(chatId);
          userState.currentStep = 'units_booking';
        } else if (choice === '2') {
          await this.sendCarsBookingMenu(chatId);
          userState.currentStep = 'cars_booking';
        } else if (choice === '3') {
          await this.sendTourismPackagesMenu(chatId);
          userState.currentStep = 'tourism_packages';
        } else if (choice === '4') {
          await this.sendEventsBookingForm(chatId);
          userState.currentStep = 'events_booking';
        } else if (choice === '0') {
          await this.sendWelcomeMessage(chatId);
        } else {
          await this.sendInvalidChoiceMessage(chatId);
        }
      }
      // قائمة الاستفسارات
      else if (currentStep === 'inquiries_menu') {
        if (choice === '1' || choice === '2' || choice === '3') {
          await this.sendInquiryConfirmation(chatId);
          userState.currentStep = 'inquiry_confirmation';
        } else if (choice === '0') {
          await this.sendWelcomeMessage(chatId);
        } else {
          await this.sendInvalidChoiceMessage(chatId);
        }
      }
      // قائمة الشكاوى
      else if (currentStep === 'complaints_menu') {
        if (choice === '1' || choice === '2' || choice === '3') {
          await this.sendComplaintConfirmation(chatId);
          userState.currentStep = 'complaint_confirmation';
        } else if (choice === '0') {
          await this.sendWelcomeMessage(chatId);
        } else {
          await this.sendInvalidChoiceMessage(chatId);
        }
      }

      this.userBotState.set(chatId, userState);
    } catch (error) {
      this.logger.error(`❌ Error handling bot response: ${error.message}`);
    }
  }

  // رسائل القوائم المختلفة
  private async sendBookingsMenu(chatId: string) {
    const message = `✈️ *قسم الحجوزات*

━━━━━━━━━━━━━━━━━━━━━
📋 *اختر نوع الحجز:*
━━━━━━━━━━━━━━━━━━━━━

*1️⃣ حجز وحدات سكنية* 🏠
   شقق وفلل مفروشة

*2️⃣ حجز سيارات* 🚗
   اقتصادية، فاخرة، وعائلية

*3️⃣ باقات سياحية* 🇸🇦
   رحلات داخل المملكة

*4️⃣ حفلات خارجية* 🎉
   تنظيم المناسبات والمؤتمرات

*0️⃣ القائمة الرئيسية* 🔙

━━━━━━━━━━━━━━━━━━━━━
💡 _أرسل رقم الخيار للمتابعة_`;
    
    await this.client.sendMessage(chatId, message);
  }

  private async sendInquiriesMenu(chatId: string) {
    const message = `ℹ️ *قسم الاستفسارات*

━━━━━━━━━━━━━━━━━━━━━
📋 *اختر نوع الاستفسار:*
━━━━━━━━━━━━━━━━━━━━━

*1️⃣ أسعار الرحلات* ✈️
   الاستفسار عن تكلفة الخدمات

*2️⃣ مواعيد الرحلات* 🕒
   الأوقات المتاحة للحجوزات

*3️⃣ خدمات إضافية* 🛡️
   تأشيرات، تأمين سفر، وغيرها

*0️⃣ القائمة الرئيسية* 🔙

━━━━━━━━━━━━━━━━━━━━━
💡 _أرسل رقم الخيار للمتابعة_`;
    
    await this.client.sendMessage(chatId, message);
  }

  private async sendComplaintsMenu(chatId: string) {
    const message = `⚠️ *قسم الشكاوى*

🙏 *نعتذر عن أي إزعاج حدث لك*

━━━━━━━━━━━━━━━━━━━━━
📋 *اختر نوع الشكوى:*
━━━━━━━━━━━━━━━━━━━━━

*1️⃣ مشكلة في الحجز* 📝
   إلغاء، تعديل، أو مشاكل في الحجز

*2️⃣ مشكلة في الدفع* 💳
   رسوم، استرجاع، أو مشاكل مالية

*3️⃣ مشكلة في الخدمة* 🛎️
   جودة الخدمة أو التعامل

*0️⃣ القائمة الرئيسية* 🔙

━━━━━━━━━━━━━━━━━━━━━
💡 _أرسل رقم الخيار للمتابعة_`;
    
    await this.client.sendMessage(chatId, message);
  }

  private async sendUnitsBookingForm(chatId: string) {
    const message = `🏠 *حجز وحدات سكنية*

من فضلك زودنا بالتفاصيل التالية:

📍 المدينة المطلوبة
🌙 عدد الليالي
👥 عدد النزلاء

_مثال: المدينة: الرياض، الليالي: 3، النزلاء: 4_

⏱️ سيقوم موظفنا المختص بالتواصل معك خلال دقائق قليلة للتأكيد.`;
    
    await this.client.sendMessage(chatId, message);
  }

  private async sendCarsBookingMenu(chatId: string) {
    const message = `🚗 *حجز سيارات*

━━━━━━━━━━━━━━━━━━━━━
📋 *اختر نوع السيارة:*
━━━━━━━━━━━━━━━━━━━━━

*1️⃣ اقتصادية* 🚗
   سيارات صغيرة ومناسبة للأفراد

*2️⃣ فاخرة* 🚙
   سيارات راقية ومريحة

*3️⃣ عائلية* 🚐
   سيارات واسعة للعائلات

*0️⃣ رجوع* 🔙

━━━━━━━━━━━━━━━━━━━━━
💡 _أرسل رقم الخيار للمتابعة_`;
    
    await this.client.sendMessage(chatId, message);
  }

  private async sendTourismPackagesMenu(chatId: string) {
    const message = `🇸🇦 *الباقات السياحية*

━━━━━━━━━━━━━━━━━━━━━
📋 *اختر الوجهة السياحية:*
━━━━━━━━━━━━━━━━━━━━━

*1️⃣ الرياض* 🏙️
*2️⃣ جدة* 🌊
*3️⃣ مكة المكرمة* 🕋
*4️⃣ المدينة المنورة* 🌿
*5️⃣ أبها* ⛰️
*6️⃣ الطائف* 🌸
*7️⃣ مدينة أخرى* 📍

*0️⃣ رجوع* 🔙

━━━━━━━━━━━━━━━━━━━━━
💡 _أرسل رقم الخيار للمتابعة_`;
    
    await this.client.sendMessage(chatId, message);
  }

  private async sendEventsBookingForm(chatId: string) {
    const message = `🎉 *تعاقدات حفلات خارجية*

من فضلك زودنا بالتفاصيل التالية:

🎊 نوع المناسبة (زفاف / مؤتمر / حفلة خاصة)
👥 عدد الحضور
📍 المكان المطلوب
📅 التاريخ

_مثال: زفاف، 300 شخص، الرياض، 2025-12-25_

⏱️ سيقوم موظفنا المختص بالتواصل معك خلال دقائق قليلة للتأكيد.`;
    
    await this.client.sendMessage(chatId, message);
  }

  private async sendInquiryConfirmation(chatId: string) {
    const message = `✅ *تم تسجيل استفسارك بنجاح!*

🔄 سيتم تحويلك لقسم خدمة العملاء للرد على استفسارك.
⏱️ سيقوم موظفنا المختص بالتواصل معك خلال دقائق قليلة.

📞 يمكنك أيضًا التواصل معنا مباشرة على:
📧 Email: support@elmasarelsa5en.com

أو اتصل بنا على:
📞 WhatsApp: متاح الآن 📱`;
    
    await this.client.sendMessage(chatId, message);
    
    // إعادة تعيين الحالة
    this.userBotState.delete(chatId);
  }

  private async sendComplaintConfirmation(chatId: string) {
    const complaintNumber = Math.floor(100000 + Math.random() * 900000);
    const message = `✅ *تم تسجيل شكواك برقم:* #${complaintNumber}

🔄 سيتم تحويلك لقسم المتابعة فورًا.
⏱️ سيقوم مسؤول الشكاوى بالتواصل معك خلال دقائق قليلة.

🙏 نعتذر مجددًا ونعدك بحل المشكلة في أسرع وقت.

⭐ رضاك يهمنا`;
    
    await this.client.sendMessage(chatId, message);
    
    // إعادة تعيين الحالة
    this.userBotState.delete(chatId);
  }

  private async sendInvalidChoiceMessage(chatId: string) {
    const message = `❌ *اختيار غير صحيح*

من فضلك اختر رقم من الخيارات المتاحة.

_أو اكتب "هلا" للعودة للقائمة الرئيسية_`;
    
    await this.client.sendMessage(chatId, message);
  }
}
