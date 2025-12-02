import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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

  async createEmployee(employeeData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    role: UserRole;
    permissions?: string[];
  }) {
    // التحقق من عدم وجود البريد مسبقاً
    const existingUser = await this.findByEmail(employeeData.email);
    if (existingUser) {
      throw new BadRequestException('البريد الإلكتروني مستخدم بالفعل');
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // إنشاء الموظف
    const employee = this.userRepository.create({
      name: employeeData.name,
      email: employeeData.email,
      passwordHash: hashedPassword,
      phone: employeeData.phone,
      department: employeeData.department as any,
      role: employeeData.role,
      permissions: employeeData.permissions || [],
      isActive: true,
    });

    const savedEmployee = await this.userRepository.save(employee);

    // إرجاع البيانات بدون كلمة المرور
    const { passwordHash, ...result } = savedEmployee;
    return result;
  }

  async updateEmployee(id: string, employeeData: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    department?: string;
    role?: UserRole;
    permissions?: string[];
  }) {
    const employee = await this.findOne(id);

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    // إذا كان هناك بريد جديد، تحقق من عدم وجوده
    if (employeeData.email && employeeData.email !== employee.email) {
      const existingUser = await this.findByEmail(employeeData.email);
      if (existingUser) {
        throw new BadRequestException('البريد الإلكتروني مستخدم بالفعل');
      }
    }

    // تشفير كلمة المرور الجديدة إن وجدت
    const updateData: any = { ...employeeData };
    if (employeeData.password) {
      updateData.passwordHash = await bcrypt.hash(employeeData.password, 10);
      delete updateData.password;
    }

    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteEmployee(id: string) {
    const employee = await this.findOne(id);
    
    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    await this.userRepository.delete(id);
    return { message: 'تم حذف الموظف بنجاح' };
  }
}
