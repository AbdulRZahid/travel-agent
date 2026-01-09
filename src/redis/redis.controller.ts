import {
  Controller,
  Get,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { RedisService } from './redis.service';
import { Public } from '../common/decorators/public.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { CacheMetricsResponse } from './dto/cache-metrics.dto';

@ApiTags('Cache')
@Controller('cache')
export class RedisController {
  private readonly logger = new Logger(RedisController.name);

  constructor(private readonly redisService: RedisService) {}

  @Get('metrics')
  @Public()
  @ApiOperation({
    summary: 'Get cache metrics',
    description: 'Returns cache statistics and health information',
  })
  @ApiSuccessResponse(CacheMetricsResponse)
  async getMetrics(): Promise<CacheMetricsResponse> {
    if (!this.redisService.isAvailable()) {
      return {
        isAvailable: false,
        message: 'Redis is not configured or not connected',
        totalKeys: 0,
        memoryUsed: '0',
        uptime: 0,
        connectedClients: 0,
      };
    }

    try {
      const [dbSize, info] = await Promise.all([
        this.redisService.dbSize(),
        this.redisService.info('server,memory,clients'),
      ]);

      // Parse info string
      const infoLines = info.split('\r\n');
      const memoryUsed =
        infoLines
          .find((line) => line.startsWith('used_memory_human:'))
          ?.split(':')[1] || '0';
      const uptime =
        parseInt(
          infoLines
            .find((line) => line.startsWith('uptime_in_seconds:'))
            ?.split(':')[1] || '0',
        ) || 0;
      const connectedClients =
        parseInt(
          infoLines
            .find((line) => line.startsWith('connected_clients:'))
            ?.split(':')[1] || '0',
        ) || 0;

      return {
        isAvailable: true,
        message: 'Redis is healthy',
        totalKeys: dbSize,
        memoryUsed,
        uptime,
        connectedClients,
      };
    } catch (error) {
      this.logger.error(`Failed to get cache metrics: ${error.message}`);
      throw new BadRequestException('Failed to retrieve cache metrics');
    }
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh cache',
    description: 'Clears all cache entries',
  })
  async refreshCache(): Promise<{ message: string; cleared: boolean }> {
    if (!this.redisService.isAvailable()) {
      throw new BadRequestException('Redis is not available');
    }

    try {
      await this.redisService.flushAll();
      this.logger.log('Cache refreshed successfully');
      return {
        message: 'Cache cleared successfully',
        cleared: true,
      };
    } catch (error) {
      this.logger.error(`Failed to refresh cache: ${error.message}`);
      throw new BadRequestException('Failed to refresh cache');
    }
  }

  @Get('health')
  @Public()
  @ApiExcludeEndpoint()
  async healthCheck(): Promise<{
    status: string;
    isAvailable: boolean;
  }> {
    return {
      status: this.redisService.isAvailable() ? 'connected' : 'disconnected',
      isAvailable: this.redisService.isAvailable(),
    };
  }
}
