# Schuldenkompass — Backend (Dev Guide)

Quick start (dev):

1. Copy example env and fill secrets:
   cp .env.example .env
   - Set `JWT_SECRET` and `DATABASE_URL` if using local docker

2. Start local Postgres with Docker Compose:
   npm run db:up

3. Install dependencies (root or workspace):
   npm install

4. Start local Postgres with Docker (optional):
   npm run db:up

5. Generate Prisma client and migrate:
   npm run prisma:generate
   npm run prisma:migrate:dev

6. Seed sample data (admin user created using `ADMIN_EMAIL`/`ADMIN_PASS` env vars):
   npm run prisma:seed

7. Start backend:
   npm run start

Notes:

- The server will fail to start if `JWT_SECRET` or `DATABASE_URL` is not set (fail-fast check).
- For production use a managed Postgres (Azure/AWS RDS) and set a secure `JWT_SECRET`.
