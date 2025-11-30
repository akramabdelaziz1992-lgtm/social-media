import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppBusinessController } from './whatsapp-business.controller';
import { WhatsAppBusinessService } from './whatsapp-business.service';
import { BotAutoReplyService } from './bot-auto-reply.service';
import { WhatsAppGateway } from './whatsapp.gateway';
import { AIModule } from '../ai/ai.module';
import { Conversation } from '../conversations/entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { Channel } from '../channels/entities/channel.entity';

@Module({
  imports: [
    HttpModule, 
    AIModule,
    TypeOrmModule.forFeature([Conversation, Message, Channel]),
  ],
  controllers: [WhatsAppController, WhatsAppBusinessController],
  providers: [WhatsAppService, WhatsAppBusinessService, BotAutoReplyService, WhatsAppGateway],
  exports: [WhatsAppService, WhatsAppBusinessService, BotAutoReplyService],
})
export class WhatsAppModule {}
