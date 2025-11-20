import { IsEnum, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChannelType, ChannelStatus } from '../entities/channel.entity';

export class CreateChannelDto {
  @ApiProperty({ enum: ChannelType })
  @IsEnum(ChannelType)
  type: ChannelType;

  @ApiProperty({ example: 'My WhatsApp Channel' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Credentials or connection config' })
  @IsObject()
  credentials: Record<string, any>;

  @ApiProperty({ enum: ChannelStatus, required: false })
  @IsOptional()
  @IsEnum(ChannelStatus)
  status?: ChannelStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastError?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
