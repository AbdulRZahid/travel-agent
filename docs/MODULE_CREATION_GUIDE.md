# 📦 Module Creation Guide

A step-by-step guide to creating new modules in this NestJS starter kit, following the project's conventions and best practices.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Detailed Steps](#detailed-steps)
3. [Folder Structure](#folder-structure)
4. [Creating DTOs](#creating-dtos)
5. [Creating Interfaces](#creating-interfaces)
6. [Implementing Service](#implementing-service)
7. [Implementing Controller](#implementing-controller)
8. [Adding Environment Variables](#adding-environment-variables)
9. [Best Practices](#best-practices)
10. [Example: Blog Module](#example-blog-module)

---

## 🚀 Quick Start

```bash
# 1. Generate module using NestJS CLI
nest g res blog

# 2. Create required folders and files
mkdir src/blog/dto
mkdir src/blog/interfaces
touch src/blog/dto/request.dto.ts
touch src/blog/dto/response.dto.ts
touch src/blog/interfaces/index.ts

# 3. Implement your business logic
# - Add DTOs for validation and serialization
# - Add interfaces for type definitions
# - Implement service with business logic
# - Implement controller with Swagger decorators
```

---

## 📋 Detailed Steps

### Step 1: Generate Module with NestJS CLI

Use the NestJS CLI resource generator to scaffold the module:

```bash
nest g res blog
```

**CLI Prompts:**
```
? What transport layer do you use? 
  ❯ REST API
? Would you like to generate CRUD entry points? 
  ❯ Yes
```

**Generated Files:**
```
src/blog/
├── blog.module.ts
├── blog.controller.ts
├── blog.controller.spec.ts
├── blog.service.ts
├── blog.service.spec.ts
├── entities/
│   └── blog.entity.ts
└── dto/
    ├── create-blog.dto.ts
    └── update-blog.dto.ts
```

### Step 2: Restructure the Module

Rename and organize files according to our conventions:

```bash
# Navigate to the module directory
cd src/blog

# Rename DTOs
mv dto/create-blog.dto.ts dto/request.dto.ts
mv dto/update-blog.dto.ts dto/request.dto.ts  # Merge into request.dto.ts

# Create response DTO
touch dto/response.dto.ts

# Create interfaces folder
mkdir interfaces
touch interfaces/index.ts

# Optional: Create utils folder if needed
mkdir utils
```

**Final Structure:**
```
src/blog/
├── blog.module.ts
├── blog.controller.ts
├── blog.service.ts
├── dto/
│   ├── request.dto.ts      # All input DTOs
│   └── response.dto.ts     # All output DTOs
├── interfaces/
│   └── index.ts            # TypeScript interfaces
└── utils/                  # (Optional) Module utilities
    └── blog.mapper.ts
```

---

## 📝 Creating DTOs

DTOs (Data Transfer Objects) define the structure of request and response data with validation.

### Request DTO (`dto/request.dto.ts`)

Input DTOs with validation decorators:

```typescript
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

// Enum for blog status
export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// Create Blog DTO
export class CreateBlogDto {
  @ApiProperty({
    description: 'Blog title',
    example: 'Getting Started with NestJS',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Blog content',
    example: 'This is the blog content...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Blog status',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus = BlogStatus.DRAFT;
}

// Update Blog DTO (inherits from Create, makes all fields optional)
export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
```

### Response DTO (`dto/response.dto.ts`)

Output DTOs with serialization decorators:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BlogStatus } from './request.dto';

export class BlogResponseDto {
  @ApiProperty({
    description: 'Blog ID',
    example: 'clx123abc456def',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Blog title',
    example: 'Getting Started with NestJS',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Blog content',
    example: 'This is the blog content...',
  })
  @Expose()
  content: string;

  @ApiProperty({
    description: 'Blog status',
    enum: BlogStatus,
    example: BlogStatus.PUBLISHED,
  })
  @Expose()
  status: BlogStatus;

  @ApiProperty({
    description: 'Author user ID',
    example: 'user_2abc123def456',
  })
  @Expose()
  authorId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-30T10:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-12-30T12:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<BlogResponseDto>) {
    Object.assign(this, partial);
  }
}
```

---

## 🔤 Creating Interfaces

TypeScript interfaces for internal type definitions (`interfaces/index.ts`):

```typescript
import { BlogStatus } from '../dto/request.dto';

// Internal blog interface (matches Prisma model)
export interface IBlog {
  id: string;
  title: string;
  content: string;
  status: BlogStatus;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Query options interface
export interface IBlogQueryOptions {
  authorId?: string;
  status?: BlogStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// Pagination result interface
export interface IPaginatedBlogs {
  data: IBlog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## ⚙️ Implementing Service

Business logic should be in the service (`blog.service.ts`):

```typescript
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto, BlogStatus } from './dto/request.dto';
import { BlogResponseDto } from './dto/response.dto';
import { IBlog, IBlogQueryOptions, IPaginatedBlogs } from './interfaces';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new blog post
   */
  async create(
    createBlogDto: CreateBlogDto,
    authorId: string,
  ): Promise<BlogResponseDto> {
    this.logger.log(`Creating blog post for author: ${authorId}`);

    const blog = await this.prisma.blog.create({
      data: {
        ...createBlogDto,
        authorId,
      },
    });

    return new BlogResponseDto(blog);
  }

  /**
   * Find all blogs with optional filters
   */
  async findAll(options: IBlogQueryOptions): Promise<IPaginatedBlogs> {
    const { authorId, status, search, page = 1, limit = 10 } = options;

    const where: any = {};

    if (authorId) where.authorId = authorId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      data: blogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one blog by ID
   */
  async findOne(id: string): Promise<BlogResponseDto> {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return new BlogResponseDto(blog);
  }

  /**
   * Update a blog post
   */
  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
    authorId: string,
  ): Promise<BlogResponseDto> {
    // Check if blog exists and belongs to author
    const existingBlog = await this.prisma.blog.findFirst({
      where: { id, authorId },
    });

    if (!existingBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found or unauthorized`);
    }

    const blog = await this.prisma.blog.update({
      where: { id },
      data: updateBlogDto,
    });

    return new BlogResponseDto(blog);
  }

  /**
   * Delete a blog post
   */
  async remove(id: string, authorId: string): Promise<void> {
    // Check if blog exists and belongs to author
    const existingBlog = await this.prisma.blog.findFirst({
      where: { id, authorId },
    });

    if (!existingBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found or unauthorized`);
    }

    await this.prisma.blog.delete({
      where: { id },
    });

    this.logger.log(`Blog ${id} deleted successfully`);
  }
}
```

---

## 🎯 Implementing Controller

Routes with proper Swagger documentation (`blog.controller.ts`):

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto, BlogStatus } from './dto/request.dto';
import { BlogResponseDto } from './dto/response.dto';
import { User } from '../common/decorators/sub.decorator';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../common/decorators/api-response.decorator';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new blog post',
    description: 'Creates a new blog post for the authenticated user',
  })
  @ApiSuccessResponse(BlogResponseDto)
  @ApiErrorResponse(400)
  @ApiErrorResponse(401)
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @User('sub') authorId: string,
  ): Promise<BlogResponseDto> {
    return this.blogService.create(createBlogDto, authorId);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all blog posts',
    description: 'Retrieves all blog posts with optional filtering',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    description: 'Filter by author ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BlogStatus,
    description: 'Filter by blog status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in title and content',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  async findAll(
    @Query('authorId') authorId?: string,
    @Query('status') status?: BlogStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.blogService.findAll({
      authorId,
      status,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get a blog post by ID',
    description: 'Retrieves a single blog post by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'clx123abc456def',
  })
  @ApiSuccessResponse(BlogResponseDto)
  @ApiErrorResponse(404)
  async findOne(@Param('id') id: string): Promise<BlogResponseDto> {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a blog post',
    description: 'Updates an existing blog post. Only the author can update.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'clx123abc456def',
  })
  @ApiSuccessResponse(BlogResponseDto)
  @ApiErrorResponse(404)
  @ApiErrorResponse(401)
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @User('sub') authorId: string,
  ): Promise<BlogResponseDto> {
    return this.blogService.update(id, updateBlogDto, authorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a blog post',
    description: 'Deletes a blog post. Only the author can delete.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog ID',
    example: 'clx123abc456def',
  })
  @ApiErrorResponse(404)
  @ApiErrorResponse(401)
  async remove(
    @Param('id') id: string,
    @User('sub') authorId: string,
  ): Promise<void> {
    return this.blogService.remove(id, authorId);
  }
}
```

---

## 🔧 Adding Environment Variables

Follow these steps to add new environment variables to your module:

### Step 1: Add to `.env` File

Add your environment variable to `.env.development` and `.env.production`:

```env
# .env.development
BLOG_MAX_CONTENT_LENGTH=10000
BLOG_ENABLE_COMMENTS=true
```

### Step 2: Update Environment Config

Add validation in `src/config/env.config.ts`:

```typescript
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  IsBoolean,
  validateSync,
  Min,
  Max,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

export class EnvironmentVariables {
  // ... existing variables ...

  // ========== Blog Configuration ==========
  @IsNumber()
  @Min(1000)
  @Max(50000)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  BLOG_MAX_CONTENT_LENGTH?: number = 10000;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  BLOG_ENABLE_COMMENTS?: boolean = false;
}

// ... rest of the file ...
```

### Step 3: Use in Your Module

Inject `ConfigService` to access environment variables:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/env.config';

@Injectable()
export class BlogService {
  private readonly maxContentLength: number;
  private readonly enableComments: boolean;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    // Access environment variables
    this.maxContentLength = this.configService.get('BLOG_MAX_CONTENT_LENGTH', 10000);
    this.enableComments = this.configService.get('BLOG_ENABLE_COMMENTS', false);
  }

  // Use the config values
  async create(data: CreateBlogDto) {
    if (data.content.length > this.maxContentLength) {
      throw new BadRequestException(
        `Content exceeds maximum length of ${this.maxContentLength}`,
      );
    }

    // ... rest of the logic
  }
}
```

### Step 4: Update `.env.example`

Document the new variables in `.env.example`:

```env
# Blog Configuration
BLOG_MAX_CONTENT_LENGTH=10000
BLOG_ENABLE_COMMENTS=true
```

---

## ✅ Best Practices

### 1. **Naming Conventions**

```typescript
// ✅ Good
export class CreateBlogDto {}
export class BlogResponseDto {}
export interface IBlog {}
export enum BlogStatus {}

// ❌ Bad
export class blogDto {}
export class response {}
export interface blog {}
```

### 2. **Validation**

Always validate input with `class-validator`:

```typescript
@IsString()
@IsNotEmpty()
@MinLength(3)
@MaxLength(100)
title: string;
```

### 3. **Serialization**

Use `@Expose()` to control response fields:

```typescript
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  // ❌ Password will not be exposed
  password: string;
}
```

### 4. **Error Handling**

Use built-in NestJS exceptions:

```typescript
throw new NotFoundException(`Blog with ID ${id} not found`);
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Not authorized');
```

### 5. **Logging**

Add logging for important operations:

```typescript
private readonly logger = new Logger(BlogService.name);

this.logger.log('Creating blog post');
this.logger.error('Failed to create blog', error);
this.logger.warn('Deprecated endpoint called');
```

### 6. **Swagger Documentation**

Always document your APIs:

```typescript
@ApiOperation({
  summary: 'Short description',
  description: 'Detailed description',
})
@ApiSuccessResponse(BlogResponseDto)
@ApiErrorResponse(404)
```

### 7. **Dependency Injection**

Use constructor injection:

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly config: ConfigService,
  private readonly redis: RedisService,
) {}
```

### 8. **Business Logic Location**

- ✅ **Service**: All business logic, database queries, external API calls
- ✅ **Controller**: Route definitions, request validation, response formatting
- ❌ **Controller**: Database queries, complex calculations, external API calls

---

## 📖 Example: Complete Blog Module

For reference, here's the complete blog module structure:

```
src/blog/
├── blog.module.ts
├── blog.controller.ts
├── blog.service.ts
├── dto/
│   ├── request.dto.ts
│   └── response.dto.ts
├── interfaces/
│   └── index.ts
└── utils/
    └── blog.mapper.ts
```

**Module Registration:**

```typescript
// blog.module.ts
import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService], // Export if used by other modules
})
export class BlogModule {}
```

**Register in App Module:**

```typescript
// app.module.ts
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    // ... other imports
    BlogModule,
  ],
})
export class AppModule {}
```

---

## 🎓 Summary

### Quick Checklist

- [ ] Generate module with `nest g res module-name`
- [ ] Create `dto/request.dto.ts` with validation decorators
- [ ] Create `dto/response.dto.ts` with `@Expose()` decorators
- [ ] Create `interfaces/index.ts` for type definitions
- [ ] Implement business logic in service
- [ ] Implement routes with Swagger in controller
- [ ] Add environment variables (if needed)
- [ ] Update module exports (if used by other modules)
- [ ] Register module in `app.module.ts`
- [ ] Test endpoints in Swagger UI

### Key Principles

1. **Single Responsibility** - Each file has one clear purpose
2. **Type Safety** - Use TypeScript interfaces and DTOs
3. **Validation** - Always validate input data
4. **Documentation** - Document all endpoints with Swagger
5. **Error Handling** - Use appropriate HTTP exceptions
6. **Logging** - Log important operations
7. **Testability** - Keep logic in services, not controllers

---

**Happy Coding! 🚀**

For questions or improvements, please refer to the main [README.md](../README.md) or open an issue.
