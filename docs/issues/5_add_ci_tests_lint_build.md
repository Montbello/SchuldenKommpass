Title: Add CI: tests + lint + build

Description:
Create a GitHub Actions workflow that runs on PR: `npm ci`, `npm run build` (root + workspaces), `npm test` for backend, and `npm run lint` for frontend (if configured). Add a separate job for integration tests that runs DB migration and seed.

Acceptance criteria:
- `.github/workflows/ci.yml` present
- PRs show test and build status

Labels: ci, infrastructure

Notes:
Keep jobs small and cache `~/.npm` where appropriate. Integration tests should run in a self-hosted or ephemeral DB (docker-compose) environment.