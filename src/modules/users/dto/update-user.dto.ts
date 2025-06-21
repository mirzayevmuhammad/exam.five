import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;
}
