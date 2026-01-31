Title: CRM-Modul für Partner- und Kontaktverwaltung

Description:
Implementiere ein minimales CRM-Modul zur Verwaltung von Partner-Organisationen, Kontakten und Kommunikationshistorie. Dieses Modul ermöglicht strukturierte Zusammenarbeit mit Jobcentern, Schuldnerberatungen und anderen Institutionen.

Acceptance criteria:
- [ ] CRUD-Endpunkte für Organisationen
- [ ] CRUD-Endpunkte für Kontakte
- [ ] CRUD-Endpunkte für Interaktionen (Kommunikationshistorie)
- [ ] Such- und Filterfunktionen
- [ ] Dashboard-Endpunkt für CRM-Übersicht
- [ ] Unit Tests für alle Services

## 1. API-Endpunkte

### Organisationen
```
GET    /api/organisations              # Liste aller Organisationen (mit Filter)
GET    /api/organisations/:id          # Einzelne Organisation
POST   /api/organisations              # Neue Organisation anlegen
PATCH  /api/organisations/:id          # Organisation aktualisieren
DELETE /api/organisations/:id          # Organisation deaktivieren (soft delete)

Query-Parameter für GET /api/organisations:
- type: OrgType (JOBCENTER, SCHULDNERBERATUNG, etc.)
- active: boolean
- search: string (Name, Stadt)
- page, limit: Pagination
```

### Kontakte
```
GET    /api/organisations/:orgId/contacts     # Kontakte einer Organisation
GET    /api/contacts/:id                      # Einzelner Kontakt
POST   /api/organisations/:orgId/contacts     # Neuer Kontakt
PATCH  /api/contacts/:id                      # Kontakt aktualisieren
DELETE /api/contacts/:id                      # Kontakt löschen
```

### Interaktionen (Kommunikationshistorie)
```
GET    /api/contacts/:contactId/interactions  # Alle Interaktionen eines Kontakts
POST   /api/contacts/:contactId/interactions  # Neue Interaktion erfassen
PATCH  /api/interactions/:id                  # Interaktion bearbeiten

Interaction Types:
- CALL (Telefonat)
- EMAIL (E-Mail)
- MEETING (Besprechung)
- NOTE (interne Notiz)
- FOLLOWUP (geplante Wiedervorlage)
```

### Dashboard
```
GET /api/crm/dashboard
Response:
{
  "stats": {
    "total_organisations": 24,
    "active_partners": 18,
    "pending_followups": 5,
    "interactions_this_week": 12
  },
  "recent_interactions": [...],
  "upcoming_followups": [...]
}
```

## 2. Request/Response Schemas (Zod)

```typescript
// backend/src/modules/crm/crm.schemas.ts

import { z } from 'zod';

export const OrgTypeEnum = z.enum([
  'JOBCENTER',
  'SCHULDNERBERATUNG', 
  'NGO',
  'PARTNER',
  'OTHER'
]);

export const CreateOrganisationSchema = z.object({
  name: z.string().min(2).max(200),
  type: OrgTypeEnum,
  description: z.string().optional(),
  address: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  website: z.string().url().optional(),
});

export const CreateContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
  primary: z.boolean().default(false),
});

export const InteractionTypeEnum = z.enum([
  'CALL',
  'EMAIL', 
  'MEETING',
  'NOTE',
  'FOLLOWUP'
]);

export const CreateInteractionSchema = z.object({
  type: InteractionTypeEnum,
  subject: z.string().min(2).max(200),
  content: z.string().optional(),
  outcome: z.string().optional(),
  followup_date: z.string().datetime().optional(),
});
```

## 3. Modulstruktur

```
backend/src/modules/crm/
├── crm.router.ts           # Express Router
├── crm.controller.ts       # Request handling
├── crm.service.ts          # Business logic
├── crm.schemas.ts          # Zod validation schemas
├── crm.service.spec.ts     # Unit tests
└── types.ts                # TypeScript interfaces
```

## 4. Berechtigungen

| Rolle | Organisationen | Kontakte | Interaktionen |
|-------|---------------|----------|---------------|
| USER | Lesen (eigene) | - | - |
| ADVISOR | Lesen/Schreiben | Lesen/Schreiben | Lesen/Schreiben |
| ADMIN | Vollzugriff | Vollzugriff | Vollzugriff |

## 5. Zukünftige CRM-Erweiterungen (nicht in diesem Issue)

- [ ] Integration mit HubSpot/Salesforce API
- [ ] E-Mail-Tracking (geöffnet, geklickt)
- [ ] Kalender-Integration für Meetings
- [ ] Pipeline-Management für Partner-Akquise
- [ ] Automatische Follow-up Erinnerungen

## 6. Implementation Notes

### Router Registration
```typescript
// backend/src/index.ts
import crmRouter from './modules/crm/crm.router';
app.use('/api/crm', crmRouter);
app.use('/api/organisations', crmRouter);  // Alias
```

### Pagination Helper
```typescript
// Wiederverwendbar für alle Listen-Endpunkte
export const paginateQuery = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});
```

Labels: feature, backend, CRM

Dependencies:
- Issue #8 (Organisation Model) - REQUIRED
- Issue #4 (Auth middleware) - für Berechtigungsprüfung

Priority: MEDIUM

Estimated effort: 3-5 Tage
