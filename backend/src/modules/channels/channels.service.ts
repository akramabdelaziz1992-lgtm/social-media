import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
  ) {}

  create(createChannelDto: CreateChannelDto): Promise<Channel> {
    const channel = this.channelsRepository.create(createChannelDto);
    return this.channelsRepository.save(channel);
  }

  findAll(): Promise<Channel[]> {
    return this.channelsRepository.find();
  }

  async findOne(id: string): Promise<Channel> {
    const channel = await this.channelsRepository.findOneBy({ id });
    if (!channel) {
      throw new NotFoundException(`Channel with ID "${id}" not found`);
    }
    return channel;
  }

  async update(id: string, updateChannelDto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.channelsRepository.preload({ id, ...updateChannelDto });
    if (!channel) {
      throw new NotFoundException(`Channel with ID "${id}" not found`);
    }
    return this.channelsRepository.save(channel);
  }

  async remove(id: string): Promise<void> {
    const result = await this.channelsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Channel with ID "${id}" not found`);
    }
  }
}