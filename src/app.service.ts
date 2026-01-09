// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class HealthCheckResponse {
  @ApiProperty({ example: 'ok' })
  status: string;

  @Exclude()
  @ApiProperty({ example: '2025-12-30T10:00:00.000Z' })
  timestamp: string;

  @Exclude()
  @ApiProperty({ example: 'Server is up and running' })
  message: string;
}

@Injectable()
export class AppService {
  healthCheck(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Server is up and running',
    };
  }
}
