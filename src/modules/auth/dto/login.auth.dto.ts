import { IsString } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  password: string;
}
