import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import OtpSecurityService from './otp.security.service';
import { EmailOtpService } from './email-otp.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    SmsService,
    OtpSecurityService,
    EmailOtpService,
  ],
  exports: [EmailOtpService],
})
export class AuthModule {}
