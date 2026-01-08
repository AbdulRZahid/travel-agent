// src/config/env.config.ts
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  validateSync,
  Min,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  // ========== App Configuration ==========
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  PORT: number = 3000;

  // ========== Database ==========
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  // ========== Authentication (Clerk) ==========
  @IsString()
  @IsNotEmpty()
  CLERK_PUBLISHABLE_KEY: string;

  @IsString()
  @IsNotEmpty()
  CLERK_SECRET_KEY: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  CLERK_JWKS_URL: string;

  @IsString()
  @IsNotEmpty()
  CLERK_WEBHOOK_SECRET: string;

  // ========== Redis (Optional) ==========
  @IsUrl({ require_tld: false })
  @IsOptional()
  REDIS_URL?: string;
}

// Validation function
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach((error) => {
      console.error(`${error.property}:`, Object.values(error.constraints || {}));
    });
    throw new Error('Invalid environment variables');
  }

  return validatedConfig;
}

// Export type for ConfigService
export type EnvConfig = EnvironmentVariables;