import { IsOptional, IsString } from 'class-validator';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  channelDescription: string;
}
