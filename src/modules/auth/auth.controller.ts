import {
  Controller,
  Post,
  Body,
  Res,
  SetMetadata,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Response } from 'express';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login.auth.dto';
import { SendCodeLoginDto } from './dto/send.code.login.dto';
import { VerifyCodeLoginDto } from './dto/verify.code.login.dto';

@Controller('auth')
@SetMetadata('isFreeAuth', true)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtpUser(@Body() body: CreateAuthDto) {
    const response = await this.authService.sendOtpUser(body);
    return response;
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const response = await this.authService.verifyOtp(body);
    return response;
  }

  @Post('register')
  async register(
    @Body() body: RegisterAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.register(body);
    res.cookie('token', token, {
      maxAge: 2.1 * 3600 * 1000,
      httpOnly: true,
    });
    return { token };
  }

  @Post('login-with-password')
  @HttpCode(200)
  async loginWithPassword(
    @Body() data: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.loginWithPassword(data);
    res.cookie('token', token, {
      maxAge: 2.1 * 3600 * 1000,
      httpOnly: true,
    });
    return { token };
  }

  @Post('send-code-login')
  async sendCodeLogin(@Body() body: SendCodeLoginDto) {
    return await this.authService.sendCodeLogin(body.phoneNumber);
  }

  @Post('verify-code-login')
  async verifyCodeLogin(
    @Body() body: VerifyCodeLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.verifyCodeLogin(body);
    res.cookie('token', token, {
      maxAge: 2.1 * 3600 * 1000,
      httpOnly: true,
    });
    return { token };
  }
}
