# Copilot / AI Agent Instructions — Schuldenkompass

Purpose

- Short, actionable guide to get an AI coding agent productive quickly in this repo.
- Focus: architecture, critical workflows, conventions, integration points, and test patterns.

Big picture

- Monorepo with 3 workspaces: `backend`, `frontend`, `common` (see root `package.json`).
- **Backend**: Express + TypeScript + Prisma (Postgres). Entry: `backend/src/index.ts`.
  - Routes follow a router → controller → service pattern (e.g. `modules/auth/*`).
  - Services typically throw Errors; controllers catch and return `{ message }` with appropriate HTTP status.
- **Frontend**: Vite + React + TypeScript (see `frontend/` and `frontend/package.json`).
- **Common**: Shared TypeScript types in `common/src/types` (imported as `@schuldenkompass/common`). Note: some enums in `common` use German display strings.

Environment & infra

- Required env vars: `JWT_SECRET` (server will fail-fast) and `DATABASE_URL` (Prisma). See `backend/.env.example`.
- Seed/ID: `ADMIN_PASS` is used by `backend/prisma/seed.ts` to create an admin user.
- Local DB: `backend/docker-compose.yml` (Postgres + Adminer). Commands below.

Key scripts & workflows (most precise commands)

- From `backend/`:
  - Start Postgres (Docker): `npm run db:up` / `npm run db:down` (runs `docker compose -f docker-compose.yml ...`).
  - Prisma: `npm run prisma:generate`, `npm run prisma:migrate:dev`, `npm run prisma:seed`, `npm run prisma:studio`.
  - Dev server: `npm run start` (uses `nodemon src/index.ts`).
  - Run tests: `npm test` (Vitest).
- From `frontend/`:
  - Dev: `npm run dev` (Vite). Build: `npm run build` (tsc -b && vite build).
- From repo root: `npm run dev` (starts frontend workspace dev), `npm run server` (runs backend start in workspace).

Testing & mocking patterns

- Unit tests use `vitest` and heavily mock `@prisma/client` by replacing `PrismaClient` (see `backend/src/modules/auth/auth.service.spec.ts`).
  - Pattern: mock `@prisma/client` _before_ importing the service so the module gets the mocked client.
  - Typical mocked methods: `user.findUnique`, `user.create`, etc.
- Integration tests that need a real DB should: `npm run db:up` → `npm run prisma:migrate:dev` → `npm run prisma:seed` before running tests.

Coding conventions & notes

- Follow router → controller → service separation; controllers send HTTP responses, services are pure async logic that throw on business errors.
- Passwords: `argon2` used for hashing; use `argon2.hash` and `argon2.verify`.
- JWT: `jsonwebtoken` with `JWT_SECRET`; tokens currently expire in 1 hour in `auth.service`.
- Prisma: Both `new PrismaClient()` and the shared `backend/src/prismaClient.ts` exist—tests mock `@prisma/client` (intercepts `new PrismaClient()`), so follow existing patterns when adding tests.
- Shared types: Prefer using `@schuldenkompass/common` for domain shapes, but watch differences between Prisma enums and display enums in `common`.

Integration points & external deps

- Postgres via Prisma (`DATABASE_URL` + `prisma migrate` flows).
- Docker Compose config at `backend/docker-compose.yml` (service name `db`).
- Adminer available on port `8080` for quick DB inspection when `db:up` is running.

Files to consult when making changes

- `backend/src/index.ts` — server/bootstrap and env fail-fast checks
- `backend/src/modules/auth/*` — canonical example of router/controller/service (+ tests)
- `backend/prisma/schema.prisma` — canonical data model
- `backend/prisma/seed.ts` — how admin seed user is created (uses `ADMIN_PASS`)
- `common/src/types/index.ts` — domain types and localized enums
- `backend/docker-compose.yml` and `backend/.env.example` — local infra setup
- `backend/package.json` & `frontend/package.json` — scripts and dev tools

Repo quirks & gotchas (agent-specific)

- Server refuses to start without `JWT_SECRET` and `DATABASE_URL`; set `.env` or export env vars before running.
- Tests rely on mocking `@prisma/client` rather than spinning up a DB for unit tests—follow the `auth.service.spec.ts` pattern.
- Some modules instantiate `new PrismaClient()` directly (not always using `prismaClient.ts`). Be consistent if adding new modules or tests.
- Localization: domain enums in `common` are localized (German); be careful when mapping to Prisma enums or API responses.
- There is a Cursor rule in `.cursor/rules/after_each_chat.mdc` that mandates writing a chat-summary JSON after every response—agents running in Cursor contexts should obey that rule (note: this is workspace metadata, not repo code).

If anything above is unclear or you want more detail in any area (e.g., common test helpers, CI scripts to add, or a suggested file-scaffold for new modules), tell me which section to expand and I will iterate. ✅
