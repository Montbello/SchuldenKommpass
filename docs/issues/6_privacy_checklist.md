Title: Privacy checklist & encryption policy

Description:
Document retention, encryption for uploaded `Document` entries, and user data deletion flows. Add `docs/privacy.md` with actionable requirements for the backend and partner integrations.

Acceptance criteria:
- `docs/privacy.md` contains retention policy, data deletion endpoint description, and encryption recommendations
- Tests or checks for data deletion flows

Labels: security, docs

Notes:
Mark any fields considered sensitive in the Prisma schema and ensure `Document.encrypted` is supported by storage logic.