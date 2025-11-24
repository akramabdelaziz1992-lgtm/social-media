import { IsString, IsEmail, IsArray, IsOptional, IsEnum } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  phone: string;

  @IsString()
  department: string;

  @IsOptional()
  @IsEnum(['مدير', 'مشرف', 'موظف'])
  role?: string;

  @IsOptional()
  @IsEnum(['نشط', 'غير نشط', 'إجازة'])
  status?: string;

  @IsOptional()
  @IsString()
  hireDate?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsString()
  avatar?: string;
}
