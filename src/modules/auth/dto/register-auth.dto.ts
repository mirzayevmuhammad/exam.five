import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  password: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @IsString()
  session_token: string;
}
