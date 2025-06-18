import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  username: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  session_token: string;

  @IsString()
  phone_number: string;
}
