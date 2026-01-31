Title: Seed: add pilot data & example users

Description:
Add deterministic seed data for pilot users, partners, and example tasks to `backend/prisma/seed.ts`. Include one admin user, 3 pilot users with different skill profiles, and 3 example tasks.

Acceptance criteria:
- `backend/prisma/seed.ts` creates sample users and tasks when run
- README updated with instructions to run seed

Labels: chore, backend

Notes:
Use fixed UUIDs for seed objects to make testing deterministic.