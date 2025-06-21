import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { RedisService } from 'src/core/database/redis.service';
import { ResendService } from 'nestjs-resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailOtpService {
  MAX_DURATION_LINK: number = 86400;
  MAX_EMAIL_RATE: number = 30;
  MAX_HOURLY_LIMIT: number = 10;
  constructor(
    private resendService: ResendService,
    private otpService: OtpService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async sendEmailLink(email: string) {
    const token = this.otpService.getSessionToken();
    await this.setEmailToken(token, email);
    const fromEmail = this.configService.get('HOST_EMAIL');
    const url = `http://${this.configService.get('HOST_EMAIL_URL')}:4000/api/users/verify-email?token=${token}`;
    try {
      await this.resendService.send({
        from: fromEmail,
        to: email,
        subject: 'Khakimov Mukhammadaziz',
        html: `<a href=${url}>${url}</a>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async sendEmailWithOtp() {
    const otp = this.otpService.generateOtp();
  }

  async setEmailToken(token: string, email: string) {
    const key = `email-verify:${token}`;
    await this.redisService.redis.setex(
      key,
      this.MAX_DURATION_LINK,
      JSON.stringify({
        email,
        createdAt: new Date(),
      }),
    );
  }

  async getEmailToken(token: string) {
    const key = `email-verify:${token}`;
    return await this.redisService.getKey(key);
  }
}
