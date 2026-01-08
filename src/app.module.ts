import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import {  ClerkModule } from './auth/clerk.module';
import { UserModule } from './user/user.module';
import { WebhookModule } from './webhook/webhook.module';
import { RedisModule } from './redis/redis.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception/prisma-client-exception.filter';
import { ClerkAuthGuard } from './common/guards/auth-guard';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    PrismaModule,
    RedisModule,
    UserModule,
    ClerkModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    }
  ],
})
export class AppModule { }
