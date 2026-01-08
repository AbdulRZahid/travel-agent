import { ApiProperty } from '@nestjs/swagger';

export class CacheMetricsResponse {
  @ApiProperty({
    description: 'Whether Redis is available',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Status message',
    example: 'Redis is healthy',
  })
  message: string;

  @ApiProperty({
    description: 'Total number of keys in cache',
    example: 42,
  })
  totalKeys: number;

  @ApiProperty({
    description: 'Memory used by Redis',
    example: '2.5M',
  })
  memoryUsed: string;

  @ApiProperty({
    description: 'Redis uptime in seconds',
    example: 3600,
  })
  uptime: number;

  @ApiProperty({
    description: 'Number of connected clients',
    example: 5,
  })
  connectedClients: number;
}
