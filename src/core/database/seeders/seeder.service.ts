import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async seedAll() {
    await this.seedUsers();
  }
  async seedUsers() {
    this.logger.log('Users seeders started');

    const email = this.configService.get('SP_EMAIL');
    const phoneNumber = this.configService.get('SP_PHONE');
    const username = this.configService.get('SP_USERNAME');
    const password = this.configService.get('SP_PASSWORD');

    const findExistsAdmin = await this.db.prisma.user.findFirst({
      where: { username },
    });

    if (!findExistsAdmin) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await this.db.prisma.user.create({
        data: {
          email,
          phone_number: phoneNumber,
          username,
          password: hashedPassword,
          role: 'SUPERADMIN',
          is_email_verified: true,
          firstName: 'Super',
          lastName: 'Admin',
        },
      });

      this.logger.log('Users seeders ended');
    } else {
      Logger.log('Superadmin already existed');
    }
  }
  async onModuleInit() {
    try {
      await this.seedAll();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
