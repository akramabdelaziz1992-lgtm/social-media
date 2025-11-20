import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AutoReplyService } from './auto-reply.service';
import { AutoReplyRule } from './entities/auto-reply-rule.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('auto-reply')
@Controller('auto-reply')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AutoReplyController {
  constructor(private autoReplyService: AutoReplyService) {}

  @Get()
  @ApiOperation({ summary: 'الحصول على قواعد الردود التلقائية' })
  async getRules(): Promise<AutoReplyRule[]> {
    return this.autoReplyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل قاعدة رد تلقائي' })
  async getRule(@Param('id') id: string): Promise<AutoReplyRule> {
    return this.autoReplyService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء قاعدة رد تلقائي جديدة' })
  async createRule(@Body() data: Partial<AutoReplyRule>): Promise<AutoReplyRule> {
    return this.autoReplyService.create(data);
  }
}
