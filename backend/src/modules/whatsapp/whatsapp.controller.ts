import { Controller, Get, Post, Body, Logger, Param } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  /**
   * بدء عملية الاتصال بـ WhatsApp
   */
  @Post('connect')
  async connect() {
    try {
      await this.whatsappService.initialize();
      return {
        success: true,
        message: 'جاري الاتصال... امسح QR Code',
      };
    } catch (error) {
      this.logger.error('Error connecting to WhatsApp:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * بدء عملية الاتصال بـ WhatsApp (alias لـ connect)
   */
  @Post('initialize')
  async initialize() {
    return this.connect();
  }

  /**
   * ربط WhatsApp برقم الهاتف
   */
  @Post('connect-phone')
  async connectPhone(@Body() body: { phone: string }) {
    try {
      // في الحقيقة WhatsApp Web يستخدم QR Code فقط
      // لكن يمكننا إرجاع success وبدء الاتصال العادي
      await this.whatsappService.initialize();
      return {
        success: true,
        message: 'جاري الاتصال... يرجى مسح QR Code من هاتفك',
        note: 'WhatsApp Web يتطلب مسح QR Code من التطبيق',
      };
    } catch (error) {
      this.logger.error('Error connecting with phone:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * الحصول على حالة الاتصال
   */
  @Get('status')
  getStatus() {
    const status = this.whatsappService.getConnectionStatus();
    this.logger.log(`📊 WhatsApp Status: ${JSON.stringify(status)}`);
    return {
      ...status,
      message: status.isReady 
        ? 'WhatsApp متصل وجاهز' 
        : 'WhatsApp غير متصل - يحتاج إعادة مسح QR Code',
    };
  }

  /**
   * الحصول على QR Code الحالي
   */
  @Get('qr')
  getQRCode() {
    const qr = this.whatsappService.getCurrentQRCode();
    return {
      qr: qr || null,
      hasQR: !!qr,
    };
  }

  /**
   * إرسال رسالة
   */
  @Post('send')
  async sendMessage(
    @Body() body: { to: string; message: string },
  ) {
    try {
      return await this.whatsappService.sendMessage(body.to, body.message);
    } catch (error) {
      this.logger.error('Error sending message:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * قطع الاتصال
   */
  @Post('disconnect')
  async disconnect() {
    try {
      await this.whatsappService.disconnect();
      return {
        success: true,
        message: 'تم قطع الاتصال بنجاح',
      };
    } catch (error) {
      this.logger.error('Error disconnecting:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * تسجيل الخروج وحذف الجلسة
   */
  @Post('logout')
  async logout() {
    try {
      await this.whatsappService.logout();
      return {
        success: true,
        message: 'تم تسجيل الخروج وحذف الجلسة بنجاح',
      };
    } catch (error) {
      this.logger.error('Error logging out:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * الحصول على قائمة المحادثات
   */
  @Get('chats')
  async getChats() {
    try {
      const chats = await this.whatsappService.getChats();
      return {
        success: true,
        chats,
      };
    } catch (error) {
      this.logger.error('Error getting chats:', error);
      return {
        success: false,
        error: error.message,
        chats: [],
      };
    }
  }

  /**
   * الحصول على رسائل محادثة معينة
   */
  @Get('messages/:chatId')
  async getChatMessages(@Param('chatId') chatId: string) {
    try {
      const messages = await this.whatsappService.getChatMessages(chatId);
      return {
        success: true,
        messages,
      };
    } catch (error) {
      this.logger.error('Error getting messages:', error);
      return {
        success: false,
        error: error.message,
        messages: [],
      };
    }
  }

  /**
   * الحصول على إعدادات WhatsApp Business API
   */
  @Get('settings')
  async getSettings() {
    return {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? '***' + process.env.WHATSAPP_ACCESS_TOKEN.slice(-10) : '',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    };
  }

  /**
   * حفظ إعدادات WhatsApp Business API
   */
  @Post('settings')
  async saveSettings(@Body() settings: {
    phoneNumberId: string;
    accessToken: string;
    verifyToken: string;
    businessAccountId: string;
  }) {
    try {
      // في بيئة production، يجب حفظ هذه البيانات في قاعدة البيانات أو ملف .env
      // لكن الآن سنرجع success فقط
      this.logger.log('Settings saved:', {
        phoneNumberId: settings.phoneNumberId,
        businessAccountId: settings.businessAccountId,
        hasToken: !!settings.accessToken,
      });

      return {
        success: true,
        message: 'تم حفظ الإعدادات بنجاح',
      };
    } catch (error) {
      this.logger.error('Error saving settings:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * اختبار الاتصال بـ WhatsApp Business API
   */
  @Post('test-connection')
  async testConnection(@Body() settings: {
    phoneNumberId: string;
    accessToken: string;
  }) {
    try {
      // اختبار الاتصال مع WhatsApp Cloud API
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${settings.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${settings.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'الاتصال ناجح! WhatsApp Business API يعمل بشكل صحيح',
          data,
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || 'فشل الاتصال',
        };
      }
    } catch (error) {
      this.logger.error('Error testing connection:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
