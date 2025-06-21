import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import TransformInterceoptor from './common/interceptors/transform.interceptor';
import { AuthGuard } from './common/guards/auth.guard';
import { ChannelModule } from './modules/channel/channel.module';

@Module({
  imports: [UsersModule, AuthModule, CoreModule, ChannelModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceoptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
