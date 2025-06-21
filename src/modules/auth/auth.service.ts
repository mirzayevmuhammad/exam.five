import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import bcrypt from 'bcrypt';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { VerifyCodeLoginDto } from './dto/verify.code.login.dto';
import { LoginAuthDto } from './dto/login.auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private db: PrismaService,
    private otpService: OtpService,
  ) {}
  async sendOtpUser(createAuthDto: CreateAuthDto) {
    const findUser = await this.db.prisma.user.findFirst({
      where: { phone_number: createAuthDto.phoneNumber },
    });

    if (findUser) throw new ConflictException('Phone number already existed');
    const res = await this.otpService.sendOtp(createAuthDto.phoneNumber);
    if (!res) throw new InternalServerErrorException('Server Error');
    return { message: 'Code sended' };
  }

  async verifyOtp(data: VerifyOtpDto) {
    const key = `user:${data.phoneNumber}`;
    const sessionToken = await this.otpService.verifyOtpSendedUser(
      key,
      data.code,
      data.phoneNumber,
    );
    return { message: 'success', statusCode: 200, sessionToken };
  }

  async register(data: RegisterAuthDto) {
    const key = `session_token:${data.phoneNumber}`;
    await this.otpService.checkSessionTokenUser(key, data.session_token);
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const checkEmail = await this.db.prisma.user.findFirst({
      where: { email: data.email },
    });
    const checkPhone = await this.db.prisma.user.findFirst({
      where: { phone_number: data.phoneNumber },
    });
    const checkUsername = await this.db.prisma.user.findFirst({
      where: { username: data.username },
    });
    if (checkEmail) throw new ConflictException('This email already existed!');
    if (checkPhone)
      throw new ConflictException('This phone number already existed!');
    if (checkUsername)
      throw new ConflictException('This username already existed!');
    const { session_token, ...userData } = data;
    const user = await this.db.prisma.user.create({
      data: { ...userData, password: hashedPassword },
    });
    const token = this.jwtService.sign({ userId: user.id });
    return token;
  }

  async loginWithPassword(data: LoginAuthDto) {
    const findUser = await this.db.prisma.user.findFirst({
      where: { phone_number: data.phoneNumber },
    });

    if (!findUser) throw new NotFoundException('User not found');

    const comparePassword = await bcrypt.compare(
      data.password,
      findUser.password,
    );

    if (!comparePassword) throw new NotFoundException('Password incorrect');

    const token = this.jwtService.sign({ userId: findUser.id });
    return token;
  }

  async sendCodeLogin(phoneNumber: string) {
    const res = await this.otpService.sendOtp(phoneNumber);
    if (!res) throw new InternalServerErrorException('Sms server error');
    return { message: 'code sended' };
  }

  async verifyCodeLogin(data: VerifyCodeLoginDto) {
    const key = `user:${data.phoneNumber}`;
    const findUser = await this.db.prisma.user.findFirst({
      where: { phone_number: data.phoneNumber },
    });
    if (!findUser)
      throw new NotFoundException(
        'User not found, you have to enter registration',
      );
    await this.otpService.verifyCodeLogin(key, data.code);
    await this.otpService.delSessionTokenUser(key);
    const token = await this.jwtService.signAsync({ userId: findUser.id });
    return token;
  }
}
