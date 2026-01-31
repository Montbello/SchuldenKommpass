# Initial Issues to create (for maintainers/agents)

Suggested issues to open (title + description + labels):

1) Title: `MVP: Define user flows & endpoints`
Description: Add details from `docs/MVP.md` (user stories, endpoints, minimal acceptance criteria). Reference models in `backend/prisma/schema.prisma`.
Labels: `chore`, `spec`

2) Title: `Partner API & consent flow`
Description: Define partner webhook/API contract, auth (HMAC/token), required fields for `userSkillProfile` and `jobOffer`, error handling and rate limits. Create `docs/partner_api.md` as next step.
Labels: `enhancement`, `spec`, `security`

3) Title: `Seed: add pilot data & example users`
Description: Add deterministic seed data for pilot users, partners and example tasks to `backend/prisma/seed.ts`. Include environment note for `ADMIN_PASS`.
Labels: `chore`, `backend`

4) Title: `Auth middleware & Task/Progress endpoints`
Description: Implement authorization middleware and endpoints for Tasks & Progress (create/list/match/verify). Add unit tests.
Labels: `feature`, `backend`, `testing`

5) Title: `Add CI: tests + lint + build`
Description: Create a GitHub Actions workflow that runs on PR: `npm ci`, `npm run build` (root + workspaces), and `npm test` for backend. Consider separate job for integration tests that runs DB migration and seed.
Labels: `ci`, `infrastructure`

6) Title: `Privacy checklist & encryption policy`
Description: Document retention, encryption for uploaded `Document` entries, and user data deletion flows. Add `docs/privacy.md`.
Labels: `security`, `docs`

7) Title: `Unit tests: auth service & register/login flows`
Description: Add more unit tests around failure modes and edge cases using `vi.mock('@prisma/client', ...)` pattern.
Labels: `testing`, `backend`

---

## Phase 2: Institutions & CRM Integration

8) Title: `Organisation & Partner Model erweitern`
Description: Erweitere Prisma Schema um `Organisation`, `Contact`, `Interaction` Models. Basis für CRM und Partner-Integration. Siehe `docs/issues/8_organisation_partner_model.md`.
Labels: `feature`, `backend`, `database`
Priority: HIGH

9) Title: `Arbeitsagentur & Behörden-Schnittstelle`
Description: XÖV-konforme Exports, Maßnahmennachweis-Reports (PDF), AZAV-Dokumentation. Kritisch für Fördergelder. Siehe `docs/issues/9_arbeitsagentur_schnittstelle.md`.
Labels: `feature`, `backend`, `compliance`, `B2G`
Priority: HIGH
Dependencies: #8

10) Title: `CRM-Modul für Partner-Management`
Description: CRUD für Organisationen, Kontakte, Interaktionen (Kommunikationshistorie). Dashboard-Endpunkt. Siehe `docs/issues/10_crm_modul.md`.
Labels: `feature`, `backend`, `CRM`
Priority: MEDIUM
Dependencies: #8, #4

---

If you want, I can create these issues directly in GitHub and link them to the PR. Tell me which issues you'd like created automatically (all suggested or a subset).
