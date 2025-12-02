import {
  Controller,
  Logger,
} from '@nestjs/common';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor() {}

  // WhatsApp webhooks moved to separate app: whatsapp-app
  // Messenger, Instagram, Telegram webhooks can be added here
}
