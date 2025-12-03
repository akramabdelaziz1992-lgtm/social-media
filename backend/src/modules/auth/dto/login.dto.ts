import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'saher' })
  @IsString({ message: 'اسم المستخدم غير صحيح' })
  username: string;

  @ApiProperty({ example: 'Aa123456' })
  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;
}
