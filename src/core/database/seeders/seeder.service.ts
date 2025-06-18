import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger();
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}
  async seedAll() {
    await this.seedUsers();
  }
  async seedUsers() {
    const username = this.configService.get('USER_USERNAME');
    const passsword = this.configService.get('USER_PASSWORD');
    const findUser = await this.prisma.user.findUnique({
      where: { username },
    });
    const hashedPassword = await bcrypt.hash(passsword, 6);
    if (!findUser) {
      await this.prisma.user.create({
        data: {
          username: username,
          passwordHash: hashedPassword,
          email: 'mirzayevmukhammad@gmail.com',
          role: 'user',
          phone: '998911174060',
          full_name: 'Muhammad',
          country: 'Fergana',
        },
      });
    }
  }
  async onModuleInit() {
    try {
      await this.seedAll();
    } catch (error) {
      this.logger.error(error);
      process.exit(1);
    }
  }
}
