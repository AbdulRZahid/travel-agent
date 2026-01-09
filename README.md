# 🚀 NestJS Starter Kit

A production-ready, enterprise-grade NestJS starter kit with authentication, database, caching, and comprehensive API documentation. Built with best practices and modern development patterns.

## ✨ Features

### Core Features
- 🔐 **Authentication & Authorization** - Clerk integration with JWT validation
- 🗄️ **Database** - PostgreSQL with Prisma ORM and connection pooling
- 🚀 **Caching** - Optional Redis support with graceful fallback
- 📚 **API Documentation** - Professional Swagger/OpenAPI interface
- ✅ **Validation** - Request validation with class-validator
- 🔒 **Security** - Rate limiting, global guards, and exception filters
- 🎯 **Type Safety** - Full TypeScript with strict mode

### Architecture
- 📦 **Modular Structure** - Feature-based organization
- 🌐 **Global Modules** - Shared services (Config, Prisma, Redis)
- 🎨 **Clean Code** - Separation of concerns with services, controllers, DTOs
- 🔄 **Webhooks** - Secure webhook handling with Svix verification
- 📊 **Health Checks** - Application health monitoring endpoints

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 11.x |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL with Prisma ORM |
| **Caching** | Redis (optional) |
| **Authentication** | Clerk |
| **Validation** | class-validator, class-transformer |
| **API Docs** | Swagger/OpenAPI |
| **Rate Limiting** | @nestjs/throttler |
| **Webhooks** | Svix |

## 📁 Project Structure

```
nest-starter-kit/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── auth.module.ts
│   │   ├── clerk.strategy.ts   # Passport JWT strategy
│   │   ├── clerk.factory.ts    # Clerk client factory
│   │   └── clerk.provider.ts   # Clerk DI provider
│   ├── user/                   # User management module
│   │   ├── user.module.ts
│   │   ├── user.service.ts     # Business logic
│   │   ├── user.controller.ts  # API routes
│   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── request.dto.ts
│   │   │   └── response.dto.ts
│   │   ├── interfaces/         # TypeScript interfaces
│   │   │   └── index.ts
│   │   └── utils/              # Module utilities
│   │       └── user.mapper.ts
│   ├── webhook/                # Webhook handling module
│   │   ├── webhook.module.ts
│   │   ├── webhook.service.ts
│   │   ├── webhook.controller.ts
│   │   └── interfaces/
│   │       └── index.ts
│   ├── redis/                  # Redis caching module
│   │   ├── redis.module.ts
│   │   ├── redis.service.ts
│   │   ├── redis.controller.ts
│   │   └── dto/
│   │       └── cache-metrics.dto.ts
│   ├── common/                 # Shared utilities
│   │   ├── constants/          # Application constants
│   │   ├── decorators/         # Custom decorators
│   │   │   ├── public.decorator.ts
│   │   │   ├── sub.decorator.ts
│   │   │   └── api-response.decorator.ts
│   │   ├── filters/            # Exception filters
│   │   │   └── prisma-client-exception/
│   │   └── guards/             # Auth guards
│   │       └── auth-guard.ts
│   ├── config/                 # Configuration module
│   │   ├── config.module.ts
│   │   └── env.config.ts       # Environment validation
│   ├── prisma/                 # Database module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── swagger/                # API documentation
│   │   ├── swagger.config.ts
│   │   └── schemas/
│   │       └── error.schema.ts
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # Health check
│   ├── app.service.ts
│   └── main.ts                 # Application entry point
├── test/                       # E2E tests
├── docs/                       # Documentation
│   └── MODULE_CREATION_GUIDE.md
├── .env.example                # Environment template
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- Redis (optional, for caching)
- Clerk account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nest-starter-kit.git
   cd nest-starter-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.development
   ```
   
   Edit `.env.development` and add your credentials:
   ```env
   NODE_ENV=development
   PORT=3006
   
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/mydb
   
   # Clerk Authentication
   CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Redis (Optional)
   REDIS_URL=redis://localhost:6379
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

7. **Access the application**
   - API: http://localhost:3006
   - Swagger Docs: http://localhost:3006/api/docs
   - Health Check: http://localhost:3006/health

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development`, `production`, `test` |
| `PORT` | Application port | `3006` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `CLERK_JWKS_URL` | Clerk JWKS endpoint | `https://.../.well-known/jwks.json` |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | `whsec_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | _Not configured_ |

## 📜 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Lint code
npm run format             # Format code with Prettier

# Database
npx prisma migrate dev     # Create and apply migration
npx prisma migrate deploy  # Apply migrations (production)
npx prisma studio          # Open Prisma Studio GUI
npx prisma generate        # Generate Prisma Client
```

## 📚 API Documentation

### Swagger UI

Access the interactive API documentation at: **http://localhost:3006/api/docs**

Features:
- 🔍 Explore all available endpoints
- 🧪 Test API requests directly from the browser
- 📖 View request/response schemas
- 🔐 Authenticate with JWT tokens

### Authentication

Most endpoints require authentication. To test protected endpoints:

1. Obtain a JWT token from Clerk
2. Click the **"Authorize"** button in Swagger UI
3. Enter: `Bearer YOUR_JWT_TOKEN`
4. Click **"Authorize"**
5. Test protected endpoints

### Available Endpoints

#### Health & Monitoring
- `GET /health` - Application health check
- `GET /cache/metrics` - Redis cache metrics
- `POST /cache/refresh` - Clear all cache

#### User Management
- `GET /users` - Get current authenticated user

#### Webhooks
- `POST /webhook/clerk` - Clerk webhook receiver

## 🏗️ Architecture Patterns

### Global Modules

The following modules are registered globally and available throughout the application:

- **ConfigModule** - Environment configuration with validation
- **PrismaModule** - Database access layer
- **RedisModule** - Caching layer (optional)

### Request Flow

```
Request → Global Guards → Route Handler → Validation Pipe → Service → Database/Cache
                                                ↓
Response ← Serialization ← Exception Filters ← Business Logic
```

### Module Structure

Each feature module follows this structure:

```
feature/
├── feature.module.ts       # Module definition
├── feature.controller.ts   # HTTP routes + Swagger
├── feature.service.ts      # Business logic
├── dto/
│   ├── request.dto.ts     # Input validation
│   └── response.dto.ts    # Output serialization
├── interfaces/
│   └── index.ts           # TypeScript interfaces
└── utils/                 # Module-specific utilities
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

Tests are located alongside source files with `.spec.ts` extension.

### E2E Tests

```bash
npm run test:e2e
```

End-to-end tests are in the `test/` directory.

### Coverage Report

```bash
npm run test:cov
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The compiled application will be in the `dist/` directory.

### Environment Setup

1. Create `.env.production` file
2. Set `NODE_ENV=production`
3. Configure production database URL
4. Set secure secret keys
5. Apply database migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Run Production Server

```bash
npm run start:prod
```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 3006
CMD ["node", "dist/main"]
```

## 🔧 Development Guidelines

### Creating a New Module

See [docs/MODULE_CREATION_GUIDE.md](./docs/MODULE_CREATION_GUIDE.md) for detailed instructions on:
- Using NestJS CLI to generate modules
- Folder structure conventions
- Creating DTOs and interfaces
- Implementing controllers with Swagger
- Adding environment variables
- Best practices

### Code Style

- Use TypeScript strict mode
- Follow NestJS naming conventions
- Write descriptive variable and function names
- Add JSDoc comments for complex logic
- Keep functions small and focused
- Use dependency injection

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add your feature"`
3. Push to remote: `git push origin feature/your-feature`
4. Create pull request

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Clerk](https://clerk.com/) - Authentication platform
- [Redis](https://redis.io/) - In-memory data store

## 📧 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ using NestJS**
