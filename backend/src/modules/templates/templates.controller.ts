import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { Template } from './entities/template.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'الحصول على جميع القوالب' })
  async getTemplates(): Promise<Template[]> {
    return this.templatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل قالب' })
  async getTemplate(@Param('id') id: string): Promise<Template> {
    return this.templatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء قالب جديد' })
  async createTemplate(@Body() data: Partial<Template>): Promise<Template> {
    return this.templatesService.create(data);
  }
}
