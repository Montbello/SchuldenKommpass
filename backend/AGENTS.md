# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Schuldenkompass backend - Express.js + TypeScript API with Prisma ORM and PostgreSQL.

## Commands

### Development
```bash
npm run start           # Start dev server with nodemon (requires .env with JWT_SECRET, DATABASE_URL)
npm run build           # Compile TypeScript to dist/
```

### Database
```bash
npm run db:up           # Start local Postgres via Docker Compose (port 5432)
npm run db:down         # Stop local Postgres
npm run prisma:generate # Generate Prisma client after schema changes
npm run prisma:migrate:dev  # Create and run migrations
npm run prisma:seed     # Seed database (uses ADMIN_EMAIL/ADMIN_PASS env vars)
npm run prisma:studio   # Open Prisma Studio GUI
```

### Testing
```bash
npm test                # Run all tests with Vitest
npm run test:watch      # Run tests in watch mode
npm test -- src/modules/auth/auth.service.spec.ts  # Run single test file
```

## Architecture

### Entry Point
`src/index.ts` - Express app setup with fail-fast checks for required env vars. Mounts all API routers under `/api/`.

### Module Structure
Each feature lives in `src/modules/{feature}/` following this pattern:
- `{feature}.router.ts` - Express routes, applies middleware
- `{feature}.controller.ts` - Request handlers, calls service
- `{feature}.service.ts` - Business logic, Prisma queries
- `{feature}.service.spec.ts` - Unit tests (mock Prisma)

Modules: `auth`, `users`, `tasks`, `matches`, `progress`

### Key Files
- `src/prismaClient.ts` - Singleton Prisma client export
- `src/middleware/auth.middleware.ts` - JWT verification, attaches `req.user`
- `prisma/schema.prisma` - Database schema (User, Task, Progress, Match, etc.)
- `prisma/seed.ts` - Seeding script

### Shared Package
`@schuldenkompass/common` (at `../common`) - Shared types and utilities used across frontend/backend.

## Conventions
- Password hashing: Argon2 (not bcrypt, despite bcrypt being in dependencies)
- Auth: JWT Bearer tokens, 1h expiry, payload contains `{ id, role }`
- User roles: `USER`, `ADVISOR`, `ADMIN` (defined in Prisma enum)
- Tests mock Prisma client via `vi.mock('@prisma/client')`
