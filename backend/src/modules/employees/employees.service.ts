import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check if email already exists
    const existingEmployee = await this.employeesRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (existingEmployee) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    const employee = this.employeesRepository.create({
      ...createEmployeeDto,
      password: hashedPassword,
      role: createEmployeeDto.role || 'موظف',
      status: createEmployeeDto.status || 'نشط',
      hireDate: createEmployeeDto.hireDate || new Date().toISOString().split('T')[0],
      permissions: createEmployeeDto.permissions || [],
      totalAssignedChats: 0,
      todayChats: 0,
      responseTime: '0 دقيقة',
    });

    return this.employeesRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    return employee;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.employeesRepository.findOne({
      where: { email },
    });
  }

  async findByDepartment(department: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { department },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // If email is being updated, check for conflicts
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmployee = await this.employeesRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });

      if (existingEmployee) {
        throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
      }
    }

    // If password is being updated, hash it
    if (updateEmployeeDto.password) {
      updateEmployeeDto.password = await bcrypt.hash(updateEmployeeDto.password, 10);
    }

    Object.assign(employee, updateEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  async delete(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeesRepository.remove(employee);
  }

  async incrementChatCount(id: string): Promise<void> {
    await this.employeesRepository.increment(
      { id },
      'totalAssignedChats',
      1,
    );
    await this.employeesRepository.increment(
      { id },
      'todayChats',
      1,
    );
  }

  async resetTodayChats(): Promise<void> {
    // This should be called daily (e.g., by a cron job)
    await this.employeesRepository.update({}, { todayChats: 0 });
  }

  async updateResponseTime(id: string, responseTime: string): Promise<void> {
    await this.employeesRepository.update({ id }, { responseTime });
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { status: 'نشط' },
      order: { name: 'ASC' },
    });
  }

  async getEmployeesByRole(role: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { role },
      order: { name: 'ASC' },
    });
  }

  async validateCredentials(email: string, password: string): Promise<Employee | null> {
    const employee = await this.findByEmail(email);
    if (!employee) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return null;
    }

    return employee;
  }
}
