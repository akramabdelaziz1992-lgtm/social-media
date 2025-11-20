import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'الحصول على رسائل محادثة' })
  async getMessages(@Param('conversationId') conversationId: string): Promise<Message[]> {
    return this.messagesService.findByConversation(conversationId);
  }

  @Post()
  @ApiOperation({ summary: 'إرسال رسالة جديدة' })
  async sendMessage(@Body() data: Partial<Message>): Promise<Message> {
    return this.messagesService.create(data);
  }
}
