import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutoReplyRule } from './entities/auto-reply-rule.entity';

@Injectable()
export class AutoReplyService {
  constructor(
    @InjectRepository(AutoReplyRule)
    private autoReplyRepository: Repository<AutoReplyRule>,
  ) {}

  async findAll(): Promise<AutoReplyRule[]> {
    return this.autoReplyRepository.find({ where: { enabled: true } });
  }

  async findOne(id: string): Promise<AutoReplyRule> {
    return this.autoReplyRepository.findOne({ where: { id } });
  }

  async create(data: Partial<AutoReplyRule>): Promise<AutoReplyRule> {
    const rule = this.autoReplyRepository.create(data);
    return this.autoReplyRepository.save(rule);
  }

  async update(id: string, data: Partial<AutoReplyRule>): Promise<AutoReplyRule> {
    await this.autoReplyRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.autoReplyRepository.delete(id);
  }
}
