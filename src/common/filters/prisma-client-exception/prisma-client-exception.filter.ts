import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  RequestTimeoutException,
  PayloadTooLargeException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    // Handle Prisma Client Known Request Errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const code = exception.code;

      switch (code) {
        // Connection errors (P1000-P1017)
        case 'P1000':
          throw new UnauthorizedException(
            'Authentication failed against database server. Invalid database credentials provided.',
          );

        case 'P1001':
          throw new ServiceUnavailableException(
            'Cannot reach database server. Please ensure your database server is running.',
          );

        case 'P1002':
          throw new ServiceUnavailableException(
            'Database server connection timed out. Please try again.',
          );

        case 'P1003':
          throw new NotFoundException(
            'Database does not exist at the specified path.',
          );

        case 'P1008':
          throw new RequestTimeoutException(
            'Database operation timed out. Please try again.',
          );

        case 'P1009':
          throw new ConflictException(
            'Database already exists on the database server.',
          );

        case 'P1010':
          throw new ForbiddenException(
            'Database user was denied access to the database.',
          );

        case 'P1011':
          throw new ServiceUnavailableException(
            'Error opening a TLS connection to the database.',
          );

        case 'P1012':
          throw new BadRequestException(
            'Invalid Prisma schema. Please check your schema configuration.',
          );

        case 'P1013':
          throw new BadRequestException(
            'The provided database connection string is invalid.',
          );

        case 'P1014':
          throw new NotFoundException(
            'The underlying table or collection does not exist.',
          );

        case 'P1015':
          throw new BadRequestException(
            'Your Prisma schema is using features not supported by your database version.',
          );

        case 'P1016':
          throw new BadRequestException(
            'Raw query has an incorrect number of parameters. Expected parameters do not match actual.',
          );

        case 'P1017':
          throw new ServiceUnavailableException(
            'Server has closed the connection.',
          );

        // Query engine errors (P2000-P2037)
        case 'P2000':
          throw new BadRequestException(
            'The provided value is too long for the column.',
          );

        case 'P2001':
          throw new NotFoundException(
            'The record searched for in the where condition does not exist.',
          );

        case 'P2002':
          throw new ConflictException(
            'Unique constraint failed. A record with this value already exists.',
          );

        case 'P2003':
          throw new ConflictException(
            'Foreign key constraint failed on the specified field.',
          );

        case 'P2004':
          throw new ConflictException('A constraint failed on the database.');

        case 'P2005':
          throw new BadRequestException(
            'The value stored in the database is invalid for the field type.',
          );

        case 'P2006':
          throw new BadRequestException(
            'The provided value for the field is not valid.',
          );

        case 'P2007':
          throw new BadRequestException('Data validation error encountered.');

        case 'P2008':
          throw new BadRequestException('Failed to parse the query.');

        case 'P2009':
          throw new BadRequestException('Failed to validate the query.');

        case 'P2010':
          throw new BadRequestException('Raw query failed to execute.');

        case 'P2011':
          throw new BadRequestException(
            'Null constraint violation on the specified constraint.',
          );

        case 'P2012':
          throw new BadRequestException('Missing a required value.');

        case 'P2013':
          throw new BadRequestException('Missing required argument for field.');

        case 'P2014':
          throw new ConflictException(
            'The change would violate a required relation between models.',
          );

        case 'P2015':
          throw new NotFoundException('A related record could not be found.');

        case 'P2016':
          throw new BadRequestException('Query interpretation error.');

        case 'P2017':
          throw new ConflictException(
            'Records for the relation are not connected.',
          );

        case 'P2018':
          throw new NotFoundException(
            'Required connected records were not found.',
          );

        case 'P2019':
          throw new BadRequestException('Input error encountered.');

        case 'P2020':
          throw new BadRequestException('Value is out of range for the type.');

        case 'P2021':
          throw new NotFoundException(
            'The table does not exist in the current database.',
          );

        case 'P2022':
          throw new NotFoundException(
            'The column does not exist in the current database.',
          );

        case 'P2023':
          throw new BadRequestException(
            'Inconsistent column data encountered.',
          );

        case 'P2024':
          throw new ServiceUnavailableException(
            'Timed out fetching a new connection from the connection pool.',
          );

        case 'P2025':
          throw new NotFoundException(
            'An operation failed because required records were not found.',
          );

        case 'P2026':
          throw new BadRequestException(
            'The current database provider does not support a feature used in the query.',
          );

        case 'P2027':
          throw new InternalServerErrorException(
            'Multiple errors occurred on the database during query execution.',
          );

        case 'P2028':
          throw new InternalServerErrorException('Transaction API error.');

        case 'P2029':
          throw new BadRequestException('Query parameter limit exceeded.');

        case 'P2030':
          throw new BadRequestException(
            'Cannot find a fulltext index to use for the search.',
          );

        case 'P2031':
          throw new BadRequestException(
            'MongoDB server must be run as a replica set for transactions.',
          );

        case 'P2033':
          throw new BadRequestException(
            'Number used in query does not fit into a 64 bit signed integer.',
          );

        case 'P2034':
          throw new ConflictException(
            'Transaction failed due to a write conflict or deadlock. Please retry.',
          );

        case 'P2035':
          throw new InternalServerErrorException(
            'Assertion violation on the database.',
          );

        case 'P2036':
          throw new InternalServerErrorException(
            'Error in external connector.',
          );

        case 'P2037':
          throw new ServiceUnavailableException(
            'Too many database connections opened.',
          );

        // Schema engine / migration errors (P3000-P3024)
        case 'P3000':
          throw new InternalServerErrorException('Failed to create database.');

        case 'P3001':
          throw new BadRequestException(
            'Migration is possible with destructive changes and possible data loss.',
          );

        case 'P3002':
          throw new InternalServerErrorException(
            'The attempted migration was rolled back.',
          );

        case 'P3003':
          throw new BadRequestException(
            'The format of migrations has changed and is no longer valid.',
          );

        case 'P3004':
          throw new BadRequestException('Cannot alter a system database.');

        case 'P3005':
          throw new BadRequestException('The database schema is not empty.');

        case 'P3006':
          throw new InternalServerErrorException(
            'Migration failed to apply cleanly to the shadow database.',
          );

        case 'P3007':
          throw new BadRequestException(
            'Preview features are not allowed in schema engine. Please remove them from your data model.',
          );

        case 'P3008':
          throw new ConflictException(
            'The migration is already recorded as applied in the database.',
          );

        case 'P3009':
          throw new InternalServerErrorException(
            'Failed migrations found in target database. Cannot apply new migrations.',
          );

        case 'P3010':
          throw new BadRequestException(
            'Migration name is too long. Must not exceed 200 characters.',
          );

        case 'P3011':
          throw new BadRequestException(
            'Migration cannot be rolled back because it was never applied.',
          );

        case 'P3012':
          throw new BadRequestException(
            'Migration cannot be rolled back because it is not in a failed state.',
          );

        case 'P3013':
          throw new BadRequestException(
            'Datasource provider arrays are no longer supported in migrate.',
          );

        case 'P3014':
          throw new InternalServerErrorException(
            'Could not create shadow database. Ensure the database user has permission to create databases.',
          );

        case 'P3015':
          throw new NotFoundException('Migration file not found.');

        case 'P3016':
          throw new InternalServerErrorException(
            'Database reset failed. Could not clean up database entirely.',
          );

        case 'P3017':
          throw new NotFoundException('The migration could not be found.');

        case 'P3018':
          throw new InternalServerErrorException(
            'A migration failed to apply. Cannot apply new migrations.',
          );

        case 'P3019':
          throw new BadRequestException(
            'Datasource provider in schema does not match the one in migration_lock.toml.',
          );

        case 'P3020':
          throw new BadRequestException(
            'Automatic shadow database creation is disabled on Azure SQL. Please set up manually.',
          );

        case 'P3021':
          throw new BadRequestException(
            'Foreign keys cannot be created on this database.',
          );

        case 'P3022':
          throw new BadRequestException(
            'Direct execution of DDL SQL statements is disabled on this database.',
          );

        case 'P3023':
          throw new BadRequestException(
            'ExternalTables and externalEnums must contain fully qualified identifiers.',
          );

        case 'P3024':
          throw new BadRequestException(
            'ExternalTables and externalEnums must contain simple identifiers without schema names.',
          );

        // Introspection errors (P4000-P4002)
        case 'P4000':
          throw new InternalServerErrorException(
            'Introspection operation failed to produce a schema file.',
          );

        case 'P4001':
          throw new NotFoundException('The introspected database was empty.');

        case 'P4002':
          throw new BadRequestException(
            'The schema of the introspected database was inconsistent.',
          );

        // Prisma Accelerate errors (P5011, P6000-P6010)
        case 'P5011':
          throw new HttpException(
            'Request volume exceeded the limit. Implement a back-off strategy and try again.',
            429,
          );

        case 'P6000':
          throw new InternalServerErrorException('Generic Accelerate error.');

        case 'P6001':
          throw new BadRequestException(
            'The Accelerate URL is malformed. Must use prisma:// protocol.',
          );

        case 'P6002':
          throw new UnauthorizedException(
            'The API Key in the connection string is invalid.',
          );

        case 'P6003':
          throw new HttpException(
            'Plan limit has been reached. Included usage exceeded.',
            402,
          );

        case 'P6004':
          throw new RequestTimeoutException(
            'Global timeout of Accelerate has been exceeded.',
          );

        case 'P6005':
          throw new BadRequestException(
            'Invalid parameters supplied to Accelerate.',
          );

        case 'P6006':
          throw new BadRequestException(
            'The chosen Prisma version is not compatible with Accelerate.',
          );

        case 'P6008':
          throw new ServiceUnavailableException(
            'Engine failed to start. Could not establish connection to database.',
          );

        case 'P6009':
          throw new PayloadTooLargeException(
            'Response size limit of Accelerate has been exceeded.',
          );

        case 'P6010':
          throw new ForbiddenException(
            'Your Accelerate project is disabled. Please enable it to use.',
          );

        default:
          throw new InternalServerErrorException(
            'An unexpected database error occurred.',
          );
      }
    }
    // Handle Prisma Validation Errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException(
        'Database validation error: ' + exception.message,
      );
    }

    // Fallback for unknown errors
    throw new InternalServerErrorException('An unexpected error occurred.');
  }
}
