import { Controller, Post, Get, Body, Param, Query, Req, Res, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { WhatsAppBusinessService } from './whatsapp-business.service';

@Controller('api/whatsapp-business')
export class WhatsAppBusinessController {
  private readonly logger = new Logger(WhatsAppBusinessController.name);

  constructor(private readonly whatsappBusinessService: WhatsAppBusinessService) {}

  /**
   * إرسال رسالة نصية
   */
  @Post('send')
  async sendMessage(@Body() body: { to: string; message: string }) {
    return this.whatsappBusinessService.sendMessage(body.to, body.message);
  }

  /**
   * إرسال رسالة بقالب (Template)
   */
  @Post('send-template')
  async sendTemplate(@Body() body: { to: string; templateName: string; languageCode?: string }) {
    return this.whatsappBusinessService.sendTemplate(
      body.to,
      body.templateName,
      body.languageCode || 'ar',
    );
  }

  /**
   * إرسال رسالة بأزرار تفاعلية
   */
  @Post('send-interactive-buttons')
  async sendInteractiveButtons(
    @Body() body: { 
      to: string; 
      bodyText: string; 
      buttons: Array<{ id: string; title: string }> 
    }
  ) {
    return this.whatsappBusinessService.sendInteractiveButtons(
      body.to,
      body.bodyText,
      body.buttons,
    );
  }

  /**
   * إرسال رسالة بقائمة تفاعلية
   */
  @Post('send-interactive-list')
  async sendInteractiveList(
    @Body() body: {
      to: string;
      bodyText: string;
      buttonText: string;
      sections: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
    },
  ) {
    return this.whatsappBusinessService.sendInteractiveList(
      body.to,
      body.bodyText,
      body.buttonText,
      body.sections,
    );
  }

  /**
   * Webhook للتحقق من صحة الاتصال (Verification)
   */
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    this.logger.log(`📥 Webhook verification request received`);
    
    const verifiedChallenge = this.whatsappBusinessService.verifyWebhook(mode, token, challenge);
    
    if (verifiedChallenge) {
      return res.status(200).send(verifiedChallenge);
    } else {
      return res.status(403).json({ error: 'Verification failed' });
    }
  }

  /**
   * Webhook لاستقبال الرسائل والتحديثات
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any, @Req() req: Request) {
    this.logger.log('📩 Webhook POST received');
    
    try {
      await this.whatsappBusinessService.handleWebhook(body);
      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Webhook error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * الحصول على حالة الاتصال
   */
  @Get('status')
  getStatus() {
    return this.whatsappBusinessService.getStatus();
  }

  /**
   * جلب قائمة المحادثات
   */
  @Get('chats')
  async getChats() {
    const chats = await this.whatsappBusinessService.getChats();
    return {
      success: true,
      chats,
    };
  }

  /**
   * جلب رسائل محادثة معينة
   */
  @Get('messages/:chatId')
  async getChatMessages(@Param('chatId') chatId: string) {
    const messages = await this.whatsappBusinessService.getChatMessages(chatId);
    return {
      success: true,
      messages,
    };
  }

  /**
   * Get recent WhatsApp messages
   */
  @Get('recent-messages')
  getRecentMessages() {
    return {
      success: true,
      messages: this.whatsappBusinessService.getRecentMessages(),
    };
  }
}
