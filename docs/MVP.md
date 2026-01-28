# MVP — Schuldenkompass

Kurz: Definiere ein kleines, implementierbares Produkt, das bestätigte Partner‑Integrationen und erste Nutzer‑Workflows ermöglicht.

Ziele
- Schnelles, testbares Produkt (4–6 Wochen) mit klaren Endpunkten.
- Nachweisbar: erste Matches, Pilot‑Nutzer, und einfache KPIs (Matches, Einkommen, Debt‑reduction proxies).

Kern‑User‑Flows

1) Onboarding & Profil
- Flow: Nutzer registriert → erstellt Profil (Skills, Verfügbarkeit, Kurzinfo) → Einverständnis/Consent für Datenfreigabe an Partner
- Endpoints (minimal):
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/users/:id
  - PATCH /api/users/:id
- DB models: `User` (siehe `prisma/schema.prisma`) 
- Acceptance: Nutzer kann Profil speichern und Consent gesetzt ist persistiert

2) Matching → Task/Job Vermittlung
- Flow: Plattform matcht Nutzer‑Skills zu offenen Tasks/Jobs, Partner sieht Vorschlag → Match wird bestätigt
- Endpoints:
  - GET /api/tasks
  - POST /api/tasks (Admin/Partner)
  - POST /api/matches
  - GET /api/matches?userId=
- DB models: `Task`, `Match`
- Acceptance: Einfacher Match wird erstellt und in `Match` persistiert

3) Progress & Proof → Auszahlung/Support
- Flow: Nutzer führt Aufgabe aus, lädt Proof (Dokument), Admin/Advisor bestätigt → Punkte/Payment/FollowUp
- Endpoints:
  - POST /api/progress
  - POST /api/documents (File upload metadata)
  - PATCH /api/progress/:id/verify
- DB models: `Progress`, `Document`
- Acceptance: Proof hochgeladen, Verifizierungsstatus änderbar

Partner‑API (minimal example)
- Partner sends: `userSkillProfile` or `jobOffer` JSON
- Contract example (example payload):
```
POST /partner/webhook/job-offer
{
  "partner_id": "acme",
  "job": {"title":"Minijob Werkstatt", "required_skill":"handwerk", "remote":false}
}
```
- Auth: HMAC signature or static token header for pilot

Privacy & Consent
- Muss einwilligungsbasiert sein (DSGVO): Consent flags on `User` model, retention policy for `Document` and `sensitiveData`.

Minimal Acceptance Criteria & KPIs
- API: Auth, create/read/update profile, create/list tasks, create match, upload proof
- KPI examples: #matches/week, %matches confirmed, avg time to first match

Implementation notes
- Use existing Prisma models (`User`, `Task`, `Progress`, `Document`) as starting point
- Tests: Unit-tests mock `@prisma/client` (see `backend/src/modules/auth/auth.service.spec.ts`); integration test uses Postgres via `docker compose` + `prisma:migrate:dev`
- Dev: `JWT_SECRET` and `DATABASE_URL` required for backend start

Nächste Schritte (konkret)
1. Issue: Define partner API + consent flow
2. Issue: Seed pilot data (`prisma/seed.ts`) + example users
3. Issue: Implement Tasks + Match endpoints + unit tests
4. Issue: Add CI workflow (test + lint + build)

---

(Bei Bedarf kann ich jetzt Issues erzeugen und einen PR mit diesem `docs/MVP.md` öffnen.)