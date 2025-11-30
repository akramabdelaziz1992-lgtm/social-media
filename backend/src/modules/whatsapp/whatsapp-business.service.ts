import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WhatsAppGateway } from './whatsapp.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';

@Injectable()
export class WhatsAppBusinessService {
  private readonly logger = new Logger(WhatsAppBusinessService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private readonly accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  private isReady = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly whatsappGateway: WhatsAppGateway,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {
    // التحقق من البيانات المطلوبة
    if (this.phoneNumberId && this.accessToken) {
      this.isReady = true;
      this.logger.log('✅ WhatsApp Business API configured and ready');
    } else {
      this.logger.warn('⚠️ WhatsApp Business API not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN');
    }
  }

  /**
   * إرسال رسالة نصية
   */
  async sendMessage(to: string, message: string) {
    if (!this.isReady) {
      throw new Error('WhatsApp Business API not configured');
    }

    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      // إزالة الرموز الإضافية من رقم الهاتف
      const cleanNumber = to.replace(/[^\d]/g, '');
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`✅ Message sent successfully to ${cleanNumber}`);
      const responseData: any = response.data;
      return {
        success: true,
        messageId: responseData.messages[0].id,
        data: responseData,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending message: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * إرسال رسالة بقالب (Template)
   */
  async sendTemplate(to: string, templateName: string, languageCode = 'ar') {
    if (!this.isReady) {
      throw new Error('WhatsApp Business API not configured');
    }

    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      const cleanNumber = to.replace(/[^\d]/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`✅ Template sent successfully to ${cleanNumber}`);
      const responseData: any = response.data;
      return {
        success: true,
        messageId: responseData.messages[0].id,
        data: responseData,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending template: ${error.message}`);
      throw error;
    }
  }

  /**
   * معالجة Webhook الوارد من WhatsApp
   */
  async handleWebhook(body: any) {
    try {
      this.logger.log('📩 Webhook received');

      if (!body.entry || !body.entry[0]) {
        return;
      }

      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      // معالجة الرسائل الواردة
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const from = message.from;
        const messageId = message.id;
        const timestamp = message.timestamp;

        let messageBody = '';
        let messageType = message.type;

        // استخراج نص الرسالة حسب النوع
        if (messageType === 'text') {
          messageBody = message.text.body;
        } else if (messageType === 'button') {
          messageBody = message.button.text;
        } else if (messageType === 'interactive') {
          if (message.interactive.type === 'button_reply') {
            messageBody = message.interactive.button_reply.title;
          } else if (message.interactive.type === 'list_reply') {
            messageBody = message.interactive.list_reply.title;
          }
        }

        // الحصول على معلومات المرسل
        const contact = value.contacts ? value.contacts[0] : null;
        const contactName = contact?.profile?.name || from;

        this.logger.log(`📨 New message from ${contactName} (${from}): ${messageBody}`);

        // حفظ الرسالة في Database
        try {
          // البحث عن المحادثة أو إنشاء واحدة جديدة
          let conversation = await this.conversationRepository.findOne({
            where: { phoneNumber: from },
          });

          if (!conversation) {
            conversation = this.conversationRepository.create({
              phoneNumber: from,
              customerName: contactName,
              platform: 'whatsapp',
              status: 'active',
            });
            await this.conversationRepository.save(conversation);
            this.logger.log(`✅ Created new conversation for ${from}`);
          }

          // حفظ الرسالة
          const newMessage = this.messageRepository.create({
            conversation: conversation,
            content: messageBody,
            sender: 'customer',
            messageType: messageType,
            platform: 'whatsapp',
            externalId: messageId,
            timestamp: new Date(parseInt(timestamp) * 1000),
          });
          await this.messageRepository.save(newMessage);
          this.logger.log(`✅ Message saved to database`);

          // إرسال الرسالة للواجهة عبر WebSocket
          this.whatsappGateway.sendMessage('new-message', {
            id: messageId,
            from: from,
            body: messageBody,
            timestamp: timestamp,
            contactName: contactName,
            type: messageType,
            conversationId: conversation.id,
          });
        } catch (dbError) {
          this.logger.error(`❌ Error saving message to database: ${dbError.message}`);
        }

        return {
          success: true,
          message: 'Webhook processed',
        };
      }

      // معالجة حالات أخرى (مثل تحديث حالة الرسالة)
      if (value.statuses && value.statuses.length > 0) {
        const status = value.statuses[0];
        this.logger.log(`📊 Message status update: ${status.status} for ${status.id}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Error processing webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * التحقق من صحة webhook verification token
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook verified successfully');
      return challenge;
    } else {
      this.logger.warn('⚠️ Webhook verification failed');
      return null;
    }
  }

  /**
   * جلب قائمة المحادثات (Chats)
   * ملاحظة: WhatsApp Business API لا توفر endpoint لجلب المحادثات مباشرة
   * يجب حفظ المحادثات في قاعدة البيانات من خلال Webhooks
   */
  async getChats() {
    // هنا يمكنك جلب المحادثات من قاعدة البيانات
    // التي تم حفظها من خلال Webhooks
    this.logger.warn('⚠️ getChats: Use database to retrieve conversations');
    return [];
  }

  /**
   * جلب رسائل محادثة معينة
   */
  async getChatMessages(chatId: string) {
    // يمكنك جلب الرسائل من قاعدة البيانات
    this.logger.warn('⚠️ getChatMessages: Use database to retrieve messages');
    return [];
  }

  /**
   * التحقق من حالة الاتصال
   */
  getStatus() {
    return {
      isReady: this.isReady,
      message: this.isReady ? 'WhatsApp Business API متصل وجاهز' : 'WhatsApp Business API غير مكوّن',
    };
  }

  /**
   * إرسال رسالة بأزرار تفاعلية
   */
  async sendInteractiveButtons(to: string, bodyText: string, buttons: Array<{ id: string; title: string }>) {
    if (!this.isReady) {
      throw new Error('WhatsApp Business API not configured');
    }

    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      const cleanNumber = to.replace(/[^\d]/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: bodyText,
          },
          action: {
            buttons: buttons.map((btn, index) => ({
              type: 'reply',
              reply: {
                id: btn.id || `btn_${index}`,
                title: btn.title.substring(0, 20), // Max 20 characters
              },
            })),
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`✅ Interactive buttons sent to ${cleanNumber}`);
      const responseData: any = response.data;
      return {
        success: true,
        messageId: responseData.messages[0].id,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending interactive buttons: ${error.message}`);
      throw error;
    }
  }

  /**
   * إرسال رسالة بقائمة تفاعلية
   */
  async sendInteractiveList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
  ) {
    if (!this.isReady) {
      throw new Error('WhatsApp Business API not configured');
    }

    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      const cleanNumber = to.replace(/[^\d]/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: bodyText,
          },
          action: {
            button: buttonText,
            sections: sections,
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`✅ Interactive list sent to ${cleanNumber}`);
      const responseData: any = response.data;
      return {
        success: true,
        messageId: responseData.messages[0].id,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending interactive list: ${error.message}`);
      throw error;
    }
  }
}
