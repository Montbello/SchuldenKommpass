# Partner API Specification

Version: 1.0.0  
Status: Draft  
Letzte Aktualisierung: 2026-01-31

## Übersicht

Die Partner-API ermöglicht externen Organisationen (Jobcenter, Schuldnerberatungen, NGOs) die Integration mit Schuldenkompass. Partner können:
- Job-/Task-Angebote einreichen
- Teilnehmer-Skill-Profile abfragen (mit Consent)
- Webhooks für Statusänderungen empfangen

## Authentifizierung

### API Token (Pilot-Phase)
Jeder Partner erhält einen API-Token, der im Header mitgesendet wird:

```http
POST /api/partner/tasks
Authorization: Bearer <PARTNER_API_TOKEN>
X-Partner-ID: acme-jobcenter
Content-Type: application/json
```

### HMAC Signature (Produktiv)
Für erhöhte Sicherheit wird HMAC-SHA256 Signatur unterstützt:

```http
POST /api/partner/tasks
X-Partner-ID: acme-jobcenter
X-Timestamp: 1706698800
X-Signature: sha256=<HMAC_SIGNATURE>
Content-Type: application/json
```

Signatur-Berechnung:
```
signature = HMAC-SHA256(
  key: PARTNER_SECRET,
  data: X-Timestamp + "." + JSON.stringify(body)
)
```

## Endpunkte

### 1. Task/Job einreichen

**POST** `/api/partner/tasks`

Erstellt ein neues Task-/Job-Angebot von einem Partner.

**Request:**
```json
{
  "title": "Minijob Werkstatt",
  "description": "Unterstützung in der KFZ-Werkstatt, einfache Tätigkeiten",
  "required_skill": "handwerk",
  "estimated_time": 20,
  "location": {
    "city": "Berlin",
    "postal_code": "10115",
    "remote": false
  },
  "compensation": {
    "type": "HOURLY",
    "amount": 12.50,
    "currency": "EUR"
  },
  "valid_until": "2026-03-31",
  "contact": {
    "name": "Frau Müller",
    "email": "mueller@werkstatt.de",
    "phone": "+49301234567"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "task_id": "uuid-here",
    "status": "PENDING_REVIEW",
    "created_at": "2026-01-31T12:00:00Z"
  }
}
```

**Fehler:**
| Code | Bedeutung |
|------|-----------|
| 400 | Ungültige Daten (Validation Error) |
| 401 | Fehlende/ungültige Authentifizierung |
| 403 | Partner nicht autorisiert |
| 429 | Rate Limit überschritten |

---

### 2. Skill-Profile abfragen (mit Consent)

**GET** `/api/partner/profiles`

Ruft anonymisierte Profile von Teilnehmern ab, die ihr Consent gegeben haben.

**Query-Parameter:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| skill | string | Filter nach Skill-Kategorie |
| available | boolean | Nur verfügbare Teilnehmer |
| limit | number | Max. Anzahl (default: 20, max: 100) |

**Request:**
```http
GET /api/partner/profiles?skill=handwerk&available=true&limit=10
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "anonymized_id": "SK-2024-0042",
        "skills": [
          { "category": "handwerk", "verified": true },
          { "category": "teamarbeit", "verified": false }
        ],
        "availability": "20h/week",
        "location_hint": "Berlin",
        "matched_tasks": 3
      }
    ],
    "total": 42,
    "page": 1
  }
}
```

**Wichtig:** 
- Nur Profile mit `consent_data_sharing = true` werden zurückgegeben
- Keine personenbezogenen Daten (Name, E-Mail) in dieser Antwort
- Für Kontaktaufnahme muss ein Match erstellt werden

---

### 3. Match anfordern

**POST** `/api/partner/matches`

Fordert einen Match zwischen Partner-Task und Teilnehmer an.

**Request:**
```json
{
  "task_id": "uuid-task",
  "profile_id": "SK-2024-0042",
  "message": "Wir würden Sie gerne für diese Position in Betracht ziehen."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "match_id": "uuid-match",
    "status": "PENDING_USER_CONSENT",
    "expires_at": "2026-02-07T12:00:00Z"
  }
}
```

**Match-Status Flow:**
```
PENDING_USER_CONSENT → USER_ACCEPTED → ACTIVE
                     → USER_DECLINED → CLOSED
                     → EXPIRED → CLOSED
```

---

### 4. Webhook: Statusänderungen empfangen

Partner können einen Webhook-Endpunkt registrieren, um über Änderungen informiert zu werden.

**Webhook Registration:**
```json
// In Organisation-Settings oder via Admin-API
{
  "webhook_url": "https://partner.example.com/webhooks/schuldenkompass",
  "events": ["match.accepted", "match.declined", "task.completed"]
}
```

**Webhook Payload:**
```json
{
  "event": "match.accepted",
  "timestamp": "2026-01-31T14:30:00Z",
  "data": {
    "match_id": "uuid-match",
    "task_id": "uuid-task",
    "profile_id": "SK-2024-0042",
    "status": "ACTIVE"
  },
  "signature": "sha256=..."
}
```

**Erwartete Antwort:** HTTP 200 OK innerhalb von 5 Sekunden.  
**Retry-Policy:** 3 Versuche mit exponential backoff (1min, 5min, 30min)

---

## Rate Limits

| Endpunkt | Limit |
|----------|-------|
| POST /partner/tasks | 100/hour |
| GET /partner/profiles | 500/hour |
| POST /partner/matches | 50/hour |

Bei Überschreitung: `429 Too Many Requests` mit `Retry-After` Header.

---

## Consent & Datenschutz (DSGVO)

### Consent-Flags
Teilnehmer müssen explizit zustimmen:
- `consent_data_sharing`: Erlaubt Teilen von anonymisierten Profildaten
- Per-Partner Consent möglich (Whitelist)

### Daten-Minimierung
- Profile sind standardmäßig anonymisiert
- Vollständige Kontaktdaten nur nach beidseitigem Match
- Alle Zugriffe werden im `AuditEvent` geloggt

### Consent-Widerruf
Wenn ein Teilnehmer Consent widerruft:
1. Profil wird sofort aus Partner-Abfragen entfernt
2. Offene Matches werden auf `CONSENT_REVOKED` gesetzt
3. Webhook `consent.revoked` wird an betroffene Partner gesendet

---

## Fehlerformat

Alle Fehler folgen diesem Schema:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "title", "message": "Title is required" }
    ]
  }
}
```

**Error Codes:**
| Code | HTTP Status | Beschreibung |
|------|-------------|--------------|
| VALIDATION_ERROR | 400 | Ungültige Eingabedaten |
| UNAUTHORIZED | 401 | Token fehlt oder ungültig |
| FORBIDDEN | 403 | Keine Berechtigung |
| NOT_FOUND | 404 | Ressource nicht gefunden |
| RATE_LIMITED | 429 | Zu viele Anfragen |
| INTERNAL_ERROR | 500 | Serverfehler |

---

## Beispiel-Integration (Node.js)

```javascript
const crypto = require('crypto');

class SchuldenkompassPartnerAPI {
  constructor(partnerId, apiToken, secret) {
    this.partnerId = partnerId;
    this.apiToken = apiToken;
    this.secret = secret;
    this.baseUrl = 'https://api.schuldenkompass.de';
  }

  async createTask(taskData) {
    const response = await fetch(`${this.baseUrl}/api/partner/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'X-Partner-ID': this.partnerId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    return response.json();
  }

  async getProfiles(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${this.baseUrl}/api/partner/profiles?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'X-Partner-ID': this.partnerId
        }
      }
    );
    return response.json();
  }

  // Webhook-Signatur verifizieren
  verifyWebhook(payload, signature, timestamp) {
    const expected = crypto
      .createHmac('sha256', this.secret)
      .update(`${timestamp}.${JSON.stringify(payload)}`)
      .digest('hex');
    return `sha256=${expected}` === signature;
  }
}
```

---

## Sandbox / Testing

**Sandbox URL:** `https://sandbox.api.schuldenkompass.de`

Test-Credentials werden auf Anfrage bereitgestellt. Die Sandbox enthält:
- Vorgenerierte Test-Profile
- Simulierte Match-Flows
- Webhook-Testing-Tools

---

## Kontakt & Support

- **Technischer Support:** api-support@schuldenkompass.de
- **Partnerschaftsanfragen:** partner@schuldenkompass.de
- **Status-Page:** https://status.schuldenkompass.de
