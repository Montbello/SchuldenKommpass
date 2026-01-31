Title: Unit tests: auth service & register/login flows

Description:
Add more unit tests around failure modes and edge cases using `vi.mock('@prisma/client', ...)` pattern. Cover:
- Duplicate registration
- Invalid login
- Token generation validity

Acceptance criteria:
- Tests added to `backend/src/modules/auth` spec file(s)
- Pass in CI

Labels: testing, backend

Notes:
Follow the existing `auth.service.spec.ts` pattern; mock before importing services.