import { Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CLERK_CLIENT } from 'src/common/contants';
import { ClerkClientFactory } from 'src/auth/clerk.factory';

export const clerkClientProvider: Provider = {
  provide: CLERK_CLIENT,
  useFactory: ClerkClientFactory,
  inject: [ConfigService],
};
