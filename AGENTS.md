# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Schuldenkompass (German: "Debt Compass") — A platform to help users manage debt-related tasks, match with advisors, and track progress. Monorepo with three workspaces: `backend`, `frontend`, `common`.

## Quick Start Commands

### From repo root
```bash
npm install              # Install all workspace dependencies
npm run dev              # Start frontend dev server (Vite)
npm run server           # Start backend dev server
```

### Backend (`backend/`)
```bash
npm run db:up            # Start local Postgres + Adminer via Docker
npm run db:down          # Stop local Postgres
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate:dev  # Run migrations
npm run prisma:seed      # Seed database (uses ADMIN_EMAIL/ADMIN_PASS env vars)
npm run prisma:studio    # Open Prisma Studio GUI
npm run start            # Start backend (nodemon)
npm test                 # Run Vitest tests
npm test -- src/modules/auth/auth.service.spec.ts  # Single test file
npm run lint             # ESLint
```

### Frontend (`frontend/`)
```bash
npm run dev              # Vite dev server
npm run build            # tsc + vite build
npm run lint             # ESLint
npm run preview          # Preview production build
```

## Required Environment Variables
Backend requires `.env` with:
- `JWT_SECRET` — Server fails fast without it
- `DATABASE_URL` — Postgres connection string (e.g., from `docker-compose.yml`)
- `ADMIN_EMAIL`, `ADMIN_PASS` — Used by seed script

Copy `backend/.env.example` as starting point.

## Architecture

### Monorepo Structure
```
backend/          Express + TypeScript + Prisma (Postgres)
frontend/         Vite + React + TypeScript
common/           Shared types (@schuldenkompass/common)
```

### Backend Module Pattern
Each feature in `backend/src/modules/{feature}/`:
- `{feature}.router.ts` — Express routes, applies middleware
- `{feature}.controller.ts` — HTTP handlers, catches service errors, returns `{ message }` responses
- `{feature}.service.ts` — Business logic, Prisma queries, throws on errors
- `{feature}.service.spec.ts` — Unit tests (mock Prisma)

Modules: `auth`, `users`, `tasks`, `matches`, `progress`

Key entry point: `backend/src/index.ts` — Express app setup with fail-fast env checks, mounts routers under `/api/`

### Frontend Structure
- `src/api/` — API client modules per feature (`auth.ts`, `tasks.ts`, etc.)
- `src/api/client.ts` — Shared `ApiError` class and response handler
- `src/pages/` — Route components (Dashboard, Login, Register, TasksPage, etc.)
- `src/components/` — Shared components (Layout, ProtectedRoute)
- `src/utils/auth.ts` — Auth utility functions

### Shared Common Package
`@schuldenkompass/common` exports domain types and enums in `common/src/types/index.ts`.

**Important**: Enums use German display strings (e.g., `UserRole.USER = 'Nutzer'`). Be careful when mapping between these and Prisma enums in API responses.

## Conventions

### Auth
- Password hashing: Argon2 (`argon2.hash`, `argon2.verify`)
- JWT: 1h expiry, payload `{ id, role }`, requires `JWT_SECRET`
- User roles: `USER`, `ADVISOR`, `ADMIN` (Prisma enum)

### Testing
- Backend uses Vitest
- Unit tests mock `@prisma/client` via `vi.mock('@prisma/client')` before importing services
- See `backend/src/modules/auth/auth.service.spec.ts` for canonical pattern

### Code Style
- Follow router → controller → service separation
- Controllers handle HTTP concerns; services are pure async logic that throw on business errors
- Zod for request validation (backend)

## Local Development Infrastructure
- `backend/docker-compose.yml` — Postgres (port 5432) + Adminer (port 8080)
- Run `npm run db:up` from `backend/` before starting development

## Key Files Reference
- `backend/src/index.ts` — Server bootstrap, env fail-fast
- `backend/prisma/schema.prisma` — Database schema
- `backend/prisma/seed.ts` — Seed script
- `common/src/types/index.ts` — Shared domain types
- `frontend/src/App.tsx` — React app entry with routing
