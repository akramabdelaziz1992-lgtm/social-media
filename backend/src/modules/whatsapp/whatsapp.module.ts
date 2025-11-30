import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppBusinessController } from './whatsapp-business.controller';
import { WhatsAppBusinessService } from './whatsapp-business.service';
import { WhatsAppGateway } from './whatsapp.gateway';
import { AIModule } from '../ai/ai.module';
import { Message } from '../messages/message.entity';
import { Conversation } from '../conversations/conversation.entity';

@Module({
  imports: [
    HttpModule,
    AIModule,
    TypeOrmModule.forFeature([Message, Conversation]),
  ],
  controllers: [WhatsAppController, WhatsAppBusinessController],
  providers: [WhatsAppService, WhatsAppBusinessService, WhatsAppGateway],
  exports: [WhatsAppService, WhatsAppBusinessService],
})
export class WhatsAppModule {}
