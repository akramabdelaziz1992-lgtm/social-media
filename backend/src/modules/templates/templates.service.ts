import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templatesRepository: Repository<Template>,
  ) {}

  async findAll(): Promise<Template[]> {
    return this.templatesRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Template> {
    return this.templatesRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Template>): Promise<Template> {
    const template = this.templatesRepository.create(data);
    return this.templatesRepository.save(template);
  }

  async update(id: string, data: Partial<Template>): Promise<Template> {
    await this.templatesRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.templatesRepository.delete(id);
  }
}
