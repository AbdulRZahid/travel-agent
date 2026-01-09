// src/prisma/prisma.service.ts
import 'dotenv/config';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;
  private adapter: PrismaPg;

  constructor() {
    // Create pool instance
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });

    // Create adapter with the pool
    const adapter = new PrismaPg(pool);

    // Pass adapter to PrismaClient
    super({ adapter });

    // Store references for cleanup
    this.pool = pool;
    this.adapter = adapter;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from Prisma');

      // Properly close the pool to avoid memory leaks
      await this.pool.end();
      this.logger.log('Database pool closed');
    } catch (error) {
      this.logger.error('Error during cleanup', error);
      throw error;
    }
  }
}
