import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from 'src/core/database/redis.service';
import { generate } from 'otp-generator';
import { SmsService } from './sms.service';
import OtpSecurityService from './otp.security.service';

@Injectable()
export class OtpService {
  constructor(
    private redisService: RedisService,
    private smsService: SmsService,
    private otpSecurityService: OtpSecurityService,
  ) {}

  getSessionToken() {
    const token = crypto.randomUUID();
    return token;
  }

  generateOtp() {
    const opt = generate(6, {
      digits: true,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });
    return opt;
  }
  async sendOtp(phone_number: string) {
    await this.otpSecurityService.checkIfTemporaryBlockedUser(phone_number);
    await this.checkOtpExisted(`user:${phone_number}`);
    const tempOtp = this.generateOtp();
    const responseRedis = await this.redisService.setOtp(phone_number, tempOtp);
    if (responseRedis === 'OK') {
      await this.smsService.sendSms(phone_number, tempOtp);
      return true;
    }
  }

  async checkOtpExisted(key: string) {
    const checkOtp = await this.redisService.getKey(key);
    if (checkOtp) {
      const ttl = await this.redisService.getTtlKey(key);
      throw new BadRequestException(`Please try again after ${ttl} seconds`);
    }
  }

  async verifyOtpSendedUser(key: string, code: string, phone_number: string) {
    await this.otpSecurityService.checkIfTemporaryBlockedUser(phone_number);
    const otp = await this.redisService.getKey(key);
    if (!otp) {
      throw new BadRequestException('invalid code');
    }
    if (otp !== code) {
      const attempts =
        await this.otpSecurityService.recordFailedOtpAttempts(phone_number);
      throw new BadRequestException({
        message: 'invalid code',
        attempts: `You have ${attempts} attempts`,
      });
    }
    await this.redisService.delKey(key);
    await this.otpSecurityService.delOtpAttempts(
      `otp_attempts:${phone_number}`,
    );
    const sessionToken = this.getSessionToken();
    await this.redisService.setSessionTokenUser(phone_number, sessionToken);
    return sessionToken;
  }

  async checkSessionTokenUser(key: string, token: string) {
    const sessionToken = await this.redisService.getKey(key);

    if (!sessionToken || sessionToken !== token)
      throw new BadRequestException('session Token expired');
  }

  async delSessionTokenUser(key: string) {
    await this.redisService.delKey(key);
  }

  async verifyCodeLogin(key: string, code: string) {
    const otp = await this.redisService.getKey(key);
    if (!otp || otp !== code) throw new BadRequestException('code invalid');
    await this.redisService.delKey(key);
  }
}
