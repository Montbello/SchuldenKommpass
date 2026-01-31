# PR: chore(docs): add MVP and initial issues

This PR prepares the project for the next development sprint by adding a concise MVP definition and a set of proposed issues to implement. It is intended to be reviewed and merged once a remote exists and a maintainer is ready to push or open the PR in the hosted repository.

Files added:
- `docs/MVP.md` — MVP definition, core user flows, minimal endpoints and acceptance criteria.
- `docs/ISSUES.md` — list of suggested issues (titles, descriptions, labels).
- `docs/issues/*.md` — copy‑ready issue bodies to paste into GitHub Issues.

What I changed locally:
- Created branch `chore/mvp-and-issues` and committed the docs locally. *Push failed* because remote `origin` is not configured on this machine.

How to review locally:
1. Checkout the branch: `git checkout chore/mvp-and-issues` (already created locally).
2. Open `docs/MVP.md` and `docs/ISSUES.md` to review the proposed MVP and issues.
3. If you want me to push & open the PR, provide the Git remote URL (SSH or HTTPS) and I will add `origin` and push the branch, then open the PR.

How to run the project locally (quick start):
- Install dependencies: `npm install` at repo root (or run `npm install` in each workspace)
- Backend:
  - Copy env: `cp backend/.env.example backend/.env` and set `JWT_SECRET` and `DATABASE_URL`.
  - Start Postgres (Docker): `cd backend && npm run db:up` (runs `docker compose -f docker-compose.yml up -d`).
  - Generate Prisma client & migrate: `npm run prisma:generate && npm run prisma:migrate:dev`.
  - Seed: `npm run prisma:seed` (uses `ADMIN_PASS` to create admin user).
  - Start dev server: `npm run start` (nodemon, runs `src/index.ts`).
- Frontend: `cd frontend && npm run dev` (Vite dev server).
- Tests: `cd backend && npm test` (Vitest). Unit tests mock `@prisma/client` as in `auth.service.spec.ts`.

Notes & next steps:
- I can push the branch and open the PR if you provide the repository URL or configure `origin` locally.
- I can also automatically create the suggested GitHub Issues once the repo is accessible (or you can copy file contents from `docs/issues/`).

---

If you'd like, I can now:
- Add the remote and push (you provide URL), open PR and create GitHub Issues automatically, or
- Keep changes local and prepare a PR text + issue drafts here for you to paste into GitHub.

Which option do you prefer?