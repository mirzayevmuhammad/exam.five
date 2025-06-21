import { IsString } from 'class-validator';

export class SendCodeLoginDto {
  @IsString()
  phoneNumber: string;
}
