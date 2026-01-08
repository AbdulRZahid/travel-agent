import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import {
  ClerkWebhookEvent,
  ClerkWebhookEventType,
  ClerkUser,
} from './interfaces';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly userService: UserService) {}

  async handleWebhook(event: ClerkWebhookEvent): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case ClerkWebhookEventType.USER_CREATED:
        await this.handleUserCreated(event.data);
        break;

      case ClerkWebhookEventType.USER_UPDATED:
        await this.handleUserUpdated(event.data);
        break;

      case ClerkWebhookEventType.USER_DELETED:
        await this.handleUserDeleted(event.data);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleUserCreated(userData: ClerkUser): Promise<void> {
    try {
      this.logger.log(`Handling user.created event for: ${userData.id}`);
      await this.userService.createUser(userData.id, userData);
    } catch (error) {
      this.logger.error(
        `Failed to handle user.created for ${userData.id}:`,
        error,
      );
      throw error;
    }
  }

  private async handleUserUpdated(userData: ClerkUser): Promise<void> {
    try {
      this.logger.log(`Handling user.updated event for: ${userData.id}`);
      await this.userService.updateUser(userData.id, userData);
      this.logger.log(`User updated successfully: ${userData.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle user.updated for ${userData.id}:`,
        error,
      );
      throw error;
    }
  }

  private async handleUserDeleted(userData: ClerkUser): Promise<void> {
    try {
      this.logger.log(`Handling user.deleted event for: ${userData.id}`);
      await this.userService.deleteUser(userData.id);
      this.logger.log(`User deleted successfully: ${userData.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle user.deleted for ${userData.id}:`,
        error,
      );
      throw error;
    }
  }
}
