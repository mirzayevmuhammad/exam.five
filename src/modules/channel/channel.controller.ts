import {
  Controller,
  Body,
  Put,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Put('me')
  @UseInterceptors(FileInterceptor('banner'))
  async updateChannel(
    @Body() body: UpdateChannelDto,
    @UploadedFile() banner: Express.Multer.File,
    @Req() req: Request,
  ) {
    const id = req['userId'];
    const bannerUrl = `http://localhost:4000/uploads/banners/${banner.filename}`;
    return await this.channelService.updateChannel(body, id);
  }
}
