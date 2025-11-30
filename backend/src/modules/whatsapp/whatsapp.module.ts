import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppBusinessController } from './whatsapp-business.controller';
import { WhatsAppBusinessService } from './whatsapp-business.service';
import { BotAutoReplyService } from './bot-auto-reply.service';
import { WhatsAppGateway } from './whatsapp.gateway';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [HttpModule, AIModule],
  controllers: [WhatsAppController, WhatsAppBusinessController],
  providers: [WhatsAppService, WhatsAppBusinessService, BotAutoReplyService, WhatsAppGateway],
  exports: [WhatsAppService, WhatsAppBusinessService, BotAutoReplyService],
})
export class WhatsAppModule {}
