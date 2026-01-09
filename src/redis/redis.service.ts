import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { EnvironmentVariables } from '../config/env.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;
  private isConnected = false;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get('REDIS_URL');

    if (!redisUrl) {
      this.logger.warn('REDIS_URL not configured. Redis features disabled.');
      return;
    }

    try {
      await this.connect(redisUrl);
    } catch (error) {
      this.logger.error(`Failed to initialize Redis: ${error.message}`);
    }
  }

  private async connect(url: string): Promise<void> {
    this.client = createClient({ url });

    this.client.on('error', (err) => {
      this.logger.error(`Redis Client Error: ${err.message}`);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });

    await this.client.connect();
    this.logger.log('✅ Redis connected successfully');
  }

  async onModuleDestroy() {
    if (this.client?.isReady) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * Get Redis client or throw exception if not available
   */
  private getClientOrThrow(): RedisClientType {
    if (!this.client?.isReady || !this.isConnected) {
      throw new BadRequestException(
        'Redis client is not connected or initialized',
      );
    }
    return this.client;
  }

  // ========== Basic Operations ==========

  async get(key: string): Promise<string | null> {
    const client = this.getClientOrThrow();
    return await client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<string | null> {
    const client = this.getClientOrThrow();
    if (ttl) {
      return await client.set(key, value, { EX: ttl });
    }
    return await client.set(key, value);
  }

  async del(key: string): Promise<number> {
    const client = this.getClientOrThrow();
    return await client.del(key);
  }

  async exists(key: string): Promise<number> {
    const client = this.getClientOrThrow();
    return await client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    const client = this.getClientOrThrow();
    return await client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    const client = this.getClientOrThrow();
    return await client.ttl(key);
  }

  // ========== Hash Operations ==========

  async hset(key: string, field: string, value: string): Promise<number> {
    const client = this.getClientOrThrow();
    return await client.hSet(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    const client = this.getClientOrThrow();
    const result = await client.hGet(key, field);
    return result ?? null;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const client = this.getClientOrThrow();
    return await client.hGetAll(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    const client = this.getClientOrThrow();
    return await client.hDel(key, field);
  }

  async hkeys(key: string): Promise<string[]> {
    const client = this.getClientOrThrow();
    return await client.hKeys(key);
  }

  async hvals(key: string): Promise<string[]> {
    const client = this.getClientOrThrow();
    return await client.hVals(key);
  }

  async hlen(key: string): Promise<number> {
    const client = this.getClientOrThrow();
    return await client.hLen(key);
  }

  // ========== Utility Methods ==========

  async flushAll(): Promise<string | null> {
    const client = this.getClientOrThrow();
    return await client.flushAll();
  }

  async keys(pattern: string): Promise<string[]> {
    const client = this.getClientOrThrow();
    return await client.keys(pattern);
  }

  async dbSize(): Promise<number> {
    const client = this.getClientOrThrow();
    return await client.dbSize();
  }

  async info(section?: string): Promise<string> {
    const client = this.getClientOrThrow();
    return await client.info(section);
  }

  isAvailable(): boolean {
    return this.isConnected && this.client?.isReady === true;
  }

  getClient(): RedisClientType | null {
    return this.client;
  }
}
