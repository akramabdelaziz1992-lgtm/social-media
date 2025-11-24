import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Check if department name already exists
    const existingDept = await this.departmentsRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existingDept) {
      throw new ConflictException('اسم القسم موجود بالفعل');
    }

    const department = this.departmentsRepository.create({
      ...createDepartmentDto,
      color: createDepartmentDto.color || 'blue',
      employeeCount: 0,
      activeChats: 0,
    });

    return this.departmentsRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('القسم غير موجود');
    }

    return department;
  }

  async findByName(name: string): Promise<Department | null> {
    return this.departmentsRepository.findOne({
      where: { name },
    });
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // If name is being updated, check for conflicts
    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingDept = await this.departmentsRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });

      if (existingDept) {
        throw new ConflictException('اسم القسم موجود بالفعل');
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  async delete(id: string): Promise<void> {
    const department = await this.findOne(id);

    // Check if department has employees
    if (department.employeeCount > 0) {
      throw new ConflictException('لا يمكن حذف قسم يحتوي على موظفين');
    }

    await this.departmentsRepository.remove(department);
  }

  async incrementEmployeeCount(id: string): Promise<void> {
    await this.departmentsRepository.increment({ id }, 'employeeCount', 1);
  }

  async decrementEmployeeCount(id: string): Promise<void> {
    await this.departmentsRepository.decrement({ id }, 'employeeCount', 1);
  }

  async updateActiveChats(id: string, count: number): Promise<void> {
    await this.departmentsRepository.update({ id }, { activeChats: count });
  }

  async incrementActiveChats(id: string): Promise<void> {
    await this.departmentsRepository.increment({ id }, 'activeChats', 1);
  }

  async decrementActiveChats(id: string): Promise<void> {
    await this.departmentsRepository.decrement({ id }, 'activeChats', 1);
  }
}
