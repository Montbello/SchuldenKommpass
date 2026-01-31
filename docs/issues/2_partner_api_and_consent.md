Title: Partner API & consent flow

Description:
Define partner webhook/API contract, auth (HMAC/token), required fields for `userSkillProfile` and `jobOffer`, error handling and rate limits. Create `docs/partner_api.md` that contains example requests and a consent flow for users.

Acceptance criteria:
- Partner API doc created (`docs/partner_api.md`)
- Example payloads included
- Consent handling described (how consent is stored and revoked)

Labels: enhancement, spec, security

Notes:
Focus first on minimal secure integration for pilot partners (static token or HMAC). Include a simple retry/backfill strategy.