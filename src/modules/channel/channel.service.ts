import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ChannelService {
  constructor(private db: PrismaService) {}
  async updateChannel(
    channelData: UpdateChannelDto,
    id: string,
  ) {
    const findChannel = await this.db.prisma.user.findFirst({ where: { id } });
    if (!findChannel) throw new NotFoundException('channel not found');
    const updatedChannel = await this.db.prisma.user.update({
      where: { id },
      data: { ...channelData },
    });
    const { password, ...channelInfo } = updatedChannel;
    return channelInfo;
  }
}
