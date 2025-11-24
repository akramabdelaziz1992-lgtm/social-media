import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { DepartmentsService } from './departments.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  // Employee Endpoints
  @Post()
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    const employee = await this.employeesService.create(createEmployeeDto);
    
    // Increment department employee count
    const department = await this.departmentsService.findByName(employee.department);
    if (department) {
      await this.departmentsService.incrementEmployeeCount(department.id);
    }

    // Don't return password in response
    const { password, ...result } = employee;
    return result;
  }

  @Get()
  async findAllEmployees(@Query('department') department?: string, @Query('status') status?: string) {
    let employees;

    if (department) {
      employees = await this.employeesService.findByDepartment(department);
    } else if (status === 'active') {
      employees = await this.employeesService.getActiveEmployees();
    } else {
      employees = await this.employeesService.findAll();
    }

    // Remove passwords from response
    return employees.map(emp => {
      const { password, ...result } = emp;
      return result;
    });
  }

  @Get(':id')
  async findOneEmployee(@Param('id') id: string) {
    const employee = await this.employeesService.findOne(id);
    const { password, ...result } = employee;
    return result;
  }

  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const oldEmployee = await this.employeesService.findOne(id);
    const employee = await this.employeesService.update(id, updateEmployeeDto);

    // If department changed, update counts
    if (updateEmployeeDto.department && updateEmployeeDto.department !== oldEmployee.department) {
      const oldDept = await this.departmentsService.findByName(oldEmployee.department);
      const newDept = await this.departmentsService.findByName(updateEmployeeDto.department);

      if (oldDept) {
        await this.departmentsService.decrementEmployeeCount(oldDept.id);
      }
      if (newDept) {
        await this.departmentsService.incrementEmployeeCount(newDept.id);
      }
    }

    const { password, ...result } = employee;
    return result;
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: string) {
    const employee = await this.employeesService.findOne(id);
    
    // Decrement department employee count
    const department = await this.departmentsService.findByName(employee.department);
    if (department) {
      await this.departmentsService.decrementEmployeeCount(department.id);
    }

    await this.employeesService.delete(id);
    return { message: 'تم حذف الموظف بنجاح' };
  }

  @Get('role/:role')
  async findByRole(@Param('role') role: string) {
    const employees = await this.employeesService.getEmployeesByRole(role);
    return employees.map(emp => {
      const { password, ...result } = emp;
      return result;
    });
  }

  // Department Endpoints
  @Post('departments')
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get('departments/all')
  async findAllDepartments() {
    return this.departmentsService.findAll();
  }

  @Get('departments/:id')
  async findOneDepartment(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Put('departments/:id')
  async updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete('departments/:id')
  async deleteDepartment(@Param('id') id: string) {
    await this.departmentsService.delete(id);
    return { message: 'تم حذف القسم بنجاح' };
  }
}
