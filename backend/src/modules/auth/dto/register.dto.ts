import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserDepartment } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'أحمد محمد' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ahmed' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'user@elmasarelsa5en.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SALES })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ enum: UserDepartment, example: UserDepartment.SALES, required: false })
  @IsOptional()
  @IsEnum(UserDepartment)
  department?: UserDepartment;

  @ApiProperty({ example: '+966501234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
