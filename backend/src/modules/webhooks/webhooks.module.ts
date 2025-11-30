import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsAppModule],
  controllers: [WebhooksController],
  providers: [],
  exports: [],
})
export class WebhooksModule {}
