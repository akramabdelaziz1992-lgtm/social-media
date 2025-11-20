import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'role', 'department', 'isActive', 'phone', 'avatar', 'createdAt'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'department', 'isActive', 'phone', 'avatar', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateData: Partial<User>) {
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.userRepository.update(id, { isActive: false });
    return { message: 'تم تعطيل المستخدم بنجاح' };
  }
}
