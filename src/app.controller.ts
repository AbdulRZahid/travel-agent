import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as appService from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ApiSuccessResponse } from './common/decorators/api-response.decorator';
import { HealthCheckResponse } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: appService.AppService) {}

  @Public()
  @Get('/health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the API is running',
  })
  @ApiSuccessResponse(HealthCheckResponse)
  getHello(): HealthCheckResponse {
    return this.appService.healthCheck();
  }
}
