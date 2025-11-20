import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { Conversation } from './entities/conversation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة المحادثات' })
  @ApiQuery({ name: 'assignedTo', required: false, description: 'تصفية حسب المسؤول' })
  @ApiQuery({ name: 'status', required: false, description: 'تصفية حسب الحالة' })
  @ApiQuery({ name: 'department', required: false, description: 'تصفية حسب القسم' })
  async getConversations(
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
  ): Promise<Conversation[]> {
    return this.conversationsService.findAll({ assignedTo, status, department });
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل محادثة' })
  async getConversation(@Param('id') id: string): Promise<Conversation> {
    return this.conversationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء محادثة جديدة' })
  async createConversation(@Body() data: Partial<Conversation>): Promise<Conversation> {
    return this.conversationsService.create(data);
  }
}
