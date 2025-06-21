import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { EmailOtpService } from '../auth/email-otp.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private emailOtpService: EmailOtpService,
    private prismaService: PrismaService,
  ) {}

  async sendEmailVerificationLink(email: string) {
    await this.emailOtpService.sendEmailLink(email);
    return { message: 'link sended' };
  }

  async verifyEmail(token: string) {
    const data = await this.emailOtpService.getEmailToken(token);
    const email = JSON.parse(data as string).email;
    const user = await this.prismaService.prisma.user.findFirst({
      where: { email },
    });
    await this.prismaService.prisma.user.update({
      where: { id: user?.id },
      data: { is_email_verified: true },
    });
  }

  async getProfile(userId: string) {
    const findUser = await this.prismaService.prisma.user.findFirst({
      where: { id: userId },
    });
    if (!findUser) throw new NotFoundException('User not found');
    const { password, ...userInfo } = findUser;
    return userInfo;
  }

  async updateUserProfile(
    avatarPath: string,
    userData: UpdateUserDto,
    id: string,
  ) {
    const findUser = await this.prismaService.prisma.user.findFirst({
      where: { id },
    });
    if (!findUser) throw new NotFoundException('User not found');
    if (userData.email) {
      const checkEmail = await this.prismaService.prisma.user.findFirst({
        where: { email: userData.email },
      });
      if (checkEmail && checkEmail.id !== findUser.id)
        throw new ConflictException('This email already existed!');
    }
    if (userData.username) {
      const checkUsername = await this.prismaService.prisma.user.findFirst({
        where: { email: userData.username },
      });
      if (checkUsername && checkUsername.id !== findUser.id)
        throw new ConflictException('This username already existed!');
    }
    if (userData.phoneNumber) {
      const checkPhone = await this.prismaService.prisma.user.findFirst({
        where: { email: userData.phoneNumber },
      });
      if (checkPhone && checkPhone.id !== findUser.id)
        throw new ConflictException('This email already existed!');
    }

    const updatedUser = await this.prismaService.prisma.user.update({
      where: { id },
      data: { ...userData, avatar: avatarPath },
    });
    const { password, ...userInfo } = updatedUser;
    return userInfo;
  }
}
