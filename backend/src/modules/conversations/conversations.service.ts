import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';

interface FindOptions {
  assignedTo?: string;
  status?: string;
  department?: string;
}

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
  ) {}

  async findAll(filters: FindOptions): Promise<Conversation[]> {
    let query = this.conversationsRepository.createQueryBuilder('conversation');

    if (filters.assignedTo && filters.assignedTo !== 'me') {
      query = query.where('conversation.assignedToUserId = :assignedTo', {
        assignedTo: filters.assignedTo,
      });
    }

    if (filters.status) {
      query = query.andWhere('conversation.status = :status', { status: filters.status });
    }

    if (filters.department) {
      query = query.andWhere('conversation.department = :department', {
        department: filters.department,
      });
    }

    return query.orderBy('conversation.lastMessageAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Conversation> {
    return this.conversationsRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversationsRepository.create(data);
    return this.conversationsRepository.save(conversation);
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    await this.conversationsRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.conversationsRepository.delete(id);
  }
}
