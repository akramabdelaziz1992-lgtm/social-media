import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ChannelType)
  @IsNotEmpty()
  type: ChannelType;

  @IsString()
  @IsOptional()
  token?: string;

  @IsString()
  @IsOptional()
  phoneNumberId?: string;
}