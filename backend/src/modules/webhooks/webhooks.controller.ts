import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { WhatsAppBusinessService } from '../whatsapp/whatsapp-business.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly whatsappBusinessService: WhatsAppBusinessService,
  ) {}

  /**
   * WhatsApp Webhook Verification (GET)
   * Meta sends this to verify the webhook endpoint
   */
  @Get('whatsapp')
  verifyWhatsAppWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    this.logger.log(`📥 WhatsApp Webhook verification request received`);
    this.logger.log(`Mode: ${mode}, Token: ${token}, Challenge: ${challenge}`);

    const verifiedChallenge = this.whatsappBusinessService.verifyWebhook(
      mode,
      token,
      challenge,
    );

    if (verifiedChallenge) {
      this.logger.log(`✅ Webhook verification successful`);
      return res.status(200).send(verifiedChallenge);
    } else {
      this.logger.error(`❌ Webhook verification failed`);
      return res.status(403).json({ error: 'Verification failed' });
    }
  }

  /**
   * WhatsApp Webhook Handler (POST)
   * Receives messages and updates from WhatsApp
   */
  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  async handleWhatsAppWebhook(@Body() body: any) {
    this.logger.log('📩 WhatsApp Webhook POST received');
    this.logger.debug(`Webhook payload: ${JSON.stringify(body, null, 2)}`);

    try {
      await this.whatsappBusinessService.handleWebhook(body);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`);
      // Always return 200 to Meta to avoid retries
      return { status: 'error', message: error.message };
    }
  }
}
