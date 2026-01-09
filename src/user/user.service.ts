import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClerkUser } from 'src/webhook/interfaces';

export interface IUser {
  user: any;
  toBeSynced?: boolean;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // SIMPLE WEBHOOK METHODS (No Syncing)
  // ==========================================

  /**
   * Create user from webhook payload
   */
  async createUser(clerkId: string, webhookPayload: ClerkUser): Promise<IUser> {
    this.logger.log(`Creating user from webhook: ${clerkId}`);

    const existingUser = await this.findUserById(clerkId);
    if (existingUser) {
      this.logger.log(`User already exists: ${clerkId}`);
      return { user: existingUser };
    }

    const email = this.extractEmailFromWebhook(webhookPayload);
    const name = this.extractNameFromWebhook(webhookPayload);

    const user = await this.prisma.user.create({
      data: {
        id: clerkId,
        email,
        name,
      },
    });

    this.logger.log(`User created: ${clerkId}`);
    return { user };
  }

  /**
   * Update user from webhook payload
   */
  async updateUser(clerkId: string, webhookPayload: ClerkUser): Promise<IUser> {
    this.logger.log(`Updating user from webhook: ${clerkId}`);

    const existingUser = await this.findUserById(clerkId);
    if (!existingUser) {
      this.logger.warn(`User not found for update, creating: ${clerkId}`);
      return this.createUser(clerkId, webhookPayload);
    }

    const email = this.extractEmailFromWebhook(webhookPayload);
    const name = this.extractNameFromWebhook(webhookPayload);

    const user = await this.prisma.user.update({
      where: { id: clerkId },
      data: {
        email,
        name,
      },
    });

    this.logger.log(`User updated: ${clerkId}`);
    return { user };
  }

  /**
   * Delete user from webhook
   */
  async deleteUser(clerkId: string): Promise<void> {
    this.logger.log(`Deleting user from webhook: ${clerkId}`);

    const existingUser = await this.findUserById(clerkId);
    if (!existingUser) {
      this.logger.warn(`User not found for deletion: ${clerkId}`);
      return;
    }

    await this.prisma.user.delete({
      where: { id: clerkId },
    });

    this.logger.log(`User deleted: ${clerkId}`);
    return;
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private extractEmailFromWebhook(userData: ClerkUser): string {
    const primaryEmail = userData.email_addresses?.find(
      (email) => email.id === userData.primary_email_address_id,
    );
    return primaryEmail?.email_address || '';
  }

  private extractNameFromWebhook(userData: ClerkUser): string | null {
    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || null;
  }

  async findUserById(clerkId: string, tx?: PrismaClient): Promise<any | null> {
    const prisma = tx || this.prisma;
    return prisma.user.findUnique({
      where: { id: clerkId },
    });
  }

  // ==========================================
  // SYNC METHODS (Commented out for reuse)
  // Uncomment when you need to sync with Clerk
  // ==========================================

  /*
  async createClerkUserAndSync(clerkId: string): Promise<IUser> {
    const clerkUser = await this.fetchClerkUser(clerkId);
    this.logger.log(`Creating user for Clerk ID: ${clerkId}`);

    return await this.createUserAndSync(
      clerkId,
      clerkUser,
      clerkUser.publicMetadata,
    );
  }

  async createUserWithWebhook(
    clerkId: string,
    webhookPayload: ClerkUser,
  ): Promise<IUser> {
    this.logger.log(`Processing webhook user data for: ${clerkId}`);

    return this.createUserAndSync(
      clerkId,
      webhookPayload,
      webhookPayload.public_metadata,
    );
  }

  private async createUserAndSync(
    clerkId: string,
    userData: any,
    publicMetadata: Record<string, any>,
  ): Promise<IUser> {
    const user = await this.prisma.$transaction(async (tx: PrismaClient) => {
      const existingUser = await this.findUserById(clerkId, tx);

      if (existingUser) {
        this.logger.log(`User already exists: ${clerkId}`);
        return existingUser;
      }

      const email = this.extractEmail(userData);
      const name = this.extractName(userData);

      const newUser = await tx.user.create({
        data: {
          id: clerkId,
          email,
          name,
        },
      });

      this.logger.log(`User created in database: ${clerkId}`);
      return newUser;
    });

    const synced = await this.syncMetadataToClerk(clerkId, publicMetadata);

    return {
      user: user,
      toBeSynced: synced,
    };
  }

  private extractEmail(userData: any): string {
    if (userData.emailAddresses) {
      const primaryEmail = userData.emailAddresses.find(
        (email: any) => email.id === userData.primaryEmailAddressId,
      );
      return primaryEmail?.emailAddress || '';
    }
    if (userData.email_addresses) {
      const primaryEmail = userData.email_addresses.find(
        (email: any) => email.id === userData.primary_email_address_id,
      );
      return primaryEmail?.email_address || '';
    }
    return '';
  }

  private extractName(userData: any): string | null {
    const firstName = userData.firstName || userData.first_name || '';
    const lastName = userData.lastName || userData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || null;
  }

  private async syncMetadataToClerk(
    clerkId: string,
    publicMetadata: Record<string, any>,
  ): Promise<boolean> {
    try {
      if (publicMetadata?.syncedWithBackend) {
        this.logger.log(
          `Clerk metadata already marked synced for user: ${clerkId}`,
        );
        return true;
      }

      await this.syncClerkUser(clerkId, 'public', {
        ...publicMetadata,
        syncedWithBackend: true,
        role: "USER",
      });
      this.logger.log(`Clerk metadata synced for user: ${clerkId}`);
      return true;
    } catch (err: any) {
      this.logger.error(
        `Failed to sync Clerk metadata for ${clerkId}: ${err?.message ?? err}`,
      );
      return false;
    }
  }

  async syncClerkUser(
    clerkId: string,
    metadataType: MetadataType,
    metadata: Record<string, any>,
  ): Promise<boolean> {
    const metadataTypeMap: Record<
      MetadataType,
      'publicMetadata' | 'privateMetadata' | 'unsafeMetadata'
    > = {
      public: 'publicMetadata',
      private: 'privateMetadata',
      unsafe: 'unsafeMetadata',
    };

    const metadataKey = metadataTypeMap[metadataType];

    if (!metadataKey) {
      this.logger.error(
        `Invalid metadata type provided for user: ${clerkId}`,
      );
      return false;
    }

    this.logger.log(
      `Updating ${metadataType} metadata for user: ${clerkId}`,
    );

    try {
      await this.clerkClient.users.updateUser(clerkId, {
        [metadataKey]: metadata,
      });

      this.logger.log(
        `Clerk user ${metadataType} metadata updated successfully: ${clerkId}`,
      );
      return true;
    } catch (err: any) {
      this.logger.error(
        `Failed to update Clerk user ${metadataType} metadata for ${clerkId}: ${err?.message ?? err}`,
      );
      return false;
    }
  }

  private async fetchClerkUser(clerkId: string): Promise<any> {
    try {
      return await this.clerkClient.users.getUser(clerkId);
    } catch (error) {
      this.logger.error(`Failed to fetch Clerk user: ${clerkId}`, error);
      throw new NotFoundException(`Clerk user not found: ${clerkId}`);
    }
  }
  */
}
