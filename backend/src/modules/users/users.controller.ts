import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { User, UserRole } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'الحصول على بيانات المستخدم الحالي' })
  getMe(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'الحصول على قائمة جميع المستخدمين (للمدراء فقط)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على بيانات مستخدم محدد' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'إنشاء موظف جديد (للمدراء فقط)' })
  async createEmployee(@Body() employeeData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    role: UserRole;
    permissions?: string[];
  }) {
    return this.usersService.createEmployee(employeeData);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'تحديث بيانات موظف (للمدراء فقط)' })
  async updateEmployee(
    @Param('id') id: string,
    @Body() employeeData: {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      department?: string;
      role?: UserRole;
      permissions?: string[];
    }
  ) {
    return this.usersService.updateEmployee(id, employeeData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RbacGuard)
  @ApiOperation({ summary: 'حذف موظف (للمدراء فقط)' })
  async deleteEmployee(@Param('id') id: string) {
    return this.usersService.deleteEmployee(id);
  }
}
