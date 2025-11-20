import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
}
