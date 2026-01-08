import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { ClerkWebhookEvent } from './interfaces';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/env.config';
import { Public } from '../common/decorators/public.decorator';

@ApiBearerAuth('Webhooks')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {}

  @Public()
  @Post('clerk')
  @ApiExcludeEndpoint()
  async handleClerkWebhook(
    @Body() payload: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing svix headers');
    }

    const webhookSecret = this.configService.get('CLERK_WEBHOOK_SECRET', {
      infer: true,
    });

    if (!webhookSecret) {
      throw new Error('CLERK_WEBHOOK_SECRET is not configured');
    }

    try {
      const wh = new Webhook(webhookSecret);
      const event = wh.verify(JSON.stringify(payload), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;

      await this.webhookService.handleWebhook(event);

      return { success: true };
    } catch (error) {
      this.logger.error('Webhook verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
