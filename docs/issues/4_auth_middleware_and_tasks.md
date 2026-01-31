Title: Auth middleware & Task/Progress endpoints

Description:
Implement authorization middleware and endpoints for Tasks & Progress (create/list/match/verify). Add unit tests and basic validation.

Acceptance criteria:
- Auth middleware that validates JWT and sets `req.user` exists
- CRUD endpoints for Tasks and Progress (basic payload validation)
- Unit tests for controllers/services using `vi.mock('@prisma/client', ...)` pattern

Labels: feature, backend, testing

Notes:
Follow the router → controller → service pattern used in `modules/auth`.