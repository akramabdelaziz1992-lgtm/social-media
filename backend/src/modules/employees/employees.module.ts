import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { EmployeesService } from './employees.service';
import { DepartmentsService } from './departments.service';
import { EmployeesController } from './employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department])],
  controllers: [EmployeesController],
  providers: [EmployeesService, DepartmentsService],
  exports: [EmployeesService, DepartmentsService],
})
export class EmployeesModule {}
