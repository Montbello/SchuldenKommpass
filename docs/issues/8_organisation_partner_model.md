Title: Organisation & Partner Model erweitern

Description:
Erweitere das Prisma Schema um Organisationen (Jobcenter, Schuldnerberatung, NGOs, Partner) und Kontakte. Dies bildet die Basis für CRM-Funktionalität und ermöglicht strukturierte Zusammenarbeit mit Institutionen.

Acceptance criteria:
- Neue Models in `prisma/schema.prisma`: `Organisation`, `Contact`, `Interaction`
- Enum `OrgType` für Organisationstypen (JOBCENTER, SCHULDNERBERATUNG, NGO, PARTNER, OTHER)
- Relation: Organisation → Tasks (Partner können Tasks erstellen)
- Relation: Organisation → Contacts (Ansprechpartner)
- Relation: Contact → Interactions (Kommunikationshistorie)
- Migration erfolgreich durchführbar
- Seed-Daten für Pilot-Organisationen

Schema-Vorschlag:
```prisma
enum OrgType {
  JOBCENTER
  SCHULDNERBERATUNG
  NGO
  PARTNER
  OTHER
}

model Organisation {
  org_id          String   @id @default(uuid())
  name            String
  type            OrgType
  description     String?
  address         String?
  contact_email   String?
  contact_phone   String?
  website         String?
  api_token_hash  String?   // für Partner-API Auth
  webhook_url     String?   // für Callbacks
  active          Boolean   @default(true)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  tasks           Task[]
  contacts        Contact[]
}

model Contact {
  contact_id      String       @id @default(uuid())
  organisation    Organisation @relation(fields: [organisationId], references: [org_id])
  organisationId  String
  name            String
  email           String?
  phone           String?
  position        String?      // z.B. "Sachbearbeiter", "Teamleitung"
  notes           String?
  primary         Boolean      @default(false)  // Hauptansprechpartner
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt

  interactions    Interaction[]
}

model Interaction {
  interaction_id  String   @id @default(uuid())
  contact         Contact  @relation(fields: [contactId], references: [contact_id])
  contactId       String
  type            String   // CALL, EMAIL, MEETING, NOTE
  subject         String
  content         String?
  outcome         String?  // Ergebnis/nächste Schritte
  created_at      DateTime @default(now())
  created_by_id   String?  // User der die Interaktion erfasst hat
}
```

Task → Organisation Relation hinzufügen:
```prisma
model Task {
  // ... bestehende Felder
  organisation    Organisation? @relation(fields: [organisationId], references: [org_id])
  organisationId  String?
}
```

Labels: feature, backend, database

Notes:
- Dieses Model ermöglicht später die Integration mit externen CRM-Systemen (HubSpot, Salesforce)
- api_token_hash wird für Partner-API Auth verwendet (Issue #2)
- Interactions bilden die Basis für CRM-Kommunikationshistorie (Issue #10)

Dependencies:
- Sollte vor Issue #9 (Arbeitsagentur-Schnittstelle) implementiert werden
- Baut auf Issue #2 (Partner API) auf
