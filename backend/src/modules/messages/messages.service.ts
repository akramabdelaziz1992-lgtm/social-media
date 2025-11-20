import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async findByConversation(conversationId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(data: Partial<Message>): Promise<Message> {
    const message = this.messagesRepository.create(data);
    return this.messagesRepository.save(message);
  }

  async findOne(id: string): Promise<Message> {
    return this.messagesRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Message>): Promise<Message> {
    await this.messagesRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.messagesRepository.delete(id);
  }
}
