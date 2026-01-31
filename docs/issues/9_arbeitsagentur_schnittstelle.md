Title: Arbeitsagentur & Behörden-Schnittstelle

Description:
Implementiere die technischen und dokumentarischen Voraussetzungen für die Zusammenarbeit mit der Bundesagentur für Arbeit, Jobcentern und anderen Behörden. Fokus auf standardkonforme Datenformate, Berichtswesen und Compliance.

Acceptance criteria:
- [ ] Export-Endpunkte für Teilnehmer-Fortschrittsberichte (PDF/XML)
- [ ] XÖV-konforme Datenstruktur dokumentiert
- [ ] Maßnahmennachweis-Template erstellt
- [ ] AZAV-Anforderungen dokumentiert
- [ ] Audit-Trail für behördliche Prüfungen

## 1. Datenformate & Standards

### XÖV (XML in der öffentlichen Verwaltung)
Für Datenaustausch mit Behörden müssen wir XÖV-Standards unterstützen:
- XSchule für Bildungsdaten
- XSozial für Sozialdaten
- Eigenes Schema für Maßnahmenberichte

### Export-Formate
```
GET /api/reports/participant/:userId/progress
Accept: application/pdf | application/xml | application/json

Response (JSON example):
{
  "participant": {
    "id": "uuid",
    "anonymized_id": "SK-2024-001",  // für Datenschutz
    "start_date": "2024-01-15",
    "status": "ACTIVE"
  },
  "period": {
    "from": "2024-01-01",
    "to": "2024-01-31"
  },
  "activities": [
    {
      "task_title": "Ehrenamtliche Tätigkeit - Tafel",
      "hours_completed": 12,
      "verified": true,
      "verified_by": "Organisation XY"
    }
  ],
  "milestones": {
    "total_hours": 48,
    "debt_reduction_proxy": 240.00,
    "skills_acquired": ["Teamarbeit", "Kundenservice"]
  }
}
```

## 2. Maßnahmennachweis (AZAV-relevant)

Für AZAV-Zertifizierung benötigt:
- Teilnehmerlisten (anonymisiert)
- Anwesenheitsnachweise
- Fortschrittsberichte
- Erfolgsquoten (KPIs)

### Report-Endpunkte
```
POST /api/reports/generate
{
  "type": "MASSNAHMENNACHWEIS",
  "organisation_id": "jobcenter-berlin-mitte",
  "period": { "from": "2024-01-01", "to": "2024-03-31" },
  "format": "PDF"
}
```

## 3. Neue Endpunkte

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/reports/participant/:id/summary` | GET | Einzelner Teilnehmerbericht |
| `/api/reports/organisation/:id/overview` | GET | Übersicht für Partner-Org |
| `/api/reports/generate` | POST | Generiere Bericht (PDF/XML) |
| `/api/export/participants` | GET | Bulk-Export (Admin only) |

## 4. Prisma Schema Erweiterung

```prisma
model Report {
  report_id       String   @id @default(uuid())
  type            String   // PARTICIPANT_PROGRESS, MASSNAHMENNACHWEIS, ORGANISATION_OVERVIEW
  organisation    Organisation? @relation(fields: [organisationId], references: [org_id])
  organisationId  String?
  period_start    DateTime
  period_end      DateTime
  format          String   // PDF, XML, JSON
  file_path       String?  // Gespeicherter Report
  generated_at    DateTime @default(now())
  generated_by_id String
}
```

## 5. Compliance-Dokumentation

Erstelle `docs/compliance/`:
- `azav_requirements.md` - AZAV-Zertifizierungsanforderungen
- `data_exchange_spec.md` - Behörden-Datenaustausch Spezifikation
- `audit_trail.md` - Wie Audit-Events für Prüfungen genutzt werden

## 6. Implementation Notes

### PDF-Generierung
- Empfehlung: `@react-pdf/renderer` oder `puppeteer` für PDF
- Templates in separatem Ordner: `backend/src/templates/reports/`

### Sicherheit
- Reports nur für ADMIN/ADVISOR Rollen
- Rate-Limiting auf Export-Endpunkten
- Audit-Event bei jedem Report-Download

Labels: feature, backend, compliance, B2G

Dependencies:
- Issue #8 (Organisation Model) muss zuerst implementiert sein
- Issue #6 (Privacy checklist) für Datenschutz-Konformität

Priority: HIGH (kritisch für Fördergelder und offizielle Anerkennung)
