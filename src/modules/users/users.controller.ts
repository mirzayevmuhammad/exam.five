import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  Req,
  SetMetadata,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('send-verification-email-link')
  @HttpCode(200)
  async sendEmailVerificationLink(@Body() data: { email: string }) {
    return await this.usersService.sendEmailVerificationLink(data.email);
  }

  @Get('verify-email')
  @SetMetadata('isFreeAuth', true)
  async verifyEmailUser(@Query('token') token: string) {
    return await this.usersService.verifyEmail(token);
  }

  @Get('me')
  async getProfile(@Req() req: Request) {
    const userId = req['userId'];
    return await this.usersService.getProfile(userId);
  }

  @Put('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDto,
  ) {
    const avatarPath = `http://localhost:4000/uploads/avatars/${file.filename}`;
    const userId = req['userId'];
    return await this.usersService.updateUserProfile(avatarPath, body, userId);
  }
}
